/**
 * Nova Media - Playlists Screen
 * Full playlist creation, renaming, deletion, track management, and playlist playback
 */

import React, { useState } from 'react';
import {
  ListMusic,
  Plus,
  Play,
  Shuffle,
  Trash2,
  Edit2,
  Clock,
  Heart,
  ChevronRight,
  FolderOpen,
} from 'lucide-react';
import { MediaItem, Playlist } from '../../types/media';
import { formatTime } from '../../services/storage';

interface PlaylistsScreenProps {
  playlists: Playlist[];
  mediaItems: MediaItem[];
  onPlayPlaylist: (playlist: Playlist, shuffle?: boolean) => void;
  onPlayMedia: (item: MediaItem) => void;
  onCreatePlaylist: (name: string, desc?: string) => void;
  onDeletePlaylist: (id: string) => void;
  onRemoveFromPlaylist: (playlistId: string, mediaId: string) => void;
}

export const PlaylistsScreen: React.FC<PlaylistsScreenProps> = ({
  playlists,
  mediaItems,
  onPlayPlaylist,
  onPlayMedia,
  onCreatePlaylist,
  onDeletePlaylist,
  onRemoveFromPlaylist,
}) => {
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const selectedPlaylist = playlists.find(p => p.id === selectedPlaylistId);
  const playlistItems = selectedPlaylist
    ? mediaItems.filter(i => selectedPlaylist.itemIds.includes(i.id))
    : [];

  const handleCreate = () => {
    if (newTitle.trim()) {
      onCreatePlaylist(newTitle.trim(), newDesc.trim() || undefined);
      setNewTitle('');
      setNewDesc('');
      setIsCreating(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#090B10] text-[#F4F7FC] overflow-y-auto select-none pb-24">
      {/* Top Header */}
      <div className="sticky top-0 z-30 bg-[#090B10]/95 backdrop-blur-md px-4 sm:px-6 py-3 border-b border-[#1E2532] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#A78BFA]/20 text-[#A78BFA] flex items-center justify-center">
            <ListMusic className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-[#F4F7FC]">Playlists</h1>
            <span className="text-xs text-[#A5AFBE]">{playlists.length} playlists</span>
          </div>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="px-3 py-1.5 rounded-xl bg-[#62B5FF] text-[#090B10] text-xs font-semibold flex items-center gap-1.5 hover:bg-[#83c6ff] transition-all shadow-md shadow-[#62B5FF]/20"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Playlist</span>
        </button>
      </div>

      <div className="p-4 sm:p-6 space-y-6">
        {/* Inline Create Form Modal */}
        {isCreating && (
          <div className="p-4 bg-[#11151D] border border-[#62B5FF]/40 rounded-2xl space-y-3 animate-in fade-in">
            <h3 className="text-sm font-semibold text-[#F4F7FC]">Create Playlist</h3>
            <input
              type="text"
              autoFocus
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              placeholder="Playlist name..."
              className="w-full px-3.5 py-2 text-xs bg-[#191F2A] border border-[#2B3442] rounded-xl text-[#F4F7FC] focus:outline-none focus:border-[#62B5FF]"
            />
            <input
              type="text"
              value={newDesc}
              onChange={e => setNewDesc(e.target.value)}
              placeholder="Description (optional)"
              className="w-full px-3.5 py-2 text-xs bg-[#191F2A] border border-[#2B3442] rounded-xl text-[#F4F7FC] focus:outline-none focus:border-[#62B5FF]"
            />
            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => setIsCreating(false)}
                className="px-3 py-1.5 text-xs text-[#A5AFBE] hover:text-[#F4F7FC]"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                className="px-4 py-1.5 text-xs font-semibold text-[#090B10] bg-[#62B5FF] rounded-xl hover:bg-[#83c6ff]"
              >
                Save
              </button>
            </div>
          </div>
        )}

        {/* Selected Playlist Detail View */}
        {selectedPlaylist ? (
          <div className="space-y-4">
            <button
              onClick={() => setSelectedPlaylistId(null)}
              className="text-xs text-[#62B5FF] font-semibold hover:underline flex items-center gap-1"
            >
              ← Back to All Playlists
            </button>

            <div className="p-5 bg-[#11151D] border border-[#2B3442] rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-[#F4F7FC]">{selectedPlaylist.name}</h2>
                <p className="text-xs text-[#A5AFBE] mt-0.5">{selectedPlaylist.description || 'Custom playlist'}</p>
                <span className="text-xs text-[#62B5FF] font-mono mt-1 block">
                  {playlistItems.length} items · {formatTime(playlistItems.reduce((acc, i) => acc + i.duration, 0))} total
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onPlayPlaylist(selectedPlaylist, false)}
                  disabled={playlistItems.length === 0}
                  className="px-4 py-2 rounded-xl bg-[#62B5FF] text-[#090B10] text-xs font-semibold flex items-center gap-1.5 hover:bg-[#83c6ff] disabled:opacity-40 transition-all shadow-md"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Play All</span>
                </button>
                <button
                  onClick={() => onPlayPlaylist(selectedPlaylist, true)}
                  disabled={playlistItems.length === 0}
                  className="px-3 py-2 rounded-xl bg-[#191F2A] border border-[#2B3442] text-xs font-semibold text-[#F4F7FC] flex items-center gap-1.5 hover:border-[#62B5FF] disabled:opacity-40 transition-all"
                >
                  <Shuffle className="w-3.5 h-3.5 text-[#62B5FF]" />
                  <span>Shuffle</span>
                </button>
                <button
                  onClick={() => {
                    onDeletePlaylist(selectedPlaylist.id);
                    setSelectedPlaylistId(null);
                  }}
                  className="p-2 rounded-xl bg-[#191F2A] border border-[#2B3442] text-[#FF7379] hover:bg-[#FF7379]/10 transition-colors"
                  title="Delete playlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Track entries */}
            <div className="space-y-2">
              {playlistItems.length === 0 ? (
                <div className="p-8 text-center bg-[#11151D] rounded-2xl border border-[#2B3442]">
                  <p className="text-xs text-[#A5AFBE]">This playlist has no items yet. Add media from the library.</p>
                </div>
              ) : (
                playlistItems.map((item, idx) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-[#11151D] hover:bg-[#191F2A] border border-[#2B3442] rounded-xl transition-all group"
                  >
                    <div
                      onClick={() => onPlayMedia(item)}
                      className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                    >
                      <span className="text-xs font-mono text-[#A5AFBE] w-5 text-right">{idx + 1}</span>
                      <img
                        src={item.thumbnailUrl}
                        alt={item.title}
                        referrerPolicy="no-referrer"
                        className="w-14 h-9 rounded-lg object-cover"
                      />
                      <div className="min-w-0">
                        <span className="text-xs font-semibold text-[#F4F7FC] truncate block group-hover:text-[#62B5FF]">
                          {item.title}
                        </span>
                        <span className="text-[10px] text-[#A5AFBE]">
                          {formatTime(item.duration)} · {item.folderName}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => onRemoveFromPlaylist(selectedPlaylist.id, item.id)}
                      className="p-2 text-[#A5AFBE] hover:text-[#FF7379] transition-colors"
                      title="Remove from playlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          /* Playlists Overview Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {playlists.map(pl => {
              const count = pl.itemIds.length;
              return (
                <div
                  key={pl.id}
                  onClick={() => setSelectedPlaylistId(pl.id)}
                  className="p-4 bg-[#11151D] hover:bg-[#191F2A] border border-[#2B3442] hover:border-[#62B5FF]/50 rounded-2xl cursor-pointer transition-all group flex items-center justify-between"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-[#191F2A] border border-[#2B3442] flex items-center justify-center text-[#A78BFA] group-hover:bg-[#A78BFA]/10 transition-colors">
                      <ListMusic className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-[#F4F7FC] group-hover:text-[#62B5FF] transition-colors block">
                        {pl.name}
                      </span>
                      <span className="text-xs text-[#A5AFBE] mt-0.5 block">
                        {count} items · {pl.description || 'Playlist'}
                      </span>
                    </div>
                  </div>

                  <ChevronRight className="w-5 h-5 text-[#A5AFBE] group-hover:text-[#62B5FF] group-hover:translate-x-0.5 transition-all" />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
