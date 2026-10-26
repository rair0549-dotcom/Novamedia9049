/**
 * Nova Media - Web Audio Engine
 * Real Web Audio API 5-Band Parametric Equalizer, Bass Boost, and Audio Effects
 */

export interface EQBandInfo {
  frequency: number;
  type: BiquadFilterType;
  label: string;
}

export const EQ_BANDS: EQBandInfo[] = [
  { frequency: 60, type: 'lowshelf', label: '60 Hz' },
  { frequency: 230, type: 'peaking', label: '230 Hz' },
  { frequency: 910, type: 'peaking', label: '910 Hz' },
  { frequency: 3600, type: 'peaking', label: '3.6 kHz' },
  { frequency: 14000, type: 'highshelf', label: '14 kHz' },
];

export const EQ_PRESETS: Record<string, number[]> = {
  Flat: [0, 0, 0, 0, 0],
  'Bass Boost': [6, 4, 1, 0, -1],
  Vocal: [-2, 1, 4, 3, -1],
  Rock: [4, 2, -1, 2, 4],
  Pop: [-1, 2, 4, 2, -1],
  Classical: [4, 2, -1, 2, 3],
  Jazz: [3, 2, 0, 2, 3],
  Electronic: [5, 3, -1, 2, 4],
};

class AudioEngine {
  private ctx: AudioContext | null = null;
  private sourceMap = new WeakMap<HTMLMediaElement, MediaElementAudioSourceNode>();
  private currentElement: HTMLMediaElement | null = null;
  private filters: BiquadFilterNode[] = [];
  private bassBoostFilter: BiquadFilterNode | null = null;
  private gainNode: GainNode | null = null;
  private isConnected = false;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public attachMediaElement(element: HTMLMediaElement) {
    try {
      this.initContext();
      if (!this.ctx) return;

      if (this.currentElement === element && this.isConnected) {
        return;
      }
      this.currentElement = element;

      let source = this.sourceMap.get(element);
      if (!source) {
        source = this.ctx.createMediaElementSource(element);
        this.sourceMap.set(element, source);
      }

      // Create filter graph if not present
      if (this.filters.length === 0) {
        this.filters = EQ_BANDS.map(band => {
          const filter = this.ctx!.createBiquadFilter();
          filter.type = band.type;
          filter.frequency.value = band.frequency;
          filter.gain.value = 0;
          return filter;
        });

        this.bassBoostFilter = this.ctx.createBiquadFilter();
        this.bassBoostFilter.type = 'lowshelf';
        this.bassBoostFilter.frequency.value = 100;
        this.bassBoostFilter.gain.value = 0;

        this.gainNode = this.ctx.createGain();
      }

      // Disconnect previous chains
      try {
        source.disconnect();
      } catch {
        // ignore
      }

      // Build chain: Source -> Filter0 -> Filter1 -> Filter2 -> Filter3 -> Filter4 -> BassBoost -> Gain -> Destination
      let lastNode: AudioNode = source;
      for (const filter of this.filters) {
        lastNode.connect(filter);
        lastNode = filter;
      }

      if (this.bassBoostFilter) {
        lastNode.connect(this.bassBoostFilter);
        lastNode = this.bassBoostFilter;
      }

      if (this.gainNode) {
        lastNode.connect(this.gainNode);
        lastNode = this.gainNode;
      }

      lastNode.connect(this.ctx.destination);
      this.isConnected = true;
    } catch {
      // AudioContext could fail on cross-origin media if CORS headers are absent
      // Fallback silently without throwing to preserve video playback
      this.isConnected = false;
    }
  }

  public applyBands(gains: number[], enabled = true) {
    if (!this.ctx || this.filters.length === 0) return;
    this.filters.forEach((filter, idx) => {
      const val = enabled ? (gains[idx] ?? 0) : 0;
      filter.gain.setTargetAtTime(val, this.ctx!.currentTime, 0.05);
    });
  }

  public applyBassBoost(amount: number, enabled = true) {
    if (!this.ctx || !this.bassBoostFilter) return;
    // Map 0..100 to 0..8 dB gain
    const gainDb = enabled ? (amount / 100) * 8 : 0;
    this.bassBoostFilter.gain.setTargetAtTime(gainDb, this.ctx.currentTime, 0.05);
  }

  public setVolume(volume: number) {
    if (!this.ctx || !this.gainNode) return;
    this.gainNode.gain.setTargetAtTime(volume, this.ctx.currentTime, 0.05);
  }
}

export const audioEngine = new AudioEngine();
