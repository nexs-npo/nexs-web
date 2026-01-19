import React from 'react';
import { HelpCircle, Code, CheckCircle, RefreshCcw, ChevronRight, RefreshCw } from 'lucide-react';

const CycleDiagram = () => {
  const steps = [
    {
      title: '仮説',
      description: '問いの発見',
      icon: <HelpCircle className="w-4 h-4 md:w-6 md:h-6" />,
    },
    {
      title: '実装',
      description: '解の探索',
      icon: <Code className="w-4 h-4 md:w-6 md:h-6" />,
    },
    {
      title: '検証',
      description: '知の蓄積',
      icon: <CheckCircle className="w-4 h-4 md:w-6 md:h-6" />,
    },
    {
      title: '共有',
      description: '社会の更新',
      icon: <RefreshCcw className="w-4 h-4 md:w-6 md:h-6" />,
    },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto p-2 md:p-4 bg-white relative">
      <div className="relative">
        {/* メインのステップフロー：モバイルでも常に横並び */}
        <div className="flex flex-row items-center justify-between gap-1 md:gap-4 relative z-10">
          {steps.map((step, index) => (
            <React.Fragment key={index}>
              <div className="flex flex-col items-center flex-1 min-w-0">
                {/* メインボックス：モバイル用にサイズを大幅に縮小 */}
                <div className="group relative flex flex-col items-center p-2 md:p-6 w-full border-[1.5px] md:border-2 border-gray-900 rounded-lg md:rounded-2xl bg-white hover:bg-gray-900 hover:text-white transition-all duration-300 shadow-none">
                  <div className="mb-1 md:mb-3 p-1 md:p-3 bg-gray-100 rounded-full group-hover:bg-gray-800 transition-colors">
                    {step.icon}
                  </div>
                  <h3 className="text-[10px] md:text-lg font-bold mb-0.5 leading-none truncate w-full text-center">
                    {step.title}
                  </h3>
                  <p className="hidden md:block text-[10px] md:text-xs text-center opacity-70 font-medium">
                    {step.description}
                  </p>

                  {/* 番号バッジも小さく調整 */}
                  <span className="absolute -top-2 -left-2 bg-white border border-gray-900 text-gray-900 text-[8px] md:text-[10px] font-black px-1 md:px-2 py-0 md:py-0.5 rounded group-hover:bg-white group-hover:text-gray-900">
                    0{index + 1}
                  </span>
                </div>
              </div>

              {/* ステップ間の矢印：常に右向きを表示 */}
              {index < steps.length - 1 && (
                <div className="flex items-center justify-center text-gray-900 flex-shrink-0">
                  <ChevronRight className="w-3 h-3 md:w-6 md:h-6" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* ループバック矢印 (04 -> 01) */}
        <div className="mt-2 md:mt-4 relative h-10 md:h-20 w-full">
          {/* SVG：モバイルとデスクトップで共通のパスを使用 */}
          <svg className="w-full h-full" viewBox="0 0 800 80" fill="none" preserveAspectRatio="none">
            <path
              d="M 700,0 L 700,30 Q 700,50 680,50 L 120,50 Q 100,50 100,30 L 100,10"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeDasharray="6 4"
              className="text-gray-300"
            />
            <path d="M 96,15 L 100,5 L 104,15" fill="currentColor" className="text-gray-300" />
          </svg>

          {/* 中央のテキストラベル：モバイルでも読めるサイズを維持しつつ調整 */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-gray-50 px-3 md:px-6 py-1.5 md:py-3 border border-dashed border-gray-300 rounded-md md:rounded-lg translate-y-1 md:translate-y-2">
              <p className="text-[8px] md:text-base font-bold text-gray-500 flex items-center gap-1.5 md:gap-3">
                <RefreshCw className="w-2.5 h-2.5 md:w-5 md:h-5 animate-spin-slow text-gray-300" />
                <span className="text-gray-900 whitespace-nowrap">前提の変化による新たな問いの発生</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}} />
    </div>
  );
};

export default CycleDiagram;
