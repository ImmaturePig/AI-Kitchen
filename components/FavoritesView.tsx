
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
                 className="bg-white rounded-2xl shadow-sm border border-stone-100 hover:shadow-lg transition-all cursor-pointer group relative overflow-hidden flex"
               >
                 {/* Image Section */}
                 <div className="w-32 h-32 flex-shrink-0 bg-stone-200 relative">
                    {recipe.imageUrl ? (
                      <img src={recipe.imageUrl} alt={recipe.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-400 text-2xl">🥘</div>
                    )}
                 </div>

                 {/* Content Section */}
                 <div className="flex-1 p-4 flex flex-col justify-between">
                   <div className="flex justify-between items-start">
                     <div className="pr-8">
                       <h3 className="text-lg font-bold text-stone-900 group-hover:text-amber-700 transition-colors line-clamp-1">
                         {recipe.title}
                       </h3>
                       <div className="flex items-center space-x-2 mt-1 mb-2">
                          <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md uppercase tracking-wide">
                            {recipe.cuisineType}
                          </span>
                          <span className="text-[10px] text-stone-400">
                             {recipe.cookTime} · {recipe.difficulty === 'Easy' ? '简单' : recipe.difficulty === 'Medium' ? '中等' : '困难'}
                          </span>
                       </div>
                     </div>
                     <button 
                        onClick={(e) => onRemove(recipe.id, e)}
                        className="absolute top-4 right-4 p-2 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                        title="取消收藏"
                      >
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                          <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                        </svg>
                      </button>
                   </div>
                   
                   <div className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                     {recipe.description}
                   </div>
                 </div>
               </div>
             ))}
           </div>
         )}
       </div>
    </div>
  );
};
