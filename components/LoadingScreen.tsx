import React, { useEffect, useState } from 'react';

const LOADING_MESSAGES = [
  "正在清洗蔬菜...",
  "正在预热烤箱...",
  "大厨正在思考食谱...",
  "正在研磨香料...",
  "正在准备摆盘...",
  "询问奶奶的秘密配方..."
];

export const LoadingScreen: React.FC = () => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-stone-50 z-50 flex flex-col items-center justify-center p-4">
      <div className="relative mb-8">
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl border border-stone-100 animate-bounce">
          <span className="text-4xl">🥘</span>
        </div>
        <div className="absolute -bottom-4 w-20 h-4 bg-black/5 blur-md rounded-full animate-pulse mx-auto"></div>
      </div>
      
      <h2 className="text-xl font-serif-display font-bold text-stone-800 mb-2 tracking-wide">生成食谱中</h2>
      <p className="text-stone-400 text-sm font-medium animate-pulse">{LOADING_MESSAGES[messageIndex]}</p>
    </div>
  );
};