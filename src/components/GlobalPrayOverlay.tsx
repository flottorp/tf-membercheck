import { useEffect, useState } from "react";

type GlobalPrayOverlayProps = {
  isActive: boolean;
  onComplete: () => void;
  prayerCount: number;
};

const GlobalPrayOverlay = ({ isActive, onComplete, prayerCount }: GlobalPrayOverlayProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [snowflakes, setSnowflakes] = useState<Array<{ id: number; left: number; delay: number; duration: number }>>([]);

  useEffect(() => {
    if (isActive) {
      setIsVisible(true);
      
      // Create snowflakes
      const newSnowflakes = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 2,
        duration: 3 + Math.random() * 2,
      }));
      setSnowflakes(newSnowflakes);

      // Show for 5 seconds, then fade out
      const timer = setTimeout(() => {
        setIsVisible(false);
        setSnowflakes([]);
        setTimeout(() => {
          onComplete();
        }, 1000); // Wait for fade out animation
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isActive, onComplete]);

  if (!isActive && !isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] pointer-events-none flex items-center justify-center transition-opacity duration-1000 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Snowflake Animation */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {snowflakes.map((snowflake) => (
          <div
            key={snowflake.id}
            className="absolute top-0 animate-snowfall-overlay"
            style={{
              left: `${snowflake.left}%`,
              animationDelay: `${snowflake.delay}s`,
              animationDuration: `${snowflake.duration}s`,
            }}
          >
            <img
              src="/prayforsnow/snowflake.png"
              alt=""
              className="w-6 h-6 opacity-70"
            />
          </div>
        ))}
      </div>

      {/* Multiple glow layers for divine effect */}
      <div className="absolute inset-0 animate-glow-pulse-1"></div>
      <div className="absolute inset-0 animate-glow-pulse-2"></div>
      <div className="absolute inset-0 animate-glow-pulse-3"></div>

      {/* Spinning image container */}
      <div className="relative animate-divine-spin-overlay">
        <img
          src="/prayforsnow/Gemini_Generated_Image_ssljedssljedsslj.png"
          alt="Snow gods response"
          className="max-w-[90vw] max-h-[90vh] w-auto h-auto rounded-lg shadow-2xl object-contain relative z-10"
        />
      </div>

      {/* Light rays effect */}
      <div className="absolute inset-0 animate-light-rays-overlay pointer-events-none"></div>

      {/* Text overlay */}
      <div className="absolute bottom-20 left-0 right-0 text-center z-20 animate-text-fade-in">
        <div className="inline-block px-8 py-4 rounded-lg bg-black/70 backdrop-blur-sm border-2 border-white/30 shadow-2xl">
          <p className="text-3xl md:text-5xl font-bold text-white drop-shadow-2xl">
            The snow gods have heard you. Powder to Vassfjellet is incoming… ❄️
          </p>
        </div>
      </div>

      <style>{`
        @keyframes divine-spin-overlay {
          0% {
            transform: rotate(0deg) scale(0.8);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          25% {
            transform: rotate(90deg) scale(1.1);
          }
          50% {
            transform: rotate(180deg) scale(1);
          }
          75% {
            transform: rotate(270deg) scale(1.1);
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: rotate(360deg) scale(0.8);
            opacity: 0;
          }
        }

        @keyframes glow-pulse-1 {
          0%, 100% {
            box-shadow: 0 0 60px rgba(59, 130, 246, 0.6),
                        0 0 120px rgba(59, 130, 246, 0.4),
                        0 0 180px rgba(59, 130, 246, 0.2);
            opacity: 0.8;
          }
          50% {
            box-shadow: 0 0 80px rgba(59, 130, 246, 0.8),
                        0 0 160px rgba(59, 130, 246, 0.6),
                        0 0 240px rgba(59, 130, 246, 0.4);
            opacity: 1;
          }
        }

        @keyframes glow-pulse-2 {
          0%, 100% {
            box-shadow: 0 0 70px rgba(147, 51, 234, 0.5),
                        0 0 140px rgba(147, 51, 234, 0.3);
            opacity: 0.7;
          }
          50% {
            box-shadow: 0 0 100px rgba(147, 51, 234, 0.7),
                        0 0 200px rgba(147, 51, 234, 0.5);
            opacity: 0.9;
          }
        }

        @keyframes glow-pulse-3 {
          0%, 100% {
            box-shadow: 0 0 50px rgba(34, 197, 94, 0.4),
                        0 0 100px rgba(34, 197, 94, 0.2);
            opacity: 0.6;
          }
          50% {
            box-shadow: 0 0 80px rgba(34, 197, 94, 0.6),
                        0 0 160px rgba(34, 197, 94, 0.4);
            opacity: 0.8;
          }
        }

        @keyframes light-rays-overlay {
          0% {
            background: radial-gradient(
              circle at center,
              transparent 0%,
              rgba(255, 255, 255, 0.15) 30%,
              transparent 60%
            );
            transform: rotate(0deg);
            opacity: 0.6;
          }
          50% {
            background: radial-gradient(
              circle at center,
              transparent 0%,
              rgba(255, 255, 255, 0.25) 30%,
              transparent 60%
            );
            transform: rotate(180deg);
            opacity: 0.9;
          }
          100% {
            background: radial-gradient(
              circle at center,
              transparent 0%,
              rgba(255, 255, 255, 0.15) 30%,
              transparent 60%
            );
            transform: rotate(360deg);
            opacity: 0.6;
          }
        }

        .animate-divine-spin-overlay {
          animation: divine-spin-overlay 5s ease-in-out;
          display: inline-block;
        }

        .animate-glow-pulse-1 {
          animation: glow-pulse-1 2s ease-in-out infinite;
        }

        .animate-glow-pulse-2 {
          animation: glow-pulse-2 2.5s ease-in-out infinite;
        }

        .animate-glow-pulse-3 {
          animation: glow-pulse-3 3s ease-in-out infinite;
        }

        @keyframes snowfall-overlay {
          0% {
            transform: translateY(-100px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(calc(100vh + 100px)) rotate(360deg);
            opacity: 0;
          }
        }

        @keyframes text-fade-in {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          20% {
            opacity: 1;
            transform: translateY(0);
          }
          80% {
            opacity: 1;
            transform: translateY(0);
          }
          100% {
            opacity: 0;
            transform: translateY(-20px);
          }
        }

        .animate-snowfall-overlay {
          animation: snowfall-overlay linear infinite;
        }

        .animate-text-fade-in {
          animation: text-fade-in 5s ease-in-out;
        }

        .animate-light-rays-overlay {
          animation: light-rays-overlay 4s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default GlobalPrayOverlay;

