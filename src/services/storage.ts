/**
 * Nova Media - Persistent Storage Service
 * Simulates Room DAO & Jetpack DataStore using localStorage
 */

import { Bookmark, EqualizerSettings, MediaItem, PlayerPreferences, Playlist, SortConfig } from '../types/media';
import { INITIAL_MEDIA_ITEMS, ALL_QUICK_SHORTCUTS } from '../data/defaultMedia';

const KEYS = {
  MEDIA: 'nova_media_catalog_v2',
  PLAYLISTS: 'nova_playlists_v1',
  BOOKMARKS: 'nova_bookmarks_v1',
  PREFERENCES: 'nova_preferences_v1',
  EQUALIZER: 'nova_equalizer_v1',
};

const DEFAULT_SORT: SortConfig = {
  field: 'date',
  order: 'desc',
};

const DEFAULT_PREFERENCES: PlayerPreferences = {
  controlTimeoutSec: 5,
  playbackSpeed: 1.0,
  aspectRatio: 'fit',
  repeatMode: 'off',
  isShuffle: false,
  isMuted: false,
  volume: 1.0,
  brightness: 1.0,
  decoder: 'HW',
  audioOnlyBackground: false,
  nightMode: false,
  mirrorMode: false,
  abRepeat: {
    enabled: false,
    pointA: null,
    pointB: null,
  },
  enabledShortcuts: ALL_QUICK_SHORTCUTS.filter(s => s.enabled).map(s => s.id),
  theme: 'dark',
  preferredLayout: 'list',
  defaultSort: DEFAULT_SORT,
  gestureSeekingEnabled: true,
  gestureBrightnessEnabled: true,
  gestureVolumeEnabled: true,
  gestureSpeedBoostEnabled: true,
};

const DEFAULT_EQUALIZER: EqualizerSettings = {
  enabled: true,
  preset: 'Flat',
  bands: [0, 0, 0, 0, 0],
  bassBoost: 0,
  virtualizer: 0,
};

const INITIAL_PLAYLISTS: Playlist[] = [
  {
    id: 'pl-favorites',
    name: 'Top Favorites',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 7,
    updatedAt: Date.now() - 1000 * 60 * 60 * 2,
    itemIds: ['vid-1', 'vid-5', 'aud-1'],
    description: 'Quick access to star-rated videos and audio',
  },
  {
    id: 'pl-night',
    name: 'Night Drive & Ambient',
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 4,
    updatedAt: Date.now() - 1000 * 60 * 60 * 4,
    itemIds: ['aud-1', 'aud-2', 'aud-3'],
    description: 'Relaxing sounds and synth beats',
  },
];

export const storage = {
  getMediaItems(): MediaItem[] {
    try {
      const data = localStorage.getItem(KEYS.MEDIA);
      if (!data) {
        localStorage.setItem(KEYS.MEDIA, JSON.stringify(INITIAL_MEDIA_ITEMS));
        return INITIAL_MEDIA_ITEMS;
      }
      const parsed: MediaItem[] = JSON.parse(data);
      // Migrate any stale URLs if present
      let changed = false;
      const sanitized = parsed.map(item => {
        if (item.url.includes('commondatastorage.googleapis.com') || item.url.includes('freesound.org')) {
          const match = INITIAL_MEDIA_ITEMS.find(d => d.id === item.id);
          changed = true;
          return match ? { ...item, url: match.url } : { ...item, url: '/videos/sample_nature.mp4' };
        }
        return item;
      });
      if (changed) {
        localStorage.setItem(KEYS.MEDIA, JSON.stringify(sanitized));
      }
      return sanitized;
    } catch {
      return INITIAL_MEDIA_ITEMS;
    }
  },

  saveMediaItems(items: MediaItem[]): void {
    try {
      localStorage.setItem(KEYS.MEDIA, JSON.stringify(items));
    } catch (e) {
      console.warn('Failed to save media items:', e);
    }
  },

  updateMediaProgress(id: string, position: number, duration?: number): void {
    const items = this.getMediaItems();
    const idx = items.findIndex(i => i.id === id);
    if (idx !== -1) {
      // If position is nearly complete (within 5 seconds or 98%), reset or mark finished
      const dur = duration || items[idx].duration;
      const isFinished = dur > 0 && position >= dur - 4;
      items[idx].playbackPosition = isFinished ? 0 : Math.floor(position);
      items[idx].lastPlayedTime = Date.now();
      this.saveMediaItems(items);
    }
  },

  toggleFavorite(id: string): boolean {
    const items = this.getMediaItems();
    const item = items.find(i => i.id === id);
    if (!item) return false;
    item.isFavorite = !item.isFavorite;
    this.saveMediaItems(items);
    return item.isFavorite;
  },

  getPlaylists(): Playlist[] {
    try {
      const data = localStorage.getItem(KEYS.PLAYLISTS);
      if (!data) {
        localStorage.setItem(KEYS.PLAYLISTS, JSON.stringify(INITIAL_PLAYLISTS));
        return INITIAL_PLAYLISTS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_PLAYLISTS;
    }
  },

  savePlaylists(playlists: Playlist[]): void {
    try {
      localStorage.setItem(KEYS.PLAYLISTS, JSON.stringify(playlists));
    } catch (e) {
      console.warn('Failed to save playlists:', e);
    }
  },

  createPlaylist(name: string, description?: string): Playlist {
    const playlists = this.getPlaylists();
    const newPl: Playlist = {
      id: `pl-${Date.now()}`,
      name,
      description: description || '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      itemIds: [],
    };
    playlists.push(newPl);
    this.savePlaylists(playlists);
    return newPl;
  },

  deletePlaylist(id: string): void {
    const playlists = this.getPlaylists().filter(p => p.id !== id);
    this.savePlaylists(playlists);
  },

  addToPlaylist(playlistId: string, mediaId: string): void {
    const playlists = this.getPlaylists();
    const pl = playlists.find(p => p.id === playlistId);
    if (pl && !pl.itemIds.includes(mediaId)) {
      pl.itemIds.push(mediaId);
      pl.updatedAt = Date.now();
      this.savePlaylists(playlists);
    }
  },

  removeFromPlaylist(playlistId: string, mediaId: string): void {
    const playlists = this.getPlaylists();
    const pl = playlists.find(p => p.id === playlistId);
    if (pl) {
      pl.itemIds = pl.itemIds.filter(id => id !== mediaId);
      pl.updatedAt = Date.now();
      this.savePlaylists(playlists);
    }
  },

  getBookmarks(mediaId?: string): Bookmark[] {
    try {
      const data = localStorage.getItem(KEYS.BOOKMARKS);
      const all: Bookmark[] = data ? JSON.parse(data) : [];
      if (mediaId) {
        return all.filter(b => b.mediaId === mediaId).sort((a, b) => a.position - b.position);
      }
      return all;
    } catch {
      return [];
    }
  },

  addBookmark(mediaId: string, mediaTitle: string, position: number, label?: string): Bookmark {
    const bookmarks = this.getBookmarks();
    const newBm: Bookmark = {
      id: `bm-${Date.now()}`,
      mediaId,
      mediaTitle,
      position: Math.floor(position),
      label: label || `At ${formatTime(position)}`,
      createdAt: Date.now(),
    };
    bookmarks.push(newBm);
    try {
      localStorage.setItem(KEYS.BOOKMARKS, JSON.stringify(bookmarks));
    } catch (e) {
      console.warn('Failed to save bookmark:', e);
    }
    return newBm;
  },

  deleteBookmark(id: string): void {
    const bookmarks = this.getBookmarks().filter(b => b.id !== id);
    localStorage.setItem(KEYS.BOOKMARKS, JSON.stringify(bookmarks));
  },

  getPreferences(): PlayerPreferences {
    try {
      const data = localStorage.getItem(KEYS.PREFERENCES);
      if (!data) return DEFAULT_PREFERENCES;
      return { ...DEFAULT_PREFERENCES, ...JSON.parse(data) };
    } catch {
      return DEFAULT_PREFERENCES;
    }
  },

  savePreferences(prefs: Partial<PlayerPreferences>): PlayerPreferences {
    const current = this.getPreferences();
    const updated = { ...current, ...prefs };
    try {
      localStorage.setItem(KEYS.PREFERENCES, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save preferences:', e);
    }
    return updated;
  },

  getEqualizer(): EqualizerSettings {
    try {
      const data = localStorage.getItem(KEYS.EQUALIZER);
      if (!data) return DEFAULT_EQUALIZER;
      return { ...DEFAULT_EQUALIZER, ...JSON.parse(data) };
    } catch {
      return DEFAULT_EQUALIZER;
    }
  },

  saveEqualizer(settings: EqualizerSettings): void {
    try {
      localStorage.setItem(KEYS.EQUALIZER, JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save equalizer:', e);
    }
  },
};

export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) {
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function formatFileSize(bytes: number): string {
  if (bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}
