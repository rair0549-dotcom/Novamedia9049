/**
 * Nova Media - Immersive Full-Screen Video Player
 * High-performance Android Media3 ExoPlayer inspired video player with
 * customizable shortcut toolbar, gestures (brightness/volume/seek/speed boost),
 * aspect ratio engine, screenshot capture, A-B repeat, and timeline scrubber.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  Music,
  Subtitles,
  MoreVertical,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  RotateCw,
  Lock,
  Unlock,
  Maximize2,
  Minimize2,
  Tv,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Timer,
  Sliders,
  Activity,
  Repeat,
  Repeat1,
  Shuffle,
  Camera,
  Headphones,
  Pencil,
  Gauge,
  Check,
  FlipHorizontal,
  ChevronRight,
  PictureInPicture,
} from 'lucide-react';
import { AspectRatioMode, Bookmark, DecoderMode, EqualizerSettings, MediaItem, PlayerPreferences, Playlist } from '../../types/media';
import { audioEngine } from '../../services/audioEngine';
import { formatTime, storage } from '../../services/storage';
import { ALL_QUICK_SHORTCUTS } from '../../data/defaultMedia';
import { PlayerOptionsSheet } from './PlayerOptionsSheet';
import { EqualizerDialog } from './EqualizerDialog';
import { SleepTimerDialog } from './SleepTimerDialog';
import { VideoInfoModal } from './VideoInfoModal';
import { CustomizeShortcutsModal } from './CustomizeShortcutsModal';

interface VideoPlayerViewProps {
  media: MediaItem;
  queue: MediaItem[];
  onBack: () => void;
  onNext: () => void;
  onPrev: () => void;
  onSelectMedia: (item: MediaItem) => void;
  preferences: PlayerPreferences;
  onUpdatePreferences: (prefs: Partial<PlayerPreferences>) => void;
  equalizer: EqualizerSettings;
  onUpdateEqualizer: (eq: EqualizerSettings) => void;
  playlists: Playlist[];
  onAddToPlaylist: (playlistId: string, mediaId: string) => void;
  onCreatePlaylist: (name: string) => void;
  onToggleFavorite: (id: string) => void;
}

export const VideoPlayerView: React.FC<VideoPlayerViewProps> = ({
  media,
  queue,
  onBack,
  onNext,
  onPrev,
  onSelectMedia,
  preferences,
  onUpdatePreferences,
  equalizer,
  onUpdateEqualizer,
  playlists,
  onAddToPlaylist,
  onCreatePlaylist,
  onToggleFavorite,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Playback state
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(media.playbackPosition || 0);
  const [duration, setDuration] = useState<number>(media.duration || 0);
  const [bufferedTime, setBufferedTime] = useState<number>(0);
  const [isBuffering, setIsBuffering] = useState<boolean>(false);
  const [isControlsLocked, setIsControlsLocked] = useState<boolean>(false);
  const [areControlsVisible, setAreControlsVisible] = useState<boolean>(true);

  // Speed, Aspect, Decoder, Screen Rotation
  const [speed, setSpeed] = useState<number>(preferences.playbackSpeed || 1.0);
  const [aspectRatio, setAspectRatio] = useState<AspectRatioMode>(preferences.aspectRatio || 'fit');
  const [decoder, setDecoder] = useState<DecoderMode>(preferences.decoder || 'HW');
  const [screenRotationDeg, setScreenRotationDeg] = useState<number>(0);
  const [isNightMode, setIsNightMode] = useState<boolean>(preferences.nightMode || false);
  const [isMirrorMode, setIsMirrorMode] = useState<boolean>(preferences.mirrorMode || false);
  const [volume, setVolume] = useState<number>(preferences.volume ?? 1.0);
  const [isMuted, setIsMuted] = useState<boolean>(preferences.isMuted || false);
  const [brightness, setBrightness] = useState<number>(preferences.brightness ?? 1.0);

  // A-B repeat
  const [abRepeat, setAbRepeat] = useState<{ pointA: number | null; pointB: number | null; active: boolean }>({
    pointA: null,
    pointB: null,
    active: false,
  });

  // Sleep timer state
  const [sleepTimerSeconds, setSleepTimerSeconds] = useState<number | null>(null);

  // Modal dialog states
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [isEqualizerOpen, setIsEqualizerOpen] = useState(false);
  const [isSleepTimerOpen, setIsSleepTimerOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);

  // Gestures & Feedback HUD
  const [hudNotice, setHudNotice] = useState<{ title: string; subtitle?: string; icon?: React.ElementType } | null>(null);
  const [doubleTapFeedback, setDoubleTapFeedback] = useState<'left' | 'right' | null>(null);
  const [isSpeedBoostActive, setIsSpeedBoostActive] = useState<boolean>(false);
  const [flashScreenshot, setFlashScreenshot] = useState<boolean>(false);

  // Bookmarks
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  const hideControlsTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastTapTimeRef = useRef<number>(0);
  const gestureStartYRef = useRef<number | null>(null);
  const gestureStartXRef = useRef<number | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load bookmarks on mount/media change
  useEffect(() => {
    setBookmarks(storage.getBookmarks(media.id));
  }, [media.id]);

  // Connect Audio Engine
  useEffect(() => {
    if (videoRef.current) {
      audioEngine.attachMediaElement(videoRef.current);
      audioEngine.applyBands(equalizer.bands, equalizer.enabled);
      audioEngine.applyBassBoost(equalizer.bassBoost, equalizer.enabled);
    }
  }, [equalizer]);

  // Auto-hide controls timer
  const scheduleControlsHide = useCallback(() => {
    if (hideControlsTimerRef.current) {
      clearTimeout(hideControlsTimerRef.current);
    }
    if (!isControlsLocked && preferences.controlTimeoutSec > 0 && isPlaying) {
      hideControlsTimerRef.current = setTimeout(() => {
        setAreControlsVisible(false);
      }, preferences.controlTimeoutSec * 1000);
    }
  }, [isControlsLocked, isPlaying, preferences.controlTimeoutSec]);

  // Reset hide timer when controls become visible
  useEffect(() => {
    if (areControlsVisible && isPlaying) {
      scheduleControlsHide();
    }
    return () => {
      if (hideControlsTimerRef.current) clearTimeout(hideControlsTimerRef.current);
    };
  }, [areControlsVisible, isPlaying, scheduleControlsHide]);

  // Sleep timer interval
  useEffect(() => {
    if (sleepTimerSeconds === null) return;
    if (sleepTimerSeconds <= 0) {
      if (videoRef.current) {
        videoRef.current.pause();
        setIsPlaying(false);
      }
      setSleepTimerSeconds(null);
      triggerHud('Sleep Timer Expired', 'Playback paused automatically', Timer);
      return;
    }
    const timer = setInterval(() => {
      setSleepTimerSeconds(prev => (prev && prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [sleepTimerSeconds]);

  // Flash HUD notification
  const triggerHud = (title: string, subtitle?: string, icon?: React.ElementType) => {
    setHudNotice({ title, subtitle, icon });
    setTimeout(() => setHudNotice(null), 2000);
  };

  // Sync Video time updates
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    setCurrentTime(current);

    // Check A-B repeat
    if (abRepeat.active && abRepeat.pointA !== null && abRepeat.pointB !== null) {
      if (current >= abRepeat.pointB) {
        videoRef.current.currentTime = abRepeat.pointA;
      }
    }

    // Save playback position occasionally
    if (Math.floor(current) % 5 === 0) {
      storage.updateMediaProgress(media.id, current, videoRef.current.duration);
    }

    // Buffered progress
    if (videoRef.current.buffered.length > 0) {
      setBufferedTime(videoRef.current.buffered.end(videoRef.current.buffered.length - 1));
    }
  };

  const [hasPlaybackError, setHasPlaybackError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(media.url);

  useEffect(() => {
    setCurrentSrc(media.url);
    setHasPlaybackError(false);
  }, [media.url, media.id]);

  // Play / Pause with Promise catch
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          triggerHud('Playing', media.title, Play);
        })
        .catch(err => {
          console.warn('Play prevented or error:', err);
          setIsPlaying(false);
        });
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
      triggerHud('Paused', media.title, Pause);
    }
    scheduleControlsHide();
  };

  const handleVideoError = () => {
    if (currentSrc !== '/videos/sample_nature.mp4' && media.type === 'video') {
      setCurrentSrc('/videos/sample_nature.mp4');
    } else if (currentSrc !== '/audio/sample_audio1.mp3' && media.type === 'audio') {
      setCurrentSrc('/audio/sample_audio1.mp3');
    } else {
      setHasPlaybackError(true);
    }
  };

  // Seek
  const handleSeek = (seconds: number) => {
    if (!videoRef.current) return;
    const target = Math.max(0, Math.min(duration, seconds));
    videoRef.current.currentTime = target;
    setCurrentTime(target);
    scheduleControlsHide();
  };

  const seekRelative = (delta: number) => {
    if (!videoRef.current) return;
    const target = Math.max(0, Math.min(duration, videoRef.current.currentTime + delta));
    videoRef.current.currentTime = target;
    setCurrentTime(target);
    triggerHud(delta > 0 ? `+${delta}s` : `${delta}s`, formatTime(target), delta > 0 ? RotateCw : RotateCcw);
    scheduleControlsHide();
  };

  // Speed controls
  const speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0];
  const cycleSpeed = () => {
    const currentIdx = speeds.indexOf(speed);
    const nextSpeed = speeds[(currentIdx + 1) % speeds.length];
    setSpeed(nextSpeed);
    if (videoRef.current) videoRef.current.playbackRate = nextSpeed;
    onUpdatePreferences({ playbackSpeed: nextSpeed });
    triggerHud(`Speed ${nextSpeed}×`, undefined, Gauge);
  };

  // Aspect ratio cycles
  const aspectModes: AspectRatioMode[] = ['fit', 'fill', 'zoom', 'stretch'];
  const cycleAspectRatio = () => {
    const currentIdx = aspectModes.indexOf(aspectRatio);
    const nextAspect = aspectModes[(currentIdx + 1) % aspectModes.length];
    setAspectRatio(nextAspect);
    onUpdatePreferences({ aspectRatio: nextAspect });
    triggerHud(`Aspect: ${nextAspect.toUpperCase()}`, undefined, Tv);
  };

  // Decoder toggle
  const toggleDecoder = () => {
    const nextDecoder = decoder === 'HW' ? 'SW' : 'HW';
    setDecoder(nextDecoder);
    onUpdatePreferences({ decoder: nextDecoder });
    triggerHud(`Decoder: ${nextDecoder}`, nextDecoder === 'HW' ? 'Hardware Acceleration' : 'Software Fallback', Tv);
  };

  // Screen rotation
  const handleRotateScreen = () => {
    const nextDeg = (screenRotationDeg + 90) % 360;
    setScreenRotationDeg(nextDeg);
    triggerHud(`Screen Rotated ${nextDeg}°`, undefined, RotateCw);
  };

  // Screenshot capture via Canvas
  const handleCaptureScreenshot = () => {
    if (!videoRef.current) return;
    try {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 1280;
      canvas.height = videoRef.current.videoHeight || 720;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/png');
        // Flash screen
        setFlashScreenshot(true);
        setTimeout(() => setFlashScreenshot(false), 200);

        // Download trigger
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `nova_${media.title}_${Math.floor(currentTime)}s.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        triggerHud('Screenshot Captured', `Saved frame at ${formatTime(currentTime)}`, Camera);
      }
    } catch {
      triggerHud('Frame Capture Notice', 'Secure surface or CORS restriction active', Camera);
    }
  };

  // A-B Repeat setup
  const handleABRepeat = () => {
    if (!abRepeat.pointA) {
      setAbRepeat({ pointA: currentTime, pointB: null, active: false });
      triggerHud('Point A Set', `Starting at ${formatTime(currentTime)}`, Repeat);
    } else if (abRepeat.pointA !== null && abRepeat.pointB === null) {
      if (currentTime > abRepeat.pointA) {
        setAbRepeat({ pointA: abRepeat.pointA, pointB: currentTime, active: true });
        triggerHud('A-B Loop Active', `${formatTime(abRepeat.pointA)} ⇄ ${formatTime(currentTime)}`, Repeat1);
      } else {
        setAbRepeat({ pointA: currentTime, pointB: null, active: false });
        triggerHud('Point A Reset', `Starting at ${formatTime(currentTime)}`, Repeat);
      }
    } else {
      // Clear A-B repeat
      setAbRepeat({ pointA: null, pointB: null, active: false });
      triggerHud('A-B Repeat Cleared', 'Normal playback resumed', Repeat);
    }
  };

  // Handle Video Double-tap Seek & Single Tap Controls Toggle
  const handleSurfaceClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isControlsLocked) {
      setAreControlsVisible(true);
      return;
    }

    const now = Date.now();
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const isLeftHalf = clickX < rect.width / 2;

    if (now - lastTapTimeRef.current < 300) {
      // Double tap detected!
      if (isLeftHalf) {
        seekRelative(-10);
        setDoubleTapFeedback('left');
        setTimeout(() => setDoubleTapFeedback(null), 500);
      } else {
        seekRelative(10);
        setDoubleTapFeedback('right');
        setTimeout(() => setDoubleTapFeedback(null), 500);
      }
      lastTapTimeRef.current = 0;
    } else {
      lastTapTimeRef.current = now;
      // Single tap after delay toggles controls
      setTimeout(() => {
        if (lastTapTimeRef.current === now) {
          setAreControlsVisible(prev => !prev);
        }
      }, 300);
    }
  };

  // Long press for 2x speed boost
  const handleMouseDown = () => {
    if (isControlsLocked) return;
    longPressTimerRef.current = setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.playbackRate = 2.0;
        setIsSpeedBoostActive(true);
        triggerHud('2× Speed Boost', 'Release to restore normal speed', Gauge);
      }
    }, 450);
  };

  const handleMouseUp = () => {
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    if (isSpeedBoostActive) {
      if (videoRef.current) videoRef.current.playbackRate = speed;
      setIsSpeedBoostActive(false);
      triggerHud(`Speed Restored (${speed}×)`, undefined, Gauge);
    }
  };

  // Aspect ratio CSS class
  const getAspectClass = () => {
    switch (aspectRatio) {
      case 'fit':
        return 'object-contain';
      case 'fill':
        return 'object-cover';
      case 'zoom':
        return 'scale-125 object-cover';
      case 'stretch':
        return 'w-full h-full object-fill';
      default:
        return 'object-contain';
    }
  };

  // Toggle PiP
  const handlePiP = async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (e) {
      console.warn('PiP not available:', e);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full bg-black select-none overflow-hidden flex flex-col items-center justify-center transition-all ${
        isNightMode ? 'sepia-[0.35] brightness-90' : ''
      }`}
    >
      {/* Flash effect on screenshot */}
      {flashScreenshot && (
        <div className="absolute inset-0 bg-white z-[60] pointer-events-none animate-out fade-out duration-300" />
      )}

      {/* Primary Video Surface */}
      <div
        className="relative w-full h-full flex items-center justify-center cursor-pointer"
        onClick={handleSurfaceClick}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchEnd={handleMouseUp}
        style={{
          transform: `rotate(${screenRotationDeg}deg) ${isMirrorMode ? 'scaleX(-1)' : ''}`,
          filter: `brightness(${brightness})`,
        }}
      >
        {/* Media Surface: Video or Audio Visualizer */}
        {media.type === 'audio' ? (
          <div className="flex flex-col items-center justify-center p-8 text-center select-none pointer-events-none">
            <div className="relative w-44 h-44 rounded-full overflow-hidden border-4 border-[#2B3442] shadow-2xl mb-6">
              <img
                src={media.thumbnailUrl}
                alt={media.title}
                referrerPolicy="no-referrer"
                className={`w-full h-full object-cover ${isPlaying ? 'animate-[spin_12s_linear_infinite]' : ''}`}
              />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-[#090B10] border-2 border-[#62B5FF]" />
              </div>
            </div>

            <h3 className="text-xl font-bold text-[#F4F7FC] mb-1">{media.title}</h3>
            <p className="text-xs text-[#A5AFBE] mb-6">{media.folderName} · {media.codec || 'Audio'}</p>

            {/* Live Audio Equalizer Waveform Bars */}
            <div className="flex items-end gap-1.5 h-12">
              {[40, 70, 90, 50, 100, 60, 85, 45, 95, 65, 80, 55].map((h, i) => (
                <div
                  key={i}
                  className="w-1.5 bg-[#62B5FF] rounded-full transition-all duration-150"
                  style={{
                    height: isPlaying ? `${Math.max(15, (h * (0.6 + Math.random() * 0.4)))}%` : '20%',
                    opacity: isPlaying ? 0.9 : 0.4,
                  }}
                />
              ))}
            </div>

            <audio
              ref={videoRef as unknown as React.RefObject<HTMLAudioElement>}
              src={currentSrc}
              autoPlay
              playsInline
              onError={handleVideoError}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={() => {
                if (videoRef.current) {
                  setDuration(videoRef.current.duration);
                  videoRef.current.playbackRate = speed;
                  videoRef.current.muted = isMuted;
                }
              }}
              onEnded={() => onNext()}
            />
          </div>
        ) : (
          <video
            ref={videoRef}
            src={currentSrc}
            className={`max-w-full max-h-full transition-all duration-150 ${getAspectClass()}`}
            playsInline
            autoPlay
            onError={handleVideoError}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={() => {
              if (videoRef.current) {
                setDuration(videoRef.current.duration);
                if (media.playbackPosition && media.playbackPosition > 0) {
                  videoRef.current.currentTime = media.playbackPosition;
                }
                videoRef.current.playbackRate = speed;
                videoRef.current.muted = isMuted;
                videoRef.current.play().catch(() => {});
              }
            }}
            onWaiting={() => setIsBuffering(true)}
            onPlaying={() => setIsBuffering(false)}
            onEnded={() => {
              if (preferences.repeatMode === 'one' && videoRef.current) {
                videoRef.current.currentTime = 0;
                videoRef.current.play().catch(() => {});
              } else {
                onNext();
              }
            }}
          />
        )}

        {/* Playback Error Fallback Card */}
        {hasPlaybackError && (
          <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center p-6 text-center z-20 pointer-events-auto">
            <Tv className="w-12 h-12 text-[#FF7379] mb-3 opacity-80" />
            <h4 className="text-base font-bold text-[#F4F7FC] mb-1">Playback Error</h4>
            <p className="text-xs text-[#A5AFBE] max-w-sm mb-4">
              The media format or network stream could not be decoded. You can retry with hardware acceleration or select another video.
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setHasPlaybackError(false);
                  setCurrentSrc('/videos/sample_nature.mp4');
                }}
                className="px-4 py-2 text-xs font-semibold bg-[#62B5FF] text-[#090B10] rounded-xl hover:bg-[#83c6ff]"
              >
                Play Sample Video
              </button>
              <button
                onClick={onBack}
                className="px-4 py-2 text-xs font-medium text-[#A5AFBE] hover:text-[#F4F7FC]"
              >
                Return to Library
              </button>
            </div>
          </div>
        )}

        {/* Buffering Indicator */}
        {isBuffering && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none">
            <div className="w-12 h-12 rounded-full border-4 border-[#62B5FF]/30 border-t-[#62B5FF] animate-spin" />
          </div>
        )}

        {/* Double-tap seek visual feedback ripples */}
        {doubleTapFeedback === 'left' && (
          <div className="absolute left-12 w-24 h-24 rounded-full bg-black/60 border border-[#62B5FF] flex flex-col items-center justify-center text-[#62B5FF] pointer-events-none animate-in zoom-in-50 duration-150">
            <RotateCcw className="w-8 h-8" />
            <span className="text-xs font-bold font-mono mt-1">-10s</span>
          </div>
        )}
        {doubleTapFeedback === 'right' && (
          <div className="absolute right-12 w-24 h-24 rounded-full bg-black/60 border border-[#62B5FF] flex flex-col items-center justify-center text-[#62B5FF] pointer-events-none animate-in zoom-in-50 duration-150">
            <RotateCw className="w-8 h-8" />
            <span className="text-xs font-bold font-mono mt-1">+10s</span>
          </div>
        )}

        {/* Long Press 2X Speed Boost Indicator */}
        {isSpeedBoostActive && (
          <div className="absolute top-16 bg-[#62B5FF] text-[#090B10] px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase shadow-xl animate-pulse flex items-center gap-1.5 pointer-events-none">
            <Gauge className="w-4 h-4 stroke-[3]" />
            <span>2× Speed Boost</span>
          </div>
        )}

        {/* Central HUD Toast */}
        {hudNotice && (
          <div className="absolute top-20 bg-black/80 border border-[#2B3442] px-5 py-2.5 rounded-2xl backdrop-blur-md shadow-2xl flex items-center gap-3 text-white pointer-events-none animate-in fade-in zoom-in-95 duration-150">
            {hudNotice.icon && <hudNotice.icon className="w-5 h-5 text-[#62B5FF]" />}
            <div>
              <span className="text-sm font-semibold block">{hudNotice.title}</span>
              {hudNotice.subtitle && (
                <span className="text-xs text-[#A5AFBE] block">{hudNotice.subtitle}</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* OVERLAY CONTROLS (Top Bar, Quick Action Bar, Bottom Controls) */}
      <div
        className={`absolute inset-0 flex flex-col justify-between pointer-events-none transition-opacity duration-300 ${
          areControlsVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* TOP BAR */}
        <div className="w-full bg-gradient-to-b from-black/90 via-black/50 to-transparent p-4 pb-8 pointer-events-auto flex flex-col gap-3">
          {/* Main Top Header */}
          <div className="flex items-center justify-between">
            {/* Left: Back & Title */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={onBack}
                className="w-10 h-10 flex items-center justify-center rounded-full text-[#F4F7FC] hover:bg-white/10 active:scale-95 transition-all focus:outline-none"
                aria-label="Back to Library"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div className="flex flex-col min-w-0">
                <span className="text-base font-semibold text-[#F4F7FC] truncate">
                  {media.title}
                </span>
                <span className="text-xs text-[#A5AFBE] truncate">
                  {media.folderName} · {media.resolution || 'HD'} · {media.codec}
                </span>
              </div>
            </div>

            {/* Right: Audio track, Subtitles, HW decoder, More */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Audio Track */}
              <button
                onClick={() => triggerHud('Audio Track: Track 1', 'Stereo AAC 48kHz', Music)}
                className="w-9 h-9 flex items-center justify-center rounded-full text-[#F4F7FC] hover:bg-white/10 transition-colors"
                title="Audio Tracks"
              >
                <Music className="w-4 h-4" />
              </button>

              {/* Subtitles */}
              <button
                onClick={() => triggerHud('Subtitles: Embedded Subtitles 1', 'English [CC]', Subtitles)}
                className="w-9 h-9 flex items-center justify-center rounded-full text-[#F4F7FC] hover:bg-white/10 transition-colors"
                title="Subtitles"
              >
                <Subtitles className="w-4 h-4" />
              </button>

              {/* HW/SW Decoder button */}
              <button
                onClick={toggleDecoder}
                className="px-2.5 py-1 text-xs font-mono font-bold rounded-md bg-white/10 border border-white/20 text-[#62B5FF] hover:bg-white/20 transition-colors"
                title="Decoder mode"
              >
                {decoder}
              </button>

              {/* More options menu */}
              <button
                onClick={() => setIsOptionsOpen(true)}
                className="w-9 h-9 flex items-center justify-center rounded-full text-[#F4F7FC] hover:bg-white/10 transition-colors"
                title="More Options"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* QUICK SHORTCUTS TOOLBAR (Faithfully matching Screenshot 3 & 5) */}
          {!isControlsLocked && (
            <div className="flex items-center gap-3 overflow-x-auto pb-1 pt-1 scrollbar-none">
              {/* Night Mode */}
              {preferences.enabledShortcuts.includes('night_mode') && (
                <button
                  onClick={() => {
                    const next = !isNightMode;
                    setIsNightMode(next);
                    onUpdatePreferences({ nightMode: next });
                    triggerHud(next ? 'Night Mode: ON' : 'Night Mode: OFF', undefined, Moon);
                  }}
                  className="flex flex-col items-center gap-1 shrink-0 group focus:outline-none"
                >
                  <div
                    className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${
                      isNightMode
                        ? 'bg-[#A78BFA]/20 border-[#A78BFA] text-[#A78BFA]'
                        : 'bg-black/50 border-white/20 text-white group-hover:bg-white/20'
                    }`}
                  >
                    <Moon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] text-[#A5AFBE] group-hover:text-white">Night Mode</span>
                </button>
              )}

              {/* Customise Items */}
              {preferences.enabledShortcuts.includes('customise') && (
                <button
                  onClick={() => setIsCustomizeOpen(true)}
                  className="flex flex-col items-center gap-1 shrink-0 group focus:outline-none"
                >
                  <div className="w-10 h-10 rounded-full bg-black/50 border border-white/20 flex items-center justify-center text-white group-hover:bg-white/20 transition-all">
                    <Pencil className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] text-[#A5AFBE] group-hover:text-white">Customise</span>
                </button>
              )}

              {/* Shuffle */}
              {preferences.enabledShortcuts.includes('shuffle') && (
                <button
                  onClick={() => {
                    const next = !preferences.isShuffle;
                    onUpdatePreferences({ isShuffle: next });
                    triggerHud(next ? 'Shuffle: ON' : 'Shuffle: OFF', undefined, Shuffle);
                  }}
                  className="flex flex-col items-center gap-1 shrink-0 group focus:outline-none"
                >
                  <div
                    className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${
                      preferences.isShuffle
                        ? 'bg-[#62B5FF]/20 border-[#62B5FF] text-[#62B5FF]'
                        : 'bg-black/50 border-white/20 text-white group-hover:bg-white/20'
                    }`}
                  >
                    <Shuffle className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] text-[#A5AFBE] group-hover:text-white">Shuffle</span>
                </button>
              )}

              {/* Loop */}
              {preferences.enabledShortcuts.includes('loop') && (
                <button
                  onClick={() => {
                    const modes: ('off' | 'one' | 'all')[] = ['off', 'one', 'all'];
                    const nextMode = modes[(modes.indexOf(preferences.repeatMode) + 1) % modes.length];
                    onUpdatePreferences({ repeatMode: nextMode });
                    triggerHud(`Repeat: ${nextMode.toUpperCase()}`, undefined, Repeat);
                  }}
                  className="flex flex-col items-center gap-1 shrink-0 group focus:outline-none"
                >
                  <div
                    className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${
                      preferences.repeatMode !== 'off'
                        ? 'bg-[#62B5FF]/20 border-[#62B5FF] text-[#62B5FF]'
                        : 'bg-black/50 border-white/20 text-white group-hover:bg-white/20'
                    }`}
                  >
                    {preferences.repeatMode === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
                  </div>
                  <span className="text-[10px] text-[#A5AFBE] group-hover:text-white">Loop</span>
                </button>
              )}

              {/* Mute */}
              {preferences.enabledShortcuts.includes('mute') && (
                <button
                  onClick={() => {
                    const next = !isMuted;
                    setIsMuted(next);
                    if (videoRef.current) videoRef.current.muted = next;
                    onUpdatePreferences({ isMuted: next });
                    triggerHud(next ? 'Player Muted' : 'Player Unmuted', undefined, next ? VolumeX : Volume2);
                  }}
                  className="flex flex-col items-center gap-1 shrink-0 group focus:outline-none"
                >
                  <div
                    className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${
                      isMuted
                        ? 'bg-[#FF7379]/20 border-[#FF7379] text-[#FF7379]'
                        : 'bg-black/50 border-white/20 text-white group-hover:bg-white/20'
                    }`}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </div>
                  <span className="text-[10px] text-[#A5AFBE] group-hover:text-white">Mute</span>
                </button>
              )}

              {/* Sleep Timer */}
              {preferences.enabledShortcuts.includes('sleep_timer') && (
                <button
                  onClick={() => setIsSleepTimerOpen(true)}
                  className="flex flex-col items-center gap-1 shrink-0 group focus:outline-none relative"
                >
                  <div
                    className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${
                      sleepTimerSeconds !== null && sleepTimerSeconds > 0
                        ? 'bg-[#62B5FF]/20 border-[#62B5FF] text-[#62B5FF]'
                        : 'bg-black/50 border-white/20 text-white group-hover:bg-white/20'
                    }`}
                  >
                    <Timer className="w-4 h-4" />
                    {sleepTimerSeconds !== null && sleepTimerSeconds > 0 && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#62B5FF] rounded-full border border-black" />
                    )}
                  </div>
                  <span className="text-[10px] text-[#A5AFBE] group-hover:text-white">Sleep Timer</span>
                </button>
              )}

              {/* A-B Repeat */}
              {preferences.enabledShortcuts.includes('ab_repeat') && (
                <button
                  onClick={handleABRepeat}
                  className="flex flex-col items-center gap-1 shrink-0 group focus:outline-none"
                >
                  <div
                    className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${
                      abRepeat.active
                        ? 'bg-[#62B5FF]/20 border-[#62B5FF] text-[#62B5FF]'
                        : 'bg-black/50 border-white/20 text-white group-hover:bg-white/20'
                    }`}
                  >
                    <span className="text-xs font-bold font-mono">A-B</span>
                  </div>
                  <span className="text-[10px] text-[#A5AFBE] group-hover:text-white">A-B Repeat</span>
                </button>
              )}

              {/* Audio Effect */}
              {preferences.enabledShortcuts.includes('audio_effect') && (
                <button
                  onClick={() => {
                    const nextBass = equalizer.bassBoost > 0 ? 0 : 50;
                    const updated = { ...equalizer, bassBoost: nextBass };
                    onUpdateEqualizer(updated);
                    audioEngine.applyBassBoost(nextBass, updated.enabled);
                    triggerHud(nextBass > 0 ? 'Bass Boost: 50%' : 'Bass Boost: OFF', undefined, Activity);
                  }}
                  className="flex flex-col items-center gap-1 shrink-0 group focus:outline-none"
                >
                  <div
                    className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${
                      equalizer.bassBoost > 0
                        ? 'bg-[#5DD6A0]/20 border-[#5DD6A0] text-[#5DD6A0]'
                        : 'bg-black/50 border-white/20 text-white group-hover:bg-white/20'
                    }`}
                  >
                    <Activity className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] text-[#A5AFBE] group-hover:text-white">Audio Effect</span>
                </button>
              )}

              {/* Equalizer */}
              {preferences.enabledShortcuts.includes('equalizer') && (
                <button
                  onClick={() => setIsEqualizerOpen(true)}
                  className="flex flex-col items-center gap-1 shrink-0 group focus:outline-none"
                >
                  <div
                    className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${
                      equalizer.enabled
                        ? 'bg-[#62B5FF]/20 border-[#62B5FF] text-[#62B5FF]'
                        : 'bg-black/50 border-white/20 text-white group-hover:bg-white/20'
                    }`}
                  >
                    <Sliders className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] text-[#A5AFBE] group-hover:text-white">Equalizer</span>
                </button>
              )}

              {/* Speed */}
              {preferences.enabledShortcuts.includes('speed') && (
                <button
                  onClick={cycleSpeed}
                  className="flex flex-col items-center gap-1 shrink-0 group focus:outline-none"
                >
                  <div className="w-10 h-10 rounded-full bg-black/50 border border-white/20 flex items-center justify-center text-white group-hover:bg-white/20 transition-all">
                    <span className="text-xs font-bold font-mono">{speed}×</span>
                  </div>
                  <span className="text-[10px] text-[#A5AFBE] group-hover:text-white">Speed</span>
                </button>
              )}

              {/* Screenshot */}
              {preferences.enabledShortcuts.includes('screenshot') && (
                <button
                  onClick={handleCaptureScreenshot}
                  className="flex flex-col items-center gap-1 shrink-0 group focus:outline-none"
                >
                  <div className="w-10 h-10 rounded-full bg-black/50 border border-white/20 flex items-center justify-center text-white group-hover:bg-white/20 transition-all">
                    <Camera className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] text-[#A5AFBE] group-hover:text-white">Screenshot</span>
                </button>
              )}

              {/* Background Play */}
              {preferences.enabledShortcuts.includes('background') && (
                <button
                  onClick={() => {
                    const next = !preferences.audioOnlyBackground;
                    onUpdatePreferences({ audioOnlyBackground: next });
                    triggerHud(next ? 'Background Play: Enabled' : 'Background Play: Disabled', undefined, Headphones);
                  }}
                  className="flex flex-col items-center gap-1 shrink-0 group focus:outline-none"
                >
                  <div
                    className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${
                      preferences.audioOnlyBackground
                        ? 'bg-[#A78BFA]/20 border-[#A78BFA] text-[#A78BFA]'
                        : 'bg-black/50 border-white/20 text-white group-hover:bg-white/20'
                    }`}
                  >
                    <Headphones className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] text-[#A5AFBE] group-hover:text-white">Background</span>
                </button>
              )}

              {/* Screen Rotation */}
              {preferences.enabledShortcuts.includes('rotation') && (
                <button
                  onClick={handleRotateScreen}
                  className="flex flex-col items-center gap-1 shrink-0 group focus:outline-none"
                >
                  <div className="w-10 h-10 rounded-full bg-black/50 border border-white/20 flex items-center justify-center text-white group-hover:bg-white/20 transition-all">
                    <RotateCw className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] text-[#A5AFBE] group-hover:text-white">Rotation</span>
                </button>
              )}

              {/* Mirror Mode */}
              {preferences.enabledShortcuts.includes('mirror') && (
                <button
                  onClick={() => {
                    const next = !isMirrorMode;
                    setIsMirrorMode(next);
                    onUpdatePreferences({ mirrorMode: next });
                    triggerHud(next ? 'Mirror Mode: ON' : 'Mirror Mode: OFF', undefined, FlipHorizontal);
                  }}
                  className="flex flex-col items-center gap-1 shrink-0 group focus:outline-none"
                >
                  <div
                    className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${
                      isMirrorMode
                        ? 'bg-[#62B5FF]/20 border-[#62B5FF] text-[#62B5FF]'
                        : 'bg-black/50 border-white/20 text-white group-hover:bg-white/20'
                    }`}
                  >
                    <FlipHorizontal className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] text-[#A5AFBE] group-hover:text-white">Mirror</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* BOTTOM CONTROLS (Timeline Scrubber & Transport Buttons) */}
        <div className="w-full bg-gradient-to-t from-black/95 via-black/60 to-transparent p-4 pt-8 pointer-events-auto flex flex-col gap-2">
          {/* Timeline Scrubber */}
          {!isControlsLocked && (
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-medium text-white tabular-nums shrink-0 min-w-[42px]">
                {formatTime(currentTime)}
              </span>

              {/* Scrubber track */}
              <div className="relative flex-1 h-6 flex items-center cursor-pointer group">
                {/* Background track */}
                <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden relative">
                  {/* Buffered progress */}
                  <div
                    className="absolute top-0 bottom-0 left-0 bg-white/30 transition-all duration-300"
                    style={{ width: `${duration > 0 ? (bufferedTime / duration) * 100 : 0}%` }}
                  />
                  {/* Current progress */}
                  <div
                    className="absolute top-0 bottom-0 left-0 bg-[#62B5FF] transition-all"
                    style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                  />
                </div>

                {/* Range input for exact seeking */}
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  step="0.1"
                  value={currentTime}
                  onChange={e => handleSeek(Number(e.target.value))}
                  className="absolute inset-0 w-full opacity-0 cursor-pointer"
                  aria-label="Seek video position"
                />

                {/* Scrubber thumb */}
                <div
                  className="absolute w-3.5 h-3.5 rounded-full bg-[#62B5FF] shadow-lg pointer-events-none transform -translate-x-1/2 group-hover:scale-125 transition-transform"
                  style={{ left: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                />
              </div>

              <span className="text-xs font-mono font-medium text-white/80 tabular-nums shrink-0 min-w-[42px] text-right">
                {formatTime(duration)}
              </span>
            </div>
          )}

          {/* Transport Controls Row */}
          <div className="flex items-center justify-between pt-1">
            {/* Lock Control */}
            <button
              onClick={() => {
                const nextLocked = !isControlsLocked;
                setIsControlsLocked(nextLocked);
                triggerHud(nextLocked ? 'Controls Locked' : 'Controls Unlocked', undefined, nextLocked ? Lock : Unlock);
              }}
              className="w-10 h-10 flex items-center justify-center rounded-full text-white/80 hover:bg-white/10 transition-colors"
              title={isControlsLocked ? 'Unlock controls' : 'Lock controls'}
            >
              {isControlsLocked ? <Lock className="w-5 h-5 text-[#FFCA78]" /> : <Unlock className="w-5 h-5" />}
            </button>

            {/* Main Center Controls */}
            {!isControlsLocked ? (
              <div className="flex items-center gap-4 sm:gap-6">
                {/* Seek -10s */}
                <button
                  onClick={() => seekRelative(-10)}
                  className="w-10 h-10 flex items-center justify-center rounded-full text-white hover:bg-white/10 active:scale-90 transition-all"
                  title="Rewind 10 seconds"
                >
                  <div className="relative flex items-center justify-center">
                    <RotateCcw className="w-6 h-6 stroke-[1.8]" />
                    <span className="absolute text-[8px] font-bold font-mono">10</span>
                  </div>
                </button>

                {/* Previous */}
                <button
                  onClick={onPrev}
                  className="w-10 h-10 flex items-center justify-center rounded-full text-white hover:bg-white/10 active:scale-90 transition-all"
                  title="Previous video"
                >
                  <SkipBack className="w-5 h-5 fill-current" />
                </button>

                {/* Primary Play / Pause */}
                <button
                  onClick={togglePlay}
                  className="w-14 h-14 rounded-full bg-[#62B5FF] text-[#090B10] flex items-center justify-center shadow-xl shadow-[#62B5FF]/30 active:scale-95 hover:bg-[#83c6ff] transition-all"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? (
                    <Pause className="w-7 h-7 fill-current" />
                  ) : (
                    <Play className="w-7 h-7 fill-current ml-1" />
                  )}
                </button>

                {/* Next */}
                <button
                  onClick={onNext}
                  className="w-10 h-10 flex items-center justify-center rounded-full text-white hover:bg-white/10 active:scale-90 transition-all"
                  title="Next video"
                >
                  <SkipForward className="w-5 h-5 fill-current" />
                </button>

                {/* Seek +10s */}
                <button
                  onClick={() => seekRelative(10)}
                  className="w-10 h-10 flex items-center justify-center rounded-full text-white hover:bg-white/10 active:scale-90 transition-all"
                  title="Forward 10 seconds"
                >
                  <div className="relative flex items-center justify-center">
                    <RotateCw className="w-6 h-6 stroke-[1.8]" />
                    <span className="absolute text-[8px] font-bold font-mono">10</span>
                  </div>
                </button>
              </div>
            ) : (
              <span className="text-xs text-[#FFCA78] font-medium">Controls Locked (Tap Lock icon to release)</span>
            )}

            {/* Right Tools: Aspect Ratio & PiP/Fullscreen */}
            {!isControlsLocked && (
              <div className="flex items-center gap-1.5">
                {/* Aspect Ratio Toggle */}
                <button
                  onClick={cycleAspectRatio}
                  className="w-10 h-10 flex items-center justify-center rounded-full text-white/80 hover:bg-white/10 transition-colors"
                  title={`Aspect Ratio: ${aspectRatio}`}
                >
                  <Tv className="w-5 h-5" />
                </button>

                {/* Picture in Picture */}
                <button
                  onClick={handlePiP}
                  className="w-10 h-10 flex items-center justify-center rounded-full text-white/80 hover:bg-white/10 transition-colors"
                  title="Picture in Picture"
                >
                  <PictureInPicture className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODALS & SHEETS */}
      <PlayerOptionsSheet
        isOpen={isOptionsOpen}
        onClose={() => setIsOptionsOpen(false)}
        media={media}
        currentPosition={currentTime}
        isFavorite={Boolean(media.isFavorite)}
        onToggleFavorite={() => onToggleFavorite(media.id)}
        aspectRatio={aspectRatio}
        onChangeAspectRatio={setAspectRatio}
        onOpenInfo={() => {
          setIsOptionsOpen(false);
          setIsInfoOpen(true);
        }}
        onOpenEqualizer={() => {
          setIsOptionsOpen(false);
          setIsEqualizerOpen(true);
        }}
        onOpenCustomize={() => {
          setIsOptionsOpen(false);
          setIsCustomizeOpen(true);
        }}
        onOpenSleepTimer={() => {
          setIsOptionsOpen(false);
          setIsSleepTimerOpen(true);
        }}
        bookmarks={bookmarks}
        onAddBookmark={label => {
          const bm = storage.addBookmark(media.id, media.title, currentTime, label);
          setBookmarks(prev => [...prev, bm]);
        }}
        onDeleteBookmark={id => {
          storage.deleteBookmark(id);
          setBookmarks(prev => prev.filter(b => b.id !== id));
        }}
        onJumpToBookmark={pos => {
          handleSeek(pos);
          setIsOptionsOpen(false);
        }}
        playlists={playlists}
        onAddToPlaylist={playlistId => onAddToPlaylist(playlistId, media.id)}
        onCreatePlaylist={onCreatePlaylist}
        queue={queue}
        onSelectQueueItem={item => {
          onSelectMedia(item);
          setIsOptionsOpen(false);
        }}
      />

      <EqualizerDialog
        isOpen={isEqualizerOpen}
        onClose={() => setIsEqualizerOpen(false)}
        settings={equalizer}
        onUpdateSettings={onUpdateEqualizer}
      />

      <SleepTimerDialog
        isOpen={isSleepTimerOpen}
        onClose={() => setIsSleepTimerOpen(false)}
        activeSecondsRemaining={sleepTimerSeconds}
        onSetTimerMinutes={mins => {
          setSleepTimerSeconds(mins * 60);
          triggerHud(`Sleep Timer: ${mins}m`, `Pauses in ${mins} minutes`, Timer);
        }}
        onCancelTimer={() => {
          setSleepTimerSeconds(null);
          triggerHud('Sleep Timer Cancelled', undefined, Timer);
        }}
      />

      <VideoInfoModal
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
        media={media}
      />

      <CustomizeShortcutsModal
        isOpen={isCustomizeOpen}
        onClose={() => setIsCustomizeOpen(false)}
        enabledShortcuts={preferences.enabledShortcuts}
        onToggleShortcut={id => {
          const exists = preferences.enabledShortcuts.includes(id);
          const next = exists
            ? preferences.enabledShortcuts.filter(s => s !== id)
            : [...preferences.enabledShortcuts, id];
          onUpdatePreferences({ enabledShortcuts: next });
        }}
        onResetShortcuts={() => {
          const defaults = ALL_QUICK_SHORTCUTS.filter(s => s.enabled).map(s => s.id);
          onUpdatePreferences({ enabledShortcuts: defaults });
        }}
      />
    </div>
  );
};
