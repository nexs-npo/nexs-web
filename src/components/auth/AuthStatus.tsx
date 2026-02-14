import { SignInButton, useUser } from '@clerk/astro/react';
import { CircleUserRound } from 'lucide-react';
import UserButton from './UserButton';

interface AuthStatusProps {
  isAuthenticatedSSR?: boolean;
}

/**
 * 認証状態を表示するクライアントサイドコンポーネント
 * 静的ページでもログイン状態を反映するため、useUser hook を使用
 */
export default function AuthStatus({
  isAuthenticatedSSR = false,
}: AuthStatusProps) {
  // クライアントサイドで認証状態を取得（静的ページでも動作）
  const { isSignedIn, isLoaded } = useUser();

  // クライアントサイドでロード完了後は useUser の結果を使用
  // SSR時またはロード中はプロパティの値を使用
  const isAuthenticated = isLoaded ? isSignedIn : isAuthenticatedSSR;

  return (
    <div className="flex items-center relative z-[60]">
      {isAuthenticated ? (
        <UserButton />
      ) : (
        <SignInButton mode="modal">
          <button
            type="button"
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition-colors"
          >
            <CircleUserRound size={32} className="text-gray-300" />
          </button>
        </SignInButton>
      )}
    </div>
  );
}
