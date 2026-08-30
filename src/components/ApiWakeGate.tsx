import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import SkierLoader from "@/components/SkierLoader";
import { pingApi } from "@/lib/ntnui-api";

type WakeState = "waking" | "ready" | "failed";

const STORAGE_KEY = "api_warmed_at";
// Render spinner ned etter ~15 min inaktivitet - hold god margin
const WARM_TTL_MS = 10 * 60 * 1000;
const RETRY_DELAY_MS = 3000;
const TOTAL_BUDGET_MS = 120 * 1000;

const isRecentlyWarmed = (): boolean => {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (!stored) return false;
    const warmedAt = Number.parseInt(stored, 10);
    return Number.isFinite(warmedAt) && Date.now() - warmedAt < WARM_TTL_MS;
  } catch {
    return false;
  }
};

const markWarmed = () => {
  try {
    sessionStorage.setItem(STORAGE_KEY, Date.now().toString());
  } catch {
    // sessionStorage kan være blokkert - oppvekkingen fungerer likevel
  }
};

type ApiWakeGateProps = {
  children: ReactNode;
};

/**
 * Vekker FastAPI-et (Render free tier) ved sidelast og blokkerer innholdet
 * med en skiløper-loader til /health svarer.
 */
export function ApiWakeGate({ children }: ApiWakeGateProps) {
  const [state, setState] = useState<WakeState>(() => (isRecentlyWarmed() ? "ready" : "waking"));
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const cancelledRef = useRef(false);
  const startTimeRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Teller sekunder mens vi venter
  useEffect(() => {
    if (state !== "waking") {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      startTimeRef.current = null;
      setElapsedSeconds(0);
      return;
    }

    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      if (startTimeRef.current) {
        setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }
    }, 100);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [state, attempt]);

  useEffect(() => {
    if (state !== "waking") {
      return;
    }

    cancelledRef.current = false;
    const deadline = Date.now() + TOTAL_BUDGET_MS;

    const run = async () => {
      while (!cancelledRef.current && Date.now() < deadline) {
        const ok = await pingApi();

        if (cancelledRef.current) {
          return;
        }

        if (ok) {
          markWarmed();
          setState("ready");
          return;
        }

        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
      }

      if (!cancelledRef.current) {
        setState("failed");
      }
    };

    void run();

    return () => {
      cancelledRef.current = true;
    };
  }, [state, attempt]);

  const handleRetry = useCallback(() => {
    setAttempt(prev => prev + 1);
    setState("waking");
  }, []);

  const handleSkip = useCallback(() => {
    cancelledRef.current = true;
    setState("ready");
  }, []);

  if (state === "ready") {
    return <div className="animate-in fade-in-50 duration-500">{children}</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-background to-muted/30">
      <div className="w-full max-w-md space-y-6 text-center">
        {state === "waking" ? (
          <>
            <SkierLoader
              elapsedSeconds={elapsedSeconds}
              message="Vekker opp API-et …"
            />
            <p className="text-sm text-muted-foreground">
              Første oppstart kan ta opptil ett minutt fordi serveren sover mellom
              hvert bruk.
            </p>
          </>
        ) : (
          <>
            <SkierLoader />
            <Alert variant="destructive" className="text-left">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Fikk ikke kontakt med API-et. Det kan være nede, eller bruke uvanlig
                lang tid på å starte.
              </AlertDescription>
            </Alert>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={handleRetry} className="flex-1">
                Prøv igjen
              </Button>
              <Button onClick={handleSkip} variant="outline" className="flex-1">
                Fortsett likevel
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ApiWakeGate;
