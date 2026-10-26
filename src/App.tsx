/**
 * Nova Media - Android Media Player
 * Main Application Architecture with Navigation, State Persistence,
 * Media3 ExoPlayer integration, Equalizer, and Adaptive Tablet/Phone Layouts.
 */

import React, { useEffect, useState } from 'react';
import { AndroidStatusBar } from './components/common/AndroidStatusBar';
import { AndroidNavBar, NavTab } from './components/common/AndroidNavBar';
import { MiniPlayer } from './components/common/MiniPlayer';
import { SortFilterModal } from './components/common/SortFilterModal';
import { LibraryScreen } from './components/screens/LibraryScreen';
import { VideosScreen } from './components/screens/VideosScreen';
import { MusicScreen } from './components/screens/MusicScreen';
import { PlaylistsScreen } from './components/screens/PlaylistsScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';
import { VideoPlayerView } from './components/player/VideoPlayerView';
import { EqualizerDialog } from './components/player/EqualizerDialog';
import {
  EqualizerSettings,
  LayoutMode,
  MediaFolder,
  MediaItem,
  PlayerPreferences,
  Playlist,
  SortConfig,
  ViewMode,
} from './types/media';
import { storage } from './services/storage';
import { INITIAL_MEDIA_ITEMS } from './data/defaultMedia';

export default function App() {
  // Navigation & Screen state
  const [currentTab, setCurrentTab] = useState<NavTab>('library');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  // Device frame simulation: 'responsive' | 'tablet' | 'phone'
  const [deviceFrame, setDeviceFrame] = useState<'tablet' | 'phone' | 'responsive'>('tablet');

  // Media catalog & folders
  const [mediaItems, setMediaItems] = useState<MediaItem[]>(() => storage.getMediaItems());
  const [playlists, setPlaylists] = useState<Playlist[]>(() => storage.getPlaylists());
  const [preferences, setPreferences] = useState<PlayerPreferences>(() => storage.getPreferences());
  const [equalizer, setEqualizer] = useState<EqualizerSettings>(() => storage.getEqualizer());

  // Active Playback State
  const [currentMedia, setCurrentMedia] = useState<MediaItem | null>(null);
  const [isPlayerOpen, setIsPlayerOpen] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackTime, setPlaybackTime] = useState<number>(0);
  const [playbackDuration, setPlaybackDuration] = useState<number>(0);

  // Modals
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);
  const [isEqualizerModalOpen, setIsEqualizerModalOpen] = useState(false);
  const [targetPlaylistMedia, setTargetPlaylistMedia] = useState<MediaItem | null>(null);

  // Group media items into folders
  const folders: MediaFolder[] = React.useMemo(() => {
    const map = new Map<string, { count: number; vids: number; auds: number; totalSize: number; latest: number; cover?: string }>();

    for (const item of mediaItems) {
      const fName = item.folderName || 'General';
      const existing = map.get(fName) || { count: 0, vids: 0, auds: 0, totalSize: 0, latest: 0 };
      existing.count += 1;
      if (item.type === 'video') existing.vids += 1;
      if (item.type === 'audio') existing.auds += 1;
      existing.totalSize += item.fileSize;
      if (item.dateAdded > existing.latest) existing.latest = item.dateAdded;
      if (!existing.cover) existing.cover = item.thumbnailUrl;
      map.set(fName, existing);
    }

    return Array.from(map.entries()).map(([name, data]) => ({
      id: `folder-${name}`,
      name,
      itemCount: data.count,
      videoCount: data.vids,
      audioCount: data.auds,
      totalSize: data.totalSize,
      latestDate: data.latest,
      coverThumbnail: data.cover,
    }));
  }, [mediaItems]);

  // Play a specific media item
  const handlePlayMedia = (item: MediaItem) => {
    setCurrentMedia(item);
    setIsPlayerOpen(true);
    setIsPlaying(true);
    setPlaybackTime(item.playbackPosition || 0);
    setPlaybackDuration(item.duration);

    // Update last played
    const updated = mediaItems.map(m =>
      m.id === item.id ? { ...m, lastPlayedTime: Date.now() } : m
    );
    setMediaItems(updated);
    storage.saveMediaItems(updated);
  };

  // Next / Prev track
  const handleNextMedia = () => {
    if (!currentMedia) return;
    const currentQueue = mediaItems.filter(i =>
      selectedFolder ? i.folderName === selectedFolder : true
    );
    const idx = currentQueue.findIndex(i => i.id === currentMedia.id);
    const nextIdx = (idx + 1) % currentQueue.length;
    handlePlayMedia(currentQueue[nextIdx]);
  };

  const handlePrevMedia = () => {
    if (!currentMedia) return;
    const currentQueue = mediaItems.filter(i =>
      selectedFolder ? i.folderName === selectedFolder : true
    );
    const idx = currentQueue.findIndex(i => i.id === currentMedia.id);
    const prevIdx = (idx - 1 + currentQueue.length) % currentQueue.length;
    handlePlayMedia(currentQueue[prevIdx]);
  };

  // Toggle favorite
  const handleToggleFavorite = (id: string) => {
    const isFav = storage.toggleFavorite(id);
    setMediaItems(prev =>
      prev.map(i => (i.id === id ? { ...i, isFavorite: isFav } : i))
    );
  };

  // Import local user files (videos or audio)
  const handleImportFiles = (fileList: FileList) => {
    const newItems: MediaItem[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const isVideo = file.type.startsWith('video');
      const isAudio = file.type.startsWith('audio');
      if (!isVideo && !isAudio) continue;

      const url = URL.createObjectURL(file);
      const title = file.name.replace(/\.[^/.]+$/, '');
      const newItem: MediaItem = {
        id: `local-${Date.now()}-${i}`,
        title,
        type: isVideo ? 'video' : 'audio',
        url,
        thumbnailUrl: isVideo
          ? 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
        duration: isVideo ? 120 : 180,
        fileSize: file.size,
        mimeType: file.type || (isVideo ? 'video/mp4' : 'audio/mp3'),
        folderName: 'Imported',
        dateAdded: Date.now(),
        playbackPosition: 0,
        isFavorite: false,
        resolution: isVideo ? '1080p' : undefined,
      };
      newItems.push(newItem);
    }

    if (newItems.length > 0) {
      const merged = [...newItems, ...mediaItems];
      setMediaItems(merged);
      storage.saveMediaItems(merged);
    }
  };

  // Preferences updates
  const handleUpdatePreferences = (prefs: Partial<PlayerPreferences>) => {
    const updated = storage.savePreferences(prefs);
    setPreferences(updated);
  };

  const handleResetPreferences = () => {
    localStorage.removeItem('nova_preferences_v1');
    const defaults = storage.getPreferences();
    setPreferences(defaults);
  };

  // Equalizer updates
  const handleUpdateEqualizer = (eq: EqualizerSettings) => {
    storage.saveEqualizer(eq);
    setEqualizer(eq);
  };

  // Playlist actions
  const handleCreatePlaylist = (name: string, desc?: string) => {
    const newPl = storage.createPlaylist(name, desc);
    setPlaylists(storage.getPlaylists());
    return newPl;
  };

  const handleDeletePlaylist = (id: string) => {
    storage.deletePlaylist(id);
    setPlaylists(storage.getPlaylists());
  };

  const handleAddToPlaylist = (playlistId: string, mediaId: string) => {
    storage.addToPlaylist(playlistId, mediaId);
    setPlaylists(storage.getPlaylists());
  };

  const handleRemoveFromPlaylist = (playlistId: string, mediaId: string) => {
    storage.removeFromPlaylist(playlistId, mediaId);
    setPlaylists(storage.getPlaylists());
  };

  const handlePlayPlaylist = (playlist: Playlist, shuffle = false) => {
    let items = mediaItems.filter(i => playlist.itemIds.includes(i.id));
    if (items.length === 0) return;
    if (shuffle) {
      items = [...items].sort(() => Math.random() - 0.5);
    }
    handlePlayMedia(items[0]);
  };

  // Switch device frames between Tablet, Phone, and Edge-to-Edge Responsive
  const cycleDeviceFrame = () => {
    if (deviceFrame === 'tablet') setDeviceFrame('phone');
    else if (deviceFrame === 'phone') setDeviceFrame('responsive');
    else setDeviceFrame('tablet');
  };

  // Dynamic frame container styles
  const getFrameContainerStyle = () => {
    if (deviceFrame === 'tablet') {
      return 'w-full max-w-5xl h-[86vh] rounded-3xl border-[6px] border-[#2B3442] shadow-2xl overflow-hidden my-auto';
    }
    if (deviceFrame === 'phone') {
      return 'w-full max-w-sm h-[88vh] rounded-[36px] border-[8px] border-[#2B3442] shadow-2xl overflow-hidden my-auto';
    }
    return 'w-full h-screen rounded-none border-none';
  };

  return (
    <div className="w-full min-h-screen bg-[#05070A] flex flex-col items-center justify-center relative font-sans text-[#F4F7FC]">
      {/* Top Bar for Viewport Toggle & Device Switcher (when not fullscreen) */}
      {!isPlayerOpen && (
        <header className="w-full max-w-5xl px-4 py-2 flex items-center justify-between text-xs text-[#A5AFBE] select-none shrink-0 z-40">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-[#F4F7FC]">Nova Media Player</span>
            <span className="hidden sm:inline">· Android Media3 Engine</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#A5AFBE] hidden sm:inline">Viewport:</span>
            <div className="flex items-center gap-1 bg-[#11151D] border border-[#2B3442] p-0.5 rounded-lg">
              <button
                onClick={() => setDeviceFrame('tablet')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                  deviceFrame === 'tablet' ? 'bg-[#62B5FF] text-[#090B10] font-semibold' : 'hover:text-[#F4F7FC]'
                }`}
              >
                Tablet (16:10)
              </button>
              <button
                onClick={() => setDeviceFrame('phone')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                  deviceFrame === 'phone' ? 'bg-[#62B5FF] text-[#090B10] font-semibold' : 'hover:text-[#F4F7FC]'
                }`}
              >
                Phone
              </button>
              <button
                onClick={() => setDeviceFrame('responsive')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                  deviceFrame === 'responsive' ? 'bg-[#62B5FF] text-[#090B10] font-semibold' : 'hover:text-[#F4F7FC]'
                }`}
              >
                Full Screen
              </button>
            </div>
          </div>
        </header>
      )}

      {/* Main Device / Player Canvas Container */}
      <div className={`relative flex flex-col bg-[#090B10] ${getFrameContainerStyle()} transition-all duration-200`}>
        {/* Full-Screen Video Player View */}
        {isPlayerOpen && currentMedia ? (
          <VideoPlayerView
            media={currentMedia}
            queue={mediaItems.filter(i => (selectedFolder ? i.folderName === selectedFolder : true))}
            onBack={() => setIsPlayerOpen(false)}
            onNext={handleNextMedia}
            onPrev={handlePrevMedia}
            onSelectMedia={handlePlayMedia}
            preferences={preferences}
            onUpdatePreferences={handleUpdatePreferences}
            equalizer={equalizer}
            onUpdateEqualizer={handleUpdateEqualizer}
            playlists={playlists}
            onAddToPlaylist={handleAddToPlaylist}
            onCreatePlaylist={handleCreatePlaylist}
            onToggleFavorite={handleToggleFavorite}
          />
        ) : (
          /* Normal App View (Status Bar + Screen Content + Mini-Player + Navigation Bar) */
          <>
            {/* Android Status Bar */}
            <AndroidStatusBar />

            {/* Current Active Screen */}
            <main className="flex-1 flex flex-col overflow-hidden relative">
              {currentTab === 'library' && (
                <LibraryScreen
                  mediaItems={mediaItems}
                  folders={folders}
                  onPlayMedia={handlePlayMedia}
                  onOpenFolder={folderName => {
                    setSelectedFolder(folderName);
                    setCurrentTab('videos');
                  }}
                  onOpenMusic={() => setCurrentTab('music')}
                  onOpenPlaylists={() => setCurrentTab('playlists')}
                  onOpenFavorites={() => {
                    setSelectedFolder(null);
                    setCurrentTab('videos');
                  }}
                  onOpenSortModal={() => setIsSortModalOpen(true)}
                  onImportFiles={handleImportFiles}
                  isTabletFrame={deviceFrame === 'tablet'}
                  onToggleDeviceFrame={cycleDeviceFrame}
                />
              )}

              {currentTab === 'videos' && (
                <VideosScreen
                  mediaItems={mediaItems}
                  currentFolder={selectedFolder}
                  onSelectFolder={setSelectedFolder}
                  onPlayMedia={handlePlayMedia}
                  layoutMode={preferences.preferredLayout}
                  onToggleLayoutMode={() =>
                    handleUpdatePreferences({
                      preferredLayout: preferences.preferredLayout === 'list' ? 'grid' : 'list',
                    })
                  }
                  sortConfig={preferences.defaultSort}
                  onOpenSortModal={() => setIsSortModalOpen(true)}
                  onToggleFavorite={handleToggleFavorite}
                  onOpenInfo={item => handlePlayMedia(item)}
                  onAddToPlaylist={item => setTargetPlaylistMedia(item)}
                />
              )}

              {currentTab === 'music' && (
                <MusicScreen
                  mediaItems={mediaItems}
                  currentPlayingMedia={currentMedia}
                  isPlaying={isPlaying}
                  onPlayMedia={handlePlayMedia}
                  onToggleFavorite={handleToggleFavorite}
                  onOpenEqualizer={() => setIsEqualizerModalOpen(true)}
                  onAddToPlaylist={item => setTargetPlaylistMedia(item)}
                />
              )}

              {currentTab === 'playlists' && (
                <PlaylistsScreen
                  playlists={playlists}
                  mediaItems={mediaItems}
                  onPlayPlaylist={handlePlayPlaylist}
                  onPlayMedia={handlePlayMedia}
                  onCreatePlaylist={handleCreatePlaylist}
                  onDeletePlaylist={handleDeletePlaylist}
                  onRemoveFromPlaylist={handleRemoveFromPlaylist}
                />
              )}

              {currentTab === 'settings' && (
                <SettingsScreen
                  preferences={preferences}
                  onUpdatePreferences={handleUpdatePreferences}
                  onResetPreferences={handleResetPreferences}
                  onOpenEqualizer={() => setIsEqualizerModalOpen(true)}
                  onRescanMedia={() => {
                    setMediaItems(INITIAL_MEDIA_ITEMS);
                    storage.saveMediaItems(INITIAL_MEDIA_ITEMS);
                  }}
                />
              )}
            </main>

            {/* Docked Mini-Player (when media is active and user is navigating app) */}
            {currentMedia && (
              <>
                <video
                  src={currentMedia.url}
                  className="hidden"
                  playsInline
                  autoPlay={isPlaying}
                  onError={() => {}}
                  onTimeUpdate={e => {
                    setPlaybackTime(e.currentTarget.currentTime);
                    if (e.currentTarget.duration) setPlaybackDuration(e.currentTarget.duration);
                  }}
                  onEnded={handleNextMedia}
                  ref={el => {
                    if (el) {
                      if (isPlaying && el.paused) el.play().catch(() => {});
                      else if (!isPlaying && !el.paused) el.pause();
                    }
                  }}
                />
                <MiniPlayer
                  media={currentMedia}
                  isPlaying={isPlaying}
                  currentTime={playbackTime}
                  duration={playbackDuration}
                  onTogglePlay={() => setIsPlaying(prev => !prev)}
                  onNext={handleNextMedia}
                  onExpand={() => setIsPlayerOpen(true)}
                  onClose={() => {
                    setCurrentMedia(null);
                    setIsPlaying(false);
                  }}
                />
              </>
            )}

            {/* Android Navigation Bar & System Nav Buttons */}
            <AndroidNavBar
              currentTab={currentTab}
              onSelectTab={tab => {
                setCurrentTab(tab);
                if (tab !== 'videos') setSelectedFolder(null);
              }}
              onSystemBack={() => {
                if (selectedFolder) setSelectedFolder(null);
                else if (currentTab !== 'library') setCurrentTab('library');
              }}
            />
          </>
        )}
      </div>

      {/* Global Modals */}
      <SortFilterModal
        isOpen={isSortModalOpen}
        onClose={() => setIsSortModalOpen(false)}
        viewMode="all_folders"
        onSelectViewMode={() => {}}
        layoutMode={preferences.preferredLayout}
        onSelectLayoutMode={mode => handleUpdatePreferences({ preferredLayout: mode })}
        sortConfig={preferences.defaultSort}
        onApplySort={cfg => handleUpdatePreferences({ defaultSort: cfg })}
      />

      <EqualizerDialog
        isOpen={isEqualizerModalOpen}
        onClose={() => setIsEqualizerModalOpen(false)}
        settings={equalizer}
        onUpdateSettings={handleUpdateEqualizer}
      />
    </div>
  );
}
