import { Injectable, signal, computed } from '@angular/core';

export type SoundTheme = 'simple_beep' | 'droplet' | 'indigo' | 'quack' | 'sosumi' | 'wild_eep';
export type DacQuality = '8bit' | '16bit';

export interface SoundConfig {
  volume: number;
  isMuted: boolean;
  soundTheme: SoundTheme;
  dacResampling: DacQuality;
}

@Injectable({
  providedIn: 'root'
})
export class SoundEffectsService {
  private audioCtx: AudioContext | null = null;
  private readonly STORAGE_KEY = 'system7_sound_config';

  // Reactive State Signals
  volume = signal<number>(80);
  isMuted = signal<boolean>(false);
  soundTheme = signal<SoundTheme>('indigo');
  dacResampling = signal<DacQuality>('16bit');

  // Computed 3-bit Macintosh Hardware Volume Level (0 to 7)
  macVolumeLevel = computed(() => Math.round((this.volume() / 100) * 7));

  constructor() {
    this.restoreConfig();
  }

  private restoreConfig(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const config: SoundConfig = JSON.parse(saved);
        if (typeof config.volume === 'number') this.volume.set(Math.max(0, Math.min(100, config.volume)));
        if (typeof config.isMuted === 'boolean') this.isMuted.set(config.isMuted);
        if (config.soundTheme) this.soundTheme.set(config.soundTheme);
        if (config.dacResampling) this.dacResampling.set(config.dacResampling);
      }
    } catch {
      // Ignore audio synthesis / localStorage errors
    }
  }

  private saveConfig(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      const config: SoundConfig = {
        volume: this.volume(),
        isMuted: this.isMuted(),
        soundTheme: this.soundTheme(),
        dacResampling: this.dacResampling()
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(config));
    } catch {
      // Ignore audio synthesis / localStorage errors
    }
  }

  setVolume(newVal: number): void {
    const clamped = Math.max(0, Math.min(100, Math.round(newVal)));
    this.volume.set(clamped);
    this.saveConfig();
  }

  toggleMute(): void {
    this.isMuted.set(!this.isMuted());
    this.saveConfig();
  }

  setSoundTheme(theme: SoundTheme): void {
    this.soundTheme.set(theme);
    this.saveConfig();
  }

  setDacResampling(dac: DacQuality): void {
    this.dacResampling.set(dac);
    this.saveConfig();
  }

  resetToDefaults(): void {
    this.volume.set(80);
    this.isMuted.set(false);
    this.soundTheme.set('indigo');
    this.dacResampling.set('16bit');
    this.saveConfig();
  }

  private getEffectiveGain(): number {
    if (this.isMuted()) return 0;
    return (this.volume() / 100) * 0.2; // Max 0.2 master gain
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  /**
   * System 7 Click Sound
   */
  playClick(): void {
    const masterGainVal = this.getEffectiveGain();
    if (masterGainVal === 0) return;

    const ctx = this.getAudioContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = this.dacResampling() === '8bit' ? 'square' : 'triangle';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.03);
      
      gain.gain.setValueAtTime(masterGainVal * 0.5, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.03);
    } catch {
      // Ignore audio synthesis / localStorage errors
    }
  }

  /**
   * System 7 Macintosh Quadra Chime / Success Sound
   */
  playSuccess(): void {
    const masterGainVal = this.getEffectiveGain();
    if (masterGainVal === 0) return;

    const ctx = this.getAudioContext();
    if (!ctx) return;
    try {
      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.05);
        gain.gain.setValueAtTime(masterGainVal, ctx.currentTime + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.05 + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.05);
        osc.stop(ctx.currentTime + idx * 0.05 + 0.15);
      });
    } catch {
      // Ignore audio synthesis / localStorage errors
    }
  }

  /**
   * System 7 Retro Macintosh Alert Sound Synthesizer (6 Themes)
   */
  playAlert(): void {
    const masterGainVal = this.getEffectiveGain();
    if (masterGainVal === 0) return;

    const ctx = this.getAudioContext();
    if (!ctx) return;

    const theme = this.soundTheme();
    try {
      if (theme === 'simple_beep') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        gain.gain.setValueAtTime(masterGainVal, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      } else if (theme === 'droplet') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1400, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(masterGainVal, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      } else if (theme === 'quack') {
        // Authentic System 7 Jim Reekes "Quack" Sound Replica
        const t = ctx.currentTime;
        const duration = 0.26;

        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        osc1.type = 'sawtooth';
        osc2.type = 'square';

        // Pitch Envelope: 360Hz -> 540Hz (0.04s) -> 260Hz (0.26s)
        osc1.frequency.setValueAtTime(360, t);
        osc1.frequency.linearRampToValueAtTime(540, t + 0.04);
        osc1.frequency.exponentialRampToValueAtTime(260, t + duration);

        osc2.frequency.setValueAtTime(540, t);
        osc2.frequency.linearRampToValueAtTime(810, t + 0.04);
        osc2.frequency.exponentialRampToValueAtTime(390, t + duration);

        // System 7 Nasal Duck Formant Bandpass Filter (1500Hz, Q=3.5)
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1500, t);
        filter.Q.setValueAtTime(3.5, t);

        // Gain Envelope
        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(masterGainVal * 1.2, t + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc1.start(t);
        osc2.start(t);
        osc1.stop(t + duration);
        osc2.stop(t + duration);
      } else if (theme === 'sosumi') {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        osc1.type = 'square';
        osc2.type = 'sawtooth';
        osc1.frequency.setValueAtTime(440, ctx.currentTime);
        osc2.frequency.setValueAtTime(660, ctx.currentTime);
        gain.gain.setValueAtTime(masterGainVal, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);
        osc1.start();
        osc2.start();
        osc1.stop(ctx.currentTime + 0.18);
        osc2.stop(ctx.currentTime + 0.18);
      } else if (theme === 'wild_eep') {
        const carrier = ctx.createOscillator();
        const modulator = ctx.createOscillator();
        const modGain = ctx.createGain();
        const mainGain = ctx.createGain();

        carrier.type = 'sine';
        modulator.type = 'sawtooth';
        carrier.frequency.setValueAtTime(900, ctx.currentTime);
        modulator.frequency.setValueAtTime(120, ctx.currentTime);

        modGain.gain.setValueAtTime(300, ctx.currentTime);
        modulator.connect(modGain);
        modGain.connect(carrier.frequency);

        mainGain.gain.setValueAtTime(masterGainVal, ctx.currentTime);
        mainGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14);

        carrier.connect(mainGain);
        mainGain.connect(ctx.destination);

        carrier.start();
        modulator.start();
        carrier.stop(ctx.currentTime + 0.14);
        modulator.stop(ctx.currentTime + 0.14);
      } else {
        // Indigo (Default)
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(masterGainVal, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.18);
      }
    } catch {
      // Ignore audio synthesis / localStorage errors
    }
  }

  /**
   * System 7 Floppy Disk Drive Head Seek Audio Cue
   */
  playDiskSeek(): void {
    const masterGainVal = this.getEffectiveGain();
    if (masterGainVal === 0) return;

    const ctx = this.getAudioContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(120, ctx.currentTime);
      osc.frequency.setValueAtTime(240, ctx.currentTime + 0.02);
      gain.gain.setValueAtTime(masterGainVal * 0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch {
      // Ignore audio synthesis / localStorage errors
    }
  }

  /**
   * PowerPC System 7 Boot Chime Audio Cue
   */
  playStartupChime(): void {
    const masterGainVal = this.getEffectiveGain();
    if (masterGainVal === 0) return;

    const ctx = this.getAudioContext();
    if (!ctx) return;
    try {
      const freqs = [220, 277.18, 329.63, 440]; // A3 Major Chord
      freqs.forEach(freq => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(masterGainVal * 0.8, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 1.2);
      });
    } catch {
      // Ignore audio synthesis / localStorage errors
    }
  }

  /**
   * Vintage Macintosh Sad Mac Death Chime (Descending Dissonance)
   */
  playSadMacChime(): void {
    const masterGainVal = this.getEffectiveGain();
    if (masterGainVal === 0) return;

    const ctx = this.getAudioContext();
    if (!ctx) return;
    try {
      const freqs = [349.23, 329.63, 311.13, 293.66, 277.18]; // F3, E3, Eb3, D3, C#3
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
        gain.gain.setValueAtTime(masterGainVal * 0.9, ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.25);
      });
    } catch {
      // Ignore audio synthesis / localStorage errors
    }
  }
}
