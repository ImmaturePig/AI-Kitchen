
import React, { useState, useEffect } from 'react';
import { generateRecipe, generateProposals, suggestRecipesFromIngredients } from './services/geminiService';
import { AppState, Recipe, ProposalData, ProposalOption, RecipeSuggestion, Ingredient, CookedLog, SearchMode, HistoryItem, NutritionInfo, Micronutrients } from './types';
import { LoadingScreen } from './components/LoadingScreen';
import { RecipeCard } from './components/RecipeCard';
import { ShoppingList } from './components/ShoppingList';
import { FavoritesView } from './components/FavoritesView';
import { ProposalView } from './components/ProposalView';
import { SuggestionSelectView } from './components/SuggestionSelectView';
import { FridgeView } from './components/FridgeView';
import { DashboardView } from './components/DashboardView';
import { STATIC_RECIPES } from './data/staticRecipes';

// Use keys from STATIC_RECIPES for popular suggestions
const SUGGESTIONS = Object.keys(STATIC_RECIPES);
const COMMON_RESTRICTIONS = ["不吃辣", "不吃香菜", "不吃葱姜蒜", "少油", "素食"];
const CACHE_KEY = 'chefgenius_recipe_cache';
const MAX_CACHE_SIZE = 5;

// Initial Static Data
const INITIAL_FRIDGE: Ingredient[] = [
  { name: '鸡蛋', amount: '6个', category: '肉类' },
  { name: '西红柿', amount: '3个', category: '蔬菜' },
  { name: '青椒', amount: '2个', category: '蔬菜' },
  { name: '葱', amount: '1根', category: '佐料' }
];

const INITIAL_FAVORITES: Recipe[] = [
  STATIC_RECIPES["宫保鸡丁"]
];

const INITIAL_LOGS: CookedLog[] = [
  {
    id: "init_log_1",
    recipeTitle: STATIC_RECIPES["西红柿炒鸡蛋"].title,
    date: new Date().toISOString(),
    nutrition: STATIC_RECIPES["西红柿炒鸡蛋"].nutrition,
    consumedServings: 1.5,
    imageUrl: STATIC_RECIPES["西红柿炒鸡蛋"].imageUrl
  },
  {
    id: "init_log_2",
    recipeTitle: "米饭",
    date: new Date(Date.now() - 3600000).toISOString(),
    nutrition: { calories: "350 kcal", protein: "7g", carbs: "80g", fat: "1g" },
    consumedServings: 2,
    // Staple food might not have image, handled in DashboardView
  }
];

// --- Helper for Nutrition Scaling ---
const parseValue = (str: string | undefined): { val: number, unit: string } => {
  if (!str) return { val: 0, unit: '' };
  const match = str.match(/(\d+(\.\d+)?)\s*(.*)/);
  if (match) {
    return { val: parseFloat(match[1]), unit: match[3] };
  }
  return { val: 0, unit: '' };
};

const scaleNutrition = (info: NutritionInfo, ratio: number): NutritionInfo => {
  const scale = (str: string | undefined) => {
    const { val, unit } = parseValue(str);
    if (val === 0) return str || '0';
    const newVal = Math.round(val * ratio * 10) / 10;
    return `${newVal}${unit ? ' ' + unit : ''}`;
  };

  const newMicro: Micronutrients = {};
  if (info.micronutrients) {
    Object.entries(info.micronutrients).forEach(([key, val]) => {
      newMicro[key as keyof Micronutrients] = scale(val);
    });
  }

  return {
    calories: scale(info.calories),
    protein: scale(info.protein),
    carbs: scale(info.carbs),
    fat: scale(info.fat),
    micronutrients: newMicro
  };
};

function App() {
  const [appState, setAppState] = useState<AppState>(AppState.HOME);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState<SearchMode>('dish');
  
  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null);
  const [currentProposal, setCurrentProposal] = useState<ProposalData | null>(null);
  const [currentSuggestions, setCurrentSuggestions] = useState<RecipeSuggestion[]>([]);
  
  const [errorMsg, setErrorMsg] = useState('');
  const [cart, setCart] = useState<Recipe[]>([]);
  const [favorites, setFavorites] = useState<Recipe[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [recipeCache, setRecipeCache] = useState<Record<string, Recipe>>({});
  const [fridge, setFridge] = useState<Ingredient[]>([]);
  const [cookedHistory, setCookedHistory] = useState<CookedLog[]>([]);
  
  // Cooking Preferences
  const [servings, setServings] = useState(2);
  const [restrictions, setRestrictions] = useState('');
  const [showPreferences, setShowPreferences] = useState(false);

  // Load data from local storage on mount, apply initial data if empty
  useEffect(() => {
    const savedFavs = localStorage.getItem('chefgenius_favorites');
    if (savedFavs) {
      try { setFavorites(JSON.parse(savedFavs)); } catch (e) { console.error(e); }
    } else {
      setFavorites(INITIAL_FAVORITES); // Initial Data
    }

    const savedHistory = localStorage.getItem('chefgenius_history_v2');
    if (savedHistory) {
      try { setHistory(JSON.parse(savedHistory)); } catch (e) { console.error(e); }
    }

    const savedCache = localStorage.getItem(CACHE_KEY);
    if (savedCache) {
      try { setRecipeCache(JSON.parse(savedCache)); } catch (e) { console.error(e); }
    }
    
    const savedFridge = localStorage.getItem('chefgenius_fridge');
    if (savedFridge) {
       try { setFridge(JSON.parse(savedFridge)); } catch (e) { console.error(e); }
    } else {
       setFridge(INITIAL_FRIDGE); // Initial Data
    }

    const savedCooked = localStorage.getItem('chefgenius_cooked_log');
    if (savedCooked) {
      try { setCookedHistory(JSON.parse(savedCooked)); } catch (e) { console.error(e); }
    } else {
      setCookedHistory(INITIAL_LOGS); // Initial Data
    }
  }, []);

  // Save favorites
  useEffect(() => {
    localStorage.setItem('chefgenius_favorites', JSON.stringify(favorites));
  }, [favorites]);
  
  // Save fridge
  useEffect(() => {
    localStorage.setItem('chefgenius_fridge', JSON.stringify(fridge));
  }, [fridge]);

  // Save Cooked History
  useEffect(() => {
    localStorage.setItem('chefgenius_cooked_log', JSON.stringify(cookedHistory));
  }, [cookedHistory]);


  const saveToCache = (query: string, recipe: Recipe) => {
    const trimmedQuery = query.trim();
    setRecipeCache(prev => {
      const newCache = { ...prev, [trimmedQuery]: recipe };
      // Enforce Cache Limit
      const keys = Object.keys(newCache);
      if (keys.length > MAX_CACHE_SIZE) {
        const keyToRemove = keys[0]; 
        if (keyToRemove !== trimmedQuery) {
           delete newCache[keyToRemove];
        }
      }
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(newCache));
      } catch (e) {
        localStorage.removeItem(CACHE_KEY);
      }
      return newCache;
    });
  };

  const updateHistory = (query: string, mode: SearchMode) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    const newItem: HistoryItem = { query: trimmed, mode };
    const newHistory = [newItem, ...history.filter(h => h.query !== trimmed)].slice(0, 5);
    setHistory(newHistory);
    localStorage.setItem('chefgenius_history_v2', JSON.stringify(newHistory));
  };

  const clearHistory = () => {
    setHistory([]);
    setRecipeCache({});
    localStorage.removeItem('chefgenius_history_v2');
    localStorage.removeItem(CACHE_KEY);
  };

  const handleSearch = async (query: string, mode: SearchMode = searchMode, forceRefresh = false) => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;
    
    // Update state to match this search
    setSearchQuery(trimmedQuery); 
    setSearchMode(mode); 
    setErrorMsg('');
    updateHistory(trimmedQuery, mode);

    if (mode === 'ingredient') {
      setAppState(AppState.LOADING);
      try {
        const suggestions = await suggestRecipesFromIngredients(trimmedQuery);
        setCurrentSuggestions(suggestions);
        setAppState(AppState.SUGGESTION_SELECT_VIEW);
      } catch (err) {
        setErrorMsg("抱歉，我无法根据这些食材想出食谱。请尝试更具体的食材名！");
        setAppState(AppState.ERROR);
      }
      return;
    }

    // Dish Mode
    // Check Static Recipes First (No LLM)
    if (STATIC_RECIPES[trimmedQuery]) {
      setCurrentRecipe(STATIC_RECIPES[trimmedQuery]);
      setAppState(AppState.RECIPE_VIEW);
      return;
    }

    // Check Cache
    if (!forceRefresh && recipeCache[trimmedQuery]) {
      setCurrentRecipe(recipeCache[trimmedQuery]);
      setAppState(AppState.RECIPE_VIEW);
      return;
    }

    setAppState(AppState.LOADING);
    try {
      if (restrictions.trim()) {
         const proposal = await generateProposals(trimmedQuery, restrictions);
         setCurrentProposal(proposal);
         setAppState(AppState.PROPOSAL_VIEW);
      } else {
         const recipe = await generateRecipe(trimmedQuery, servings, "Standard recipe", "");
         saveToCache(trimmedQuery, recipe);
         setCurrentRecipe(recipe);
         setAppState(AppState.RECIPE_VIEW);
      }
    } catch (err) {
      setErrorMsg("抱歉，我无法生成这个食谱。请尝试换一个菜名！");
      setAppState(AppState.ERROR);
    }
  };

  const handleSuggestionSelect = async (suggestion: RecipeSuggestion) => {
     setSearchMode('dish');
     
     // Check Static for Suggestions too
     if (STATIC_RECIPES[suggestion.title]) {
        setCurrentRecipe(STATIC_RECIPES[suggestion.title]);
        setAppState(AppState.RECIPE_VIEW);
        return;
     }

     setAppState(AppState.LOADING);
     try {
       if (recipeCache[suggestion.title]) {
         setCurrentRecipe(recipeCache[suggestion.title]);
         setAppState(AppState.RECIPE_VIEW);
         return;
       }
       if (restrictions.trim()) {
         const proposal = await generateProposals(suggestion.title, restrictions);
         setCurrentProposal(proposal);
         setAppState(AppState.PROPOSAL_VIEW);
       } else {
         const recipe = await generateRecipe(suggestion.title, servings, "Standard recipe", "");
         saveToCache(suggestion.title, recipe);
         setCurrentRecipe(recipe);
         setAppState(AppState.RECIPE_VIEW);
       }
     } catch (err) {
        setErrorMsg("生成详细食谱失败，请重试。");
        setAppState(AppState.ERROR);
     }
  };

  const handleProposalSelection = async (option: ProposalOption) => {
    setAppState(AppState.LOADING);
    try {
       const recipe = await generateRecipe(option.title, servings, option.modifications, restrictions);
       if (currentProposal?.originalQuery) {
         saveToCache(currentProposal.originalQuery, recipe);
       }
       setCurrentRecipe(recipe);
       setAppState(AppState.RECIPE_VIEW);
    } catch (err) {
      setErrorMsg("生成最终食谱时出错，请重试。");
      setAppState(AppState.ERROR);
    }
  };

  const addToCart = (recipe: Recipe) => {
    if (!cart.find(r => r.title === recipe.title)) {
      setCart([...cart, recipe]);
    }
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(r => r.id !== id));
  };

  const toggleFavorite = (recipe: Recipe) => {
    if (favorites.find(r => r.id === recipe.id)) {
      setFavorites(favorites.filter(r => r.id !== recipe.id));
    } else {
      setFavorites([...favorites, recipe]);
    }
  };

  const removeFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(favorites.filter(r => r.id !== id));
  };
  
  const addToFridge = (name: string, amount: string) => {
    if (!fridge.find(i => i.name === name)) {
      setFridge([...fridge, { name, amount }]);
    } else {
       setFridge(fridge.map(i => i.name === name ? { name, amount } : i));
    }
  };
  
  const removeFromFridge = (name: string) => {
    setFridge(fridge.filter(i => i.name !== name));
  };
  
  const handleCookWithFridgeIngredients = (ingredients: string[]) => {
    const query = ingredients.join('，');
    handleSearch(query, 'ingredient');
  };

  const toggleRestriction = (tag: string) => {
    if (restrictions.includes(tag)) {
      setRestrictions(restrictions.replace(tag, '').replace(/,\s*,/g, ',').replace(/^,|,$/g, '').trim());
    } else {
      setRestrictions(restrictions ? `${restrictions}, ${tag}` : tag);
    }
  };

  const completeCooking = (recipe: Recipe, consumedServings: number) => {
    const originalServings = parseValue(recipe.servings).val || 1;
    const ratio = consumedServings / originalServings;
    const scaledNutrition = scaleNutrition(recipe.nutrition, ratio);

    const log: CookedLog = {
      id: crypto.randomUUID(),
      recipeTitle: recipe.title,
      date: new Date().toISOString(),
      nutrition: scaledNutrition,
      consumedServings: consumedServings,
      imageUrl: recipe.imageUrl // Pass image URL
    };
    
    setCookedHistory(prev => [log, ...prev]);
    alert(`🎉 太棒了！您完成了 "${recipe.title}" (摄入约 ${consumedServings} 人份)，已记录到您的烹饪看板。`);
    setAppState(AppState.HOME);
  };
  
  const handleManualLog = (log: CookedLog) => {
    setCookedHistory(prev => [log, ...prev]);
    alert(`🎉 已记录 "${log.recipeTitle}" 到您的看板。`);
  };

  if (appState === AppState.LOADING) return <LoadingScreen />;
  
  if (appState === AppState.DASHBOARD_VIEW) {
    return (
      <DashboardView 
        logs={cookedHistory} 
        onBack={() => setAppState(AppState.HOME)}
        onAddLog={handleManualLog}
      />
    );
  }

  if (appState === AppState.FRIDGE_VIEW) {
    return (
      <FridgeView 
        fridge={fridge}
        onAdd={addToFridge}
        onRemove={removeFromFridge}
        onCookWithIngredients={handleCookWithFridgeIngredients}
        onBack={() => setAppState(AppState.HOME)}
      />
    );
  }

  if (appState === AppState.SUGGESTION_SELECT_VIEW) {
    return (
      <SuggestionSelectView 
        suggestions={currentSuggestions}
        ingredients={searchQuery}
        onSelect={handleSuggestionSelect}
        onBack={() => setAppState(AppState.HOME)}
      />
    );
  }

  if (appState === AppState.PROPOSAL_VIEW && currentProposal) {
    return (
      <ProposalView 
        proposal={currentProposal}
        onSelect={handleProposalSelection}
        onCancel={() => setAppState(AppState.HOME)}
      />
    );
  }

  if (appState === AppState.CART_VIEW) {
    return <ShoppingList cart={cart} fridge={fridge} onRemove={removeFromCart} onBack={() => setAppState(AppState.HOME)} />;
  }

  if (appState === AppState.FAVORITES_VIEW) {
    return (
      <FavoritesView 
        favorites={favorites} 
        onSelectRecipe={(recipe) => {
          setCurrentRecipe(recipe);
          setAppState(AppState.RECIPE_VIEW);
        }}
        onBack={() => setAppState(AppState.HOME)}
        onRemove={removeFavorite}
      />
    );
  }

  if (appState === AppState.RECIPE_VIEW && currentRecipe) {
    return (
      <RecipeCard 
        recipe={currentRecipe} 
        onBack={() => setAppState(AppState.HOME)} 
        onAddToCart={addToCart}
        isInCart={!!cart.find(r => r.title === currentRecipe.title)}
        isFavorite={!!favorites.find(r => r.id === currentRecipe.id)}
        onToggleFavorite={toggleFavorite}
        onCompleteCooking={completeCooking}
      />
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 flex items-center justify-center relative">
      
      {/* Top Right Buttons */}
      <div className="fixed top-6 right-6 z-50 flex flex-col space-y-4 items-end">
        {/* Dashboard Button */}
        {appState === AppState.HOME && (
          <button 
            onClick={() => setAppState(AppState.DASHBOARD_VIEW)}
            className="bg-white text-stone-400 p-3 rounded-full shadow-lg border border-stone-100 hover:text-purple-500 hover:scale-110 transition-all group relative"
            title="烹饪看板"
          >
             <span className="text-xl">📊</span>
          </button>
        )}

        {/* Cart Button */}
        {cart.length > 0 && appState === AppState.HOME && (
          <button 
            onClick={() => setAppState(AppState.CART_VIEW)}
            className="bg-stone-900 text-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform flex items-center group relative"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-stone-50">
              {cart.length}
            </span>
          </button>
        )}

        {/* Favorites Button */}
        {appState === AppState.HOME && (
           <button 
             onClick={() => setAppState(AppState.FAVORITES_VIEW)}
             className="bg-white text-stone-400 p-3 rounded-full shadow-lg border border-stone-100 hover:text-red-500 hover:scale-110 transition-all group relative"
             title="我的收藏"
           >
             <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
               <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
             </svg>
             {favorites.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-stone-50">
                  {favorites.length}
                </span>
             )}
           </button>
        )}
        
        {/* Fridge Button */}
        {appState === AppState.HOME && (
          <button 
             onClick={() => setAppState(AppState.FRIDGE_VIEW)}
             className="bg-white text-stone-400 p-3 rounded-full shadow-lg border border-stone-100 hover:text-blue-500 hover:scale-110 transition-all group relative"
             title="我的冰箱"
           >
             <span className="text-xl">🧊</span>
             {fridge.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-stone-50">
                  {fridge.length}
                </span>
             )}
           </button>
        )}
      </div>

      <main className="w-full max-w-lg px-6 flex flex-col items-center pb-12">
        
        <div className="mt-12 mb-8 flex flex-col items-center animate-fade-in-up">
          <div className="w-16 h-16 bg-stone-900 rounded-2xl flex items-center justify-center shadow-2xl shadow-stone-400/50 mb-6 rotate-3">
             <span className="text-3xl">👨‍🍳</span>
          </div>
          <h1 className="text-3xl font-serif-display font-bold text-stone-900 tracking-tight">ChefGenius</h1>
          <p className="text-stone-400 text-sm mt-2 font-medium tracking-wide uppercase">AI Culinary Assistant</p>
        </div>

        {/* Search Mode Toggle */}
        <div className="flex bg-white p-1 rounded-full border border-stone-200 shadow-sm mb-4">
           <button 
             onClick={() => setSearchMode('dish')}
             className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${searchMode === 'dish' ? 'bg-stone-800 text-white shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
           >
             按菜名搜
           </button>
           <button 
             onClick={() => setSearchMode('ingredient')}
             className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${searchMode === 'ingredient' ? 'bg-amber-500 text-white shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
           >
             按食材搜
           </button>
        </div>

        {/* Search Interface */}
        <div className="w-full relative group z-20">
           <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-stone-400 group-focus-within:text-stone-800 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {searchMode === 'dish' 
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                }
              </svg>
           </div>
           <input 
            type="text" 
            className="w-full pl-12 pr-4 py-5 rounded-2xl bg-white border border-stone-200 shadow-[0_4px_20px_rgba(0,0,0,0.03)] focus:shadow-xl focus:border-stone-300 focus:outline-none transition-all text-stone-800 placeholder-stone-300 text-lg"
            placeholder={searchMode === 'dish' ? "今天想吃什么？" : "输入冰箱里的食材 (如: 西红柿)"}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
          />
          <button 
            onClick={() => handleSearch(searchQuery)}
            className={`absolute right-2 top-2 bottom-2 px-6 rounded-xl transition-colors font-medium text-sm shadow-lg text-white
              ${searchMode === 'dish' ? 'bg-stone-900 hover:bg-black shadow-stone-900/20' : 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20'}`}
          >
            {searchMode === 'dish' ? '搜索' : '找灵感'}
          </button>
        </div>
        
        {/* Configuration Toggle */}
        <div className="w-full mt-3 flex justify-end">
           <button 
             onClick={() => setShowPreferences(!showPreferences)}
             className={`text-xs font-bold flex items-center transition-colors ${showPreferences ? 'text-amber-600' : 'text-stone-400 hover:text-stone-600'}`}
           >
             <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
             {showPreferences ? '收起选项' : '配置口味 & 分量'}
           </button>
        </div>

        {/* Preferences Panel */}
        <div className={`w-full overflow-hidden transition-all duration-300 ease-in-out ${showPreferences ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0 mt-0'}`}>
           <div className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm space-y-5">
              <div>
                 <label className="text-xs font-bold text-stone-400 uppercase tracking-widest block mb-2">用餐人数</label>
                 <div className="flex items-center space-x-4">
                    <button 
                      onClick={() => setServings(Math.max(1, servings - 1))}
                      className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 hover:bg-stone-200 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                    </button>
                    <span className="text-xl font-serif-display font-bold w-12 text-center">{servings} 人</span>
                    <button 
                      onClick={() => setServings(Math.min(20, servings + 1))}
                      className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 hover:bg-stone-200 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    </button>
                 </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-400 uppercase tracking-widest block mb-2">忌口 / 偏好</label>
                <div className="flex flex-wrap gap-2 mb-3">
                   {COMMON_RESTRICTIONS.map(tag => (
                     <button
                       key={tag}
                       onClick={() => toggleRestriction(tag)}
                       className={`px-3 py-1 text-xs rounded-full border transition-all ${restrictions.includes(tag) 
                         ? 'bg-amber-100 border-amber-200 text-amber-800' 
                         : 'bg-white border-stone-200 text-stone-500 hover:border-amber-200 hover:text-amber-600'}`}
                     >
                       {tag}
                     </button>
                   ))}
                </div>
                <input 
                  type="text" 
                  value={restrictions}
                  onChange={(e) => setRestrictions(e.target.value)}
                  placeholder="其他忌口，例如：花生过敏..."
                  className="w-full p-3 rounded-xl bg-stone-50 border border-stone-200 text-sm focus:outline-none focus:border-stone-300"
                />
              </div>

           </div>
        </div>

        {appState === AppState.ERROR && (
          <div className="w-full bg-red-50 text-red-600 p-4 rounded-xl mt-6 text-sm text-center border border-red-100 animate-pulse">
            {errorMsg}
          </div>
        )}

        {/* Recent Search History */}
        {history.length > 0 && !showPreferences && (
          <div className="w-full mt-8">
            <div className="flex items-center justify-between mb-3 px-1">
              <p className="text-xs font-bold text-stone-400 uppercase tracking-widest flex items-center">
                <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                最近搜索
              </p>
              <button 
                onClick={clearHistory}
                className="text-[10px] text-stone-300 hover:text-red-400 transition-colors font-medium"
              >
                清除记录
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {history.map((item, idx) => (
                <button
                  key={`${item.query}-${idx}`}
                  onClick={() => handleSearch(item.query, item.mode)}
                  className={`px-3 py-1.5 border rounded-lg text-xs font-medium transition-all active:scale-95 flex items-center space-x-1
                    ${item.mode === 'ingredient' 
                       ? 'bg-amber-50 text-amber-800 border-amber-100' 
                       : 'bg-stone-100 text-stone-600 border-stone-100 hover:bg-white hover:border-stone-300'
                    }`}
                >
                  <span className="mr-1 opacity-50">{item.mode === 'ingredient' ? '🥦' : '🍲'}</span>
                  <span>{item.query}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {!showPreferences && (
          <div className="w-full mt-6">
            <p className="text-xs font-bold text-stone-400 mb-4 text-center uppercase tracking-widest">热门推荐</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {SUGGESTIONS.map((dish) => (
                <button
                  key={dish}
                  onClick={() => {
                    handleSearch(dish, 'dish');
                  }}
                  className="px-4 py-2 bg-white border border-stone-200 rounded-full text-stone-500 shadow-sm hover:border-stone-400 hover:text-stone-800 hover:shadow-md transition-all text-sm active:scale-95"
                >
                  {dish}
                </button>
              ))}
            </div>
          </div>
        )}

        {cart.length > 0 && !showPreferences && (
          <div 
             onClick={() => setAppState(AppState.CART_VIEW)}
             className="mt-12 bg-white w-full p-4 rounded-xl border border-stone-200 shadow-sm flex items-center justify-between cursor-pointer hover:shadow-md transition-all"
          >
            <div className="flex items-center space-x-3">
              <div className="bg-amber-100 p-2 rounded-lg text-amber-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              </div>
              <div>
                <div className="font-bold text-stone-800">查看今日清单</div>
                <div className="text-xs text-stone-400">已添加 {cart.length} 道菜</div>
              </div>
            </div>
            <svg className="w-4 h-4 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </div>
        )}
        
      </main>

      <footer className="fixed bottom-6 text-stone-300 text-xs tracking-wider">
        DESIGNED FOR FOODIES
      </footer>
    </div>
  );
}

export default App;
