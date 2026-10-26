/**
 * Nova Media - Android System Status Bar
 * Matches modern Android tablet & phone system status bar
 */

import React, { useEffect, useState } from 'react';
import { Wifi, Battery } from 'lucide-react';

interface AndroidStatusBarProps {
  isImmersive?: boolean;
}

export const AndroidStatusBar: React.FC<AndroidStatusBarProps> = ({ isImmersive = false }) => {
  const [timeStr, setTimeStr] = useState('09:04');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setTimeStr(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  if (isImmersive) {
    return null; // Immersive video hides status bar unless pulled down
  }

  return (
    <div className="w-full h-8 px-4 flex items-center justify-between text-xs text-[#A5AFBE] select-none bg-[#090B10]/95 z-50 shrink-0 font-medium">
      {/* Time */}
      <div className="flex items-center gap-1.5 tracking-tight font-semibold text-[#F4F7FC]">
        <span>{timeStr}</span>
      </div>

      {/* Pill Camera Notch */}
      <div className="flex items-center gap-1 opacity-70">
        <span className="w-1.5 h-1.5 rounded-full bg-[#2B3442]"></span>
        <span className="w-1.5 h-1.5 rounded-full bg-[#2B3442]"></span>
        <span className="w-1.5 h-1.5 rounded-full bg-[#2B3442]"></span>
      </div>

      {/* Connectivity & Battery */}
      <div className="flex items-center gap-2 tabular-nums text-[11px]">
        <span className="text-[10px] text-[#A5AFBE]">0.12 KB/s</span>
        <Wifi className="w-3.5 h-3.5 text-[#F4F7FC]" />
        <div className="flex items-center gap-0.5">
          <span className="text-[11px] font-semibold text-[#F4F7FC]">44%</span>
          <div className="relative flex items-center">
            <Battery className="w-4 h-4 text-[#5DD6A0]" />
          </div>
        </div>
      </div>
    </div>
  );
};
