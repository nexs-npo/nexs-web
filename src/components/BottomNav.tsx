import { Icons } from './Icons';

interface BottomNavProps {
  activeTab: string;
}

const tabs = [
  { id: 'home', icon: Icons.Home, label: 'Home', href: '/' },
  { id: 'projects', icon: Icons.Projects, label: 'Projects', href: '/projects/' },
  { id: 'signals', icon: Icons.Signals, label: 'Signals', href: '/signals/' },
  { id: 'about', icon: Icons.Info, label: 'About', href: '/about/' },
];

export default function BottomNav({ activeTab }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-xl border-t border-gray-100 pb-safe pt-2 px-6 z-50 shadow-nav">
      <div className="flex justify-between items-center max-w-md mx-auto h-16">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
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
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              <span
                className={`text-[10px] font-bold tracking-tight ${
                  isActive ? 'opacity-100' : 'opacity-0'
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
