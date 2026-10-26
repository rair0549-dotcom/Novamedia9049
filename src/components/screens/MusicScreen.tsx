/**
 * Nova Media - Music Screen
 * Audio track player and library with audio effects, visualizer, and playlist integration
 */

import React from 'react';
import { Headphones, Play, Pause, Sliders, Heart, FolderPlus, Clock, Disc3 } from 'lucide-react';
import { MediaItem } from '../../types/media';
import { formatTime, formatFileSize } from '../../services/storage';

interface MusicScreenProps {
  mediaItems: MediaItem[];
  currentPlayingMedia: MediaItem | null;
  isPlaying: boolean;
  onPlayMedia: (item: MediaItem) => void;
  onToggleFavorite: (id: string) => void;
  onOpenEqualizer: () => void;
  onAddToPlaylist: (item: MediaItem) => void;
}

export const MusicScreen: React.FC<MusicScreenProps> = ({
  mediaItems,
  currentPlayingMedia,
  isPlaying,
  onPlayMedia,
  onToggleFavorite,
  onOpenEqualizer,
  onAddToPlaylist,
}) => {
  const audioTracks = mediaItems.filter(i => i.type === 'audio');

  return (
    <div className="flex-1 flex flex-col bg-[#090B10] text-[#F4F7FC] overflow-y-auto select-none pb-24">
      {/* Top Header */}
      <div className="sticky top-0 z-30 bg-[#090B10]/95 backdrop-blur-md px-4 sm:px-6 py-3 border-b border-[#1E2532] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#62B5FF]/20 text-[#62B5FF] flex items-center justify-center">
            <Headphones className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-[#F4F7FC]">Music & Audio</h1>
            <span className="text-xs text-[#A5AFBE]">{audioTracks.length} tracks</span>
          </div>
        </div>

        <button
          onClick={onOpenEqualizer}
          className="px-3 py-1.5 rounded-xl bg-[#191F2A] border border-[#2B3442] hover:border-[#62B5FF] text-xs font-semibold text-[#62B5FF] flex items-center gap-1.5 transition-colors"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Equalizer</span>
        </button>
      </div>

      {/* Main Track List */}
      <div className="p-4 sm:p-6 space-y-3">
        {audioTracks.length === 0 ? (
          <div className="p-12 text-center bg-[#11151D] rounded-2xl border border-[#2B3442]">
            <Disc3 className="w-10 h-10 text-[#A5AFBE] mx-auto mb-3 opacity-40 animate-spin" />
            <h3 className="text-base font-semibold text-[#F4F7FC]">No audio tracks</h3>
            <p className="text-xs text-[#A5AFBE] mt-1">Import MP3 or audio files from the library.</p>
          </div>
        ) : (
          audioTracks.map((track, idx) => {
            const isCurrent = currentPlayingMedia?.id === track.id;
            return (
              <div
                key={track.id}
                className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                  isCurrent
                    ? 'border-[#62B5FF] bg-[#62B5FF]/10 shadow-lg shadow-[#62B5FF]/5'
                    : 'border-[#2B3442] bg-[#11151D] hover:bg-[#191F2A]'
                }`}
              >
                {/* Track info & play trigger */}
                <div
                  onClick={() => onPlayMedia(track)}
                  className="flex items-center gap-3.5 flex-1 min-w-0 cursor-pointer"
                >
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-[#191F2A] border border-[#2B3442] shrink-0">
                    <img
                      src={track.thumbnailUrl}
                      alt={track.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    {isCurrent && isPlaying ? (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-0.5">
                        <span className="w-0.5 h-4 bg-[#62B5FF] animate-pulse"></span>
                        <span className="w-0.5 h-6 bg-[#62B5FF] animate-pulse delay-75"></span>
                        <span className="w-0.5 h-3 bg-[#62B5FF] animate-pulse delay-150"></span>
                      </div>
                    ) : (
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <Play className="w-5 h-5 text-white fill-current" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-[#A5AFBE]">{String(idx + 1).padStart(2, '0')}</span>
                      <span className={`text-sm font-semibold truncate ${isCurrent ? 'text-[#62B5FF]' : 'text-[#F4F7FC]'}`}>
                        {track.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#A5AFBE] mt-0.5">
                      <span>{track.codec || 'Audio'}</span>
                      <span>·</span>
                      <span>{formatFileSize(track.fileSize)}</span>
                    </div>
                  </div>
                </div>

                {/* Right controls */}
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <span className="text-xs font-mono text-[#A5AFBE] tabular-nums">
                    {formatTime(track.duration)}
                  </span>

                  <button
                    onClick={() => onToggleFavorite(track.id)}
                    className="p-1.5 text-[#A5AFBE] hover:text-[#FF7379] transition-colors"
                    title="Toggle favorite"
                  >
                    <Heart className={`w-4 h-4 ${track.isFavorite ? 'fill-[#FF7379] text-[#FF7379]' : ''}`} />
                  </button>

                  <button
                    onClick={() => onAddToPlaylist(track)}
                    className="p-1.5 text-[#A5AFBE] hover:text-[#A78BFA] transition-colors"
                    title="Add to playlist"
                  >
                    <FolderPlus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
