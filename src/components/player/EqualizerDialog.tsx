/**
 * Nova Media - 5-Band Audio Equalizer Dialog
 * Real Web Audio API filtering with presets, band sliders, and bass boost
 */

import React from 'react';
import { X, RotateCcw, Volume2, Sliders } from 'lucide-react';
import { EqualizerSettings } from '../../types/media';
import { EQ_BANDS, EQ_PRESETS, audioEngine } from '../../services/audioEngine';

interface EqualizerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  settings: EqualizerSettings;
  onUpdateSettings: (newSettings: EqualizerSettings) => void;
}

export const EqualizerDialog: React.FC<EqualizerDialogProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  const handleToggle = () => {
    const updated = { ...settings, enabled: !settings.enabled };
    onUpdateSettings(updated);
    audioEngine.applyBands(updated.bands, updated.enabled);
    audioEngine.applyBassBoost(updated.bassBoost, updated.enabled);
  };

  const handleSelectPreset = (presetName: string) => {
    const presetGains = EQ_PRESETS[presetName] || [0, 0, 0, 0, 0];
    const updated = {
      ...settings,
      preset: presetName,
      bands: [...presetGains],
    };
    onUpdateSettings(updated);
    audioEngine.applyBands(updated.bands, updated.enabled);
  };

  const handleBandChange = (index: number, val: number) => {
    const newBands = [...settings.bands];
    newBands[index] = val;
    const updated = {
      ...settings,
      preset: 'Custom',
      bands: newBands,
    };
    onUpdateSettings(updated);
    audioEngine.applyBands(newBands, settings.enabled);
  };

  const handleBassBoostChange = (val: number) => {
    const updated = { ...settings, bassBoost: val };
    onUpdateSettings(updated);
    audioEngine.applyBassBoost(val, settings.enabled);
  };

  const handleReset = () => {
    const resetSettings: EqualizerSettings = {
      enabled: true,
      preset: 'Flat',
      bands: [0, 0, 0, 0, 0],
      bassBoost: 0,
      virtualizer: 0,
    };
    onUpdateSettings(resetSettings);
    audioEngine.applyBands(resetSettings.bands, true);
    audioEngine.applyBassBoost(0, true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-md bg-[#191F2A] border border-[#2B3442] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2B3442] bg-[#11151D]">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-[#62B5FF]" />
            <h3 className="text-base font-semibold text-[#F4F7FC]">Audio Equalizer</h3>
          </div>
          <div className="flex items-center gap-2">
            {/* Enable/Disable Toggle */}
            <button
              onClick={handleToggle}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                settings.enabled ? 'bg-[#62B5FF]' : 'bg-[#2B3442]'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-[#090B10] transition-transform ${
                  settings.enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-[#A5AFBE] hover:text-[#F4F7FC] hover:bg-[#2B3442] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-6 overflow-y-auto max-h-[75vh]">
          {/* Preset Pills */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-[#A5AFBE]">PRESETS</span>
              <button
                onClick={handleReset}
                className="flex items-center gap-1 text-xs text-[#62B5FF] hover:underline"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.keys(EQ_PRESETS).map(name => {
                const isActive = settings.preset === name;
                return (
                  <button
                    key={name}
                    onClick={() => handleSelectPreset(name)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                      isActive
                        ? 'border-[#62B5FF] bg-[#62B5FF]/15 text-[#62B5FF]'
                        : 'border-[#2B3442] bg-[#11151D] text-[#A5AFBE] hover:text-[#F4F7FC]'
                    }`}
                  >
                    {name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5-Band Frequencies Sliders */}
          <div className="bg-[#11151D] border border-[#2B3442] rounded-xl p-4">
            <div className="flex items-center justify-between text-[11px] text-[#A5AFBE] mb-2 font-mono">
              <span>+12 dB</span>
              <span>0 dB</span>
              <span>-12 dB</span>
            </div>

            <div className="grid grid-cols-5 gap-3 h-44 pt-2 pb-6">
              {EQ_BANDS.map((band, idx) => {
                const gain = settings.bands[idx] ?? 0;
                return (
                  <div key={band.frequency} className="flex flex-col items-center justify-between h-full">
                    <span className="text-[10px] font-mono text-[#62B5FF] font-medium">
                      {gain > 0 ? `+${gain}` : gain}dB
                    </span>
                    <input
                      type="range"
                      min="-12"
                      max="12"
                      step="1"
                      disabled={!settings.enabled}
                      value={gain}
                      onChange={e => handleBandChange(idx, Number(e.target.value))}
                      className="w-24 -rotate-90 origin-center cursor-pointer accent-[#62B5FF] disabled:opacity-40"
                    />
                    <span className="text-[11px] font-medium text-[#A5AFBE] truncate">{band.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bass Boost Slider */}
          <div className="bg-[#11151D] border border-[#2B3442] rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-[#A78BFA]" />
                <span className="text-xs font-semibold text-[#F4F7FC]">Bass Boost</span>
              </div>
              <span className="text-xs font-mono text-[#A78BFA] font-medium">{settings.bassBoost}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              disabled={!settings.enabled}
              value={settings.bassBoost}
              onChange={e => handleBassBoostChange(Number(e.target.value))}
              className="w-full accent-[#A78BFA] cursor-pointer disabled:opacity-40"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#2B3442] bg-[#11151D] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold text-[#090B10] bg-[#62B5FF] rounded-xl hover:bg-[#83c6ff] transition-all"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
