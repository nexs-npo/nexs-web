import { SignOutButton as ClerkSignOutButton } from '@clerk/astro/react';

export default function SignOutButton() {
  return (
    <ClerkSignOutButton signOutOptions={{ redirectUrl: '/' }}>
      <button className="w-full px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors active:scale-95">
        ログアウト
      </button>
    </ClerkSignOutButton>
  );
}
