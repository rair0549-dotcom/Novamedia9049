/**
 * Nova Media - Video Browser Screen
 * Supports List and Grid modes, folder drill-down, real-time sorting, and media actions
 */

import React, { useState } from 'react';
import {
  Folder,
  SlidersHorizontal,
  List,
  LayoutGrid,
  Play,
  Clock,
  MoreVertical,
  Heart,
  FolderPlus,
  Info,
  Tv,
  ArrowLeft,
  Search,
} from 'lucide-react';
import { LayoutMode, MediaItem, SortConfig, ViewMode } from '../../types/media';
import { formatFileSize, formatTime } from '../../services/storage';

interface VideosScreenProps {
  mediaItems: MediaItem[];
  currentFolder: string | null;
  onSelectFolder: (folder: string | null) => void;
  onPlayMedia: (item: MediaItem) => void;
  layoutMode: LayoutMode;
  onToggleLayoutMode: () => void;
  sortConfig: SortConfig;
  onOpenSortModal: () => void;
  onToggleFavorite: (id: string) => void;
  onOpenInfo: (item: MediaItem) => void;
  onAddToPlaylist: (item: MediaItem) => void;
}

export const VideosScreen: React.FC<VideosScreenProps> = ({
  mediaItems,
  currentFolder,
  onSelectFolder,
  onPlayMedia,
  layoutMode,
  onToggleLayoutMode,
  sortConfig,
  onOpenSortModal,
  onToggleFavorite,
  onOpenInfo,
  onAddToPlaylist,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Filter video type only
  let videos = mediaItems.filter(i => i.type === 'video');

  // Filter by folder if selected
  if (currentFolder) {
    videos = videos.filter(i => i.folderName === currentFolder);
  }

  // Filter by search
  if (searchQuery.trim()) {
    videos = videos.filter(i =>
      i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.folderName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Sort
  videos.sort((a, b) => {
    let comparison = 0;
    switch (sortConfig.field) {
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'date':
        comparison = a.dateAdded - b.dateAdded;
        break;
      case 'length':
        comparison = a.duration - b.duration;
        break;
      case 'size':
        comparison = a.fileSize - b.fileSize;
        break;
      case 'played_time':
        comparison = (a.lastPlayedTime || 0) - (b.lastPlayedTime || 0);
        break;
      case 'resolution':
        comparison = (a.resolution || '').localeCompare(b.resolution || '');
        break;
      case 'frame_rate':
        comparison = (a.frameRate || 0) - (b.frameRate || 0);
        break;
      default:
        comparison = a.dateAdded - b.dateAdded;
    }
    return sortConfig.order === 'desc' ? -comparison : comparison;
  });

  // Extract distinct folders
  const allFolders = Array.from(new Set(mediaItems.filter(i => i.type === 'video').map(i => i.folderName)));

  return (
    <div className="flex-1 flex flex-col bg-[#090B10] text-[#F4F7FC] overflow-y-auto select-none pb-24">
      {/* Top Header */}
      <div className="sticky top-0 z-30 bg-[#090B10]/95 backdrop-blur-md px-4 sm:px-6 py-3 border-b border-[#1E2532] flex items-center justify-between">
        <div className="flex items-center gap-3">
          {currentFolder && (
            <button
              onClick={() => onSelectFolder(null)}
              className="p-1 rounded-lg text-[#A5AFBE] hover:text-[#F4F7FC] hover:bg-[#191F2A]"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h1 className="text-base font-bold text-[#F4F7FC]">
              {currentFolder ? currentFolder : 'All Videos'}
            </h1>
            <span className="text-xs text-[#A5AFBE]">{videos.length} videos</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle List / Grid */}
          <button
            onClick={onToggleLayoutMode}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#11151D] border border-[#2B3442] text-[#A5AFBE] hover:text-[#F4F7FC] transition-colors"
            title={`Switch to ${layoutMode === 'list' ? 'Grid' : 'List'} view`}
          >
            {layoutMode === 'list' ? <LayoutGrid className="w-4 h-4" /> : <List className="w-4 h-4" />}
          </button>

          {/* Sort button */}
          <button
            onClick={onOpenSortModal}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#11151D] border border-[#2B3442] text-[#A5AFBE] hover:text-[#F4F7FC] transition-colors"
            title="Sort videos"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Folder Chips Horizontal Scroll */}
      {!currentFolder && (
        <div className="px-4 sm:px-6 py-2.5 flex items-center gap-2 overflow-x-auto border-b border-[#1E2532]/60 scrollbar-none">
          <button
            onClick={() => onSelectFolder(null)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#62B5FF]/20 text-[#62B5FF] border border-[#62B5FF]/40 shrink-0"
          >
            All Folders
          </button>
          {allFolders.map(fName => (
            <button
              key={fName}
              onClick={() => onSelectFolder(fName)}
              className="px-3 py-1.5 rounded-xl text-xs font-medium bg-[#11151D] text-[#A5AFBE] border border-[#2B3442] hover:text-[#F4F7FC] hover:border-[#62B5FF]/40 shrink-0 transition-colors flex items-center gap-1.5"
            >
              <Folder className="w-3.5 h-3.5 text-[#FFCA78]" />
              <span>{fName}</span>
            </button>
          ))}
        </div>
      )}

      {/* Main List / Grid View */}
      <div className="p-4 sm:p-6">
        {videos.length === 0 ? (
          <div className="p-12 text-center bg-[#11151D] rounded-2xl border border-[#2B3442]">
            <Tv className="w-10 h-10 text-[#A5AFBE] mx-auto mb-3 opacity-40" />
            <h3 className="text-base font-semibold text-[#F4F7FC]">No videos found</h3>
            <p className="text-xs text-[#A5AFBE] mt-1">Try another search or folder selection.</p>
          </div>
        ) : layoutMode === 'list' ? (
          /* LIST MODE */
          <div className="space-y-2.5">
            {videos.map(item => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 bg-[#11151D] hover:bg-[#191F2A] border border-[#2B3442] rounded-2xl transition-all group relative"
              >
                {/* Clickable body */}
                <div
                  onClick={() => onPlayMedia(item)}
                  className="flex items-center gap-3.5 flex-1 min-w-0 cursor-pointer"
                >
                  <div className="relative w-24 h-15 rounded-xl overflow-hidden bg-[#191F2A] shrink-0 border border-[#2B3442]">
                    <img
                      src={item.thumbnailUrl}
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <span className="absolute bottom-1 right-1 px-1 py-0.2 bg-black/80 rounded text-[9px] font-mono text-white">
                      {formatTime(item.duration)}
                    </span>
                    {item.playbackPosition && item.playbackPosition > 0 && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black/50">
                        <div
                          className="h-full bg-[#62B5FF]"
                          style={{ width: `${Math.min(100, (item.playbackPosition / item.duration) * 100)}%` }}
                        />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <span className="text-sm font-semibold text-[#F4F7FC] truncate block group-hover:text-[#62B5FF] transition-colors">
                      {item.title}
                    </span>
                    <div className="flex items-center gap-2 text-xs text-[#A5AFBE] mt-0.5">
                      <span>{item.folderName}</span>
                      <span>·</span>
                      <span>{item.resolution || 'HD'}</span>
                      <span>·</span>
                      <span>{formatFileSize(item.fileSize)}</span>
                    </div>
                  </div>
                </div>

                {/* Right Action Menu */}
                <div className="flex items-center gap-1 shrink-0 ml-2">
                  <button
                    onClick={() => onToggleFavorite(item.id)}
                    className="p-2 text-[#A5AFBE] hover:text-[#FF7379] transition-colors"
                    title="Toggle Favorite"
                  >
                    <Heart className={`w-4 h-4 ${item.isFavorite ? 'fill-[#FF7379] text-[#FF7379]' : ''}`} />
                  </button>

                  <button
                    onClick={() => setActiveMenuId(activeMenuId === item.id ? null : item.id)}
                    className="p-2 text-[#A5AFBE] hover:text-[#F4F7FC] transition-colors"
                    title="More actions"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>

                {/* Overflow Popup Menu */}
                {activeMenuId === item.id && (
                  <div className="absolute right-4 top-12 z-40 w-44 bg-[#191F2A] border border-[#2B3442] rounded-xl shadow-2xl py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                    <button
                      onClick={() => {
                        onPlayMedia(item);
                        setActiveMenuId(null);
                      }}
                      className="w-full px-3.5 py-2 text-left hover:bg-[#222B3A] flex items-center gap-2 text-[#F4F7FC]"
                    >
                      <Play className="w-3.5 h-3.5 text-[#62B5FF]" />
                      <span>Play Video</span>
                    </button>
                    <button
                      onClick={() => {
                        onAddToPlaylist(item);
                        setActiveMenuId(null);
                      }}
                      className="w-full px-3.5 py-2 text-left hover:bg-[#222B3A] flex items-center gap-2 text-[#F4F7FC]"
                    >
                      <FolderPlus className="w-3.5 h-3.5 text-[#A78BFA]" />
                      <span>Add to Playlist</span>
                    </button>
                    <button
                      onClick={() => {
                        onOpenInfo(item);
                        setActiveMenuId(null);
                      }}
                      className="w-full px-3.5 py-2 text-left hover:bg-[#222B3A] flex items-center gap-2 text-[#F4F7FC]"
                    >
                      <Info className="w-3.5 h-3.5 text-[#5DD6A0]" />
                      <span>Information</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          /* GRID MODE */
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {videos.map(item => (
              <div
                key={item.id}
                onClick={() => onPlayMedia(item)}
                className="bg-[#11151D] hover:bg-[#191F2A] border border-[#2B3442] hover:border-[#62B5FF]/50 rounded-2xl overflow-hidden cursor-pointer group transition-all shadow-md flex flex-col"
              >
                <div className="relative aspect-video bg-[#191F2A] overflow-hidden">
                  <img
                    src={item.thumbnailUrl}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-mono text-white">
                    {formatTime(item.duration)}
                  </span>
                  {item.resolution && (
                    <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-[#62B5FF]/90 text-[9px] font-bold text-[#090B10]">
                      {item.resolution}
                    </span>
                  )}
                  {item.isFavorite && (
                    <span className="absolute top-2 right-2 p-1 rounded-full bg-black/70 text-[#FF7379]">
                      <Heart className="w-3 h-3 fill-current" />
                    </span>
                  )}
                </div>

                <div className="p-3 flex-1 flex flex-col justify-between">
                  <span className="text-xs font-semibold text-[#F4F7FC] truncate block group-hover:text-[#62B5FF] transition-colors">
                    {item.title}
                  </span>
                  <div className="flex items-center justify-between text-[11px] text-[#A5AFBE] mt-1.5">
                    <span>{item.folderName}</span>
                    <span className="font-mono">{formatFileSize(item.fileSize)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
