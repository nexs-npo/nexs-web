import { SignInButton } from '@clerk/astro/react';

export default function LoginPrompt() {
  return (
    <div className="animate-fade-in-up">
      <div className="flex flex-col items-center justify-center px-5 max-w-md mx-auto pt-16 text-center">
        {/* Icon: Lock */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-gray-300 mb-6"
        >
          <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>

        {/* Message */}
        <h2 className="text-lg font-bold text-gray-900 mb-2">
          ログインが必要です
        </h2>
        <p className="text-sm text-gray-500 leading-relaxed mb-8">
          MyDeskにアクセスするには、
          <br />
          ログインしてください。
        </p>

        {/* Sign In Button */}
        <SignInButton mode="modal">
          <button className="px-6 py-3 bg-gray-900 text-white text-sm font-bold rounded-lg hover:bg-gray-800 transition-colors active:scale-95">
            ログイン
          </button>
        </SignInButton>

        {/* Note */}
        <p className="text-xs text-gray-400 mt-6 font-mono">
          ログイン後、あなたの役割に応じた
          <br />
          専用デスクが表示されます
        </p>
      </div>
    </div>
  );
}
