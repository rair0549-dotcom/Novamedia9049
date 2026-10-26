/**
 * Nova Media - Sleep Timer Dialog
 * Offers quick presets and custom duration to auto-pause playback
 */

import React, { useState } from 'react';
import { X, Timer, Check, AlertCircle } from 'lucide-react';
import { formatTime } from '../../services/storage';

interface SleepTimerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  activeSecondsRemaining: number | null;
  onSetTimerMinutes: (minutes: number) => void;
  onCancelTimer: () => void;
}

export const SleepTimerDialog: React.FC<SleepTimerDialogProps> = ({
  isOpen,
  onClose,
  activeSecondsRemaining,
  onSetTimerMinutes,
  onCancelTimer,
}) => {
  const [customMin, setCustomMin] = useState<string>('20');
  const presets = [5, 10, 15, 30, 45, 60];

  if (!isOpen) return null;

  const handleApplyCustom = () => {
    const mins = parseInt(customMin, 10);
    if (!isNaN(mins) && mins > 0) {
      onSetTimerMinutes(mins);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-sm bg-[#191F2A] border border-[#2B3442] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2B3442] bg-[#11151D]">
          <div className="flex items-center gap-2.5">
            <Timer className="w-5 h-5 text-[#62B5FF]" />
            <h3 className="text-base font-semibold text-[#F4F7FC]">Sleep Timer</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#A5AFBE] hover:text-[#F4F7FC] hover:bg-[#2B3442] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Active Timer Indicator */}
          {activeSecondsRemaining !== null && activeSecondsRemaining > 0 ? (
            <div className="p-3 rounded-xl bg-[#62B5FF]/10 border border-[#62B5FF]/30 flex items-center justify-between">
              <div>
                <span className="text-xs text-[#A5AFBE] block">Timer active:</span>
                <span className="text-lg font-bold font-mono text-[#62B5FF] tabular-nums">
                  {formatTime(activeSecondsRemaining)} remaining
                </span>
              </div>
              <button
                onClick={() => {
                  onCancelTimer();
                  onClose();
                }}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#FF7379]/20 text-[#FF7379] hover:bg-[#FF7379]/30 transition-colors"
              >
                Turn Off
              </button>
            </div>
          ) : (
            <p className="text-xs text-[#A5AFBE]">
              Playback will automatically pause once the timer finishes.
            </p>
          )}

          {/* Quick presets */}
          <div>
            <span className="text-xs font-semibold text-[#A5AFBE] block mb-2.5">PRESETS</span>
            <div className="grid grid-cols-3 gap-2.5">
              {presets.map(mins => (
                <button
                  key={mins}
                  onClick={() => {
                    onSetTimerMinutes(mins);
                    onClose();
                  }}
                  className="py-2.5 px-3 rounded-xl border border-[#2B3442] bg-[#11151D] text-xs font-semibold text-[#F4F7FC] hover:border-[#62B5FF] hover:bg-[#62B5FF]/15 hover:text-[#62B5FF] transition-all text-center"
                >
                  {mins} min
                </button>
              ))}
            </div>
          </div>

          {/* Custom Duration Input */}
          <div className="pt-2 border-t border-[#2B3442]">
            <span className="text-xs font-semibold text-[#A5AFBE] block mb-2">CUSTOM MINUTES</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="240"
                value={customMin}
                onChange={e => setCustomMin(e.target.value)}
                className="flex-1 px-3 py-2 text-sm bg-[#11151D] border border-[#2B3442] rounded-xl text-[#F4F7FC] focus:outline-none focus:border-[#62B5FF]"
                placeholder="Minutes"
              />
              <button
                onClick={handleApplyCustom}
                className="px-4 py-2 text-xs font-semibold text-[#090B10] bg-[#62B5FF] rounded-xl hover:bg-[#83c6ff] transition-all"
              >
                Set
              </button>
            </div>
          </div>
        </div>

        <div className="px-5 py-3 border-t border-[#2B3442] bg-[#11151D] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-[#A5AFBE] hover:text-[#F4F7FC]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
