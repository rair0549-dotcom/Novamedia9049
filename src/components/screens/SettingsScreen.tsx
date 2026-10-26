/**
 * Nova Media - Settings Screen
 * Preferences for display, gesture controls, playback engine, and media library permissions
 */

import React, { useState } from 'react';
import {
  Settings,
  Tv,
  Moon,
  Clock,
  Gauge,
  Sliders,
  ShieldCheck,
  RotateCcw,
  RefreshCw,
  FolderSync,
  HelpCircle,
  Smartphone,
  Eye,
  Check,
} from 'lucide-react';
import { PlayerPreferences } from '../../types/media';

interface SettingsScreenProps {
  preferences: PlayerPreferences;
  onUpdatePreferences: (prefs: Partial<PlayerPreferences>) => void;
  onResetPreferences: () => void;
  onOpenEqualizer: () => void;
  onRescanMedia: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  preferences,
  onUpdatePreferences,
  onResetPreferences,
  onOpenEqualizer,
  onRescanMedia,
}) => {
  const [rescanStatus, setRescanStatus] = useState<string | null>(null);

  const handleRescan = () => {
    setRescanStatus('Scanning device storage...');
    setTimeout(() => {
      onRescanMedia();
      setRescanStatus('Index up to date (8 videos, 3 audio tracks)');
      setTimeout(() => setRescanStatus(null), 3000);
    }, 800);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#090B10] text-[#F4F7FC] overflow-y-auto select-none pb-24">
      {/* Top Header */}
      <div className="sticky top-0 z-30 bg-[#090B10]/95 backdrop-blur-md px-4 sm:px-6 py-3 border-b border-[#1E2532] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#62B5FF]/20 text-[#62B5FF] flex items-center justify-center">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-[#F4F7FC]">Settings</h1>
            <span className="text-xs text-[#A5AFBE]">Preferences & Playback</span>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-6">
        {/* SECTION 1: DISPLAY & THEME */}
        <div className="bg-[#11151D] border border-[#2B3442] rounded-2xl p-4 sm:p-5 space-y-4">
          <h2 className="text-xs font-semibold tracking-wider text-[#A5AFBE] uppercase flex items-center gap-2">
            <Eye className="w-4 h-4 text-[#62B5FF]" />
            <span>Display & Appearance</span>
          </h2>

          {/* Theme selector */}
          <div className="space-y-2">
            <span className="text-sm font-semibold text-[#F4F7FC] block">Theme</span>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { id: 'dark', label: 'Nova Dark' },
                { id: 'pure_black', label: 'AMOLED Black' },
                { id: 'system', label: 'System Match' },
              ].map(theme => (
                <button
                  key={theme.id}
                  onClick={() => onUpdatePreferences({ theme: theme.id as 'dark' | 'pure_black' | 'system' })}
                  className={`py-2 px-3 text-xs font-medium rounded-xl border text-center transition-all ${
                    preferences.theme === theme.id
                      ? 'border-[#62B5FF] bg-[#62B5FF]/15 text-[#62B5FF]'
                      : 'border-[#2B3442] bg-[#191F2A] text-[#A5AFBE] hover:text-[#F4F7FC]'
                  }`}
                >
                  {theme.label}
                </button>
              ))}
            </div>
          </div>

          {/* Controls timeout */}
          <div className="space-y-2 pt-2 border-t border-[#2B3442]">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-[#F4F7FC]">Controls Auto-Hide Timeout</span>
              <span className="text-xs font-mono text-[#62B5FF]">
                {preferences.controlTimeoutSec === 0 ? 'Never' : `${preferences.controlTimeoutSec}s`}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[3, 5, 8, 0].map(sec => (
                <button
                  key={sec}
                  onClick={() => onUpdatePreferences({ controlTimeoutSec: sec })}
                  className={`py-1.5 px-2 text-xs font-medium rounded-xl border text-center transition-all ${
                    preferences.controlTimeoutSec === sec
                      ? 'border-[#62B5FF] bg-[#62B5FF]/15 text-[#62B5FF]'
                      : 'border-[#2B3442] bg-[#191F2A] text-[#A5AFBE] hover:text-[#F4F7FC]'
                  }`}
                >
                  {sec === 0 ? 'Never' : `${sec}s`}
                </button>
              ))}
            </div>
          </div>

          {/* Default Aspect Ratio */}
          <div className="space-y-2 pt-2 border-t border-[#2B3442]">
            <span className="text-sm font-semibold text-[#F4F7FC] block">Default Aspect Ratio</span>
            <div className="grid grid-cols-4 gap-2">
              {['fit', 'fill', 'zoom', 'stretch'].map(aspect => (
                <button
                  key={aspect}
                  onClick={() => onUpdatePreferences({ aspectRatio: aspect as 'fit' | 'fill' | 'zoom' | 'stretch' })}
                  className={`py-1.5 px-2 text-xs font-medium rounded-xl border capitalize text-center transition-all ${
                    preferences.aspectRatio === aspect
                      ? 'border-[#62B5FF] bg-[#62B5FF]/15 text-[#62B5FF]'
                      : 'border-[#2B3442] bg-[#191F2A] text-[#A5AFBE] hover:text-[#F4F7FC]'
                  }`}
                >
                  {aspect}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* SECTION 2: PLAYBACK & ENGINE */}
        <div className="bg-[#11151D] border border-[#2B3442] rounded-2xl p-4 sm:p-5 space-y-4">
          <h2 className="text-xs font-semibold tracking-wider text-[#A5AFBE] uppercase flex items-center gap-2">
            <Gauge className="w-4 h-4 text-[#A78BFA]" />
            <span>Playback Engine</span>
          </h2>

          {/* HW Decoder Mode */}
          <div className="flex items-center justify-between py-1">
            <div>
              <span className="text-sm font-semibold text-[#F4F7FC] block">Hardware Acceleration (HW Decoder)</span>
              <span className="text-xs text-[#A5AFBE]">Uses device GPU MediaCodec for smooth high-fps playback</span>
            </div>
            <button
              onClick={() => onUpdatePreferences({ decoder: preferences.decoder === 'HW' ? 'SW' : 'HW' })}
              className={`px-3 py-1 text-xs font-mono font-bold rounded-lg transition-colors ${
                preferences.decoder === 'HW' ? 'bg-[#62B5FF]/20 text-[#62B5FF] border border-[#62B5FF]/40' : 'bg-[#2B3442] text-[#A5AFBE]'
              }`}
            >
              {preferences.decoder}
            </button>
          </div>

          {/* Background Audio */}
          <div className="flex items-center justify-between py-1 border-t border-[#2B3442]">
            <div>
              <span className="text-sm font-semibold text-[#F4F7FC] block">Background Audio Playback</span>
              <span className="text-xs text-[#A5AFBE]">Continue sound playback when screen locks or app minimizes</span>
            </div>
            <button
              onClick={() => onUpdatePreferences({ audioOnlyBackground: !preferences.audioOnlyBackground })}
              className={`w-11 h-6 rounded-full transition-colors flex items-center px-1 ${
                preferences.audioOnlyBackground ? 'bg-[#62B5FF]' : 'bg-[#2B3442]'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-[#090B10] transition-transform ${
                  preferences.audioOnlyBackground ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Equalizer launch button */}
          <div className="flex items-center justify-between py-1 border-t border-[#2B3442]">
            <div>
              <span className="text-sm font-semibold text-[#F4F7FC] block">Audio Equalizer & Effects</span>
              <span className="text-xs text-[#A5AFBE]">5-Band Parametric Filter, Bass Boost, and Presets</span>
            </div>
            <button
              onClick={onOpenEqualizer}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-[#191F2A] border border-[#2B3442] text-[#62B5FF] hover:border-[#62B5FF]"
            >
              Open EQ
            </button>
          </div>
        </div>

        {/* SECTION 3: GESTURES */}
        <div className="bg-[#11151D] border border-[#2B3442] rounded-2xl p-4 sm:p-5 space-y-4">
          <h2 className="text-xs font-semibold tracking-wider text-[#A5AFBE] uppercase flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-[#5DD6A0]" />
            <span>Gestures & Interaction</span>
          </h2>

          {/* Double-tap Seek */}
          <div className="flex items-center justify-between py-1">
            <div>
              <span className="text-sm font-semibold text-[#F4F7FC] block">Double-Tap to Seek (10s)</span>
              <span className="text-xs text-[#A5AFBE]">Tap left to rewind, right to jump forward</span>
            </div>
            <button
              onClick={() => onUpdatePreferences({ gestureSeekingEnabled: !preferences.gestureSeekingEnabled })}
              className={`w-11 h-6 rounded-full transition-colors flex items-center px-1 ${
                preferences.gestureSeekingEnabled ? 'bg-[#5DD6A0]' : 'bg-[#2B3442]'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-[#090B10] transition-transform ${
                  preferences.gestureSeekingEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Long Press Speed Boost */}
          <div className="flex items-center justify-between py-1 border-t border-[#2B3442]">
            <div>
              <span className="text-sm font-semibold text-[#F4F7FC] block">Long-Press 2× Speed Boost</span>
              <span className="text-xs text-[#A5AFBE]">Hold down video surface to temporarily speed up</span>
            </div>
            <button
              onClick={() => onUpdatePreferences({ gestureSpeedBoostEnabled: !preferences.gestureSpeedBoostEnabled })}
              className={`w-11 h-6 rounded-full transition-colors flex items-center px-1 ${
                preferences.gestureSpeedBoostEnabled ? 'bg-[#5DD6A0]' : 'bg-[#2B3442]'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-[#090B10] transition-transform ${
                  preferences.gestureSpeedBoostEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* SECTION 4: MEDIA PERMISSIONS & DISCOVERY */}
        <div className="bg-[#11151D] border border-[#2B3442] rounded-2xl p-4 sm:p-5 space-y-4">
          <h2 className="text-xs font-semibold tracking-wider text-[#A5AFBE] uppercase flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#FFCA78]" />
            <span>Media Library & Permissions</span>
          </h2>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-[#191F2A] border border-[#2B3442]">
            <Check className="w-5 h-5 text-[#5DD6A0] shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-semibold text-[#F4F7FC] block">Android MediaStore Index Active</span>
              <span className="text-[#A5AFBE] block mt-0.5">
                Target SDK 34 permissions granted for READ_MEDIA_VIDEO and READ_MEDIA_AUDIO.
              </span>
            </div>
          </div>

          {rescanStatus && (
            <div className="p-3 bg-[#62B5FF]/10 border border-[#62B5FF]/30 rounded-xl text-xs text-[#62B5FF] font-semibold text-center animate-in fade-in">
              {rescanStatus}
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handleRescan}
              className="px-4 py-2 text-xs font-semibold bg-[#191F2A] hover:bg-[#222B3A] border border-[#2B3442] text-[#F4F7FC] rounded-xl flex items-center gap-2 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#62B5FF]" />
              <span>Rescan Local Storage</span>
            </button>

            <button
              onClick={onResetPreferences}
              className="px-4 py-2 text-xs font-semibold text-[#A5AFBE] hover:text-[#FF7379] flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>
          </div>
        </div>

        {/* SECTION 5: ABOUT */}
        <div className="p-4 text-center space-y-1 text-xs text-[#A5AFBE]">
          <span className="font-bold text-[#F4F7FC]">Nova Media</span>
          <span className="block">Version 1.0.0 (Build 2026.10)</span>
          <span className="block text-[11px]">Nova Dark Design System · Kotlin & Media3 Architecture</span>
        </div>
      </div>
    </div>
  );
};
