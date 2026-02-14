import { type ReactNode, useEffect, useState } from 'react';
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
  const [isMounted, setIsMounted] = useState(false);

  // クライアントサイドでマウント後にのみ AuthStatus を表示
  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        title={headerTitle}
        subtitle={headerSubtitle}
        iconType={headerIconType}
        isReadingMode={isReadingMode}
        authStatusSlot={
          isMounted ? <AuthStatus isAuthenticatedSSR={isAuthenticated} /> : null
        }
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
