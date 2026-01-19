import React from 'react';
import { HelpCircle, Code, CheckCircle, RefreshCcw, ChevronRight, RefreshCw } from 'lucide-react';

const CycleDiagram = () => {
  const steps = [
    {
      title: '仮説',
      description: '問いの発見',
      icon: <HelpCircle className="w-4 h-4 md:w-6 md:h-6" />,
      color: 'from-blue-500 to-cyan-500',
      lightColor: 'from-blue-50 to-cyan-50',
      iconBg: 'bg-gradient-to-br from-blue-100 to-cyan-100',
      iconBgHover: 'from-blue-600 to-cyan-600',
    },
    {
      title: '実装',
      description: '解の探索',
      icon: <Code className="w-4 h-4 md:w-6 md:h-6" />,
      color: 'from-purple-500 to-pink-500',
      lightColor: 'from-purple-50 to-pink-50',
      iconBg: 'bg-gradient-to-br from-purple-100 to-pink-100',
      iconBgHover: 'from-purple-600 to-pink-600',
    },
    {
      title: '検証',
      description: '知の蓄積',
      icon: <CheckCircle className="w-4 h-4 md:w-6 md:h-6" />,
      color: 'from-green-500 to-emerald-500',
      lightColor: 'from-green-50 to-emerald-50',
      iconBg: 'bg-gradient-to-br from-green-100 to-emerald-100',
      iconBgHover: 'from-green-600 to-emerald-600',
    },
    {
      title: '共有',
      description: '社会の更新',
      icon: <RefreshCcw className="w-4 h-4 md:w-6 md:h-6" />,
      color: 'from-orange-500 to-red-500',
      lightColor: 'from-orange-50 to-red-50',
      iconBg: 'bg-gradient-to-br from-orange-100 to-red-100',
      iconBgHover: 'from-orange-600 to-red-600',
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto p-2 md:p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl">
      <div className="relative">
        {/* Main step flow */}
        <div className="flex flex-row items-center justify-between gap-1 md:gap-3 relative z-10">
          {steps.map((step, index) => (
            <React.Fragment key={index}>
              <div className="flex flex-col items-center flex-1 min-w-0">
                {/* Step box with gradient design */}
                <div className="group relative flex flex-col items-center p-3 md:p-6 w-full border-2 md:border-3 border-gray-200 rounded-xl md:rounded-2xl bg-white hover:shadow-2xl transition-all duration-300 overflow-hidden">
                  {/* Gradient background on hover */}
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 bg-gradient-to-br ${step.color} transition-opacity duration-300`}></div>

                  {/* Content */}
                  <div className="relative z-10">
                    {/* Icon with gradient background */}
                    <div className={`mb-2 md:mb-4 p-2 md:p-3 ${step.iconBg} rounded-full group-hover:shadow-lg transition-all duration-300 text-gray-700 group-hover:text-white flex items-center justify-center`}>
                      <div className={`group-hover:bg-gradient-to-br ${step.iconBgHover} group-hover:text-white rounded-full p-1 md:p-2 transition-all duration-300`}>
                        {step.icon}
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-sm md:text-xl font-bold text-gray-900 text-center leading-tight mb-1">
                      {step.title}
                    </h3>

                    {/* Description */}
                    <p className="hidden md:block text-xs text-gray-600 text-center font-medium">
                      {step.description}
                    </p>
                  </div>

                  {/* Step number badge */}
                  <div className={`absolute -top-3 -right-3 w-8 md:w-10 h-8 md:h-10 rounded-full bg-gradient-to-br ${step.color} text-white font-black text-xs md:text-sm flex items-center justify-center shadow-lg border-4 border-white group-hover:scale-110 transition-transform duration-300`}>
                    {String(index + 1).padStart(2, '0')}
                  </div>
                </div>
              </div>

              {/* Arrow between steps */}
              {index < steps.length - 1 && (
                <div className="flex items-center justify-center text-gray-400 flex-shrink-0 hover:text-gray-600 transition-colors duration-300">
                  <ChevronRight className="w-4 h-4 md:w-8 md:h-8" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Loop back arrow */}
        <div className="mt-4 md:mt-8 relative h-12 md:h-24 w-full">
          <svg className="w-full h-full" viewBox="0 0 800 100" fill="none" preserveAspectRatio="none">
            {/* Main curve path */}
            <path
              d="M 750,10 L 750,40 Q 750,60 730,60 L 70,60 Q 50,60 50,40 L 50,15"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-300 drop-shadow-sm"
            />
            {/* Arrow head */}
            <path d="M 45,20 L 50,8 L 58,18" fill="currentColor" className="text-gray-300" />
          </svg>

          {/* Center label */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-white px-4 md:px-8 py-2 md:py-4 border-2 border-gray-200 rounded-xl md:rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <p className="text-xs md:text-base font-bold text-gray-900 flex items-center gap-2 md:gap-3 whitespace-nowrap">
                <RefreshCw className="w-3 h-3 md:w-5 md:h-5 animate-spin-slow text-gray-400" />
                <span className="hidden sm:inline text-gray-700">前提の変化による新たな問いの発生</span>
                <span className="sm:hidden text-gray-700">新たな問いの発生</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Custom animations */}
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
