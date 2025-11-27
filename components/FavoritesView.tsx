
import React from 'react';
import { Recipe } from '../types';

interface FavoritesViewProps {
  favorites: Recipe[];
  onSelectRecipe: (recipe: Recipe) => void;
  onBack: () => void;
  onRemove: (id: string, e: React.MouseEvent) => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({ favorites, onSelectRecipe, onBack, onRemove }) => {
  return (
    <div className="bg-stone-50 min-h-screen pb-20 animate-fade-in">
       {/* Header */}
       <div className="bg-white sticky top-0 z-40 px-6 py-5 shadow-sm border-b border-stone-100 flex justify-between items-center">
         <h2 className="text-2xl font-serif-display font-bold text-stone-900">我的收藏</h2>
         <button onClick={onBack} className="text-stone-500 hover:text-stone-900 font-medium text-sm">
           返回
         </button>
       </div>

       <div className="p-6 max-w-2xl mx-auto">
         {favorites.length === 0 ? (
           <div className="flex flex-col items-center justify-center py-20 text-center">
             <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mb-6 text-4xl opacity-50">
               ❤️
             </div>
             <h3 className="text-lg font-bold text-stone-700 mb-2">还没有收藏食谱</h3>
             <p className="text-stone-400 text-sm max-w-xs leading-relaxed">
               当你看到喜欢的食谱时，点击右上角的爱心图标，它就会出现在这里。
             </p>
           </div>
         ) : (
           <div className="grid gap-4">
             {favorites.map(recipe => (
               <div 
                 key={recipe.id}
                 onClick={() => onSelectRecipe(recipe)}
                 className="bg-white p-5 rounded-2xl shadow-sm border border-stone-100 hover:shadow-lg transition-all cursor-pointer group relative overflow-hidden"
               >
                 <div className="flex justify-between items-start">
                   <div>
                     <div className="flex items-center space-x-2 mb-1">
                        <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md uppercase tracking-wide">
                          {recipe.cuisineType}
                        </span>
                        <span className="text-xs text-stone-400">•</span>
                        <span className="text-xs text-stone-400">{recipe.difficulty === 'Easy' ? '简单' : recipe.difficulty === 'Medium' ? '中等' : '困难'}</span>
                     </div>
                     <h3 className="text-xl font-bold text-stone-900 mb-2 group-hover:text-amber-700 transition-colors">
                       {recipe.title}
                     </h3>
                     <p className="text-stone-500 text-sm line-clamp-2 leading-relaxed">
                       {recipe.description}
                     </p>
                   </div>
                   <div className="flex flex-col items-end space-y-4">
                      <button 
                        onClick={(e) => onRemove(recipe.id, e)}
                        className="p-2 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all z-10"
                        title="取消收藏"
                      >
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                          <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                        </svg>
                      </button>
                   </div>
                 </div>
                 <div className="mt-4 pt-4 border-t border-stone-50 flex items-center justify-between text-xs text-stone-400 font-medium">
                   <div className="flex space-x-4">
                     <span className="flex items-center">
                       <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                       {recipe.cookTime}
                     </span>
                     <span className="flex items-center">
                       <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                       {recipe.servings}
                     </span>
                   </div>
                   <span className="text-amber-500 font-bold group-hover:translate-x-1 transition-transform">
                     查看食谱 →
                   </span>
                 </div>
               </div>
             ))}
           </div>
         )}
       </div>
    </div>
  );
};
