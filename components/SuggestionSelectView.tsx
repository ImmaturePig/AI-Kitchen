
import React from 'react';
import { RecipeSuggestion } from '../types';

interface SuggestionSelectViewProps {
  suggestions: RecipeSuggestion[];
  ingredients: string;
  onSelect: (suggestion: RecipeSuggestion) => void;
  onBack: () => void;
}

export const SuggestionSelectView: React.FC<SuggestionSelectViewProps> = ({ suggestions, ingredients, onSelect, onBack }) => {
  return (
    <div className="min-h-screen bg-stone-50 pb-12 animate-fade-in">
       {/* Header */}
       <div className="bg-white sticky top-0 z-40 px-6 py-5 shadow-sm border-b border-stone-100 flex justify-between items-center">
         <h2 className="text-xl font-serif-display font-bold text-stone-900">为您推荐</h2>
         <button onClick={onBack} className="text-stone-500 hover:text-stone-900 font-medium text-sm">
           返回
         </button>
       </div>

       <div className="p-6 max-w-xl mx-auto">
         <div className="mb-6">
           <div className="inline-block bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full mb-2">
             冰箱大作战
           </div>
           <p className="text-stone-500 text-sm">
             根据您的食材 <span className="text-stone-800 font-bold">"{ingredients}"</span>，大厨为您想到了这几道菜：
           </p>
         </div>

         <div className="space-y-4">
           {suggestions.map((item, idx) => (
             <div 
               key={idx}
               onClick={() => onSelect(item)}
               className="bg-white p-5 rounded-2xl shadow-sm border border-stone-100 hover:shadow-md hover:border-amber-200 transition-all cursor-pointer group"
             >
               <div className="flex justify-between items-start mb-2">
                 <h3 className="text-lg font-bold text-stone-900 group-hover:text-amber-700 transition-colors">
                   {item.title}
                 </h3>
                 <span className="text-stone-300 group-hover:text-amber-500 transition-colors">
                   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                 </span>
               </div>
               
               <p className="text-sm text-stone-500 mb-4">{item.description}</p>
               
               <div className="flex flex-col space-y-2 text-xs">
                 <div className="flex items-start text-green-700 bg-green-50 p-2 rounded-lg">
                    <span className="font-bold mr-2 whitespace-nowrap">✅ 匹配:</span>
                    <span>{item.matchReason}</span>
                 </div>
                 {item.missingIngredients && item.missingIngredients.length > 0 && (
                   <div className="flex items-start text-stone-500 bg-stone-100 p-2 rounded-lg">
                      <span className="font-bold mr-2 whitespace-nowrap">🛒 需补:</span>
                      <span>{item.missingIngredients.join(', ')}</span>
                   </div>
                 )}
               </div>
             </div>
           ))}
         </div>
         
         <div className="mt-8 text-center text-xs text-stone-400">
           没有喜欢的？尝试调整一下输入的食材吧
         </div>
       </div>
    </div>
  );
};
