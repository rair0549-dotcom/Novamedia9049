/**
 * Nova Media - Library Home Screen
 * Matches the reference home screen with quick-access category circles,
 * Continue Watching carousel, indexed folder browser, search, and FAB play button.
 */

import React, { useRef, useState } from 'react';
import {
  Search,
  SlidersHorizontal,
  Headphones,
  UploadCloud,
  Folder,
  ListMusic,
  Clock,
  Heart,
  Play,
  Film,
  MoreVertical,
  Plus,
  FolderOpen,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { MediaFolder, MediaItem } from '../../types/media';
import { NovaWordmark } from '../common/NovaWordmark';
import { formatFileSize, formatTime } from '../../services/storage';

interface LibraryScreenProps {
  mediaItems: MediaItem[];
  folders: MediaFolder[];
  onPlayMedia: (item: MediaItem) => void;
  onOpenFolder: (folderName: string) => void;
  onOpenMusic: () => void;
  onOpenPlaylists: () => void;
  onOpenFavorites: () => void;
  onOpenSortModal: () => void;
  onImportFiles: (files: FileList) => void;
  isTabletFrame: boolean;
  onToggleDeviceFrame: () => void;
}

export const LibraryScreen: React.FC<LibraryScreenProps> = ({
  mediaItems,
  folders,
  onPlayMedia,
  onOpenFolder,
  onOpenMusic,
  onOpenPlaylists,
  onOpenFavorites,
  onOpenSortModal,
  onImportFiles,
  isTabletFrame,
  onToggleDeviceFrame,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Recently played or partially watched items
  const continueWatchingItems = mediaItems
    .filter(i => i.type === 'video' && i.playbackPosition && i.playbackPosition > 0)
    .sort((a, b) => (b.lastPlayedTime || 0) - (a.lastPlayedTime || 0))
    .slice(0, 6);

  // Filtered media by search query
  const filteredItems = searchQuery.trim()
    ? mediaItems.filter(i =>
        i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.folderName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onImportFiles(e.target.files);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#090B10] text-[#F4F7FC] overflow-y-auto relative select-none">
      {/* Hidden file input for importing local files */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        multiple
        accept="video/*,audio/*"
        className="hidden"
      />

      {/* Top Header */}
      <div className="sticky top-0 z-30 bg-[#090B10]/95 backdrop-blur-md px-4 sm:px-6 py-3 border-b border-[#1E2532] flex items-center justify-between">
        {!isSearchActive ? (
          <>
            <NovaWordmark size="md" />

            <div className="flex items-center gap-1.5">
              {/* Device Frame Viewport Toggle */}
              <button
                onClick={onToggleDeviceFrame}
                className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-[#191F2A] border border-[#2B3442] text-[#A5AFBE] hover:text-[#62B5FF] hover:border-[#62B5FF] transition-all flex items-center gap-1"
                title="Switch layout mode"
              >
                <span>{isTabletFrame ? 'Tablet' : 'Phone'} Mode</span>
              </button>

              {/* Search Toggle */}
              <button
                onClick={() => setIsSearchActive(true)}
                className="w-9 h-9 flex items-center justify-center rounded-full text-[#A5AFBE] hover:text-[#F4F7FC] hover:bg-[#191F2A] transition-colors"
                title="Search media"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* View & Sort options */}
              <button
                onClick={onOpenSortModal}
                className="w-9 h-9 flex items-center justify-center rounded-full text-[#A5AFBE] hover:text-[#F4F7FC] hover:bg-[#191F2A] transition-colors"
                title="View & Sort options"
              >
                <SlidersHorizontal className="w-5 h-5" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2 w-full">
            <Search className="w-5 h-5 text-[#62B5FF]" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search videos, music, folders..."
              className="flex-1 bg-transparent border-none text-sm text-[#F4F7FC] placeholder-[#A5AFBE] focus:outline-none"
            />
            <button
              onClick={() => {
                setIsSearchActive(false);
                setSearchQuery('');
              }}
              className="text-xs text-[#62B5FF] font-semibold px-2 py-1"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="p-4 sm:p-6 space-y-6 pb-24">
        {/* Search Results if query exists */}
        {searchQuery.trim() ? (
          <div>
            <h2 className="text-sm font-semibold text-[#A5AFBE] mb-3">
              SEARCH RESULTS ({filteredItems.length})
            </h2>
            {filteredItems.length === 0 ? (
              <div className="p-8 text-center bg-[#11151D] rounded-2xl border border-[#2B3442]">
                <Film className="w-8 h-8 text-[#A5AFBE] mx-auto mb-2 opacity-50" />
                <p className="text-sm text-[#A5AFBE]">No media found matching &quot;{searchQuery}&quot;</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredItems.map(item => (
                  <div
                    key={item.id}
                    onClick={() => onPlayMedia(item)}
                    className="flex items-center justify-between p-3 bg-[#11151D] hover:bg-[#191F2A] border border-[#2B3442] rounded-xl cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={item.thumbnailUrl}
                        alt={item.title}
                        referrerPolicy="no-referrer"
                        className="w-16 h-10 rounded-lg object-cover border border-[#2B3442]"
                      />
                      <div className="min-w-0">
                        <span className="text-sm font-semibold text-[#F4F7FC] group-hover:text-[#62B5FF] truncate block">
                          {item.title}
                        </span>
                        <span className="text-xs text-[#A5AFBE] flex items-center gap-2">
                          <span>{item.folderName}</span>
                          <span>·</span>
                          <span>{formatTime(item.duration)}</span>
                          <span>·</span>
                          <span>{item.resolution || 'Audio'}</span>
                        </span>
                      </div>
                    </div>
                    <Play className="w-4 h-4 text-[#62B5FF] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Quick Access Categories Row (Faithfully inspired by Screenshot 1 top row) */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {/* Music */}
              <button
                onClick={onOpenMusic}
                className="flex flex-col items-center justify-center p-3 bg-[#11151D] hover:bg-[#191F2A] border border-[#2B3442] rounded-2xl transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#62B5FF]/20 to-[#A78BFA]/20 border border-[#62B5FF]/40 flex items-center justify-center text-[#62B5FF] group-hover:scale-110 transition-transform">
                  <Headphones className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold text-[#F4F7FC] mt-2">Music</span>
                <span className="text-[10px] text-[#A5AFBE]">
                  {mediaItems.filter(i => i.type === 'audio').length} tracks
                </span>
              </button>

              {/* File Import / Local Scanner */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center p-3 bg-[#11151D] hover:bg-[#191F2A] border border-[#2B3442] rounded-2xl transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#5DD6A0]/20 to-[#62B5FF]/20 border border-[#5DD6A0]/40 flex items-center justify-center text-[#5DD6A0] group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold text-[#F4F7FC] mt-2">Add Media</span>
                <span className="text-[10px] text-[#A5AFBE]">Pick Files</span>
              </button>

              {/* Folders */}
              <button
                onClick={() => onOpenFolder(folders[0]?.name || 'Dynamic')}
                className="flex flex-col items-center justify-center p-3 bg-[#11151D] hover:bg-[#191F2A] border border-[#2B3442] rounded-2xl transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#FFCA78]/20 to-[#FF7379]/20 border border-[#FFCA78]/40 flex items-center justify-center text-[#FFCA78] group-hover:scale-110 transition-transform">
                  <Folder className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold text-[#F4F7FC] mt-2">Folders</span>
                <span className="text-[10px] text-[#A5AFBE]">{folders.length} folders</span>
              </button>

              {/* Playlists */}
              <button
                onClick={onOpenPlaylists}
                className="flex flex-col items-center justify-center p-3 bg-[#11151D] hover:bg-[#191F2A] border border-[#2B3442] rounded-2xl transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#A78BFA]/20 to-[#62B5FF]/20 border border-[#A78BFA]/40 flex items-center justify-center text-[#A78BFA] group-hover:scale-110 transition-transform">
                  <ListMusic className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold text-[#F4F7FC] mt-2">Playlists</span>
                <span className="text-[10px] text-[#A5AFBE]">Manage</span>
              </button>

              {/* Recently Played */}
              <button
                onClick={() => {
                  const recent = mediaItems.filter(i => i.lastPlayedTime);
                  if (recent.length > 0) onPlayMedia(recent[0]);
                }}
                className="flex flex-col items-center justify-center p-3 bg-[#11151D] hover:bg-[#191F2A] border border-[#2B3442] rounded-2xl transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-[#191F2A] border border-[#2B3442] flex items-center justify-center text-[#A5AFBE] group-hover:text-[#F4F7FC] group-hover:scale-110 transition-transform">
                  <Clock className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold text-[#F4F7FC] mt-2">Recent</span>
                <span className="text-[10px] text-[#A5AFBE]">Resume</span>
              </button>

              {/* Favourites */}
              <button
                onClick={onOpenFavorites}
                className="flex flex-col items-center justify-center p-3 bg-[#11151D] hover:bg-[#191F2A] border border-[#2B3442] rounded-2xl transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#FF7379]/20 to-[#A78BFA]/20 border border-[#FF7379]/40 flex items-center justify-center text-[#FF7379] group-hover:scale-110 transition-transform">
                  <Heart className="w-6 h-6 fill-current" />
                </div>
                <span className="text-xs font-semibold text-[#F4F7FC] mt-2">Favourites</span>
                <span className="text-[10px] text-[#A5AFBE]">
                  {mediaItems.filter(i => i.isFavorite).length} saved
                </span>
              </button>
            </div>

            {/* Continue Watching Section */}
            {continueWatchingItems.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold tracking-wide text-[#F4F7FC] flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#62B5FF]" />
                    <span>Continue Watching</span>
                  </h2>
                  <span className="text-xs text-[#A5AFBE]">
                    {continueWatchingItems.length} videos
                  </span>
                </div>

                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
                  {continueWatchingItems.map(item => {
                    const percent = item.duration > 0 ? ((item.playbackPosition || 0) / item.duration) * 100 : 0;
                    return (
                      <div
                        key={item.id}
                        onClick={() => onPlayMedia(item)}
                        className="w-60 sm:w-72 shrink-0 bg-[#11151D] border border-[#2B3442] rounded-2xl overflow-hidden cursor-pointer group hover:border-[#62B5FF]/50 transition-all shadow-lg"
                      >
                        <div className="relative aspect-video bg-[#191F2A] overflow-hidden">
                          <img
                            src={item.thumbnailUrl}
                            alt={item.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {/* Duration Badge */}
                          <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-mono text-white">
                            {formatTime(item.duration)}
                          </span>

                          {/* Center Play Button on hover */}
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <div className="w-10 h-10 rounded-full bg-[#62B5FF] text-[#090B10] flex items-center justify-center">
                              <Play className="w-5 h-5 fill-current ml-0.5" />
                            </div>
                          </div>

                          {/* Watch Progress Bar */}
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/40">
                            <div
                              className="h-full bg-[#62B5FF]"
                              style={{ width: `${Math.min(100, percent)}%` }}
                            />
                          </div>
                        </div>

                        <div className="p-3">
                          <span className="text-xs font-semibold text-[#F4F7FC] truncate block group-hover:text-[#62B5FF] transition-colors">
                            {item.title}
                          </span>
                          <div className="flex items-center justify-between text-[11px] text-[#A5AFBE] mt-1">
                            <span>{item.folderName}</span>
                            <span className="font-mono text-[#62B5FF]">{Math.round(percent)}% watched</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Folders List (Faithfully inspired by Screenshot 1) */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold tracking-wide text-[#F4F7FC] flex items-center gap-2">
                  <FolderOpen className="w-4 h-4 text-[#FFCA78]" />
                  <span>Media Folders</span>
                </h2>
                <span className="text-xs text-[#A5AFBE]">{folders.length} indexed</span>
              </div>

              <div className="space-y-2.5">
                {folders.map(f => (
                  <div
                    key={f.name}
                    onClick={() => onOpenFolder(f.name)}
                    className="flex items-center justify-between p-3.5 bg-[#11151D] hover:bg-[#191F2A] border border-[#2B3442] rounded-2xl cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-xl bg-[#191F2A] border border-[#2B3442] flex items-center justify-center text-[#62B5FF] group-hover:bg-[#62B5FF]/10 transition-colors">
                        <Folder className="w-6 h-6 fill-current/30" />
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-[#F4F7FC] group-hover:text-[#62B5FF] transition-colors">
                          {f.name}
                        </span>
                        <div className="flex items-center gap-2 text-xs text-[#A5AFBE] mt-0.5">
                          <span>{f.itemCount} items</span>
                          <span>·</span>
                          <span>{formatFileSize(f.totalSize)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-[#A5AFBE]">{f.videoCount} vids</span>
                      <ChevronRight className="w-4 h-4 text-[#A5AFBE] group-hover:text-[#62B5FF] group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Floating Action Button (FAB Play Button from Screenshot 1) */}
      <button
        onClick={() => {
          if (mediaItems.length > 0) onPlayMedia(mediaItems[0]);
        }}
        className="fixed bottom-20 right-6 w-14 h-14 rounded-full bg-[#62B5FF] text-[#090B10] flex items-center justify-center shadow-2xl shadow-[#62B5FF]/40 hover:bg-[#83c6ff] active:scale-95 transition-all z-30 focus:outline-none"
        title="Quick Play"
      >
        <Play className="w-7 h-7 fill-current ml-1" />
      </button>
    </div>
  );
};
