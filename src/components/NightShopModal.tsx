import React from 'react';
import { Moon, ArrowRight, Check, ShoppingBag, Award, XCircle, CheckCircle2 } from 'lucide-react';
import { UpgradeCard, DailyMission } from '../game/types';

interface NightShopModalProps {
  isOpen: boolean;
  day: number;
  money: number;
  dayEarnings: number;
  customersServedToday: number;
  dailyMission: DailyMission | null;
  availableUpgrades: UpgradeCard[];
  onBuyUpgrade: (upgrade: UpgradeCard) => void;
  onNextDay: () => void;
}

export const NightShopModal: React.FC<NightShopModalProps> = ({
  isOpen,
  day,
  money,
  dayEarnings,
  customersServedToday,
  dailyMission,
  availableUpgrades,
  onBuyUpgrade,
  onNextDay,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-amber-500/40 rounded-2xl shadow-2xl p-6 sm:p-8 text-slate-100">
        {/* Title */}
        <div className="text-center space-y-1.5 pb-4 border-b border-slate-800">
          <div className="inline-flex items-center gap-2 text-amber-400 font-bold text-xs sm:text-sm tracking-wider uppercase">
            <Moon className="w-4 h-4 fill-amber-400" />
            <span>營業圓滿打烊 · 第 {day} 天結算</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Fredoka',sans-serif]">
            餐廳升級藍圖商店
          </h2>
          <div className="flex items-center justify-center gap-4 text-xs sm:text-sm pt-1 text-slate-300">
            <span>今日接待：<strong className="text-sky-400 font-mono">{customersServedToday} 組客人</strong></span>
            <span className="text-slate-600">·</span>
            <span>今日淨賺：<strong className="text-emerald-400 font-mono">+${dayEarnings}</strong></span>
            <span className="text-slate-600">·</span>
            <span>當前庫存金幣：<strong className="text-amber-300 font-mono">${money}</strong></span>
          </div>

          {/* Daily Mission completion banner */}
          {dailyMission && (
            <div className={`mt-3 p-2.5 rounded-xl border flex items-center justify-between text-xs sm:text-sm ${
              dailyMission.isCompleted
                ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                : 'bg-rose-950/30 border-rose-800/40 text-slate-400'
            }`}>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  每日目標【{dailyMission.title}】：{dailyMission.desc}
                </span>
              </div>
              <div className="font-bold flex items-center gap-1 shrink-0">
                {dailyMission.isCompleted ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400 font-mono">+${dailyMission.rewardGold} 獎勵已發放！</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-rose-400" />
                    <span>挑戰未達成</span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Upgrade Cards Section */}
        <div className="py-6">
          <div className="flex items-center justify-between mb-3 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
              <span>今日抽取的升級卡牌（點選即刻購買）：</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {availableUpgrades.map((upg) => {
              const canAfford = money >= upg.cost;
              const isPurchased = upg.applied;

              return (
                <div
                  key={upg.id}
                  className={`relative p-4 rounded-xl border flex flex-col justify-between transition-all ${
                    isPurchased
                      ? 'bg-emerald-950/30 border-emerald-500/50 opacity-90'
                      : canAfford
                      ? 'bg-slate-800/90 border-slate-700 hover:border-amber-400 hover:shadow-lg hover:-translate-y-1'
                      : 'bg-slate-800/40 border-slate-800 opacity-60'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">{upg.icon}</span>
                      <span className="text-[11px] font-semibold text-slate-400">
                        {upg.tag}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-white">{upg.name}</h4>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        {upg.desc}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between">
                    <span className="font-mono font-bold text-sm text-emerald-400">
                      ${upg.cost}
                    </span>

                    {isPurchased ? (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-bold">
                        <Check className="w-3.5 h-3.5" /> 已裝備
                      </span>
                    ) : (
                      <button
                        onClick={() => canAfford && onBuyUpgrade(upg)}
                        disabled={!canAfford}
                        className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                          canAfford
                            ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                            : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        {canAfford ? '購買' : '金幣不足'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Action */}
        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onNextDay}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-sm rounded-xl transition-all shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer"
          >
            <span>準備就緒，開啟第 {day + 1} 天！</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
