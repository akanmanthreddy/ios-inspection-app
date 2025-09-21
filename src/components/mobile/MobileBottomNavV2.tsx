import { Home, Plus, Settings } from 'lucide-react';

interface MobileBottomNavV2Props {
  currentPage: string;
  onNavigateToLanding: () => void;
  onCenterButtonClick: () => void;
  onSettings?: () => void; // Optional for future implementation
}

export function MobileBottomNavV2({
  currentPage,
  onNavigateToLanding,
  onCenterButtonClick,
  onSettings
}: MobileBottomNavV2Props) {
  const isHomeActive = currentPage === 'landing';

  return (
    <div
      className="fixed bottom-0 left-0 right-0 bg-neutral-100 rounded-t-3xl overflow-hidden z-50"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        height: '8rem' // 128px equivalent
      }}
    >
      {/* White background area - takes up almost entire space */}
      <div className="absolute left-0 right-0 top-3 bottom-0 bg-white rounded-t-3xl" />

      {/* Navigation buttons container */}
      <div className="absolute left-0 right-0 top-4 px-3 flex justify-center items-end h-20">

        {/* Home Button */}
        <button
          onClick={onNavigateToLanding}
          className="flex-1 inline-flex flex-col justify-start items-center gap-1.5 py-2 transition-colors"
        >
          <div className="w-6 h-6 relative overflow-hidden">
            <Home
              className={`w-6 h-6 absolute left-0 top-0 ${
                isHomeActive ? 'text-blue-400' : 'text-neutral-600'
              }`}
            />
          </div>
          <div className={`justify-start text-xs font-poppins leading-none ${
            isHomeActive
              ? 'text-blue-400 font-medium'
              : 'text-neutral-600 font-normal'
          }`}>
            Home
          </div>
        </button>

        {/* Center FAB Button */}
        <div className="flex-1 pb-4 inline-flex flex-col justify-start items-center gap-1.5">
          <button
            onClick={onCenterButtonClick}
            className="p-3.5 rounded-[100px] outline outline-4 outline-white inline-flex justify-start items-start gap-2.5 transition-all hover:scale-105 active:scale-95 bg-blue-400 hover:bg-blue-500"
          >
            <div className="w-6 h-6 relative">
              <Plus className="w-6 h-6 text-white" />
            </div>
          </button>
        </div>

        {/* Settings Button */}
        <button
          onClick={onSettings || (() => {})}
          disabled={!onSettings}
          className={`flex-1 inline-flex flex-col justify-start items-center gap-1.5 py-2 transition-colors ${
            !onSettings ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <div className="w-6 h-6 relative overflow-hidden">
            <Settings className="w-6 h-6 absolute left-0 top-0 text-neutral-600" />
          </div>
          <div className="justify-start text-neutral-600 text-xs font-normal font-poppins leading-none">
            Settings
          </div>
        </button>

      </div>

      {/* iOS Home Indicator */}
      <div className="absolute left-0 right-0 h-7 bottom-0">
        <div className="w-32 h-[5px] absolute left-1/2 transform -translate-x-1/2 top-[8px] bg-neutral-300 rounded-[100px]" />
      </div>
    </div>
  );
}