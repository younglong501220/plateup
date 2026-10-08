import React from 'react';
import { RotateCcw, Award, Utensils, Coins, Calendar, Trophy, Sparkles } from 'lucide-react';
import { KitchenStats, HallOfFameData } from '../game/types';

interface GameOverModalProps {
  isOpen: boolean;
  day: number;
  stats: KitchenStats;
  hallOfFame: HallOfFameData;
  newRecords?: string[];
  onRestart: () => void;
  onOpenHallOfFame: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  day,
  stats,
  hallOfFame,
  newRecords = [],
  onRestart,
  onOpenHallOfFame,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-lg bg-slate-900 border border-rose-500/50 rounded-2xl shadow-2xl p-6 sm:p-7 text-center text-slate-100">
        {/* Skull / Broken Plate Icon */}
        <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-rose-950/60 border border-rose-500/40 flex items-center justify-center text-3xl">
          💥
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Fredoka',sans-serif]">
          餐廳宣告倒閉！
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">
          顧客等候超時憤而離席，餐廳的名聲敗光了... 下次要更加優化動線與出餐速度！
        </p>

        {/* New Record Banner if applicable */}
        {newRecords.length > 0 && (
          <div className="mt-3 py-1.5 px-3 bg-amber-500/15 border border-amber-500/40 rounded-xl text-amber-300 text-xs font-bold flex items-center justify-center gap-2 animate-pulse">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>恭喜！刷新了名人堂新紀錄：{newRecords.join(' · ')}！</span>
          </div>
        )}

        {/* Current Run Stats */}
        <div className="my-4 p-4 bg-slate-800/80 border border-slate-700 rounded-xl grid grid-cols-2 gap-3 text-left">
          <div className="flex items-center gap-2.5">
            <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <div className="text-[11px] text-slate-400">本次生存天數</div>
              <div className="text-sm font-bold text-white font-mono">第 {day} 天</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Coins className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <div className="text-[11px] text-slate-400">本次累積營業額</div>
              <div className="text-sm font-bold text-emerald-400 font-mono">${stats.moneyEarnedTotal}</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Utensils className="w-4 h-4 text-sky-400 shrink-0" />
            <div>
              <div className="text-[11px] text-slate-400">本次出餐總數</div>
              <div className="text-sm font-bold text-white font-mono">{stats.dishesServedTotal} 份</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Award className="w-4 h-4 text-purple-400 shrink-0" />
            <div>
              <div className="text-[11px] text-slate-400">本次完成挑戰</div>
              <div className="text-sm font-bold text-purple-300 font-mono">{stats.missionsCompleted} 項</div>
            </div>
          </div>
        </div>

        {/* Kitchen Hall of Fame Section */}
        <div className="mb-5 p-4 bg-amber-950/20 border border-amber-500/30 rounded-xl text-left">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wide">
              <Trophy className="w-4 h-4" />
              <span>廚房名人堂 (Hall of Fame) 紀錄</span>
            </div>
            <button
              onClick={onOpenHallOfFame}
              className="text-[11px] text-amber-400 hover:text-amber-300 underline cursor-pointer"
            >
              查看詳情
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 block">最高金幣總額</span>
              <strong className="text-amber-300 font-mono text-sm">${hallOfFame.bestMoney}</strong>
            </div>

            <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 block">最高完成任務</span>
              <strong className="text-sky-300 font-mono text-sm">{hallOfFame.bestMissions} 項</strong>
            </div>

            <div className="bg-slate-900/60 p-2 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 block">最長生存天數</span>
              <strong className="text-emerald-300 font-mono text-sm">第 {hallOfFame.bestDay} 天</strong>
            </div>
          </div>
        </div>

        {/* Single-line Play Again Button */}
        <button
          onClick={onRestart}
          className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-bold text-base rounded-xl transition-all shadow-lg shadow-rose-600/30 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>重新開店挑戰</span>
        </button>
      </div>
    </div>
  );
};
