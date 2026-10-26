/**
 * Nova Media - Customize Player Shortcuts Modal
 * Enables/disables quick action items in the top player toolbar
 */

import React from 'react';
import { X, CheckSquare, Square, RotateCcw } from 'lucide-react';
import { ALL_QUICK_SHORTCUTS } from '../../data/defaultMedia';

interface CustomizeShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  enabledShortcuts: string[];
  onToggleShortcut: (id: string) => void;
  onResetShortcuts: () => void;
}

export const CustomizeShortcutsModal: React.FC<CustomizeShortcutsModalProps> = ({
  isOpen,
  onClose,
  enabledShortcuts,
  onToggleShortcut,
  onResetShortcuts,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-md bg-[#191F2A] border border-[#2B3442] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2B3442] bg-[#11151D]">
          <h3 className="text-base font-semibold text-[#F4F7FC]">Customise Shortcuts</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#A5AFBE] hover:text-[#F4F7FC] hover:bg-[#2B3442] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of shortcuts with checkboxes */}
        <div className="p-5 space-y-1 overflow-y-auto">
          <div className="flex items-center justify-between mb-3 text-xs text-[#A5AFBE]">
            <span>SELECT ACTIONS DISPLAYED IN PLAYER BAR</span>
            <button
              onClick={onResetShortcuts}
              className="text-[#62B5FF] hover:underline flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {ALL_QUICK_SHORTCUTS.map(sc => {
              const isChecked = enabledShortcuts.includes(sc.id);
              return (
                <button
                  key={sc.id}
                  onClick={() => onToggleShortcut(sc.id)}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all ${
                    isChecked
                      ? 'border-[#62B5FF]/50 bg-[#62B5FF]/10 text-[#F4F7FC]'
                      : 'border-[#2B3442] bg-[#11151D] text-[#A5AFBE] hover:text-[#F4F7FC]'
                  }`}
                >
                  {isChecked ? (
                    <CheckSquare className="w-4 h-4 text-[#62B5FF] shrink-0" />
                  ) : (
                    <Square className="w-4 h-4 text-[#A5AFBE] shrink-0" />
                  )}
                  <span className="text-xs font-medium truncate">{sc.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#2B3442] bg-[#11151D] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-[#090B10] bg-[#62B5FF] rounded-xl hover:bg-[#83c6ff] transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
