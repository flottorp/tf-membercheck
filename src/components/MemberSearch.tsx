import { useEffect, useRef, useState } from "react";
import { Search, CheckCircle, XCircle, Loader2, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { searchMembers, MemberRecord } from "@/lib/ntnui-api";
import { getMembershipStatus } from "@/lib/membership-status";

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 350;

const formatDate = (value?: string): string | null => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("nb-NO");
};

const MemberSearch = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MemberRecord[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchedFor, setSearchedFor] = useState("");
  const [retryToken, setRetryToken] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const trimmed = query.trim();

    if (trimmed.length < MIN_QUERY_LENGTH) {
      abortRef.current?.abort();
      setResults(null);
      setError(null);
      setIsSearching(false);
      return;
    }

    const timeout = setTimeout(async () => {
      // Avbryt forrige søk så treffene alltid hører til siste tastetrykk
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setIsSearching(true);
      setError(null);

      try {
        const found = await searchMembers(trimmed, controller.signal);
        if (controller.signal.aborted) return;
        setResults(found);
        setSearchedFor(trimmed);
      } catch (err) {
        if (controller.signal.aborted || (err instanceof Error && err.name === "AbortError")) {
          return;
        }
        console.error("Søk feilet:", err);
        setError(err instanceof Error ? err.message : "Søket feilet");
        setResults(null);
      } finally {
        if (!controller.signal.aborted) {
          setIsSearching(false);
        }
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [query, retryToken]);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const trimmedQuery = query.trim();

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Søk på navn eller telefonnummer"
          className="pl-9 pr-9"
          autoComplete="off"
        />
        {isSearching && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-primary" />
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex flex-col gap-3">
            <span>{error}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRetryToken(prev => prev + 1)}
              className="self-start"
            >
              Prøv igjen
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {!error && trimmedQuery.length > 0 && trimmedQuery.length < MIN_QUERY_LENGTH && (
        <p className="text-sm text-muted-foreground text-center">
          Skriv minst {MIN_QUERY_LENGTH} tegn for å søke.
        </p>
      )}

      {!error && results && results.length === 0 && (
        <p className="text-sm text-muted-foreground text-center">
          Ingen treff på «{searchedFor}».
        </p>
      )}

      {!error && results && results.length > 0 && (
        <div className="space-y-3 animate-in fade-in-50 duration-500">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            Treff
            <span className="text-sm text-muted-foreground font-normal">
              ({results.length})
            </span>
          </h3>
          <div className="space-y-2">
            {results.map(member => {
              const status = getMembershipStatus(member);
              const tfUntil = formatDate(member.tf_valid_until);
              const ntnuiUntil = formatDate(member.ntnui_valid_until);

              return (
                <div
                  key={member.phone}
                  className="flex items-start justify-between gap-4 p-4 rounded-lg bg-card border border-border/50 hover:shadow-[var(--shadow-soft)] transition-shadow"
                >
                  <div className="flex flex-col gap-1 min-w-0">
                    <span className="font-medium truncate">{member.name || member.phone}</span>
                    <span className="text-xs text-muted-foreground">{member.phone}</span>
                    {member.email && (
                      <span className="text-xs text-muted-foreground break-all">
                        {member.email}
                      </span>
                    )}
                    {(tfUntil || ntnuiUntil) && (
                      <span className="text-xs text-muted-foreground">
                        {tfUntil && `TF til ${tfUntil}`}
                        {tfUntil && ntnuiUntil && " · "}
                        {ntnuiUntil && `NTNUI til ${ntnuiUntil}`}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {status.valid ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-destructive" />
                    )}
                    <span
                      className={
                        status.valid
                          ? "text-sm font-medium text-green-600 dark:text-green-400"
                          : "text-sm font-medium text-destructive"
                      }
                    >
                      {status.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!error && !results && trimmedQuery.length === 0 && (
        <p className="text-sm text-muted-foreground text-center">
          Søk opp én person på navn eller telefonnummer.
        </p>
      )}
    </div>
  );
};

export default MemberSearch;
