import type { ReactNode } from 'react';
import { Icons } from './Icons';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  iconType?: 'lab' | 'library' | 'nexs' | 'office' | 'mydesk';
  isReadingMode?: boolean;
  isAuthenticated?: boolean;
  authStatusSlot?: ReactNode;
}

export default function Header({
  title = '',
  subtitle,
  iconType = 'nexs',
  isReadingMode = false,
  authStatusSlot,
}: HeaderProps) {
  // アイコンの選択
  const renderIcon = () => {
    switch (iconType) {
      case 'lab':
        return <Icons.BookSearch size={20} className="text-gray-900" />;
      case 'library':
        return <Icons.Library size={20} className="text-gray-900" />;
      case 'office':
        return <Icons.DoorClosed size={20} className="text-gray-900" />;
      case 'mydesk':
        return <Icons.LampDesk size={20} className="text-gray-900" />;
      default:
        return (
          <img
            src="https://res.cloudinary.com/dl4pdwpyi/image/upload/v1768697017/nexs_3_tvxqjr.png"
            alt="nexs logo"
            className="w-5 h-5 rounded-full object-contain"
          />
        );
    }
  };

  return (
    <div
      className={`
        fixed top-0 inset-x-0 z-30 bg-transparent px-5 py-4 flex justify-between items-start
        transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1)
        ${isReadingMode ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'}
      `}
    >
      <div className="flex flex-col gap-1">
        <span className="font-bold text-lg tracking-tight flex items-center gap-2">
          {renderIcon()}
          {title}
        </span>
        {subtitle && (
          <span className="text-[11px] text-gray-500 leading-snug">
            {subtitle}
          </span>
        )}
      </div>

      {/* Auth Status */}
      {authStatusSlot}
    </div>
  );
}
