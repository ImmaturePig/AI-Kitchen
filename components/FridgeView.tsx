
import React, { useState } from 'react';
import { Ingredient, UnitType } from '../types';

interface FridgeViewProps {
  fridge: Ingredient[];
  onAdd: (name: string, amount: string) => void;
  onRemove: (name: string) => void;
  onCookWithIngredients: (ingredients: string[]) => void;
  onBack: () => void;
}

const UNIT_OPTIONS: UnitType[] = ['个', 'g', 'kg', 'ml', 'L', '根', '包', '勺', '适量'];

export const FridgeView: React.FC<FridgeViewProps> = ({ fridge, onAdd, onRemove, onCookWithIngredients, onBack }) => {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState<UnitType>('个');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  
  // Edit Mode State
  const [editingItemName, setEditingItemName] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      const finalAmount = unit === '适量' ? '适量' : `${quantity}${unit}`;
      
      // If editing, remove the old one first (conceptually an update)
      // Note: In a real app, we might want an explicit update function, 
      // but here onAdd/onRemove combination works if managed by parent or we just overwrite by name logic if parent supports it.
      // Assuming parent onAdd allows duplicates or we handle it here. 
      // To be safe and clean:
      if (editingItemName && editingItemName !== name.trim()) {
         onRemove(editingItemName);
      }
      // If name is same, onAdd usually overwrites or adds duplicate. 
      // Let's assume onAdd in App.tsx handles "add or update".
      // Actually App.tsx onAdd checks "if (!fridge.find...)" so it prevents duplicates. 
      // We need to explicitly remove if we are "updating" to allow the new value.
      if (editingItemName) {
        onRemove(editingItemName);
      } else {
        // If adding new, remove any existing with same name to ensure update
        onRemove(name.trim());
      }

      onAdd(name.trim(), finalAmount);
      
      // Reset
      setName('');
      setQuantity('');
      setUnit('个');
      setEditingItemName(null);
    }
  };

  const startEdit = (item: Ingredient) => {
    setName(item.name);
    // Parse amount to separate quantity and unit
    const match = item.amount.match(/^(\d+(?:\.\d+)?)\s*([a-zA-Z\u4e00-\u9fa5]+)?$/);
    if (match) {
      setQuantity(match[1]);
      setUnit((match[2] as UnitType) || '个');
    } else if (item.amount === '适量') {
      setQuantity('');
      setUnit('适量');
    } else {
      setQuantity('');
      setUnit('个');
    }
    setEditingItemName(item.name);
  };

  const cancelEdit = () => {
    setName('');
    setQuantity('');
    setUnit('个');
    setEditingItemName(null);
  };

  const toggleSelection = (itemName: string) => {
    const next = new Set(selectedItems);
    if (next.has(itemName)) next.delete(itemName);
    else next.add(itemName);
    setSelectedItems(next);
  };

  return (
    <div className="bg-stone-50 min-h-screen pb-32 animate-fade-in relative">
       {/* Header */}
       <div className="bg-white sticky top-0 z-40 px-6 py-5 shadow-sm border-b border-stone-100 flex justify-between items-center">
         <h2 className="text-2xl font-serif-display font-bold text-stone-900">我的冰箱</h2>
         <button onClick={onBack} className="text-stone-500 hover:text-stone-900 font-medium text-sm">
           返回
         </button>
       </div>

       <div className="p-6 max-w-2xl mx-auto">
         
         {/* Input Form */}
         <div className={`p-5 rounded-2xl shadow-sm border transition-all mb-8 ${editingItemName ? 'bg-amber-50 border-amber-200' : 'bg-white border-stone-100'}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-xs font-bold uppercase tracking-widest ${editingItemName ? 'text-amber-600' : 'text-stone-400'}`}>
                {editingItemName ? '编辑食材' : '添加食材'}
              </h3>
              {editingItemName && (
                <button onClick={cancelEdit} className="text-xs text-stone-400 hover:text-stone-600">取消</button>
              )}
            </div>
            
            <form onSubmit={handleSubmit} className="flex flex-wrap gap-2">
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="食材 (如: 鸡蛋)"
                className="flex-[2] p-3 rounded-xl bg-white border border-stone-200 text-sm focus:outline-none focus:border-stone-300 min-w-[120px]"
              />
              
              <div className="flex flex-1 min-w-[140px] space-x-1">
                 <input 
                  type="number" 
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="数量"
                  disabled={unit === '适量'}
                  className="w-full p-3 rounded-xl bg-white border border-stone-200 text-sm focus:outline-none focus:border-stone-300 disabled:bg-stone-100"
                />
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value as UnitType)}
                  className="bg-stone-100 rounded-xl px-2 text-sm border-r-8 border-transparent outline-none cursor-pointer hover:bg-stone-200"
                >
                  {UNIT_OPTIONS.map(u => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>

              <button 
                type="submit"
                disabled={!name.trim() || (unit !== '适量' && !quantity)}
                className={`px-6 py-3 rounded-xl text-sm font-bold disabled:opacity-50 transition-colors w-full sm:w-auto text-white
                  ${editingItemName ? 'bg-amber-500 hover:bg-amber-600' : 'bg-stone-900 hover:bg-black'}
                `}
              >
                {editingItemName ? '保存' : '添加'}
              </button>
            </form>
         </div>

         {/* Inventory List */}
         <div className="space-y-4">
           {fridge.length === 0 ? (
             <div className="text-center py-10 bg-stone-100 rounded-2xl border border-stone-200 border-dashed">
                <div className="text-4xl mb-3 opacity-30">🧊</div>
                <p className="text-stone-400 text-sm">冰箱空空如也，快添加一些食材吧！</p>
             </div>
           ) : (
             <>
               <div className="flex justify-between items-center mb-2">
                 <span className="text-xs text-stone-400">点击选中食材搜索，或点击铅笔图标编辑</span>
               </div>
               <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                 {fridge.map((item, idx) => {
                   const isSelected = selectedItems.has(item.name);
                   const isEditing = editingItemName === item.name;
                   
                   return (
                     <div 
                       key={idx} 
                       onClick={() => toggleSelection(item.name)}
                       className={`p-3 rounded-xl shadow-sm border flex justify-between items-center group cursor-pointer transition-all relative
                         ${isEditing ? 'ring-2 ring-amber-400 border-amber-400 bg-white' : 
                           isSelected ? 'bg-amber-50 border-amber-200 ring-1 ring-amber-200' : 'bg-white border-stone-100 hover:border-amber-200'}
                       `}
                     >
                        <div className="flex items-center overflow-hidden">
                          <div className={`w-4 h-4 rounded border flex items-center justify-center mr-2 flex-shrink-0 transition-colors
                            ${isSelected ? 'bg-amber-500 border-amber-500' : 'border-stone-300'}`}>
                             {isSelected && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                          </div>
                          <div>
                             <div className={`font-bold truncate ${isSelected ? 'text-amber-900' : 'text-stone-800'}`}>{item.name}</div>
                             <div className="text-xs text-stone-400 font-mono">{item.amount}</div>
                          </div>
                        </div>
                        
                        <div className="flex space-x-1">
                          <button 
                            onClick={(e) => { e.stopPropagation(); startEdit(item); }}
                            className="text-stone-300 hover:text-stone-600 p-1.5 rounded-full hover:bg-stone-100 transition-colors"
                            title="编辑"
                          >
                             <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); onRemove(item.name); }}
                            className="text-stone-300 hover:text-red-400 p-1.5 rounded-full hover:bg-stone-100 transition-colors"
                            title="删除"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </div>
                     </div>
                   );
                 })}
               </div>
             </>
           )}
         </div>
       </div>

       {/* Floating Action Bar */}
       {selectedItems.size > 0 && (
          <div className="fixed bottom-6 left-6 right-6 z-50">
             <button 
               onClick={() => onCookWithIngredients(Array.from(selectedItems))}
               className="w-full py-4 bg-amber-500 text-white rounded-2xl font-bold shadow-xl shadow-amber-500/20 hover:bg-amber-600 transition-all active:scale-95 flex items-center justify-center space-x-2"
             >
                <span className="text-xl">🍳</span>
                <span>用这 {selectedItems.size} 种食材找灵感</span>
             </button>
          </div>
       )}
    </div>
  );
};
