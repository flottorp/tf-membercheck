type PrayForSnowProps = {
  onPray: () => void;
  prayerCount: number;
};

const PrayForSnow = ({ onPray, prayerCount }: PrayForSnowProps) => {
  const handlePray = () => {
    onPray(); // Trigger global overlay
  };

  return (
    <>
      {/* Pray Button - Fixed in top right corner */}
      <div className="fixed top-4 right-4 z-50 flex flex-col items-end gap-2">
        <button
          onClick={handlePray}
          className="hover:scale-110 transition-transform duration-300 cursor-pointer bg-transparent border-none p-0"
          aria-label="Pray for Snow"
        >
          <img
            src="/prayforsnow/button.png"
            alt="Pray for Snow"
            className="h-20 w-auto drop-shadow-2xl hover:drop-shadow-[0_0_20px_rgba(59,130,246,0.8)] transition-all"
          />
        </button>
        {/* Prayer Counter */}
        <div className="px-3 py-1.5 rounded-lg bg-black/70 backdrop-blur-sm border border-white/30 shadow-lg">
          <p className="text-sm font-bold text-white">
            Prayers: <span className="text-primary-foreground">{prayerCount}</span> 🙏
          </p>
        </div>
      </div>
    </>
  );
};

export default PrayForSnow;

