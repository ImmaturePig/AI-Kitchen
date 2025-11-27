
import React, { useMemo, useState } from 'react';
import { Recipe, Ingredient } from '../types';

interface ShoppingListProps {
  cart: Recipe[];
  fridge: Ingredient[];
  onRemove: (id: string) => void;
  onBack: () => void;
}

// Helper to parse amount strings
const parseAmount = (amount: string) => {
  const match = amount.match(/^(\d+(?:\.\d+)?)\s*([a-zA-Z\u4e00-\u9fa5]+)?$/);
  if (match) {
    return {
      val: parseFloat(match[1]),
      unit: match[2] || ''
    };
  }
  return null;
};

export const ShoppingList: React.FC<ShoppingListProps> = ({ cart, fridge, onRemove, onBack }) => {
  // Local state to track "checked/purchased" items by name
  const [purchasedItems, setPurchasedItems] = useState<Set<string>>(new Set());

  // Toggle purchased state
  const togglePurchased = (name: string) => {
    const next = new Set(purchasedItems);
    if (next.has(name)) next.delete(name);
    else next.add(name);
    setPurchasedItems(next);
  };

  // Advanced Ingredient Aggregation Logic
  const aggregatedIngredients = useMemo(() => {
    const map = new Map<string, { category: string; amounts: string[] }>();

    cart.forEach(recipe => {
      recipe.ingredients.forEach(ing => {
        const key = ing.name.trim(); // Group by name
        if (!map.has(key)) {
          map.set(key, { category: ing.category || '其他', amounts: [] });
        }
        map.get(key)?.amounts.push(ing.amount);
      });
    });

    const result: Record<string, Ingredient[]> = {
      "肉类": [], "蔬菜": [], "佐料": [], "香料": [], "其他": []
    };

    map.forEach((data, name) => {
      // Try to sum up amounts
      let finalAmount = "";
      let total = 0;
      let commonUnit = null;
      let allParseable = true;

      for (const amt of data.amounts) {
        const parsed = parseAmount(amt);
        if (parsed) {
          if (commonUnit === null) commonUnit = parsed.unit;
          if (commonUnit !== parsed.unit) {
            allParseable = false;
            break;
          }
          total += parsed.val;
        } else {
          allParseable = false;
          break;
        }
      }

      if (allParseable && data.amounts.length > 0) {
        const formattedTotal = Math.round(total * 10) / 10;
        finalAmount = `${formattedTotal}${commonUnit || ''}`;
      } else {
        finalAmount = Array.from(new Set(data.amounts)).join(' + ');
      }

      const category = data.category;
      const targetGroup = result[category] ? result[category] : result["其他"];
      
      targetGroup.push({
        name: name,
        amount: finalAmount,
        category: category
      });
    });

    return result;
  }, [cart]);

  // Helper to check if item is in fridge
  const checkFridge = (itemName: string) => {
     const match = fridge.find(
       f => f.name.includes(itemName) || itemName.includes(f.name)
     );
     return match;
  };

  const categories = ["肉类", "蔬菜", "佐料", "香料", "其他"].filter(cat => aggregatedIngredients[cat].length > 0);

  return (
    <div className="bg-stone-50 min-h-screen pb-20 animate-fade-in">
       {/* Header */}
       <div className="bg-white sticky top-0 z-40 px-6 py-5 shadow-sm border-b border-stone-100 flex justify-between items-center">
         <h2 className="text-2xl font-serif-display font-bold text-stone-900">采购清单</h2>
         <button onClick={onBack} className="text-stone-500 hover:text-stone-900 font-medium text-sm">
           关闭
         </button>
       </div>

       <div className="p-6 max-w-2xl mx-auto">
         {/* Selected Menu */}
         <div className="mb-8">
           <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">今日菜单 ({cart.length})</h3>
           {cart.length === 0 ? (
             <div className="text-center py-10 bg-stone-100 rounded-2xl border border-stone-200 border-dashed text-stone-400 text-sm">
               购物车是空的，快去添加食谱吧！
             </div>
           ) : (
             <div className="space-y-3">
               {cart.map(recipe => (
                 <div key={recipe.id} className="bg-white p-4 rounded-xl shadow-sm border border-stone-100 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-stone-800 block">{recipe.title}</span>
                      <span className="text-xs text-stone-400">{recipe.ingredients.length} 种食材</span>
                    </div>
                    <button 
                      onClick={() => onRemove(recipe.id)}
                      className="text-red-400 hover:text-red-600 p-2 text-sm"
                    >
                      移除
                    </button>
                 </div>
               ))}
             </div>
           )}
         </div>

         {/* Aggregated List */}
         {cart.length > 0 && (
           <>
            <div className="flex items-center mb-6">
              <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest flex-1">汇总清单</h3>
              <div className="flex gap-4 text-[10px] font-bold">
                 <div className="flex items-center text-green-600"><span className="w-2 h-2 rounded-full bg-green-500 mr-1"></span>冰箱</div>
                 <div className="flex items-center text-stone-800"><span className="w-2 h-2 rounded-full border border-stone-300 mr-1"></span>缺货</div>
                 <div className="flex items-center text-stone-400"><span className="w-2 h-2 rounded-full bg-stone-300 mr-1"></span>已买</div>
              </div>
            </div>

            <div className="space-y-6">
              {categories.map(cat => (
                <div key={cat} className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-stone-100">
                  <h4 className="font-serif-display font-bold text-stone-800 mb-4 flex items-center">
                    <span className={`w-2 h-2 rounded-full mr-2 ${
                      cat === '肉类' ? 'bg-red-400' : 
                      cat === '蔬菜' ? 'bg-green-400' : 
                      cat === '佐料' ? 'bg-amber-400' : 'bg-stone-400'
                    }`}></span>
                    {cat}
                  </h4>
                  <ul className="space-y-3">
                    {aggregatedIngredients[cat].map((ing, i) => {
                      const fridgeItem = checkFridge(ing.name);
                      const isPurchased = purchasedItems.has(ing.name);
                      
                      return (
                        <li key={i} className={`flex justify-between items-center text-sm border-b border-stone-50 last:border-0 pb-2 last:pb-0 
                            ${fridgeItem ? 'opacity-60 bg-green-50/30 -mx-2 px-2 py-2 rounded' : ''}
                        `}>
                          <div className="flex items-center">
                            {/* Checkbox (Only if not in fridge) */}
                            {!fridgeItem && (
                              <button 
                                onClick={() => togglePurchased(ing.name)}
                                className={`w-5 h-5 rounded border mr-3 flex items-center justify-center transition-colors
                                  ${isPurchased ? 'bg-stone-300 border-stone-300' : 'border-stone-300 hover:border-amber-400'}
                                `}
                              >
                                {isPurchased && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                              </button>
                            )}
                            
                            {/* Checkmark placeholder for fridge item */}
                            {fridgeItem && (
                              <div className="w-5 h-5 mr-3 flex items-center justify-center">
                                <span className="text-green-500">✓</span>
                              </div>
                            )}

                            <div className="flex flex-col">
                              <span className={`font-medium transition-all ${
                                fridgeItem ? 'text-green-700' : 
                                isPurchased ? 'text-stone-400 line-through' : 'text-stone-800'
                              }`}>
                                {ing.name}
                                {fridgeItem && (
                                  <span className="ml-2 text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold">
                                    库存: {fridgeItem.amount}
                                  </span>
                                )}
                              </span>
                            </div>
                          </div>
                          
                          <span className={`font-mono px-2 py-0.5 rounded ${isPurchased ? 'text-stone-300' : 'text-stone-500 bg-stone-50'}`}>
                            {ing.amount}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
           </>
         )}
       </div>
    </div>
  );
};
