import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface SkierLoaderProps {
  elapsedSeconds?: number;
  message?: string;
  className?: string;
}

/**
 * Skiløper som gliner nedover bakken mens vi venter på API-et.
 * Faller tilbake til en statisk figur hvis brukeren har bedt om redusert bevegelse.
 */
const SkierLoader = ({ elapsedSeconds, message, className }: SkierLoaderProps) => {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(query.matches);

    const handleChange = (event: MediaQueryListEvent) => setReducedMotion(event.matches);
    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, []);

  const snowflakes = [
    { x: 34, delay: "0s" },
    { x: 96, delay: "0.9s" },
    { x: 158, delay: "1.8s" },
    { x: 206, delay: "2.4s" },
  ];

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <svg
        viewBox="0 0 240 140"
        role="img"
        aria-label="Skiløper på vei ned bakken"
        className="w-full max-w-[240px] h-auto"
      >
        {/* Bakken */}
        <path
          d="M0 40 L240 128 L240 140 L0 140 Z"
          className="fill-muted"
        />
        <path
          d="M0 40 L240 128"
          className="stroke-border"
          strokeWidth="2"
          fill="none"
        />

        {/* Snøfnugg */}
        {!reducedMotion &&
          snowflakes.map(flake => (
            <circle
              key={flake.x}
              cx={flake.x}
              cy={10}
              r="2.5"
              className="fill-primary/40 animate-snow-drift"
              style={{ animationDelay: flake.delay }}
            />
          ))}

        {/* Skiløper - glir langs bakken (helling ~20°) */}
        <g
          className={cn(!reducedMotion && "animate-ski-glide")}
          style={reducedMotion ? { transform: "translate(110px, 73px)" } : undefined}
        >
          <g transform="rotate(20)">
            {/* Ski */}
            <path
              d="M-12 0 L12 0"
              className="stroke-accent"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
            {/* Bein */}
            <path
              d="M1 0 L-1 -8"
              className="stroke-primary"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
            {/* Kropp */}
            <path
              d="M-1 -8 L2 -17"
              className="stroke-primary"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
            />
            {/* Arm */}
            <path
              d="M0 -13 L9 -10"
              className="stroke-primary"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
            {/* Stav */}
            <path
              d="M9 -10 L12 2"
              className="stroke-foreground/50"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
            />
            {/* Hode */}
            <circle cx="3" cy="-21" r="4.5" className="fill-primary" />
          </g>
        </g>
      </svg>

      {/* Fremdriftsstripe */}
      <div className="w-full max-w-[240px] h-2 rounded-full bg-secondary overflow-hidden">
        <div
          className={cn(
            "h-full w-1/3 rounded-full bg-gradient-to-r from-primary to-primary/70",
            reducedMotion ? "w-full animate-pulse" : "animate-track-slide"
          )}
        />
      </div>

      {(message || elapsedSeconds !== undefined) && (
        <div className="text-center space-y-1">
          {message && <p className="text-sm font-medium text-foreground">{message}</p>}
          {elapsedSeconds !== undefined && elapsedSeconds > 0 && (
            <p className="text-xs text-muted-foreground">{elapsedSeconds}s</p>
          )}
        </div>
      )}
    </div>
  );
};

export default SkierLoader;
