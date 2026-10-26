/**
 * Nova Media - Android Navigation Bar & System Nav Bar
 * Features Material 3 navigation destinations and authentic Android system buttons/pill
 */

import React from 'react';
import { Folder, Film, Headphones, ListMusic, Settings, Square, Circle, ChevronLeft } from 'lucide-react';

export type NavTab = 'library' | 'videos' | 'music' | 'playlists' | 'settings';

interface AndroidNavBarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  systemNavStyle?: 'gesture' | 'three_button';
  onSystemBack?: () => void;
}

export const AndroidNavBar: React.FC<AndroidNavBarProps> = ({
  currentTab,
  onSelectTab,
  systemNavStyle = 'three_button',
  onSystemBack,
}) => {
  const tabs = [
    { id: 'library' as NavTab, label: 'Library', icon: Folder },
    { id: 'videos' as NavTab, label: 'Videos', icon: Film },
    { id: 'music' as NavTab, label: 'Music', icon: Headphones },
    { id: 'playlists' as NavTab, label: 'Playlists', icon: ListMusic },
    { id: 'settings' as NavTab, label: 'Settings', icon: Settings },
  ];

  return (
    <div className="w-full bg-[#11151D] border-t border-[#2B3442] shrink-0 select-none z-40">
      {/* App Destinations Bar */}
      <div className="grid grid-cols-5 items-center h-14 px-2">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className="flex flex-col items-center justify-center py-1 group transition-all duration-150 focus:outline-none"
            >
              <div
                className={`flex items-center justify-center w-12 h-7 rounded-full transition-colors ${
                  isActive ? 'bg-[#62B5FF]/20 text-[#62B5FF]' : 'text-[#A5AFBE] group-hover:text-[#F4F7FC]'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
              </div>
              <span
                className={`text-[11px] font-medium tracking-tight mt-0.5 whitespace-nowrap ${
                  isActive ? 'text-[#62B5FF] font-semibold' : 'text-[#A5AFBE]'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Android System Bar (Bottom gesture / 3-button nav) */}
      <div className="h-6 w-full flex items-center justify-around px-8 bg-[#090B10] border-t border-[#191F2A]">
        {systemNavStyle === 'three_button' ? (
          <div className="w-full max-w-xs flex items-center justify-between text-[#A5AFBE]">
            {/* Recents */}
            <button
              title="Recent apps"
              className="p-1 hover:text-[#F4F7FC] transition-colors focus:outline-none"
            >
              <div className="flex flex-col gap-0.5">
                <span className="w-3.5 h-0.5 bg-current rounded-full"></span>
                <span className="w-3.5 h-0.5 bg-current rounded-full"></span>
                <span className="w-3.5 h-0.5 bg-current rounded-full"></span>
              </div>
            </button>

            {/* Home */}
            <button
              onClick={() => onSelectTab('library')}
              title="Home"
              className="p-1 hover:text-[#F4F7FC] transition-colors focus:outline-none"
            >
              <div className="w-3.5 h-3.5 rounded-full border-[1.5px] border-current"></div>
            </button>

            {/* Back */}
            <button
              onClick={onSystemBack}
              title="Back"
              className="p-1 hover:text-[#F4F7FC] transition-colors focus:outline-none"
            >
              <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        ) : (
          <div className="w-28 h-1 rounded-full bg-[#A5AFBE]/60 hover:bg-[#F4F7FC] transition-colors cursor-pointer"></div>
        )}
      </div>
    </div>
  );
};
