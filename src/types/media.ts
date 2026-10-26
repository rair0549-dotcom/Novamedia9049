/**
 * Nova Media - Core Type Definitions
 * Models for media items, folders, playlists, bookmarks, and player configuration.
 */

export type MediaType = 'video' | 'audio';

export interface MediaItem {
  id: string;
  title: string;
  type: MediaType;
  url: string;
  thumbnailUrl: string;
  duration: number; // in seconds
  fileSize: number; // in bytes
  resolution?: string; // e.g. "1080p", "4K", "720p"
  width?: number;
  height?: number;
  mimeType: string;
  folderName: string;
  dateAdded: number; // timestamp
  lastPlayedTime?: number; // timestamp
  playbackPosition?: number; // in seconds
  isFavorite?: boolean;
  frameRate?: number;
  codec?: string;
  audioTrackCount?: number;
  hasSubtitles?: boolean;
}

export interface MediaFolder {
  id: string;
  name: string;
  itemCount: number;
  videoCount: number;
  audioCount: number;
  totalSize: number;
  latestDate: number;
  coverThumbnail?: string;
}

export interface Playlist {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  itemIds: string[];
  thumbnailUrl?: string;
  description?: string;
}

export interface Bookmark {
  id: string;
  mediaId: string;
  mediaTitle: string;
  position: number; // in seconds
  label: string;
  createdAt: number;
}

export type AspectRatioMode = 'fit' | 'fill' | 'zoom' | 'stretch';
export type DecoderMode = 'HW' | 'SW';
export type ScreenOrientation = 'auto' | 'portrait' | 'landscape';

export type ViewMode = 'all_folders' | 'files' | 'folders';
export type LayoutMode = 'list' | 'grid';

export type SortField =
  | 'title'
  | 'date'
  | 'played_time'
  | 'status'
  | 'length'
  | 'size'
  | 'resolution'
  | 'path'
  | 'frame_rate'
  | 'type';

export type SortOrder = 'asc' | 'desc'; // oldest / newest, or A-Z / Z-A

export interface SortConfig {
  field: SortField;
  order: SortOrder;
}

export interface QuickShortcutItem {
  id: string;
  label: string;
  iconName: string;
  enabled: boolean;
}

export interface EqualizerSettings {
  enabled: boolean;
  preset: string;
  bands: number[]; // dB gains for [-12 to +12] dB across 5 bands
  bassBoost: number; // 0 to 100
  virtualizer: number; // 0 to 100
}

export interface PlayerPreferences {
  controlTimeoutSec: number; // 3, 5, 8, 0 (never)
  playbackSpeed: number; // 0.5 to 2.0
  aspectRatio: AspectRatioMode;
  repeatMode: 'off' | 'one' | 'all';
  isShuffle: boolean;
  isMuted: boolean;
  volume: number; // 0 to 1
  brightness: number; // 0 to 1
  decoder: DecoderMode;
  audioOnlyBackground: boolean;
  nightMode: boolean;
  mirrorMode: boolean;
  abRepeat: {
    enabled: boolean;
    pointA: number | null;
    pointB: number | null;
  };
  enabledShortcuts: string[];
  theme: 'dark' | 'pure_black' | 'system';
  preferredLayout: LayoutMode;
  defaultSort: SortConfig;
  gestureSeekingEnabled: boolean;
  gestureBrightnessEnabled: boolean;
  gestureVolumeEnabled: boolean;
  gestureSpeedBoostEnabled: boolean;
}
