import type { SVGProps } from 'react';

import { Icons } from './Icons';

interface BottomNavProps {
  activeTab: string;
}

type IconComponent = (props: SVGProps<SVGSVGElement>) => JSX.Element;

type Tab =
  | { id: string; label: string; href: string; icon: IconComponent }
  | { id: string; label: string; href: string; imageSrc: string; imageAlt: string };

const tabs: Tab[] = [
  { id: 'signals', icon: Icons.Signals, label: 'Signals', href: '/signals/' },
  { id: 'knowledge', icon: Icons.Library, label: 'Knowledge', href: '/knowledge/' },
  { id: 'projects', icon: Icons.Projects, label: 'Projects', href: '/projects/' },
  {
    id: 'about',
    imageSrc: 'https://res.cloudinary.com/dl4pdwpyi/image/upload/v1768697017/nexs_3_tvxqjr.png',
    imageAlt: 'nexs logo',
    label: 'nexs',
    href: '/about/',
  },
];

export default function BottomNav({ activeTab }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-xl border-t border-gray-100 pb-safe pt-2 px-6 z-50 shadow-nav">
      <div className="flex justify-between items-center max-w-md mx-auto h-16">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <a
              key={tab.id}
              href={tab.href}
              className={`flex flex-col items-center justify-center w-16 space-y-1 transition-all duration-300 ${
                isActive
                  ? 'text-black transform -translate-y-1'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              {'icon' in tab ? (
                <tab.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              ) : (
                <img
                  src={tab.imageSrc}
                  alt={tab.imageAlt}
                  className={`h-6 w-6 rounded-full object-contain transition-opacity ${
                    isActive ? 'opacity-100' : 'opacity-70'
                  }`}
                />
              )}
              <span
                className={`text-[10px] font-bold tracking-tight ${
                  isActive ? 'opacity-100' : tab.id === 'about' ? 'opacity-100' : 'opacity-0'
                }`}
              >
                {tab.label}
              </span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
