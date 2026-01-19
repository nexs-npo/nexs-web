import React from 'react';
import { HelpCircle, Code, CheckCircle, Share2 } from 'lucide-react';

const CycleDiagram = () => {
  const steps = [
    {
      title: '仮説',
      subtitle: '問いの発見',
      icon: HelpCircle,
      position: 'top-left',
    },
    {
      title: '実装',
      subtitle: '解の探索',
      icon: Code,
      position: 'top-right',
    },
    {
      title: '検証',
      subtitle: '知の蓄積',
      icon: CheckCircle,
      position: 'bottom-left',
    },
    {
      title: '共有',
      subtitle: '社会の更新',
      icon: Share2,
      position: 'bottom-right',
    },
  ];

  return (
    <div className="w-full px-0 md:px-8 py-8 md:py-12 bg-white">
      <div className="max-w-2xl mx-auto relative">
        {/* 2x2グリッドレイアウト */}
        <div className="grid grid-cols-2 gap-4 md:gap-8 mb-8">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <div
                key={index}
                className="flex justify-center"
              >
                <div className="group relative w-full max-w-40 md:max-w-48">
                  {/* ステップボックス */}
                  <div className="flex flex-col items-center p-4 md:p-6 rounded-2xl md:rounded-3xl border-2 border-gray-900 bg-white hover:bg-gray-900 hover:text-white transition-all duration-300 cursor-pointer aspect-square flex-shrink-0">
                    {/* ステップナンバー */}
                    <div className="absolute -top-3 -right-3 md:-top-4 md:-right-4 w-7 h-7 md:w-9 md:h-9 bg-white border-2 border-gray-900 rounded-full flex items-center justify-center font-black text-xs md:text-sm text-gray-900 group-hover:bg-gray-900 group-hover:text-white transition-colors">
                      {index + 1}
                    </div>

                    {/* アイコン */}
                    <div className="mb-2 md:mb-3 p-2 md:p-3 bg-gray-100 rounded-full group-hover:bg-gray-800 transition-colors">
                      <IconComponent className="w-5 h-5 md:w-7 md:h-7" />
                    </div>

                    {/* タイトル */}
                    <h3 className="text-sm md:text-lg font-bold mb-1 md:mb-2 text-center leading-tight">
                      {step.title}
                    </h3>

                    {/* サブタイトル */}
                    <p className="text-xs md:text-sm text-center opacity-70 font-medium leading-tight">
                      {step.subtitle}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ループ矢印の接続線（SVG） */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ top: '-20px', height: 'calc(100% + 40px)' }}
          viewBox="0 0 400 500"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* 右上から右下への矢印 */}
          <path
            d="M 350 80 L 350 220"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="6 4"
            fill="none"
            className="text-gray-300"
          />
          <path
            d="M 347 220 L 350 230 L 353 220"
            fill="currentColor"
            className="text-gray-300"
          />

          {/* 右下から左下への矢印 */}
          <path
            d="M 350 230 L 50 230"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="6 4"
            fill="none"
            className="text-gray-300"
          />
          <path
            d="M 50 227 L 40 230 L 50 233"
            fill="currentColor"
            className="text-gray-300"
          />

          {/* 左下から左上への矢印 */}
          <path
            d="M 50 230 L 50 80"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="6 4"
            fill="none"
            className="text-gray-300"
          />
          <path
            d="M 53 80 L 50 70 L 47 80"
            fill="currentColor"
            className="text-gray-300"
          />

          {/* 左上から右上への矢印 */}
          <path
            d="M 50 70 L 350 70"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="6 4"
            fill="none"
            className="text-gray-300"
          />
          <path
            d="M 350 73 L 360 70 L 350 67"
            fill="currentColor"
            className="text-gray-300"
          />
        </svg>

        {/* ループテキスト */}
        <div className="mt-12 md:mt-16 flex justify-center">
          <div className="bg-gray-50 px-3 md:px-5 py-2 md:py-3 border border-dashed border-gray-300 rounded-lg">
            <p className="text-xs md:text-sm font-bold text-gray-600 text-center">
              前提の変化による新たな問い
            </p>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 768px) {
          svg {
            display: none !important;
          }
        }
      ` }} />
    </div>
  );
};

export default CycleDiagram;
