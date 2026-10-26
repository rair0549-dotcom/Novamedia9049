/**
 * Nova Media - Docked Mini Player
 * Appears above bottom navigation when playback is active, offering seamless multi-tasking
 */

import React from 'react';
import { Play, Pause, SkipForward, X, Maximize2 } from 'lucide-react';
import { MediaItem } from '../../types/media';

interface MiniPlayerProps {
  media: MediaItem;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onTogglePlay: () => void;
  onNext: () => void;
  onExpand: () => void;
  onClose: () => void;
}

export const MiniPlayer: React.FC<MiniPlayerProps> = ({
  media,
  isPlaying,
  currentTime,
  duration,
  onTogglePlay,
  onNext,
  onExpand,
  onClose,
}) => {
  const progressPercent = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <div className="w-full bg-[#191F2A] border-t border-[#2B3442] shadow-2xl relative select-none shrink-0 z-30 transition-all">
      {/* Top progress line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-[#11151D]">
        <div
          className="h-full bg-[#62B5FF] transition-all duration-200"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="flex items-center justify-between px-3.5 py-2.5">
        {/* Thumbnail & Title (Tappable to expand) */}
        <div
          onClick={onExpand}
          className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer group"
        >
          <div className="relative w-12 h-10 rounded-lg overflow-hidden bg-[#11151D] shrink-0 border border-[#2B3442]">
            <img
              src={media.thumbnailUrl}
              alt={media.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
            {isPlaying && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-0.5">
                <span className="w-0.5 h-3 bg-[#62B5FF] animate-pulse"></span>
                <span className="w-0.5 h-4 bg-[#62B5FF] animate-pulse delay-75"></span>
                <span className="w-0.5 h-2 bg-[#62B5FF] animate-pulse delay-150"></span>
              </div>
            )}
          </div>

          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold text-[#F4F7FC] truncate group-hover:text-[#62B5FF] transition-colors">
              {media.title}
            </span>
            <span className="text-[11px] text-[#A5AFBE] truncate flex items-center gap-1.5">
              <span>{media.folderName}</span>
              <span>·</span>
              <span>{media.resolution || media.mimeType.split('/')[1]?.toUpperCase()}</span>
            </span>
          </div>
        </div>

        {/* Player Controls */}
        <div className="flex items-center gap-1 shrink-0 ml-2">
          {/* Play / Pause */}
          <button
            onClick={onTogglePlay}
            className="w-10 h-10 flex items-center justify-center rounded-full text-[#F4F7FC] hover:bg-[#2B3442] active:scale-95 transition-all focus:outline-none"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
          </button>

          {/* Next */}
          <button
            onClick={onNext}
            className="w-9 h-9 flex items-center justify-center rounded-full text-[#A5AFBE] hover:text-[#F4F7FC] hover:bg-[#2B3442] active:scale-95 transition-all focus:outline-none"
            aria-label="Next track"
          >
            <SkipForward className="w-4 h-4 fill-current" />
          </button>

          {/* Expand */}
          <button
            onClick={onExpand}
            className="w-9 h-9 flex items-center justify-center rounded-full text-[#A5AFBE] hover:text-[#F4F7FC] hover:bg-[#2B3442] active:scale-95 transition-all focus:outline-none"
            aria-label="Open Full Player"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full text-[#A5AFBE] hover:text-[#FF7379] hover:bg-[#2B3442] active:scale-95 transition-all focus:outline-none"
            aria-label="Close player"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
