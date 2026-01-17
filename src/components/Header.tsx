import { Icons } from './Icons';

interface HeaderProps {
  title?: string;
  showSearch?: boolean;
}

export default function Header({ title = 'nexs', showSearch = true }: HeaderProps) {
  return (
    <div className="fixed top-0 inset-x-0 z-30 bg-white/90 backdrop-blur-md px-5 py-3 flex justify-between items-center border-b border-gray-50 transition-all duration-300">
      <span className="font-bold text-lg tracking-tight flex items-center gap-2">
        <span className="w-3 h-3 bg-black rounded-sm" aria-hidden="true"></span>
        {title}
      </span>
      {showSearch && (
        <button
          className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
          aria-label="検索"
        >
          <Icons.Search size={16} className="text-gray-400" />
        </button>
      )}
    </div>
  );
}
