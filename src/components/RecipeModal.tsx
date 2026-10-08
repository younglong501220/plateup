import React from 'react';
import { X, Flame, ChefHat, Sparkles } from 'lucide-react';
import { RECIPES } from '../game/recipes';

interface RecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RecipeModal: React.FC<RecipeModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 text-slate-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <ChefHat className="w-6 h-6 text-amber-400" />
            <h2 className="text-xl font-bold tracking-tight text-white font-['Fredoka',sans-serif]">
              廚房料理手冊與流水線指南
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6 pt-5">
          {/* Section 1: Recipes */}
          <div>
            <h3 className="text-sm font-semibold text-amber-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> 菜單與組裝配方
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Classic Burger */}
              <div className="p-4 bg-slate-800/80 border border-slate-700 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-white text-base">
                    <span className="text-2xl">🍔</span>
                    <span>經典肉排堡</span>
                  </div>
                  <span className="text-emerald-400 font-bold font-mono">${RECIPES.burger.price}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  基底料理：生肉放煎台 ➔ 熟肉 ➔ 盤子盛裝麵包與熟肉 ➔ 出餐！
                </p>
                <div className="text-xs bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 space-y-1 text-slate-300">
                  <span className="text-amber-400 font-medium">組裝公式：</span>
                  <div>乾淨盤 + 漢堡麵包 + 香煎熟肉排</div>
                </div>
              </div>

              {/* Cheeseburger */}
              <div className="p-4 bg-slate-800/80 border border-slate-700 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-white text-base">
                    <span className="text-2xl">🧀🍔</span>
                    <span>金牌起司堡</span>
                  </div>
                  <span className="text-emerald-400 font-bold font-mono">${RECIPES.cheeseburger.price}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  濃郁升級：起司放砧板長按 <kbd className="px-1 py-0.5 bg-slate-700 rounded text-amber-300 font-mono">E</kbd> 切片後組裝。
                </p>
                <div className="text-xs bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 space-y-1 text-slate-300">
                  <span className="text-amber-400 font-medium">組裝公式：</span>
                  <div>乾淨盤 + 漢堡麵包 + 香煎熟肉排 + 起司切片</div>
                </div>
              </div>

              {/* Garden Salad */}
              <div className="p-4 bg-slate-800/80 border border-slate-700 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-white text-base">
                    <span className="text-2xl">🥗</span>
                    <span>田園鮮蔬沙拉</span>
                  </div>
                  <span className="text-emerald-400 font-bold font-mono">${RECIPES.salad.price}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  純刀工料理：生菜箱取菜、番茄箱取番茄，分別於砧板按 <kbd className="px-1 py-0.5 bg-slate-700 rounded text-amber-300 font-mono">E</kbd> 切片後裝盤！
                </p>
                <div className="text-xs bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 space-y-1 text-slate-300">
                  <span className="text-amber-400 font-medium">組裝公式：</span>
                  <div>乾淨盤 + 切片生菜 + 切片番茄（免開火）</div>
                </div>
              </div>

              {/* Ribeye Steak */}
              <div className="p-4 bg-slate-800/80 border border-slate-700 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-white text-base">
                    <span className="text-2xl">🥩🍽️</span>
                    <span>頂級香煎牛排</span>
                  </div>
                  <span className="text-emerald-400 font-bold font-mono">${RECIPES.steak.price}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  高檔主菜：生肉於煎台煎熟，搭配砧板切片的番茄佐餐裝盤！
                </p>
                <div className="text-xs bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 space-y-1 text-slate-300">
                  <span className="text-amber-400 font-medium">組裝公式：</span>
                  <div>乾淨盤 + 香煎熟肉排 + 切片番茄</div>
                </div>
              </div>

              {/* Deluxe Burger */}
              <div className="p-4 bg-slate-800/80 border border-slate-700 rounded-xl space-y-3 md:col-span-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-white text-base">
                    <span className="text-2xl">👑🍔</span>
                    <span>豪華總匯巨堡</span>
                  </div>
                  <span className="text-emerald-400 font-bold font-mono">${RECIPES.deluxe_burger.price}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  終極手速挑戰：五層極品漢堡，利潤高達 $55！
                </p>
                <div className="text-xs bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 space-y-1 text-slate-300">
                  <span className="text-amber-400 font-medium">組裝公式：</span>
                  <div>乾淨盤 + 漢堡麵包 + 熟肉排 + 起司切片 + 生菜切片 + 番茄切片</div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Dishwashing & Garbage */}
          <div>
            <h3 className="text-sm font-semibold text-sky-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Flame className="w-4 h-4" /> 盤子清洗與安全重點
            </h3>
            <div className="p-4 bg-slate-800/80 border border-slate-700 rounded-xl space-y-2 text-xs text-slate-300 leading-relaxed">
              <div className="flex items-start gap-2">
                <span className="text-sky-400 font-bold">● 洗碗流水線：</span>
                <span>客人用餐完畢後桌上會留下「灰色髒盤」。按 <kbd className="px-1 py-0.5 bg-slate-700 rounded text-amber-300 font-mono">Space</kbd> 收回放入水槽，對著水槽按住 <kbd className="px-1 py-0.5 bg-slate-700 rounded text-amber-300 font-mono">E</kbd> 進行清洗，洗淨後拿出來即可重複使用！</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-rose-400 font-bold">● 防燒焦機制：</span>
                <span>肉排煎熟後若長時間留在煎台上會開始冒煙燒焦！燒焦的肉排無法食用，必須丟進廚餘桶（垃圾桶）重煎。</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">● 顧客耐心機制：</span>
                <span>每位進店顧客頭頂都有「耐心計時條」。若等待過久生氣離場會扣除 1 顆餐廳愛心，愛心歸零餐廳將宣告倒閉！</span>
              </div>
            </div>
          </div>

          {/* Section 3: Controls */}
          <div>
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-2">
              操作按鍵一覽
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-slate-300">
              <div className="p-3 bg-slate-800/60 rounded-lg border border-slate-700/60 flex flex-col gap-1">
                <span className="font-bold text-white">移動主廚</span>
                <span><kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-amber-300 font-mono font-bold">W</kbd><kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-amber-300 font-mono font-bold">A</kbd><kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-amber-300 font-mono font-bold">S</kbd><kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-amber-300 font-mono font-bold">D</kbd> 或方向鍵</span>
              </div>
              <div className="p-3 bg-slate-800/60 rounded-lg border border-slate-700/60 flex flex-col gap-1">
                <span className="font-bold text-white">拿取 / 放置 / 組裝</span>
                <span><kbd className="px-2 py-0.5 bg-slate-700 rounded text-amber-300 font-mono font-bold">Space 空白鍵</kbd></span>
              </div>
              <div className="p-3 bg-slate-800/60 rounded-lg border border-slate-700/60 flex flex-col gap-1">
                <span className="font-bold text-white">切菜 / 洗碗 (長按)</span>
                <span><kbd className="px-2 py-0.5 bg-slate-700 rounded text-amber-300 font-mono font-bold">E 鍵</kbd> (長按工作)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-lg transition-colors cursor-pointer"
          >
            我瞭解了，開始做菜！
          </button>
        </div>
      </div>
    </div>
  );
};
