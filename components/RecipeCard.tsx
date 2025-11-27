
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Recipe, Ingredient } from '../types';
import { generateDishImage } from '../services/geminiService';

interface RecipeCardProps {
  recipe: Recipe;
  onBack: () => void;
  onAddToCart: (recipe: Recipe) => void;
  isInCart: boolean;
  isFavorite: boolean;
  onToggleFavorite: (recipe: Recipe) => void;
  onCompleteCooking: (recipe: Recipe, actualServings: number) => void;
}

// --- Helper Functions ---
const parseDurationToSeconds = (durationStr: string | undefined): number => {
  if (!durationStr) return 0;
  let totalSeconds = 0;
  
  // Match minutes (e.g., 5 min, 5分钟)
  const minMatch = durationStr.match(/(\d+(?:\.\d+)?)\s*(?:m|min|minute|分钟)/i);
  if (minMatch) totalSeconds += parseFloat(minMatch[1]) * 60;

  // Match seconds (e.g., 30 sec, 30秒)
  const secMatch = durationStr.match(/(\d+(?:\.\d+)?)\s*(?:s|sec|second|秒)/i);
  if (secMatch) totalSeconds += parseFloat(secMatch[1]);

  // Match hours (e.g., 1 hour, 1小时)
  const hourMatch = durationStr.match(/(\d+(?:\.\d+)?)\s*(?:h|hour|小时|hr)/i);
  if (hourMatch) totalSeconds += parseFloat(hourMatch[1]) * 3600;

  return Math.ceil(totalSeconds);
};

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

const MICRO_LABELS: Record<string, string> = {
  sodium: '钠',
  sugar: '糖',
  fiber: '膳食纤维',
  calcium: '钙',
  iron: '铁',
  vitaminC: '维生素C'
};

// --- Sub-components ---

const StepTimer: React.FC<{ durationStr: string }> = ({ durationStr }) => {
  const initialSeconds = useMemo(() => parseDurationToSeconds(durationStr), [durationStr]);
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isActive && !isPaused && timeLeft > 0) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsActive(false);
            setIsPaused(false);
            setIsFinished(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, isPaused, timeLeft]);

  const handleStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsActive(true);
    setIsPaused(false);
  };

  const handlePause = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPaused(true);
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTimeLeft(initialSeconds);
    setIsActive(false);
    setIsPaused(false);
    setIsFinished(false);
  };

  if (initialSeconds === 0) return null;

  return (
    <div className="mt-3 flex items-center space-x-2">
      {/* Timer Display */}
      <div className={`font-mono text-lg font-bold w-20 ${isFinished ? 'text-red-500' : 'text-stone-700'}`}>
        {formatTime(timeLeft)}
      </div>

      {/* Controls */}
      {!isActive && !isFinished && (
        <button
          onClick={handleStart}
          className="flex items-center px-3 py-1.5 bg-stone-800 text-white rounded-lg text-xs font-bold hover:bg-black transition-colors"
        >
          <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          开始计时
        </button>
      )}

      {isActive && !isPaused && (
        <button
          onClick={handlePause}
          className="flex items-center px-3 py-1.5 bg-amber-100 text-amber-700 border border-amber-200 rounded-lg text-xs font-bold hover:bg-amber-200 transition-colors"
        >
          <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" /></svg>
          暂停
        </button>
      )}

      {isActive && isPaused && (
        <button
          onClick={handleStart}
          className="flex items-center px-3 py-1.5 bg-green-100 text-green-700 border border-green-200 rounded-lg text-xs font-bold hover:bg-green-200 transition-colors"
        >
          <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /></svg>
          继续
        </button>
      )}

      {(isActive || isFinished) && (
        <button
          onClick={handleReset}
          className="p-1.5 text-stone-400 hover:text-stone-600 transition-colors"
          title="重置"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
        </button>
      )}
      
      {isFinished && <span className="text-xs text-red-500 font-bold animate-pulse">时间到!</span>}
    </div>
  );
};


export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onBack, onAddToCart, isInCart, isFavorite, onToggleFavorite, onCompleteCooking }) => {
  const [activeTab, setActiveTab] = useState<'ingredients' | 'steps'>('ingredients');
  const [checkedIngredients, setCheckedIngredients] = useState<Set<string>>(new Set());
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [showMicro, setShowMicro] = useState(false);
  
  // Modal State
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [consumedServings, setConsumedServings] = useState<number>(1); // Default init

  // Initialize consumed servings with recipe servings (parsing the number)
  useEffect(() => {
    const match = recipe.servings.match(/(\d+(\.\d+)?)/);
    if (match) {
      setConsumedServings(parseFloat(match[0]));
    }
  }, [recipe.servings]);

  // Group ingredients by category
  const groupedIngredients = useMemo(() => {
    const groups: Record<string, Ingredient[]> = {
      "肉类": [],
      "蔬菜": [],
      "佐料": [],
      "香料": [],
      "其他": []
    };

    recipe.ingredients.forEach(ing => {
      const cat = ing.category || "其他";
      if (groups[cat]) {
        groups[cat].push(ing);
      } else {
        if (!groups["其他"]) groups["其他"] = [];
        groups["其他"] = [];
        groups["其他"].push(ing);
      }
    });
    return Object.entries(groups).filter(([_, items]) => items.length > 0);
  }, [recipe.ingredients]);

  useEffect(() => {
    let isMounted = true;
    const fetchImage = async () => {
      // Check for static image first
      if (recipe.imageUrl) {
        setImageSrc(recipe.imageUrl);
        setIsImageLoading(false);
        return;
      }

      // Generate if no static image
      if (recipe.imagePrompt) {
        setIsImageLoading(true);
        const img = await generateDishImage(recipe.imagePrompt);
        if (isMounted) {
          setImageSrc(img);
          setIsImageLoading(false);
        }
      } else {
        setIsImageLoading(false);
      }
    };
    fetchImage();
    return () => { isMounted = false; };
  }, [recipe.id, recipe.imagePrompt, recipe.imageUrl]);

  const toggleIngredient = (name: string) => {
    const next = new Set(checkedIngredients);
    if (next.has(name)) next.delete(name);
    else next.add(name);
    setCheckedIngredients(next);
  };

  const toggleStep = (idx: number) => {
    const next = new Set(completedSteps);
    if (next.has(idx)) next.delete(idx);
    else next.add(idx);
    setCompletedSteps(next);
  };

  const handleConfirmCompletion = () => {
    setShowCompleteModal(false);
    onCompleteCooking(recipe, consumedServings);
  };

  // Calculate progress
  const stepProgress = Math.round((completedSteps.size / recipe.steps.length) * 100);

  return (
    <div className="bg-stone-50 min-h-screen pb-32 animate-fade-in relative">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 p-4 z-40 flex justify-between items-center bg-gradient-to-b from-black/60 to-transparent pointer-events-none">
        <button 
          onClick={onBack}
          className="bg-white/20 backdrop-blur-md text-white p-2.5 rounded-full hover:bg-white/30 transition-all border border-white/20 pointer-events-auto"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </button>

        <button 
          onClick={() => onToggleFavorite(recipe)}
          className={`bg-white/20 backdrop-blur-md p-2.5 rounded-full hover:bg-white/30 transition-all border border-white/20 pointer-events-auto ${isFavorite ? 'text-red-500 bg-white/80' : 'text-white'}`}
        >
          {isFavorite ? (
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          )}
        </button>
      </nav>

      {/* Completion Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" onClick={() => setShowCompleteModal(false)}></div>
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl relative z-10 scale-100 transition-all">
             <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                  🍽️
                </div>
                <h3 className="text-xl font-serif-display font-bold text-stone-800">记录您的用餐</h3>
                <p className="text-stone-500 text-sm mt-1">请输入您实际食用的份量，以便准确计算营养摄入。</p>
             </div>

             <div className="flex flex-col items-center mb-8">
               <label className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">食用份量 (Servings)</label>
               <div className="flex items-center space-x-4">
                  <button 
                    onClick={() => setConsumedServings(Math.max(0.5, consumedServings - 0.5))}
                    className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 hover:bg-stone-200 transition-colors font-bold text-xl"
                  >
                    -
                  </button>
                  <div className="w-20 text-center">
                    <span className="text-3xl font-serif-display font-bold text-stone-800">{consumedServings}</span>
                    <span className="block text-xs text-stone-400 font-medium">人份</span>
                  </div>
                  <button 
                    onClick={() => setConsumedServings(Math.min(10, consumedServings + 0.5))}
                    className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 hover:bg-stone-200 transition-colors font-bold text-xl"
                  >
                    +
                  </button>
               </div>
               <div className="mt-2 text-xs text-stone-400 bg-stone-50 px-2 py-1 rounded">
                 原食谱: {recipe.servings}
               </div>
             </div>

             <div className="flex space-x-3">
               <button 
                 onClick={() => setShowCompleteModal(false)}
                 className="flex-1 py-3 bg-stone-100 text-stone-500 rounded-xl font-bold hover:bg-stone-200 transition-colors"
               >
                 取消
               </button>
               <button 
                 onClick={handleConfirmCompletion}
                 className="flex-[2] py-3 bg-green-500 text-white rounded-xl font-bold shadow-lg shadow-green-500/20 hover:bg-green-600 transition-colors"
               >
                 确认记录
               </button>
             </div>
          </div>
        </div>
      )}

      {/* Hero Image */}
      <div className="relative w-full h-[45vh] bg-stone-200">
        {isImageLoading ? (
           <div className="w-full h-full flex items-center justify-center bg-stone-100 text-stone-400">
             <div className="flex flex-col items-center animate-pulse">
                <svg className="w-8 h-8 mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-xs tracking-widest uppercase font-medium">Rendering</span>
             </div>
           </div>
        ) : imageSrc ? (
          <img src={imageSrc} alt={recipe.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-stone-200">
             <span className="text-5xl opacity-20">🥘</span>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-stone-50 to-transparent"></div>
      </div>

      {/* Content Container */}
      <div className="px-6 -mt-10 relative z-10">
        <div className="flex justify-between items-end mb-4">
           <span className="px-3 py-1 bg-white/90 backdrop-blur text-stone-600 text-xs font-bold tracking-wider uppercase rounded-full shadow-sm border border-stone-100">
             {recipe.cuisineType}
           </span>
           <div className="flex space-x-2">
              <span className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-sm text-xs font-bold text-stone-700">{recipe.difficulty === 'Easy' ? '易' : recipe.difficulty === 'Medium' ? '中' : '难'}</span>
           </div>
        </div>

        <h1 className="text-4xl font-serif-display font-bold text-stone-900 mb-3 leading-tight">{recipe.title}</h1>
        <p className="text-stone-500 text-sm leading-relaxed mb-6">{recipe.description}</p>

        {/* Nutrition Bar */}
        <div className="bg-white rounded-xl p-3 shadow-sm border border-stone-100 mb-6">
           <div className="grid grid-cols-4 gap-2 mb-2">
             <div className="text-center">
                <div className="text-[10px] text-stone-400 uppercase tracking-wide">卡路里</div>
                <div className="text-sm font-bold text-stone-800">{recipe.nutrition.calories}</div>
             </div>
             <div className="text-center border-l border-stone-100">
                <div className="text-[10px] text-stone-400 uppercase tracking-wide">蛋白质</div>
                <div className="text-sm font-bold text-stone-800">{recipe.nutrition.protein}</div>
             </div>
             <div className="text-center border-l border-stone-100">
                <div className="text-[10px] text-stone-400 uppercase tracking-wide">碳水</div>
                <div className="text-sm font-bold text-stone-800">{recipe.nutrition.carbs}</div>
             </div>
             <div className="text-center border-l border-stone-100">
                <div className="text-[10px] text-stone-400 uppercase tracking-wide">脂肪</div>
                <div className="text-sm font-bold text-stone-800">{recipe.nutrition.fat}</div>
             </div>
           </div>
           
           {/* Micronutrients Toggle */}
           <div className="border-t border-stone-100 pt-2">
              <button 
                onClick={() => setShowMicro(!showMicro)}
                className="w-full flex items-center justify-center text-[10px] text-stone-400 uppercase font-bold tracking-widest hover:text-stone-600"
              >
                {showMicro ? '收起微量元素' : '显示微量元素'}
                <svg className={`w-3 h-3 ml-1 transition-transform ${showMicro ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              
              {showMicro && recipe.nutrition.micronutrients && (
                <div className="grid grid-cols-3 gap-2 mt-3 animate-fade-in-down">
                   {Object.entries(recipe.nutrition.micronutrients).map(([key, val]) => (
                     <div key={key} className="text-center bg-stone-50 rounded p-1">
                        <div className="text-[9px] text-stone-400 uppercase">{MICRO_LABELS[key] || key}</div>
                        <div className="text-xs font-semibold text-stone-700">{val}</div>
                     </div>
                   ))}
                </div>
              )}
           </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-3 gap-px bg-stone-200 rounded-2xl overflow-hidden mb-8 border border-stone-200 shadow-sm">
          <div className="bg-white p-4 text-center">
            <div className="text-xs text-stone-400 uppercase tracking-wide mb-1">准备</div>
            <div className="font-semibold text-stone-800">{recipe.prepTime}</div>
          </div>
          <div className="bg-white p-4 text-center">
            <div className="text-xs text-stone-400 uppercase tracking-wide mb-1">烹饪</div>
            <div className="font-semibold text-stone-800">{recipe.cookTime}</div>
          </div>
          <div className="bg-white p-4 text-center">
            <div className="text-xs text-stone-400 uppercase tracking-wide mb-1">份量</div>
            <div className="font-semibold text-stone-800">{recipe.servings}</div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="bg-stone-200 p-1 rounded-xl flex mb-8 sticky top-20 z-30 shadow-sm">
          <button 
            onClick={() => setActiveTab('ingredients')}
            className={`flex-1 py-3 text-sm font-medium rounded-lg transition-all duration-300 ${activeTab === 'ingredients' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
          >
            食材
          </button>
          <button 
            onClick={() => setActiveTab('steps')}
            className={`flex-1 py-3 text-sm font-medium rounded-lg transition-all duration-300 ${activeTab === 'steps' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
          >
            步骤 ({stepProgress}%)
          </button>
        </div>

        {/* View Content */}
        <div className="transition-opacity duration-300 min-h-[400px]">
          {activeTab === 'ingredients' ? (
            <div className="space-y-8 animate-fade-in-up">
              {groupedIngredients.map(([category, ingredients]) => (
                <div key={category} className="bg-white rounded-2xl p-6 shadow-[0_2px_20px_rgba(0,0,0,0.03)] border border-stone-100/50">
                  <h3 className="font-serif-display text-lg font-bold text-stone-800 mb-4 pb-2 border-b border-stone-100 flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-2"></span>
                    {category}
                  </h3>
                  <div className="space-y-3">
                    {ingredients.map((ing, idx) => (
                      <div 
                        key={`${category}-${idx}`} 
                        onClick={() => toggleIngredient(ing.name)}
                        className="flex items-start justify-between group cursor-pointer"
                      >
                        <div className="flex items-center">
                          <div className={`w-5 h-5 rounded-full border transition-all flex items-center justify-center mr-3 flex-shrink-0
                            ${checkedIngredients.has(ing.name) ? 'bg-stone-800 border-stone-800' : 'border-stone-300 group-hover:border-amber-400'}`}>
                            {checkedIngredients.has(ing.name) && (
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                            )}
                          </div>
                          
                          <div className={`${checkedIngredients.has(ing.name) ? 'opacity-40 line-through transition-opacity' : ''}`}>
                            <div className="flex items-center">
                              <span className={`font-medium text-sm ${ing.conflict ? 'text-red-600' : 'text-stone-800'}`}>
                                {ing.name}
                              </span>
                              {ing.conflict && (
                                <span className="ml-2 text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold">
                                  忌口
                                </span>
                              )}
                            </div>
                            {ing.notes && <span className="text-stone-400 text-xs font-light">({ing.notes})</span>}
                          </div>
                        </div>
                        <span className="text-stone-500 text-sm font-medium">{ing.amount}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              
              {/* Tips Section */}
              {recipe.tips && recipe.tips.length > 0 && (
                <div className="mt-8 bg-amber-50/50 p-6 rounded-2xl border border-amber-100">
                  <h4 className="text-amber-900/80 font-serif-display font-bold mb-3">大厨贴士</h4>
                  <ul className="space-y-2">
                    {recipe.tips.map((tip, i) => (
                      <li key={i} className="text-sm text-amber-900/70 flex items-start">
                        <span className="mr-2 opacity-50">•</span> {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-0 relative animate-fade-in-up">
               {/* Visual Progress Bar */}
               <div className="sticky top-32 z-20 mb-6 bg-stone-200 rounded-full h-2 w-full overflow-hidden">
                 <div 
                   className="bg-green-500 h-full transition-all duration-500 ease-out"
                   style={{ width: `${stepProgress}%` }}
                 ></div>
               </div>

               <div className="absolute left-[19px] top-4 bottom-4 w-px bg-stone-200"></div>
              {recipe.steps.map((step, idx) => {
                 const isCompleted = completedSteps.has(idx);
                 return (
                  <div 
                    key={idx} 
                    className={`relative pl-12 pb-10 group last:pb-0 transition-all duration-300 ${isCompleted ? 'opacity-60' : 'opacity-100'}`}
                  >
                    {/* Step Number Bubble (Clickable) */}
                    <button 
                      onClick={() => toggleStep(idx)}
                      className={`absolute left-0 top-0 w-10 h-10 flex items-center justify-center border rounded-full z-10 font-serif-display font-bold transition-all shadow-sm
                        ${isCompleted 
                          ? 'bg-amber-500 border-amber-500 text-white scale-90' 
                          : 'bg-stone-50 border-stone-200 text-stone-400 hover:text-stone-800 hover:border-amber-400'
                        }`}
                    >
                      {isCompleted ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                      ) : (
                        idx + 1
                      )}
                    </button>

                    {/* Step Card */}
                    <div 
                      onClick={() => toggleStep(idx)}
                      className={`bg-white rounded-2xl p-6 shadow-sm border transition-all cursor-pointer
                        ${isCompleted ? 'border-stone-100 shadow-none bg-stone-50' : 'border-stone-100 hover:shadow-md'}`}
                    >
                      <div className="flex items-center space-x-3 mb-3">
                         <h4 className={`font-bold text-xs uppercase tracking-wide flex-shrink-0 ${isCompleted ? 'text-stone-400' : 'text-stone-400'}`}>
                           第 {idx + 1} 步
                         </h4>
                         {/* Display Step Title */}
                         {step.title && (
                           <span className={`text-lg font-bold font-serif-display ${isCompleted ? 'text-stone-400' : 'text-amber-600'}`}>
                             {step.title}
                           </span>
                         )}
                         {isCompleted && <span className="ml-auto text-xs font-bold text-amber-500">已完成</span>}
                      </div>
                      
                      <p className={`leading-7 text-sm ${isCompleted ? 'text-stone-400 line-through decoration-stone-300' : 'text-stone-600'}`}>
                        {step.instruction}
                      </p>

                      {/* Timer Logic */}
                      {step.duration && !isCompleted && (
                        <StepTimer durationStr={step.duration} />
                      )}

                      {step.tip && !isCompleted && (
                        <div className="mt-3 text-xs text-stone-500 bg-stone-50 p-3 rounded-lg border-l-2 border-stone-300 italic">
                          " {step.tip} "
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              
              {/* Finish Message */}
              {stepProgress === 100 && (
                <div className="mt-8 p-6 bg-green-50 rounded-2xl border border-green-100 text-center animate-bounce">
                  <span className="text-3xl block mb-2">🎉</span>
                  <h3 className="text-green-800 font-bold mb-1">恭喜完成!</h3>
                  <p className="text-green-600 text-sm">这道菜看起来非常美味，快去享用吧！</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Bar */}
      <div className="fixed bottom-6 left-6 right-6 z-50 flex gap-2">
         {/* Cart Button */}
        <button 
          onClick={() => onAddToCart(recipe)}
          disabled={isInCart}
          className={`flex-1 py-4 rounded-2xl font-bold shadow-xl transition-all flex items-center justify-center space-x-2
            ${isInCart 
              ? 'bg-stone-800 text-stone-400 cursor-default' 
              : 'bg-stone-900 text-white hover:bg-black hover:scale-[1.02] active:scale-95'
            }`}
        >
          {isInCart ? (
             <>
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
               <span>已入菜单</span>
             </>
          ) : (
            <>
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
               <span>今日菜单</span>
            </>
          )}
        </button>

        {/* Complete Button - Triggers Modal */}
        <button 
          onClick={() => setShowCompleteModal(true)}
          className="flex-1 py-4 bg-green-500 text-white rounded-2xl font-bold shadow-xl shadow-green-500/20 hover:bg-green-600 transition-all active:scale-95 flex items-center justify-center space-x-2"
        >
           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
           <span>完成烹饪</span>
        </button>
      </div>
    </div>
  );
};
