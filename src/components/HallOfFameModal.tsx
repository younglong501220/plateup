import React from 'react';
import { Trophy, Calendar, Coins, Target, Utensils, X, Flame } from 'lucide-react';
import { HallOfFameData } from '../game/types';

interface HallOfFameModalProps {
  isOpen: boolean;
  onClose: () => void;
  hallOfFame: HallOfFameData;
}

export const HallOfFameModal: React.FC<HallOfFameModalProps> = ({
  isOpen,
  onClose,
  hallOfFame,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-lg bg-slate-900 border border-amber-500/50 rounded-2xl shadow-2xl p-6 sm:p-7 text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white font-['Fredoka',sans-serif]">
                廚房名人堂 (Hall of Fame)
              </h2>
              <p className="text-xs text-slate-400">
                主廚歷代生涯最佳歷史成就記錄
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Records Grid */}
        <div className="grid grid-cols-2 gap-3.5 my-6">
          {/* Record 1: Best Money */}
          <div className="p-4 bg-slate-800/80 border border-amber-500/30 rounded-xl space-y-1 relative overflow-hidden">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold">
              <Coins className="w-4 h-4" />
              <span>最高獲得金幣總額</span>
            </div>
            <div className="text-2xl font-black text-amber-300 font-mono tabular-nums">
              ${hallOfFame.bestMoney}
            </div>
            <div className="text-[11px] text-slate-400">單次遊戲最高累計營收</div>
          </div>

          {/* Record 2: Best Missions */}
          <div className="p-4 bg-slate-800/80 border border-sky-500/30 rounded-xl space-y-1 relative overflow-hidden">
            <div className="flex items-center gap-2 text-sky-400 text-xs font-semibold">
              <Target className="w-4 h-4" />
              <span>最高完成任務數</span>
            </div>
            <div className="text-2xl font-black text-sky-300 font-mono tabular-nums">
              {hallOfFame.bestMissions} 項
            </div>
            <div className="text-[11px] text-slate-400">單次遊戲完成挑戰次數</div>
          </div>

          {/* Record 3: Best Day */}
          <div className="p-4 bg-slate-800/80 border border-emerald-500/30 rounded-xl space-y-1 relative overflow-hidden">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
              <Calendar className="w-4 h-4" />
              <span>最高生存天數</span>
            </div>
            <div className="text-2xl font-black text-emerald-300 font-mono tabular-nums">
              第 {hallOfFame.bestDay} 天
            </div>
            <div className="text-[11px] text-slate-400">營業堅持最久輪次</div>
          </div>

          {/* Record 4: Best Dishes */}
          <div className="p-4 bg-slate-800/80 border border-rose-500/30 rounded-xl space-y-1 relative overflow-hidden">
            <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold">
              <Utensils className="w-4 h-4" />
              <span>最高出餐總量</span>
            </div>
            <div className="text-2xl font-black text-rose-300 font-mono tabular-nums">
              {hallOfFame.bestDishes} 份
            </div>
            <div className="text-[11px] text-slate-400">單局服務顧客總盤數</div>
          </div>
        </div>

        {/* Tip */}
        <div className="p-3 bg-slate-800/40 border border-slate-700/60 rounded-xl text-xs text-slate-300 flex items-start gap-2.5">
          <Flame className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span className="leading-relaxed">
            挑戰更高的生存日數、把握每日挑戰與尖峰狂潮，讓你的餐廳營收與任務成就登上米其林巔峰！資料已即時保存於瀏覽器儲存中。
          </span>
        </div>

        {/* Close Button */}
        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-xl transition-all cursor-pointer"
          >
            返回遊戲
          </button>
        </div>
      </div>
    </div>
  );
};
