
import React from 'react';
import { ProposalData, ProposalOption } from '../types';

interface ProposalViewProps {
  proposal: ProposalData;
  onSelect: (option: ProposalOption) => void;
  onCancel: () => void;
}

export const ProposalView: React.FC<ProposalViewProps> = ({ proposal, onSelect, onCancel }) => {
  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-6 animate-fade-in">
      <div className="max-w-md w-full">
        
        <div className="text-center mb-8">
           <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
             🤔
           </div>
           <h2 className="text-2xl font-serif-display font-bold text-stone-900 mb-2">大厨建议</h2>
           <p className="text-stone-500 text-sm">
             您想做的 "{proposal.originalQuery}" 与您的忌口偏好存在冲突。为您准备了两个方案：
           </p>
        </div>

        <div className="space-y-4">
          {/* Safe Option */}
          <button 
            onClick={() => onSelect(proposal.safeOption)}
            className="w-full bg-white p-6 rounded-2xl shadow-sm border border-stone-100 hover:border-green-400 hover:shadow-md transition-all text-left group relative overflow-hidden"
          >
             <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
             <div className="flex justify-between items-start mb-2">
                <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                  推荐 · 符合忌口
                </span>
             </div>
             <h3 className="text-xl font-bold text-stone-800 mb-2 group-hover:text-green-700 transition-colors">
               {proposal.safeOption.title}
             </h3>
             <p className="text-stone-500 text-sm leading-relaxed">
               {proposal.safeOption.description}
             </p>
          </button>

          {/* Original Option */}
          <button 
            onClick={() => onSelect(proposal.originalOption)}
            className="w-full bg-white p-6 rounded-2xl shadow-sm border border-stone-100 hover:border-red-400 hover:shadow-md transition-all text-left group relative overflow-hidden"
          >
             <div className="absolute top-0 left-0 w-1 h-full bg-stone-300 group-hover:bg-red-400 transition-colors"></div>
             <div className="flex justify-between items-start mb-2">
                <span className="bg-stone-100 text-stone-500 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider group-hover:bg-red-100 group-hover:text-red-600 transition-colors">
                  原版 · 含忌口食材
                </span>
             </div>
             <h3 className="text-xl font-bold text-stone-800 mb-2 group-hover:text-stone-900 transition-colors">
               {proposal.originalOption.title}
             </h3>
             <p className="text-stone-500 text-sm leading-relaxed mb-3">
               {proposal.originalOption.description}
             </p>
             
             {/* Warnings */}
             {proposal.originalOption.warnings.length > 0 && (
               <div className="bg-red-50 rounded-lg p-3 flex items-start space-x-2">
                  <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div className="text-xs text-red-600 font-medium">
                    包含: {proposal.originalOption.warnings.join('、')}
                  </div>
               </div>
             )}
          </button>
        </div>

        <button 
          onClick={onCancel}
          className="w-full mt-6 py-3 text-stone-400 text-sm font-medium hover:text-stone-600 transition-colors"
        >
          取消
        </button>

      </div>
    </div>
  );
};
