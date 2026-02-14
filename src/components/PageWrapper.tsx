import { type ReactNode, useState } from 'react';
import AuthStatus from './auth/AuthStatus';
import BottomNav from './BottomNav';
import Header from './Header';

interface PageWrapperProps {
  children: ReactNode;
  activeTab: string;
  headerTitle?: string;
  headerSubtitle?: string;
  headerIconType?: 'lab' | 'library' | 'nexs' | 'office' | 'mydesk';
  isAuthenticated?: boolean;
}

export default function PageWrapper({
  children,
  activeTab,
  headerTitle,
  headerSubtitle,
  headerIconType = 'nexs',
  isAuthenticated = false,
}: PageWrapperProps) {
  const [isReadingMode, setIsReadingMode] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        title={headerTitle}
        subtitle={headerSubtitle}
        iconType={headerIconType}
        isReadingMode={isReadingMode}
        authStatusSlot={<AuthStatus isAuthenticatedSSR={isAuthenticated} />}
      />

      <main
        className={`
          flex-1 transition-all duration-500
          ${isReadingMode ? 'pt-8 pb-10' : 'pt-24 pb-32'}
        `}
      >
        {children}
      </main>

      <BottomNav
        activeTab={activeTab}
        isReadingMode={isReadingMode}
        onToggleReadingMode={() => setIsReadingMode(!isReadingMode)}
      />
    </div>
  );
}
