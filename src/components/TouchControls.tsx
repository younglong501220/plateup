import React from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Hand, Waves } from 'lucide-react';

interface TouchControlsProps {
  onDirectionPress: (dir: 'up' | 'down' | 'left' | 'right' | null) => void;
  onSpaceDown: () => void;
  onEDown: () => void;
  onEUp: () => void;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  onDirectionPress,
  onSpaceDown,
  onEDown,
  onEUp,
}) => {
  return (
    <div className="w-full max-w-5xl mx-auto mt-2 px-2 flex items-center justify-between select-none touch-none">
      {/* Direction Pad */}
      <div className="grid grid-cols-3 gap-1.5 w-36 h-36">
        <div></div>
        <button
          onPointerDown={() => onDirectionPress('up')}
          onPointerUp={() => onDirectionPress(null)}
          onPointerLeave={() => onDirectionPress(null)}
          className="flex items-center justify-center bg-slate-800/90 hover:bg-slate-700 active:bg-amber-500 active:text-slate-950 text-slate-200 border border-slate-700 rounded-xl shadow-md transition-colors"
          aria-label="往上"
        >
          <ArrowUp className="w-6 h-6" />
        </button>
        <div></div>

        <button
          onPointerDown={() => onDirectionPress('left')}
          onPointerUp={() => onDirectionPress(null)}
          onPointerLeave={() => onDirectionPress(null)}
          className="flex items-center justify-center bg-slate-800/90 hover:bg-slate-700 active:bg-amber-500 active:text-slate-950 text-slate-200 border border-slate-700 rounded-xl shadow-md transition-colors"
          aria-label="往左"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <div className="bg-slate-900/50 rounded-lg flex items-center justify-center text-[10px] text-slate-500 font-bold">
          D-PAD
        </div>

        <button
          onPointerDown={() => onDirectionPress('right')}
          onPointerUp={() => onDirectionPress(null)}
          onPointerLeave={() => onDirectionPress(null)}
          className="flex items-center justify-center bg-slate-800/90 hover:bg-slate-700 active:bg-amber-500 active:text-slate-950 text-slate-200 border border-slate-700 rounded-xl shadow-md transition-colors"
          aria-label="往右"
        >
          <ArrowRight className="w-6 h-6" />
        </button>

        <div></div>
        <button
          onPointerDown={() => onDirectionPress('down')}
          onPointerUp={() => onDirectionPress(null)}
          onPointerLeave={() => onDirectionPress(null)}
          className="flex items-center justify-center bg-slate-800/90 hover:bg-slate-700 active:bg-amber-500 active:text-slate-950 text-slate-200 border border-slate-700 rounded-xl shadow-md transition-colors"
          aria-label="往下"
        >
          <ArrowDown className="w-6 h-6" />
        </button>
        <div></div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        {/* E Button (Wash / Chop) */}
        <button
          onPointerDown={onEDown}
          onPointerUp={onEUp}
          onPointerLeave={onEUp}
          className="flex flex-col items-center justify-center w-20 h-20 bg-sky-700 hover:bg-sky-600 active:bg-sky-500 active:scale-95 text-white border-2 border-sky-400 rounded-2xl shadow-lg transition-transform"
        >
          <Waves className="w-6 h-6 mb-1" />
          <span className="text-xs font-bold font-mono">E [洗/切]</span>
        </button>

        {/* Space Button (Grab / Drop / Assemble) */}
        <button
          onPointerDown={onSpaceDown}
          className="flex flex-col items-center justify-center w-24 h-24 bg-amber-500 hover:bg-amber-400 active:bg-amber-300 active:scale-95 text-slate-950 border-2 border-amber-300 rounded-2xl shadow-xl transition-transform"
        >
          <Hand className="w-7 h-7 mb-1" />
          <span className="text-xs font-black font-mono">SPACE 拿/放</span>
        </button>
      </div>
    </div>
  );
};
