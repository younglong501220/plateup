import React from 'react';
import { Volume2, VolumeX, BookOpen, Play, Bell, Zap, Target, CheckCircle2, XCircle, Trophy } from 'lucide-react';
import { GamePhase, DailyMission, RushHourState } from '../game/types';

interface HeaderHUDProps {
  day: number;
  money: number;
  reputation: number;
  customersRemaining: number;
  phase: GamePhase;
  dailyMission: DailyMission | null;
  rushHour: RushHourState;
  hasBell: boolean;
  bellUsesLeft: number;
  onRingBell: () => void;
  isMuted: boolean;
  volume: number;
  onToggleMute: () => void;
  onVolumeChange: (vol: number) => void;
  onOpenRecipes: () => void;
  onOpenHallOfFame: () => void;
  onStartService: () => void;
}

export const HeaderHUD: React.FC<HeaderHUDProps> = ({
  day,
  money,
  reputation,
  customersRemaining,
  phase,
  dailyMission,
  rushHour,
  hasBell,
  bellUsesLeft,
  onRingBell,
  isMuted,
  volume,
  onToggleMute,
  onVolumeChange,
  onOpenRecipes,
  onOpenHallOfFame,
  onStartService,
}) => {
  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col bg-slate-900 border-b border-slate-800 text-slate-100 select-none">
      <header className="flex items-center justify-between px-4 py-2.5">
        {/* Zone 1: Wordmark */}
        <div className="flex items-center gap-3">
          <span className="text-xl font-extrabold tracking-tight text-amber-400 font-['Fredoka',sans-serif]">
            PlateUp! 速速上菜
          </span>
          <span className="hidden sm:inline-block text-[11px] text-slate-400 font-medium tracking-wide">
            WEB EDITION
          </span>
        </div>

        {/* Zone 2: Unboxed metadata metrics with typographic separators */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm font-medium">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">營業日</span>
            <span className="font-bold text-amber-300 font-mono tabular-nums">第 {day} 天</span>
          </div>

          <span className="text-slate-600" aria-hidden="true">·</span>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">金幣</span>
            <span className="font-bold text-emerald-400 font-mono tabular-nums">${money}</span>
          </div>

          <span className="text-slate-600" aria-hidden="true">·</span>

          <div className="flex items-center gap-1.5" title="聲望愛心：若顧客等候超時離場將扣除">
            <span className="text-slate-400">聲望</span>
            <span className="text-rose-500 tracking-wider">
              {'❤️'.repeat(Math.max(0, reputation))}
              {'🤍'.repeat(Math.max(0, 3 - reputation))}
            </span>
          </div>

          <span className="hidden md:inline text-slate-600" aria-hidden="true">·</span>

          <div className="hidden md:flex items-center gap-1.5">
            <span className="text-slate-400">待接待顧客</span>
            <span className="font-bold text-sky-400 font-mono tabular-nums">
              {phase === 'PREP' ? '準備中' : `${customersRemaining} 組`}
            </span>
          </div>
        </div>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2">
          {hasBell && (
            <button
              onClick={onRingBell}
              disabled={bellUsesLeft <= 0}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                bellUsesLeft > 0
                  ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md shadow-amber-400/20 active:scale-95'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
              title="敲響迎賓響鈴 (快捷鍵 Q)：使全場在座顧客耐心即刻回滿 50%"
            >
              <Bell className="w-3.5 h-3.5 fill-current" />
              <span>敲金鐘 ({bellUsesLeft})</span>
            </button>
          )}

          {phase === 'PREP' && (
            <button
              onClick={onStartService}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold text-xs sm:text-sm rounded-lg transition-all shadow-md shadow-amber-500/20 whitespace-nowrap cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>開門營業！</span>
            </button>
          )}

          {phase === 'SERVICE' && (
            <div className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md ${
              rushHour.isActive 
                ? 'bg-rose-600 text-white font-bold animate-bounce' 
                : 'text-rose-300 bg-rose-950/60 border border-rose-800/60 animate-pulse'
            }`}>
              <span className={`w-2 h-2 rounded-full ${rushHour.isActive ? 'bg-amber-300' : 'bg-rose-500'}`}></span>
              <span>{rushHour.isActive ? `尖峰客潮 ${Math.ceil(rushHour.timeLeft)}s` : '營業中'}</span>
            </div>
          )}

          <button
            onClick={onOpenRecipes}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 active:scale-95 rounded-lg transition-colors cursor-pointer"
            title="查看料理指南與操作說明"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">食譜指南</span>
          </button>

          <button
            onClick={onOpenHallOfFame}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 active:scale-95 rounded-lg transition-colors cursor-pointer"
            title="查看廚房名人堂歷史紀錄"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">名人堂</span>
          </button>

          {/* Volume & Mute */}
          <div className="flex items-center gap-1 pl-1">
            <button
              onClick={onToggleMute}
              className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md transition-colors cursor-pointer"
              title={isMuted ? '取消靜音' : '靜音音效'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="hidden lg:block w-14 accent-amber-400 h-1 bg-slate-700 rounded-lg cursor-pointer"
              title="音效音量"
            />
          </div>
        </div>
      </header>

      {/* Sub-bar: Daily Mission Progress */}
      {dailyMission && (
        <div className="px-4 py-1.5 bg-slate-950/70 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Target className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold text-slate-200">今日目標：{dailyMission.title}</span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-400">{dailyMission.desc}</span>
            {dailyMission.targetCount > 0 && (
              <span className="font-mono text-amber-300 font-bold">
                ({dailyMission.currentCount}/{dailyMission.targetCount})
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-emerald-400 font-bold font-mono">+${dailyMission.rewardGold}</span>
            {dailyMission.isCompleted ? (
              <span className="flex items-center gap-1 text-emerald-400 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" /> 已達成
              </span>
            ) : dailyMission.isFailed ? (
              <span className="flex items-center gap-1 text-rose-400 font-bold">
                <XCircle className="w-3.5 h-3.5" /> 已失敗
              </span>
            ) : (
              <span className="text-sky-400 font-medium">挑戰進行中</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
