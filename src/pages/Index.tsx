import { useState, useEffect } from "react";
import MemberCheck from "@/components/MemberCheck";
import PrayForSnow from "@/components/PrayForSnow";
import GlobalPrayOverlay from "@/components/GlobalPrayOverlay";

const PRAYER_COUNT_KEY = "pray_for_snow_count";

const Index = () => {
  const heroImage = "/mainpicture.jpeg";
  const [showGlobalOverlay, setShowGlobalOverlay] = useState(false);
  const [prayerCount, setPrayerCount] = useState(0);

  // Load prayer count from localStorage on mount
  useEffect(() => {
    try {
      const savedCount = localStorage.getItem(PRAYER_COUNT_KEY);
      if (savedCount) {
        setPrayerCount(parseInt(savedCount, 10));
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const handlePray = () => {
    // Increment counter
    const newCount = prayerCount + 1;
    setPrayerCount(newCount);
    try {
      localStorage.setItem(PRAYER_COUNT_KEY, newCount.toString());
    } catch {
      // Ignore localStorage errors
    }
    // Show global overlay
    setShowGlobalOverlay(true);
  };

  const handleOverlayComplete = () => {
    setShowGlobalOverlay(false);
  };

  return (
    <div className="min-h-screen relative">
      {/* Global Prayer Overlay */}
      <GlobalPrayOverlay
        isActive={showGlobalOverlay}
        onComplete={handleOverlayComplete}
        prayerCount={prayerCount}
      />
      {/* Hero Section */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-background" />
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-3 mb-6 px-6 py-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
          <span className="text-white font-medium">NTNUI</span>
        </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-2xl">
            Topptur og Frikjøring
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 mb-8 drop-shadow-lg max-w-2xl mx-auto">
            Internside for turkomitéen i NTNUI Topptur og Frikjøring.
          </p>
          
          <a 
            href="#medlemssjekk"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity shadow-lg"
          >
            Sjekk medlemskap
          </a>
        </div>
      </section>

      {/* Member Check Section */}
      <div id="medlemssjekk">
        <MemberCheck />
      </div>

      {/* Pray for Snow Button and Counter (fixed position) */}
      <PrayForSnow onPray={handlePray} prayerCount={prayerCount} />

      {/* Footer */}
      <footer className="bg-card border-t border-border py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <img
              src="/ntnui-logo-liten.png"
              alt="NTNUI logo"
              className="h-6 w-auto"
            />
            <span className="font-semibold text-foreground">Topptur og Frikjøring NTNUI</span>
          </div>
          <p className="text-sm text-muted-foreground">
            En del av NTNUI - Norges Teknisk-Naturvitenskapelige Universitets Idrettsforening
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
