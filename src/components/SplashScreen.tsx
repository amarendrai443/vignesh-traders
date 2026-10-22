import React, { useEffect, useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

interface SplashScreenProps {
  onFinish: () => void;
  durationMs?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onFinish,
  durationMs = 5000,
}) => {
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    // Trigger entrance animation frame
    const startTimer = setTimeout(() => {
      setHasStarted(true);
    }, 50);

    // Trigger fade-out 500ms before total duration
    const fadeOutTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, Math.max(0, durationMs - 500));

    // Finish and dismiss splash screen
    const finishTimer = setTimeout(() => {
      onFinish();
    }, durationMs);

    return () => {
      clearTimeout(startTimer);
      clearTimeout(fadeOutTimer);
      clearTimeout(finishTimer);
    };
  }, [durationMs, onFinish]);

  const handleSkip = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      onFinish();
    }, 250);
  };

  return (
    <div
      aria-label="Welcome Splash Screen"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between p-4 sm:p-8 bg-[#FAF7F2] transition-opacity duration-500 ease-in-out select-none overflow-hidden ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Top Bar with Skip Button */}
      <div className="w-full max-w-2xl flex justify-end pt-1">
        <button
          onClick={handleSkip}
          type="button"
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-medium text-[#6E6359] hover:text-[#B45309] bg-white/80 hover:bg-white rounded-full border border-[#EFE9DF] shadow-xs transition-all duration-200 cursor-pointer"
        >
          <span>Skip</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Center Hero Identity Showcase */}
      <div className="flex flex-col items-center text-center my-auto px-2 sm:px-4 max-w-2xl w-full">
        {/* Brand Logo with Glow & Floating Border */}
        <div
          className={`relative mb-5 sm:mb-6 transition-all duration-700 ease-out transform ${
            hasStarted ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
          }`}
        >
          <div className="w-32 h-32 sm:w-44 sm:h-44 md:w-52 md:h-52 rounded-2xl sm:rounded-3xl bg-white shadow-xl shadow-amber-900/5 border border-[#EFE9DF] p-3 sm:p-4 flex items-center justify-center">
            <img
              src="https://i.ibb.co/s9tyVqzN/image.png"
              alt="Vignesh Traders Logo"
              className="h-32 w-32 sm:h-44 sm:w-44 md:h-52 md:w-52 object-contain"
            />
          </div>
          <span className="absolute -top-2 -right-2 p-1.5 sm:p-2 bg-[#B45309] text-white rounded-full shadow-md">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </span>
        </div>

        {/* Welcome Text strictly on a Single Unbroken Line */}
        <div className="w-full overflow-hidden flex justify-center">
          <h1
            className={`whitespace-nowrap font-extrabold text-lg sm:text-2xl md:text-3xl tracking-wide text-[#2D241E] uppercase transition-all duration-700 delay-150 ease-out transform ${
              hasStarted ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
            }`}
          >
            WELCOME TO <span className="text-[#B45309]">VIGNESH TRADERS</span>
          </h1>
        </div>

        {/* Brand Tagline */}
        <p
          className={`mt-2.5 sm:mt-3 text-sm sm:text-lg md:text-xl font-medium text-[#B45309] italic transition-all duration-700 delay-300 ease-out transform ${
            hasStarted ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
          }`}
        >
          &ldquo;Crunch your way to a healthier day&rdquo;
        </p>

        {/* Quality Badges */}
        <div
          className={`mt-3.5 sm:mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/60 text-[11px] sm:text-xs font-semibold text-amber-900 transition-all duration-700 delay-500 ease-out ${
            hasStarted ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <span>Premium Dry Fruits &amp; Nuts</span>
          <span>•</span>
          <span>Narasaraopet</span>
        </div>
      </div>

      {/* Bottom Progress Indicator Bar */}
      <div className="w-full max-w-xs sm:max-w-md pb-2 sm:pb-4 flex flex-col items-center gap-2">
        <div className="w-full h-1.5 bg-[#EFE9DF] rounded-full overflow-hidden">
          <div
            className="h-full bg-linear-to-r from-[#B45309] to-[#D97706] rounded-full"
            style={{
              width: hasStarted ? '100%' : '0%',
              transition: `width ${durationMs}ms cubic-bezier(0.1, 0.2, 0.3, 1)`,
            }}
          />
        </div>
        <p className="text-[10px] sm:text-[11px] text-[#6E6359] font-medium tracking-wider uppercase">
          Curating Fresh Harvests...
        </p>
      </div>
    </div>
  );
};
export default SplashScreen;
