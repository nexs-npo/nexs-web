import { Eye, EyeOff } from 'lucide-react';

interface ReadingModeToggleProps {
  isReadingMode: boolean;
  onToggle: () => void;
}

export default function ReadingModeToggle({
  isReadingMode,
  onToggle,
}: ReadingModeToggleProps) {
  return (
    <div className="fixed top-6 right-6 z-50 flex items-center gap-2">
      {/* 状態を示すテキスト（オプション） */}
      <span
        className={`
          text-[9px] font-bold tracking-widest uppercase transition-opacity duration-300 hidden sm:block
          ${isReadingMode ? 'opacity-100' : 'opacity-40'}
        `}
      >
        {isReadingMode ? 'READING' : 'VIEW'}
      </span>

      {/* トグルスイッチ本体 */}
      <button
        type="button"
        onClick={onToggle}
        className={`
          relative w-11 h-6 rounded-full transition-colors duration-300 shadow-sm
          ${isReadingMode ? 'bg-black' : 'bg-gray-300'}
        `}
        aria-label="Toggle Reading Mode"
      >
        {/* 動くノブ */}
        <div
          className={`
            absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm flex items-center justify-center
            transition-transform duration-300 cubic-bezier(0.34, 1.56, 0.64, 1)
            ${isReadingMode ? 'translate-x-5' : 'translate-x-0'}
          `}
        >
          {/* ノブの中のアイコン */}
          {isReadingMode ? (
            <EyeOff size={10} className="text-black" />
          ) : (
            <Eye size={10} className="text-gray-400" />
          )}
        </div>
      </button>
    </div>
  );
}
