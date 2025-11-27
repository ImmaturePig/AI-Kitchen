
import React, { useMemo, useState } from 'react';
import { CookedLog, NutritionInfo } from '../types';

interface DashboardViewProps {
  logs: CookedLog[];
  onBack: () => void;
  onAddLog: (log: CookedLog) => void;
}

// Re-using labels for display consistency
const MICRO_LABELS: Record<string, string> = {
  sodium: '钠',
  sugar: '糖',
  fiber: '膳食纤维',
  calcium: '钙',
  iron: '铁',
  vitaminC: '维生素C'
};

const STAPLE_FOODS = [
  { name: '米饭', unit: '碗 (约150g)', calories: 174, protein: 3.5, carbs: 40, fat: 0.5 },
  { name: '馒头', unit: '个 (约100g)', calories: 220, protein: 7, carbs: 47, fat: 1 },
  { name: '面条', unit: '碗 (约200g)', calories: 220, protein: 8, carbs: 48, fat: 1 },
  { name: '粥', unit: '碗 (约250g)', calories: 120, protein: 2, carbs: 25, fat: 0.5 },
  { name: '水煮蛋', unit: '个', calories: 70, protein: 6, carbs: 0.5, fat: 5 },
  { name: '全麦面包', unit: '片', calories: 80, protein: 3, carbs: 14, fat: 1 },
];

const parseMacro = (str: string | undefined): number => {
  if (!str) return 0;
  return parseFloat(str) || 0;
};

export const DashboardView: React.FC<DashboardViewProps> = ({ logs, onBack, onAddLog }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStaple, setSelectedStaple] = useState(STAPLE_FOODS[0]);
  const [stapleAmount, setStapleAmount] = useState(1);

  // Sort logs by date (newest first)
  const sortedLogs = useMemo(() => [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [logs]);

  // Calculate stats for the last 7 days
  const stats = useMemo(() => {
    const totalDishes = sortedLogs.length;
    const totalCalories = sortedLogs.reduce((acc, log) => acc + parseInt(log.nutrition.calories) || 0, 0);
    return { totalDishes, totalCalories };
  }, [sortedLogs]);

  // Today's Intake Calculation including Micronutrients
  const todayAnalysis = useMemo(() => {
    const today = new Date().toDateString();
    const todayLogs = sortedLogs.filter(log => new Date(log.date).toDateString() === today);
    
    const totals = {
       calories: 0, protein: 0, carbs: 0, fat: 0,
       sodium: 0, sugar: 0, fiber: 0, calcium: 0, iron: 0, vitaminC: 0
    };

    todayLogs.forEach(log => {
       totals.calories += parseMacro(log.nutrition.calories);
       totals.protein += parseMacro(log.nutrition.protein);
       totals.carbs += parseMacro(log.nutrition.carbs);
       totals.fat += parseMacro(log.nutrition.fat);
       
       if (log.nutrition.micronutrients) {
          const m = log.nutrition.micronutrients;
          totals.sodium += parseMacro(m.sodium);
          totals.sugar += parseMacro(m.sugar);
          totals.fiber += parseMacro(m.fiber);
          totals.calcium += parseMacro(m.calcium);
          totals.iron += parseMacro(m.iron);
          totals.vitaminC += parseMacro(m.vitaminC);
       }
    });

    const advices: string[] = [];
    if (totals.calories < 1200) advices.push("⚡️ 今日热量摄入偏低，建议晚餐吃得丰富一些。");
    else if (totals.calories > 2500) advices.push("⚠️ 今日热量摄入稍高，可以适当运动哦。");
    else advices.push("🌟 今日热量摄入达标，保持得很好！");

    if (totals.protein < 50) advices.push("🥩 蛋白质摄入不足，建议补充鸡蛋、牛奶或瘦肉。");
    if (totals.sodium > 2300) advices.push("🧂 钠摄入量较高，注意清淡饮食，多喝水。");

    return { count: todayLogs.length, ...totals, advices };
  }, [sortedLogs]);

  const handleAddStaple = () => {
    const factor = stapleAmount;
    const nutrition: NutritionInfo = {
      calories: `${Math.round(selectedStaple.calories * factor)} kcal`,
      protein: `${(selectedStaple.protein * factor).toFixed(1)}g`,
      carbs: `${(selectedStaple.carbs * factor).toFixed(1)}g`,
      fat: `${(selectedStaple.fat * factor).toFixed(1)}g`,
      micronutrients: {
        sodium: "0mg", sugar: "0g", fiber: "0g", calcium: "0mg", iron: "0mg", vitaminC: "0mg"
      }
    };

    const newLog: CookedLog = {
      id: crypto.randomUUID(),
      recipeTitle: selectedStaple.name,
      date: new Date().toISOString(),
      nutrition: nutrition,
      consumedServings: stapleAmount
    };

    onAddLog(newLog);
    setShowAddModal(false);
    setStapleAmount(1);
  };

  const microStatsDisplay = [
    { key: 'sodium', val: todayAnalysis.sodium, unit: 'mg', color: 'text-blue-600', bg: 'bg-blue-50' },
    { key: 'sugar', val: todayAnalysis.sugar, unit: 'g', color: 'text-pink-500', bg: 'bg-pink-50' },
    { key: 'fiber', val: todayAnalysis.fiber, unit: 'g', color: 'text-green-600', bg: 'bg-green-50' },
    { key: 'calcium', val: todayAnalysis.calcium, unit: 'mg', color: 'text-stone-600', bg: 'bg-stone-100' },
    { key: 'iron', val: todayAnalysis.iron, unit: 'mg', color: 'text-red-700', bg: 'bg-red-50' },
    { key: 'vitaminC', val: todayAnalysis.vitaminC, unit: 'mg', color: 'text-orange-500', bg: 'bg-orange-50' },
  ];

  return (
    <div className="bg-stone-50 min-h-screen pb-20 animate-fade-in">
       {/* Header */}
       <div className="bg-white sticky top-0 z-40 px-6 py-5 shadow-sm border-b border-stone-100 flex justify-between items-center">
         <h2 className="text-2xl font-serif-display font-bold text-stone-900">烹饪看板</h2>
         <button onClick={onBack} className="text-stone-500 hover:text-stone-900 font-medium text-sm">
           返回
         </button>
       </div>

       <div className="p-6 max-w-2xl mx-auto space-y-6">
         
         {/* Summary Cards */}
         <div className="grid grid-cols-2 gap-4">
            <div className="bg-stone-900 rounded-2xl p-5 text-white shadow-lg shadow-stone-900/20">
               <div className="text-stone-400 text-xs font-bold uppercase tracking-wider mb-1">累计记录</div>
               <div className="text-4xl font-serif-display font-bold">{stats.totalDishes} <span className="text-sm font-sans font-normal opacity-60">项</span></div>
            </div>
            <div className="bg-amber-500 rounded-2xl p-5 text-white shadow-lg shadow-amber-500/20">
               <div className="text-amber-100 text-xs font-bold uppercase tracking-wider mb-1">累计热量</div>
               <div className="text-4xl font-serif-display font-bold">{stats.totalCalories > 1000 ? (stats.totalCalories/1000).toFixed(1) + 'k' : stats.totalCalories} <span className="text-sm font-sans font-normal opacity-60">kcal</span></div>
            </div>
         </div>

         {/* Today's Advice Section */}
         <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
             <h3 className="font-serif-display font-bold text-stone-800 mb-4 flex items-center">
               <span className="text-xl mr-2">📋</span> 今日营养分析
             </h3>
             
             {todayAnalysis.count === 0 ? (
               <div className="text-stone-400 text-sm text-center py-4">
                 今天还没有记录，完成后我会为您分析营养摄入。
               </div>
             ) : (
               <div className="space-y-4">
                  {/* Progress Bars */}
                  <div className="space-y-3 mb-6">
                     <div>
                       <div className="flex justify-between text-xs mb-1">
                          <span className="text-stone-500">热量 ({todayAnalysis.calories} / 2000 kcal)</span>
                          <span className="font-bold text-stone-800">{Math.min(100, Math.round(todayAnalysis.calories / 2000 * 100))}%</span>
                       </div>
                       <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.min(100, todayAnalysis.calories / 2000 * 100)}%` }}></div>
                       </div>
                     </div>
                     <div>
                       <div className="flex justify-between text-xs mb-1">
                          <span className="text-stone-500">蛋白质 ({todayAnalysis.protein} / 60g)</span>
                          <span className="font-bold text-stone-800">{Math.min(100, Math.round(todayAnalysis.protein / 60 * 100))}%</span>
                       </div>
                       <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                          <div className="h-full bg-red-400 rounded-full" style={{ width: `${Math.min(100, todayAnalysis.protein / 60 * 100)}%` }}></div>
                       </div>
                     </div>
                  </div>

                  {/* Text Advice */}
                  <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                     <h4 className="text-xs font-bold text-amber-800 uppercase mb-2">建议</h4>
                     <ul className="space-y-2">
                        {todayAnalysis.advices.map((adv, i) => (
                           <li key={i} className="text-sm text-amber-900/80 leading-relaxed">{adv}</li>
                        ))}
                     </ul>
                  </div>
               </div>
             )}
         </div>

         {/* Recent History List */}
         <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
           <div className="flex justify-between items-center mb-4">
             <h3 className="font-serif-display font-bold text-stone-800 flex items-center">
               <span className="text-xl mr-2">📅</span> 饮食记录
             </h3>
             <button 
               onClick={() => setShowAddModal(true)}
               className="text-xs bg-stone-100 hover:bg-stone-200 text-stone-800 px-3 py-1.5 rounded-lg font-bold transition-colors"
             >
               ➕ 记主食/单品
             </button>
           </div>
           
           {sortedLogs.length === 0 ? (
             <div className="text-center py-8 text-stone-400 text-sm">
                还没有记录。
             </div>
           ) : (
             <div className="space-y-4">
               {sortedLogs.map((log) => {
                 const date = new Date(log.date);
                 return (
                  <div key={log.id} className="flex items-center justify-between border-b border-stone-50 last:border-0 pb-4 last:pb-0">
                      <div className="flex items-center space-x-4">
                         <div className="w-12 h-12 bg-stone-100 rounded-lg flex flex-col items-center justify-center text-stone-600 flex-shrink-0 relative overflow-hidden">
                            <div className="w-full h-3 bg-red-400 absolute top-0 left-0"></div>
                            <span className="text-lg font-bold mt-1 leading-none">{date.getDate()}</span>
                         </div>
                         <div>
                            <div className="font-bold text-stone-900 text-lg flex items-center">
                              {log.recipeTitle}
                              {log.consumedServings && (
                                <span className="ml-2 text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold">
                                  x{log.consumedServings}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-stone-400 mt-0.5">
                              {date.toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </div>
                         </div>
                      </div>

                      <div className="text-right">
                          <div className="inline-flex items-center px-2 py-1 bg-stone-100 rounded text-xs font-mono font-medium text-stone-600 mb-1">
                             {log.nutrition.calories}
                          </div>
                          <div className="flex gap-1 justify-end">
                             <div className="h-1.5 w-4 bg-red-400 rounded-full" title="Protein"></div>
                             <div className="h-1.5 w-4 bg-green-400 rounded-full" title="Carbs"></div>
                             <div className="h-1.5 w-4 bg-amber-400 rounded-full" title="Fat"></div>
                          </div>
                      </div>
                  </div>
                 );
               })}
             </div>
           )}
         </div>

         {/* Micronutrients Stats */}
         <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 relative overflow-hidden">
            <h3 className="font-serif-display font-bold text-stone-800 mb-4 flex items-center">
              <span className="text-xl mr-2">📊</span> 今日微量元素
            </h3>
            
            {todayAnalysis.count === 0 ? (
               <div className="text-stone-300 text-sm text-center py-6">暂无数据</div>
            ) : (
               <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {microStatsDisplay.map((stat) => (
                    <div key={stat.key} className={`p-3 rounded-xl border border-transparent ${stat.bg}`}>
                       <div className="text-[10px] text-stone-500 font-bold uppercase mb-1">{MICRO_LABELS[stat.key]}</div>
                       <div className={`text-xl font-bold font-serif-display ${stat.color}`}>
                         {Math.round(stat.val * 10) / 10} <span className="text-xs font-sans text-stone-400">{stat.unit}</span>
                       </div>
                    </div>
                  ))}
               </div>
            )}
         </div>
       </div>

       {/* Add Staple Modal */}
       {showAddModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
           <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" onClick={() => setShowAddModal(false)}></div>
           <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl relative z-10">
              <h3 className="text-lg font-bold text-stone-900 mb-4">记录主食 / 单品</h3>
              
              <div className="space-y-4">
                 <div className="grid grid-cols-3 gap-2">
                    {STAPLE_FOODS.map(food => (
                       <button
                         key={food.name}
                         onClick={() => setSelectedStaple(food)}
                         className={`p-3 rounded-xl border text-sm font-bold transition-all ${
                           selectedStaple.name === food.name 
                             ? 'bg-amber-500 border-amber-500 text-white' 
                             : 'bg-white border-stone-200 text-stone-600 hover:border-amber-300'
                         }`}
                       >
                         {food.name}
                       </button>
                    ))}
                 </div>

                 <div className="bg-stone-50 p-4 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="font-bold text-stone-800">{selectedStaple.name}</div>
                      <div className="text-xs text-stone-400">{selectedStaple.unit} / 份</div>
                    </div>
                    <div className="flex items-center space-x-3">
                       <button 
                         onClick={() => setStapleAmount(Math.max(0.5, stapleAmount - 0.5))}
                         className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center font-bold"
                       >
                         -
                       </button>
                       <span className="font-bold text-lg w-8 text-center">{stapleAmount}</span>
                       <button 
                         onClick={() => setStapleAmount(Math.min(10, stapleAmount + 0.5))}
                         className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center font-bold"
                       >
                         +
                       </button>
                    </div>
                 </div>

                 <div className="text-xs text-stone-400 text-center">
                   预计热量: {Math.round(selectedStaple.calories * stapleAmount)} kcal
                 </div>

                 <button 
                   onClick={handleAddStaple}
                   className="w-full py-3 bg-stone-900 text-white rounded-xl font-bold shadow-lg hover:bg-black transition-colors"
                 >
                   确认记录
                 </button>
              </div>
           </div>
         </div>
       )}
    </div>
  );
};
