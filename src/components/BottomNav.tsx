import type { SVGProps } from 'react';

import { Icons } from './Icons';

interface BottomNavProps {
  activeTab: string;
  isReadingMode?: boolean;
}

type IconComponent = (props: SVGProps<SVGSVGElement>) => JSX.Element;

type Tab =
  | { id: string; label: string; href: string; icon: IconComponent }
  | {
      id: string;
      label: string;
      href: string;
      imageSrc: string;
      imageAlt: string;
    };

const tabs: Tab[] = [
  { id: 'lab', label: '研究室', href: '/lab/', icon: Icons.BookSearch },
  { id: 'library', label: '書庫', href: '/library/', icon: Icons.Library },
  {
    id: 'nexs',
    label: 'nexs',
    href: '/',
    imageSrc:
      'https://res.cloudinary.com/dl4pdwpyi/image/upload/v1768697017/nexs_3_tvxqjr.png',
    imageAlt: 'nexs logo',
  },
  { id: 'office', label: '事務局', href: '/office/', icon: Icons.DoorClosed },
  {
    id: 'mydesk',
    label: 'マイデスク',
    href: '/mydesk/',
    icon: Icons.LampDesk,
  },
];

export default function BottomNav({
  activeTab,
  isReadingMode = false,
}: BottomNavProps) {
  return (
    <div
      className={`
        fixed bottom-8 left-6 right-6 z-40 max-w-sm mx-auto
        transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1)
        ${
          !isReadingMode
            ? 'translate-y-0 opacity-100 pointer-events-auto'
            : 'translate-y-[150%] opacity-0 pointer-events-none'
        }
      `}
    >
      {/* ナビゲーションコンテナ */}
      <nav className="relative bg-white/90 backdrop-blur-xl rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/50 h-[64px] px-1 flex items-center justify-between overflow-hidden">
        <div className="w-full grid grid-cols-5 h-full">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = 'icon' in tab ? tab.icon : null;

            return (
              <a
                key={tab.id}
                href={tab.href}
                className="relative h-full flex flex-col items-center justify-center group focus:outline-none"
              >
                {/* アイコン部分 */}
                <div
                  className={`
                    relative z-10 transition-all duration-300 transform
                    ${isActive ? 'scale-110 -translate-y-1' : 'scale-100 group-hover:scale-105'}
                  `}
                >
                  {Icon ? (
                    <Icon
                      size={24}
                      className={`
                        transition-colors duration-300
                        ${isActive ? 'text-black' : 'text-gray-400 group-hover:text-gray-600'}
                      `}
                    />
                  ) : (
                    'imageSrc' in tab && (
                      <img
                        src={tab.imageSrc}
                        alt={tab.imageAlt}
                        className={`h-6 w-6 rounded-full object-contain transition-opacity ${
                          isActive ? 'opacity-100' : 'opacity-70'
                        }`}
                      />
                    )
                  )}
                </div>

                {/* 選択中のラベル (nexsは常に表示) */}
                <span
                  className={`
                    absolute bottom-2 text-[9px] font-bold tracking-tight transition-all duration-300
                    ${isActive || tab.id === 'nexs' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'}
                  `}
                >
                  {tab.label}
                </span>
              </a>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
