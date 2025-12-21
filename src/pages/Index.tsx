import MemberCheck from "@/components/MemberCheck";

const Index = () => {
  const heroImage = "/mainpicture.jpeg";

  return (
    <div className="min-h-screen relative">
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