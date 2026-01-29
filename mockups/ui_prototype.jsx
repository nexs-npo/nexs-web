import React, { useEffect, useRef, useState } from 'react';

// --- Icons (Inline SVG) ---
const Icons = {
  Home: (props) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  Projects: (props) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  ),
  Signals: (props) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9" />
      <path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5" />
      <circle cx="12" cy="12" r="2" />
      <path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5" />
      <path d="M19.1 4.9C23 8.8 23 15.2 19.1 19.1" />
    </svg>
  ),
  Info: (props) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" x2="12" y1="16" y2="12" />
      <line x1="12" x2="12.01" y1="8" y2="8" />
    </svg>
  ),
  Search: (props) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  ),
  ArrowRight: (props) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  ),
  ArrowLeft: (props) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </svg>
  ),
  X: (props) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  ),
  Heart: (props) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  ),
  Zap: (props) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  ExternalLink: (props) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" x2="21" y1="14" y2="3" />
    </svg>
  ),
  Users: (props) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  Mail: (props) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  ),
  MessageSquare: (props) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  Send: (props) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <line x1="22" x2="11" y1="2" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  ),
  Shield: (props) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
};

// --- Data ---
const projects = [
  {
    id: 'p1',
    title: 'みんなの事務局',
    category: 'Shared Service',
    status: 'In Progress',
    color: 'bg-blue-50',
    textColor: 'text-blue-900',
    borderColor: 'border-blue-100',
    desc: 'NPO事務局のシェアードサービス化を通じた、評価経済社会の実装実験。',
    hypotheses: [
      '資本主義外での評価経済の可能性検証',
      'ミッション第一組織における人材評価モデルの再構築',
      'NPO支援エコシステムの最適化',
    ],
    discussionCount: 12,
  },
  {
    id: 'p2',
    title: 'open issue',
    category: 'Platform',
    status: 'Prototype',
    color: 'bg-purple-50',
    textColor: 'text-purple-900',
    borderColor: 'border-purple-100',
    desc: '課題の「定義」と「解決」を分散的に行う、課題駆動型AI実装プラットフォーム。',
    hypotheses: [
      '良き課題（Issue）を生み出すための教育プログラム開発',
      '新人育成の場としてのAIワークフロー検証',
      'ペインホルダー・デザイナー・ソルバーの三者間インセンティブ設計',
    ],
    discussionCount: 8,
  },
];

const signals = [
  {
    id: 's1',
    type: 'AI News',
    date: '2h ago',
    title: 'OpenAI DevDay Keynote',
    content:
      'サム・アルトマンの発言から見る、次世代のエージェント指向。自律型AIが組織運営に与える影響について分析しました。',
    tags: ['OpenAI', 'Analysis'],
  },
  {
    id: 's2',
    type: 'Log',
    date: '5h ago',
    title: 'みんなの事務局 PoC開始',
    content:
      '初期導入3団体において、経理業務のAI自動化率の測定を開始しました。想定より高い精度が出ています。',
    tags: ['Experiment', 'Data'],
  },
  {
    id: 's3',
    type: 'AI News',
    date: '1d ago',
    title: 'Anthropicの"Constitutional AI"',
    content:
      '倫理憲章に基づくAIの意思決定プロセスは、NPOのガバナンスに応用できるか？技術文書の解読メモ。',
    tags: ['Ethics', 'Research'],
  },
];

const discussions = [
  {
    id: 'd1',
    user: 'Daiki.T',
    role: 'Researcher',
    text: '「資本主義外」とありますが、持続可能性の担保としてトークンエコノミーの導入は検討していますか？',
    time: '10m ago',
    likes: 5,
    replies: 1,
  },
  {
    id: 'd2',
    user: 'nexs_admin',
    role: 'Owner',
    text: 'ありがとうございます。はい、地域通貨プロジェクトでの知見を活かし、貢献度に応じた非金銭的インセンティブ（評判スコア等）の実装を計画中です。',
    time: '5m ago',
    likes: 2,
    replies: 0,
  },
  {
    id: 'd3',
    user: 'Guest_User',
    role: 'Visitor',
    text: '事務局のアウトソーシングはセキュリティ面での懸念を持つ団体も多そうです。',
    time: '1h ago',
    likes: 8,
    replies: 0,
  },
];

// --- Components ---

const BottomNav = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'home', icon: Icons.Home, label: 'Home' },
    { id: 'projects', icon: Icons.Projects, label: 'Projects' },
    { id: 'signals', icon: Icons.Signals, label: 'Signals' },
    { id: 'about', icon: Icons.Info, label: 'About' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-xl border-t border-gray-100 pb-safe pt-2 px-6 z-50 shadow-nav">
      <div className="flex justify-between items-center max-w-md mx-auto h-16">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center w-16 space-y-1 transition-all duration-300 ${isActive ? 'text-black transform -translate-y-1' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              <span
                className={`text-[10px] font-bold tracking-tight ${isActive ? 'opacity-100' : 'opacity-0'}`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

const Header = ({ title, showSearch = true }) => (
  <div className="fixed top-0 inset-x-0 z-30 bg-white/90 backdrop-blur-md px-5 py-3 flex justify-between items-center border-b border-gray-50 transition-all duration-300">
    <span className="font-bold text-lg tracking-tight flex items-center gap-2">
      <span className="w-3 h-3 bg-black rounded-sm"></span>
      {title || 'nexs'}
    </span>
    {showSearch && (
      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors">
        <Icons.Search size={16} className="text-gray-400" />
      </div>
    )}
  </div>
);

const ConceptCard = ({ onClose, onNavigate }) => (
  <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-xl shadow-soft border border-gray-200 relative overflow-hidden group transition-all animate-fade-in-up mb-8">
    <div className="relative z-10">
      <div className="flex justify-between items-start mb-2">
        <p className="font-mono text-xs text-gray-400 uppercase tracking-widest">
          About Us
        </p>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="p-1 -mr-2 -mt-2 text-gray-300 hover:text-gray-500 transition-colors"
        >
          <Icons.X size={18} />
        </button>
      </div>
      <h2 className="text-xl font-bold leading-snug mb-3 text-gray-800">
        社会をデザインする、
        <br />
        柔らかな実験場。
      </h2>
      <p className="text-xs text-gray-500 leading-relaxed mb-4 max-w-[90%]">
        nexsは、AI時代の社会システムを実証・還元するリサーチコレクティブです。
      </p>
      <button
        onClick={onNavigate}
        className="inline-flex items-center gap-2 text-xs font-bold text-black border-b border-gray-300 pb-0.5 hover:border-black transition-colors"
      >
        組織概要を見る <Icons.ArrowRight size={12} />
      </button>
    </div>
    <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-gray-100 rounded-full blur-2xl opacity-80 mix-blend-multiply pointer-events-none"></div>
  </div>
);

const ProjectCard = ({ project, onClick }) => (
  <div
    onClick={() => onClick(project)}
    className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 active:scale-[0.98] transition-all cursor-pointer group hover:border-gray-300"
  >
    <div className="flex justify-between items-start mb-3">
      <span
        className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${project.color} ${project.textColor}`}
      >
        {project.category}
      </span>
      <div
        className={`w-2 h-2 rounded-full ${project.status === 'In Progress' ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}
      ></div>
    </div>
    <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight group-hover:text-gray-600 transition-colors">
      {project.title}
    </h3>
    <p className="text-xs text-gray-500 leading-relaxed mb-4 line-clamp-2">
      {project.desc}
    </p>

    {/* Hypotheses Preview */}
    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
      <p className="text-[10px] text-gray-400 font-bold uppercase mb-2 flex items-center gap-1">
        <Icons.Zap size={10} /> Research Items
      </p>
      <ul className="space-y-1.5">
        {project.hypotheses.slice(0, 2).map((item, idx) => (
          <li
            key={idx}
            className="text-xs text-gray-600 flex items-start gap-1.5 leading-snug"
          >
            <span className="mt-1 w-1 h-1 rounded-full bg-gray-400 shrink-0"></span>
            {item}
          </li>
        ))}
      </ul>
    </div>

    <div className="mt-4 flex items-center justify-between border-t border-gray-50 pt-3">
      <span className="text-xs font-bold text-gray-400 group-hover:text-black transition-colors flex items-center gap-1">
        詳細を見る <Icons.ArrowRight size={12} />
      </span>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 text-gray-400 text-[10px] group-hover:text-blue-500 transition-colors">
          <Icons.MessageSquare size={14} /> {project.discussionCount}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="text-gray-300 hover:text-red-400 transition-colors"
        >
          <Icons.Heart size={18} />
        </button>
      </div>
    </div>
  </div>
);

const SignalCard = ({ signal }) => (
  <div className="flex gap-4 p-4 border-b border-gray-50 last:border-0 bg-white active:bg-gray-50 transition-colors cursor-pointer">
    <div className="shrink-0 pt-1">
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center ${signal.type === 'AI News' ? 'bg-black text-white' : 'bg-gray-100 text-gray-500'}`}
      >
        <Icons.Zap size={18} />
      </div>
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-[10px] font-bold text-gray-500">
          {signal.type}
        </span>
        <span className="text-[10px] text-gray-300">•</span>
        <span className="text-[10px] text-gray-400 font-mono">
          {signal.date}
        </span>
      </div>
      <h4 className="text-sm font-bold text-gray-900 mb-1 leading-snug">
        {signal.title}
      </h4>
      <p className="text-xs text-gray-600 leading-relaxed line-clamp-2 mb-2">
        {signal.content}
      </p>
      <div className="flex flex-wrap gap-1">
        {signal.tags.map((tag) => (
          <span
            key={tag}
            className="text-[9px] px-1.5 py-0.5 bg-gray-50 border border-gray-100 rounded text-gray-500"
          >
            #{tag}
          </span>
        ))}
      </div>
    </div>
  </div>
);

// --- Discussion Drawer Component ---
const DiscussionDrawer = ({ project, isOpen, onClose }) => {
  const [commentText, setCommentText] = useState('');
  const sheetRef = useRef(null);

  const handleSend = () => {
    if (!commentText) return;
    setCommentText('');
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[70] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      ></div>

      {/* Sheet */}
      <div
        className={`fixed inset-x-0 bottom-0 z-[75] bg-white rounded-t-3xl shadow-2xl transition-transform duration-300 ease-out transform ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
        style={{ height: '85vh' }}
      >
        {/* Drag Handle */}
        <div className="w-full flex justify-center pt-3 pb-1" onClick={onClose}>
          <div className="w-12 h-1.5 bg-gray-200 rounded-full"></div>
        </div>

        {/* Header */}
        <div className="px-5 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`w-2 h-2 rounded-full ${project?.status === 'In Progress' ? 'bg-green-500' : 'bg-gray-300'}`}
            ></span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              {project?.category}
            </span>
          </div>
          <h3 className="text-base font-bold text-gray-900 line-clamp-1">
            {project?.title}
          </h3>
        </div>

        {/* Discussion List (Scrollable) */}
        <div className="overflow-y-auto p-5 pb-32 h-full bg-gray-50/50">
          <div className="space-y-6">
            {/* Notice */}
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-xs text-blue-900 flex gap-3">
              <Icons.Shield size={16} className="shrink-0 mt-0.5" />
              <div>
                <p className="font-bold mb-1">オープンディスカッション</p>
                <p className="leading-relaxed opacity-80">
                  この議論は公開され、誰でも閲覧可能です。建設的な対話を心がけてください。
                  <br />
                  <span className="opacity-60 text-[10px] mt-1 block">
                    License: CC BY 4.0
                  </span>
                </p>
              </div>
            </div>

            {discussions.map((item) => (
              <div key={item.id} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-white border border-gray-200 shrink-0 flex items-center justify-center text-[10px] font-bold text-gray-500 shadow-sm">
                  {item.user.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="text-xs font-bold text-gray-900">
                      {item.user}{' '}
                      <span className="text-[9px] font-normal text-gray-500 px-1.5 py-0.5 bg-gray-100 rounded-full ml-1">
                        {item.role}
                      </span>
                    </span>
                    <span className="text-[9px] text-gray-400">
                      {item.time}
                    </span>
                  </div>
                  <div className="bg-white p-3 rounded-tr-xl rounded-b-xl border border-gray-100 shadow-sm">
                    <p className="text-sm text-gray-800 leading-relaxed">
                      {item.text}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 mt-2 ml-1">
                    <button className="text-[10px] font-bold text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors">
                      <Icons.Heart size={12} /> {item.likes}
                    </button>
                    <button className="text-[10px] font-bold text-gray-400 hover:text-black transition-colors">
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Input Area (Fixed) */}
        <div className="absolute bottom-0 inset-x-0 bg-white p-4 border-t border-gray-100 pb-safe z-10">
          <div className="relative">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="議論に参加する..."
              className="w-full bg-gray-50 border border-gray-200 rounded-full pl-5 pr-12 py-3.5 text-sm focus:outline-none focus:border-black transition-colors focus:bg-white focus:ring-1 focus:ring-black/5"
            />
            <button
              onClick={handleSend}
              className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all ${commentText ? 'bg-black text-white' : 'bg-gray-200 text-gray-400'}`}
            >
              <Icons.Send size={16} />
            </button>
          </div>
          <p className="text-[10px] text-gray-400 text-center mt-2">
            投稿には{' '}
            <span className="underline cursor-pointer hover:text-gray-600">
              ログイン (Auth)
            </span>{' '}
            が必要です
          </p>
        </div>
      </div>
    </>
  );
};

// --- Views ---

const HomeView = ({ setActiveTab, openProject }) => {
  const [showCard, setShowCard] = useState(true);

  return (
    <div className="pb-32 pt-16 animate-fade-in-up px-5">
      {showCard && (
        <ConceptCard
          onClose={() => setShowCard(false)}
          onNavigate={() => setActiveTab('about')}
        />
      )}

      {/* Quick Signals */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <Icons.Zap size={16} className="text-yellow-500" /> Latest Signals
          </h2>
          <button
            onClick={() => setActiveTab('signals')}
            className="text-xs text-gray-500 font-medium hover:text-black"
          >
            More
          </button>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {signals.slice(0, 2).map((signal) => (
            <SignalCard key={signal.id} signal={signal} />
          ))}
        </div>
      </section>

      {/* Projects */}
      <section>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <Icons.Projects size={16} className="text-blue-500" /> Active
            Experiments
          </h2>
          <button
            onClick={() => setActiveTab('projects')}
            className="text-xs text-gray-500 font-medium hover:text-black"
          >
            View All
          </button>
        </div>
        <div className="space-y-4">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={openProject}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

const ProjectsView = ({ openProject }) => (
  <div className="pb-32 pt-16 animate-fade-in-up px-5 min-h-screen">
    <h1 className="text-2xl font-bold mb-2">Experiments</h1>
    <p className="text-xs text-gray-500 mb-6">
      進行中の社会実装プロジェクトと検証項目。
    </p>

    <div className="space-y-6">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} onClick={openProject} />
      ))}
    </div>
  </div>
);

const SignalsView = () => (
  <div className="pb-32 pt-16 animate-fade-in-up min-h-screen">
    <div className="px-5 mb-4">
      <h1 className="text-2xl font-bold mb-2">Signals</h1>
      <p className="text-xs text-gray-500">
        AIが収集した業界動向と、研究員による実験ログ。
      </p>
    </div>

    <div className="bg-white border-t border-gray-100">
      {signals.map((signal) => (
        <SignalCard key={signal.id} signal={signal} />
      ))}
      {signals.map((signal) => (
        <SignalCard
          key={signal.id + '_dup'}
          signal={{ ...signal, id: signal.id + '_dup', date: '2d ago' }}
        />
      ))}
    </div>
  </div>
);

const AboutView = () => (
  <div className="pb-32 pt-16 px-5 min-h-screen bg-white animate-fade-in-up">
    <div className="mb-8">
      <p className="font-mono text-xs text-gray-400 uppercase tracking-widest mb-2">
        Organization
      </p>
      <h1 className="text-2xl font-bold mb-4">About nexs</h1>
      <p className="text-sm text-gray-600 leading-relaxed">
        次世代社会デザイン研究機構（nexs）は、テクノロジーと社会システムの交差点における新たな価値創造を目指すリサーチコレクティブです。
      </p>
    </div>

    <div className="space-y-6">
      <div className="p-5 bg-gray-50 rounded-xl border border-gray-100">
        <h3 className="font-bold text-sm mb-2">Our Mission</h3>
        <p className="text-xs text-gray-600 leading-relaxed">
          「仮説・実証・還元」のサイクルを通じ、持続可能な社会のプロトタイプを提示すること。私たちは実験の結果だけでなく、そのプロセスで得られた全てのナレッジを社会の共有財産として公開します。
        </p>
      </div>

      <dl className="space-y-4 text-sm border-t border-gray-100 pt-4">
        <div className="grid grid-cols-3 gap-4">
          <dt className="text-gray-500 text-xs font-bold uppercase pt-1">
            Name
          </dt>
          <dd className="col-span-2 font-medium text-gray-800">
            次世代社会デザイン研究機構
          </dd>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <dt className="text-gray-500 text-xs font-bold uppercase pt-1">
            Status
          </dt>
          <dd className="col-span-2 font-medium text-gray-800">
            NPO法人化準備中
          </dd>
        </div>
      </dl>

      <div className="pt-6 border-t border-gray-100">
        <a
          href="mailto:info@nexs.jp"
          className="flex items-center justify-between p-4 bg-black text-white rounded-xl shadow-lg active:scale-[0.98] transition-transform"
        >
          <span className="font-bold text-sm flex items-center gap-2">
            <Icons.Mail size={16} /> お問い合わせ
          </span>
          <Icons.ArrowRight size={16} />
        </a>
      </div>
    </div>
  </div>
);

const ProjectDetailOverlay = ({ project, onClose, onOpenDiscussion }) => {
  if (!project) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-white flex flex-col animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white/95 backdrop-blur border-b border-gray-100">
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <Icons.ArrowLeft size={24} />
        </button>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 bg-gray-100 hover:bg-red-50 hover:text-red-500 rounded-full text-xs font-bold transition-colors flex items-center gap-1">
            <Icons.Heart size={14} /> 応援
          </button>
          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500">
            <Icons.ExternalLink size={20} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 pb-32">
        <div className="pt-6">
          <span
            className={`inline-block px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider mb-4 ${project.color} ${project.textColor}`}
          >
            {project.category}
          </span>
          <h1 className="text-2xl font-bold leading-tight mb-4 text-gray-900">
            {project.title}
          </h1>
          <p className="text-sm text-gray-600 leading-relaxed mb-8">
            {project.desc}
            <br />
            <br />
            本プロジェクトでは、以下の仮説検証を中心に、実証実験とデータ収集を行っています。
          </p>

          {/* Research Items */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Icons.Zap size={14} /> 検証中の仮説 (Research Items)
            </h3>
            <div className="space-y-3">
              {project.hypotheses.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-gray-50 p-4 rounded-xl border border-gray-100"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white border border-gray-200 text-[10px] font-bold shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-sm font-medium text-gray-800 leading-snug">
                      {item}
                    </p>
                  </div>
                  <div className="mt-3 pl-8 flex gap-2">
                    <span className="text-[10px] bg-white px-2 py-0.5 rounded border border-gray-100 text-gray-500">
                      データ収集中
                    </span>
                    <button
                      onClick={onOpenDiscussion}
                      className="text-[10px] text-blue-600 font-bold hover:underline"
                    >
                      議論を見る
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Outputs / Reports */}
          <div className="mb-12">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4">
              Outputs
            </h3>
            <div className="border border-gray-100 rounded-xl divide-y divide-gray-100">
              <div className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold">PoC中間報告書_v1.0.pdf</p>
                  <p className="text-[10px] text-gray-400">2024.12.10 Update</p>
                </div>
                <Icons.ExternalLink size={14} className="text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Action Footer */}
      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 p-4 pb-safe z-[70]">
        <div className="max-w-md mx-auto flex gap-3">
          <button className="flex-1 bg-black text-white py-3.5 rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 shadow-lg">
            <Icons.Users size={18} /> プロジェクトに参加
          </button>
          <button
            onClick={onOpenDiscussion}
            className="flex-1 bg-white border border-gray-200 text-gray-900 py-3.5 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <Icons.MessageSquare size={18} /> 議論に参加 (
            {project.discussionCount})
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main App ---

const App = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedProject, setSelectedProject] = useState(null);
  const [isDiscussionOpen, setIsDiscussionOpen] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomeView
            setActiveTab={setActiveTab}
            openProject={setSelectedProject}
          />
        );
      case 'projects':
        return <ProjectsView openProject={setSelectedProject} />;
      case 'signals':
        return <SignalsView />;
      case 'about':
        return <AboutView />;
      default:
        return (
          <HomeView
            setActiveTab={setActiveTab}
            openProject={setSelectedProject}
          />
        );
    }
  };

  return (
    <div className="bg-gray-200 min-h-screen font-sans text-gray-900 flex justify-center">
      <div className="w-full max-w-md bg-white min-h-screen shadow-2xl relative overflow-hidden flex flex-col">
        <Header
          title={activeTab === 'about' ? 'About' : 'nexs'}
          showSearch={activeTab !== 'about'}
        />
        <main className="flex-1 bg-white relative">{renderContent()}</main>
        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

        {selectedProject && (
          <ProjectDetailOverlay
            project={selectedProject}
            onClose={() => setSelectedProject(null)}
            onOpenDiscussion={() => setIsDiscussionOpen(true)}
          />
        )}

        <DiscussionDrawer
          project={selectedProject}
          isOpen={isDiscussionOpen}
          onClose={() => setIsDiscussionOpen(false)}
        />
      </div>
    </div>
  );
};

export default App;
