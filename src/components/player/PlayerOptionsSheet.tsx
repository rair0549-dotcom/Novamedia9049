/**
 * Nova Media - Player Options Side Sheet
 * Matches the reference layout with circular action buttons, aspect ratio switcher,
 * bookmark management, playlist addition, info viewer, and shortcut settings.
 */

import React, { useState } from 'react';
import {
  ListMusic,
  Maximize,
  Sliders,
  Bookmark as BookmarkIcon,
  Heart,
  FolderPlus,
  Info,
  Share2,
  X,
  Plus,
  Trash2,
  Play,
  RotateCw,
  Gauge,
  SlidersHorizontal,
  Check,
} from 'lucide-react';
import { AspectRatioMode, Bookmark, MediaItem, Playlist } from '../../types/media';
import { formatTime } from '../../services/storage';

interface PlayerOptionsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  media: MediaItem;
  currentPosition: number;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  aspectRatio: AspectRatioMode;
  onChangeAspectRatio: (mode: AspectRatioMode) => void;
  onOpenInfo: () => void;
  onOpenEqualizer: () => void;
  onOpenCustomize: () => void;
  onOpenSleepTimer: () => void;
  bookmarks: Bookmark[];
  onAddBookmark: (label?: string) => void;
  onDeleteBookmark: (id: string) => void;
  onJumpToBookmark: (position: number) => void;
  playlists: Playlist[];
  onAddToPlaylist: (playlistId: string) => void;
  onCreatePlaylist: (name: string) => void;
  queue: MediaItem[];
  onSelectQueueItem: (media: MediaItem) => void;
}

export const PlayerOptionsSheet: React.FC<PlayerOptionsSheetProps> = ({
  isOpen,
  onClose,
  media,
  currentPosition,
  isFavorite,
  onToggleFavorite,
  aspectRatio,
  onChangeAspectRatio,
  onOpenInfo,
  onOpenEqualizer,
  onOpenCustomize,
  onOpenSleepTimer,
  bookmarks,
  onAddBookmark,
  onDeleteBookmark,
  onJumpToBookmark,
  playlists,
  onAddToPlaylist,
  onCreatePlaylist,
  queue,
  onSelectQueueItem,
}) => {
  const [activeTab, setActiveTab] = useState<'options' | 'queue' | 'bookmarks' | 'aspect' | 'playlist'>('options');
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [bookmarkLabel, setBookmarkLabel] = useState('');
  const [addedToast, setAddedToast] = useState<string | null>(null);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setAddedToast(msg);
    setTimeout(() => setAddedToast(null), 2500);
  };

  const aspectModes: { id: AspectRatioMode; label: string; desc: string }[] = [
    { id: 'fit', label: 'Fit to Screen', desc: 'Preserves original aspect ratio' },
    { id: 'fill', label: 'Fill Display', desc: 'Fills display without black bars' },
    { id: 'zoom', label: 'Zoom & Crop', desc: 'Crops slightly to center' },
    { id: 'stretch', label: 'Stretch Full', desc: 'Stretches video to fill boundaries' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full sm:max-w-md bg-[#191F2A] border-l border-[#2B3442] shadow-2xl h-full flex flex-col overflow-hidden animate-in slide-in-from-right duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2B3442] bg-[#11151D] shrink-0">
          <div className="flex items-center gap-2">
            {activeTab !== 'options' && (
              <button
                onClick={() => setActiveTab('options')}
                className="text-xs text-[#62B5FF] hover:underline mr-1"
              >
                ← Back
              </button>
            )}
            <h3 className="text-base font-semibold text-[#F4F7FC]">
              {activeTab === 'options' && 'Player Options'}
              {activeTab === 'queue' && 'Playing Queue'}
              {activeTab === 'bookmarks' && 'Bookmarks'}
              {activeTab === 'aspect' && 'Aspect Ratio'}
              {activeTab === 'playlist' && 'Add to Playlist'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#A5AFBE] hover:text-[#F4F7FC] hover:bg-[#2B3442] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Temporary Feedback Notification */}
        {addedToast && (
          <div className="bg-[#62B5FF] text-[#090B10] px-4 py-2 text-xs font-semibold text-center transition-all animate-in slide-in-from-top">
            {addedToast}
          </div>
        )}

        {/* Body content based on tab */}
        <div className="p-5 flex-1 overflow-y-auto space-y-6">
          {activeTab === 'options' && (
            <>
              {/* Circular Action Icons Grid */}
              <div className="grid grid-cols-4 gap-y-5 gap-x-3 text-center">
                {/* Playing Queue */}
                <button
                  onClick={() => setActiveTab('queue')}
                  className="flex flex-col items-center gap-1.5 group"
                >
                  <div className="w-12 h-12 rounded-full bg-[#11151D] border border-[#2B3442] flex items-center justify-center text-[#F4F7FC] group-hover:border-[#62B5FF] group-hover:bg-[#62B5FF]/10 group-hover:text-[#62B5FF] transition-all">
                    <ListMusic className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-medium text-[#A5AFBE] group-hover:text-[#F4F7FC]">
                    Playing Queue
                  </span>
                </button>

                {/* Aspect Ratio */}
                <button
                  onClick={() => setActiveTab('aspect')}
                  className="flex flex-col items-center gap-1.5 group"
                >
                  <div className="w-12 h-12 rounded-full bg-[#11151D] border border-[#2B3442] flex items-center justify-center text-[#F4F7FC] group-hover:border-[#62B5FF] group-hover:bg-[#62B5FF]/10 group-hover:text-[#62B5FF] transition-all">
                    <Maximize className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-medium text-[#A5AFBE] group-hover:text-[#F4F7FC]">
                    Aspect Ratio
                  </span>
                </button>

                {/* Equalizer */}
                <button
                  onClick={onOpenEqualizer}
                  className="flex flex-col items-center gap-1.5 group"
                >
                  <div className="w-12 h-12 rounded-full bg-[#11151D] border border-[#2B3442] flex items-center justify-center text-[#F4F7FC] group-hover:border-[#62B5FF] group-hover:bg-[#62B5FF]/10 group-hover:text-[#62B5FF] transition-all">
                    <Sliders className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-medium text-[#A5AFBE] group-hover:text-[#F4F7FC]">
                    Equalizer
                  </span>
                </button>

                {/* Bookmark */}
                <button
                  onClick={() => setActiveTab('bookmarks')}
                  className="flex flex-col items-center gap-1.5 group"
                >
                  <div className="w-12 h-12 rounded-full bg-[#11151D] border border-[#2B3442] flex items-center justify-center text-[#F4F7FC] group-hover:border-[#62B5FF] group-hover:bg-[#62B5FF]/10 group-hover:text-[#62B5FF] transition-all relative">
                    <BookmarkIcon className="w-5 h-5" />
                    {bookmarks.length > 0 && (
                      <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#62B5FF]" />
                    )}
                  </div>
                  <span className="text-[11px] font-medium text-[#A5AFBE] group-hover:text-[#F4F7FC]">
                    Bookmark
                  </span>
                </button>

                {/* Favourite */}
                <button
                  onClick={() => {
                    onToggleFavorite();
                    showToast(isFavorite ? 'Removed from Favourites' : 'Added to Favourites');
                  }}
                  className="flex flex-col items-center gap-1.5 group"
                >
                  <div
                    className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all ${
                      isFavorite
                        ? 'border-[#FF7379] bg-[#FF7379]/15 text-[#FF7379]'
                        : 'bg-[#11151D] border-[#2B3442] text-[#F4F7FC] group-hover:border-[#FF7379] group-hover:text-[#FF7379]'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                  </div>
                  <span className="text-[11px] font-medium text-[#A5AFBE] group-hover:text-[#F4F7FC]">
                    {isFavorite ? 'Favourited' : 'Favourite'}
                  </span>
                </button>

                {/* Add To Playlist */}
                <button
                  onClick={() => setActiveTab('playlist')}
                  className="flex flex-col items-center gap-1.5 group"
                >
                  <div className="w-12 h-12 rounded-full bg-[#11151D] border border-[#2B3442] flex items-center justify-center text-[#F4F7FC] group-hover:border-[#62B5FF] group-hover:bg-[#62B5FF]/10 group-hover:text-[#62B5FF] transition-all">
                    <FolderPlus className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-medium text-[#A5AFBE] group-hover:text-[#F4F7FC]">
                    Add To Playlist
                  </span>
                </button>

                {/* Information */}
                <button
                  onClick={onOpenInfo}
                  className="flex flex-col items-center gap-1.5 group"
                >
                  <div className="w-12 h-12 rounded-full bg-[#11151D] border border-[#2B3442] flex items-center justify-center text-[#F4F7FC] group-hover:border-[#62B5FF] group-hover:bg-[#62B5FF]/10 group-hover:text-[#62B5FF] transition-all">
                    <Info className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-medium text-[#A5AFBE] group-hover:text-[#F4F7FC]">
                    Information
                  </span>
                </button>

                {/* Sleep Timer */}
                <button
                  onClick={onOpenSleepTimer}
                  className="flex flex-col items-center gap-1.5 group"
                >
                  <div className="w-12 h-12 rounded-full bg-[#11151D] border border-[#2B3442] flex items-center justify-center text-[#F4F7FC] group-hover:border-[#62B5FF] group-hover:bg-[#62B5FF]/10 group-hover:text-[#62B5FF] transition-all">
                    <Gauge className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-medium text-[#A5AFBE] group-hover:text-[#F4F7FC]">
                    Sleep Timer
                  </span>
                </button>
              </div>

              {/* Quick Settings & Customization Toggles */}
              <div className="pt-4 border-t border-[#2B3442] space-y-3">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <span className="text-sm font-semibold text-[#F4F7FC] block">Shortcuts Bar</span>
                    <span className="text-xs text-[#A5AFBE]">Customise items visible in player controls</span>
                  </div>
                  <button
                    onClick={onOpenCustomize}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#62B5FF]/20 text-[#62B5FF] hover:bg-[#62B5FF]/30 transition-colors"
                  >
                    Customise
                  </button>
                </div>

                <div className="p-3 bg-[#11151D] rounded-xl border border-[#2B3442] flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[#F4F7FC] font-semibold block">Aspect Mode</span>
                    <span className="text-[#A5AFBE] capitalize">{aspectRatio}</span>
                  </div>
                  <button
                    onClick={() => setActiveTab('aspect')}
                    className="text-[#62B5FF] font-semibold hover:underline"
                  >
                    Change
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Playing Queue Tab */}
          {activeTab === 'queue' && (
            <div className="space-y-3">
              <span className="text-xs text-[#A5AFBE] block">
                {queue.length} items in current playback queue
              </span>
              <div className="space-y-2">
                {queue.map(item => {
                  const isCurrent = item.id === media.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => onSelectQueueItem(item)}
                      className={`flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition-all ${
                        isCurrent
                          ? 'border-[#62B5FF] bg-[#62B5FF]/15'
                          : 'border-[#2B3442] bg-[#11151D] hover:bg-[#222B3A]'
                      }`}
                    >
                      <img
                        src={item.thumbnailUrl}
                        alt={item.title}
                        referrerPolicy="no-referrer"
                        className="w-12 h-8 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <span className={`text-xs font-semibold block truncate ${isCurrent ? 'text-[#62B5FF]' : 'text-[#F4F7FC]'}`}>
                          {item.title}
                        </span>
                        <span className="text-[10px] text-[#A5AFBE] block">
                          {formatTime(item.duration)} · {item.folderName}
                        </span>
                      </div>
                      {isCurrent && <Play className="w-4 h-4 text-[#62B5FF] fill-current" />}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Aspect Ratio Tab */}
          {activeTab === 'aspect' && (
            <div className="space-y-3">
              <span className="text-xs text-[#A5AFBE] block">
                Select how the video fills the screen surface
              </span>
              <div className="space-y-2.5">
                {aspectModes.map(mode => {
                  const isSelected = aspectRatio === mode.id;
                  return (
                    <button
                      key={mode.id}
                      onClick={() => {
                        onChangeAspectRatio(mode.id);
                        showToast(`Aspect ratio set to ${mode.label}`);
                      }}
                      className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all text-left ${
                        isSelected
                          ? 'border-[#62B5FF] bg-[#62B5FF]/15 text-[#F4F7FC]'
                          : 'border-[#2B3442] bg-[#11151D] text-[#A5AFBE] hover:text-[#F4F7FC]'
                      }`}
                    >
                      <div>
                        <span className={`text-sm font-semibold block ${isSelected ? 'text-[#62B5FF]' : 'text-[#F4F7FC]'}`}>
                          {mode.label}
                        </span>
                        <span className="text-xs text-[#A5AFBE]">{mode.desc}</span>
                      </div>
                      {isSelected && <Check className="w-5 h-5 text-[#62B5FF]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Bookmarks Tab */}
          {activeTab === 'bookmarks' && (
            <div className="space-y-4">
              {/* Add current position */}
              <div className="p-3 bg-[#11151D] border border-[#2B3442] rounded-xl space-y-2">
                <span className="text-xs font-semibold text-[#F4F7FC] block">
                  Bookmark current time ({formatTime(currentPosition)})
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={bookmarkLabel}
                    onChange={e => setBookmarkLabel(e.target.value)}
                    placeholder="Optional label (e.g. Intro, Climax)"
                    className="flex-1 px-3 py-1.5 text-xs bg-[#191F2A] border border-[#2B3442] rounded-lg text-[#F4F7FC] focus:outline-none focus:border-[#62B5FF]"
                  />
                  <button
                    onClick={() => {
                      onAddBookmark(bookmarkLabel.trim() || undefined);
                      setBookmarkLabel('');
                      showToast(`Bookmark added at ${formatTime(currentPosition)}`);
                    }}
                    className="px-3 py-1.5 text-xs font-semibold bg-[#62B5FF] text-[#090B10] rounded-lg hover:bg-[#83c6ff]"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Bookmarks List */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-[#A5AFBE] block">SAVED BOOKMARKS</span>
                {bookmarks.length === 0 ? (
                  <p className="text-xs text-[#A5AFBE] py-3 text-center">No bookmarks saved for this video.</p>
                ) : (
                  bookmarks.map(bm => (
                    <div
                      key={bm.id}
                      className="flex items-center justify-between p-2.5 bg-[#11151D] border border-[#2B3442] rounded-xl text-xs"
                    >
                      <button
                        onClick={() => {
                          onJumpToBookmark(bm.position);
                          showToast(`Jumped to ${formatTime(bm.position)}`);
                        }}
                        className="flex-1 text-left flex items-center gap-2 text-[#F4F7FC] hover:text-[#62B5FF]"
                      >
                        <BookmarkIcon className="w-4 h-4 text-[#62B5FF] fill-current" />
                        <div>
                          <span className="font-semibold block">{bm.label}</span>
                          <span className="text-[10px] text-[#A5AFBE] font-mono">{formatTime(bm.position)}</span>
                        </div>
                      </button>
                      <button
                        onClick={() => onDeleteBookmark(bm.id)}
                        className="p-1.5 text-[#A5AFBE] hover:text-[#FF7379] rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Add to Playlist Tab */}
          {activeTab === 'playlist' && (
            <div className="space-y-4">
              {/* Create new playlist inline */}
              <div className="p-3 bg-[#11151D] border border-[#2B3442] rounded-xl space-y-2">
                <span className="text-xs font-semibold text-[#F4F7FC] block">Create New Playlist</span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newPlaylistName}
                    onChange={e => setNewPlaylistName(e.target.value)}
                    placeholder="Playlist name..."
                    className="flex-1 px-3 py-1.5 text-xs bg-[#191F2A] border border-[#2B3442] rounded-lg text-[#F4F7FC] focus:outline-none focus:border-[#62B5FF]"
                  />
                  <button
                    onClick={() => {
                      if (newPlaylistName.trim()) {
                        onCreatePlaylist(newPlaylistName.trim());
                        setNewPlaylistName('');
                        showToast('Created playlist');
                      }
                    }}
                    className="px-3 py-1.5 text-xs font-semibold bg-[#62B5FF] text-[#090B10] rounded-lg hover:bg-[#83c6ff]"
                  >
                    Create
                  </button>
                </div>
              </div>

              {/* Playlists list */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-[#A5AFBE] block">SELECT PLAYLIST</span>
                {playlists.map(pl => {
                  const alreadyIn = pl.itemIds.includes(media.id);
                  return (
                    <div
                      key={pl.id}
                      className="flex items-center justify-between p-3 bg-[#11151D] border border-[#2B3442] rounded-xl text-xs"
                    >
                      <div>
                        <span className="font-semibold text-[#F4F7FC] block">{pl.name}</span>
                        <span className="text-[10px] text-[#A5AFBE]">{pl.itemIds.length} items</span>
                      </div>
                      <button
                        onClick={() => {
                          onAddToPlaylist(pl.id);
                          showToast(alreadyIn ? 'Already in playlist' : `Added to ${pl.name}`);
                        }}
                        disabled={alreadyIn}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          alreadyIn
                            ? 'bg-[#2B3442] text-[#A5AFBE] cursor-not-allowed'
                            : 'bg-[#62B5FF]/20 text-[#62B5FF] hover:bg-[#62B5FF]/30'
                        }`}
                      >
                        {alreadyIn ? 'Added' : 'Add'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
