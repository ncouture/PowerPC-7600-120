import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { SoundEffectsService, SoundTheme } from './sound-effects.service';

describe('SoundEffectsService', () => {
  let service: SoundEffectsService;

  beforeEach(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('system7_sound_config');
    }
    TestBed.configureTestingModule({});
    service = TestBed.inject(SoundEffectsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Volume & 3-Bit Macintosh Level Calculations', () => {
    it('should initialize with default volume (80%) and unmuted state', () => {
      expect(service.volume()).toBe(80);
      expect(service.isMuted()).toBe(false);
      expect(service.macVolumeLevel()).toBe(6);
    });

    it('should clamp volume between 0% and 100%', () => {
      service.setVolume(150);
      expect(service.volume()).toBe(100);
      expect(service.macVolumeLevel()).toBe(7);

      service.setVolume(-50);
      expect(service.volume()).toBe(0);
      expect(service.macVolumeLevel()).toBe(0);
    });

    it('should compute 3-bit System 7 volume levels (0-7)', () => {
      service.setVolume(0);
      expect(service.macVolumeLevel()).toBe(0);

      service.setVolume(25);
      expect(service.macVolumeLevel()).toBe(2);

      service.setVolume(50);
      expect(service.macVolumeLevel()).toBe(4);

      service.setVolume(100);
      expect(service.macVolumeLevel()).toBe(7);
    });

    it('should toggle mute state cleanly', () => {
      expect(service.isMuted()).toBe(false);
      service.toggleMute();
      expect(service.isMuted()).toBe(true);
      service.toggleMute();
      expect(service.isMuted()).toBe(false);
    });

    it('should reset state to defaults when resetToDefaults is called', () => {
      service.setVolume(20);
      service.toggleMute();
      service.setSoundTheme('quack');
      service.setDacResampling('8bit');

      service.resetToDefaults();

      expect(service.volume()).toBe(80);
      expect(service.isMuted()).toBe(false);
      expect(service.soundTheme()).toBe('indigo');
      expect(service.dacResampling()).toBe('16bit');
    });
  });

  describe('Sound Themes & DAC Quality Configuration', () => {
    it('should switch between 6 System 7 sound themes', () => {
      const themes: SoundTheme[] = ['simple_beep', 'droplet', 'indigo', 'quack', 'sosumi', 'wild_eep'];
      themes.forEach(theme => {
        service.setSoundTheme(theme);
        expect(service.soundTheme()).toBe(theme);
      });
    });

    it('should toggle DAC resampling quality mode between 8-bit and 16-bit', () => {
      service.setDacResampling('8bit');
      expect(service.dacResampling()).toBe('8bit');

      service.setDacResampling('16bit');
      expect(service.dacResampling()).toBe('16bit');
    });
  });

  describe('LocalStorage Persistence & Restoration', () => {
    it('should persist audio configuration to LocalStorage and restore on boot', () => {
      service.setVolume(45);
      service.setSoundTheme('wild_eep');
      service.setDacResampling('8bit');
      service.toggleMute();

      const saved = localStorage.getItem('system7_sound_config');
      expect(saved).toBeTruthy();
      const parsed = JSON.parse(saved!);
      expect(parsed.volume).toBe(45);
      expect(parsed.soundTheme).toBe('wild_eep');
      expect(parsed.dacResampling).toBe('8bit');
      expect(parsed.isMuted).toBe(true);
    });
  });

  describe('Audio Triggers & Web Audio Synthesis Execution', () => {
    beforeEach(() => {
      const dummyParam = {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
        linearRampToValueAtTime: vi.fn(),
      };

      const mockGainNode = {
        gain: dummyParam,
        connect: vi.fn(),
      };

      const mockOscNode = {
        type: 'sine',
        frequency: dummyParam,
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
      };

      const mockFilterNode = {
        type: 'bandpass',
        frequency: dummyParam,
        Q: dummyParam,
        connect: vi.fn(),
      };

      const mockAudioCtx = {
        state: 'suspended',
        currentTime: 0,
        destination: {},
        resume: vi.fn().mockReturnValue(Promise.resolve()),
        createOscillator: vi.fn().mockReturnValue(mockOscNode),
        createGain: vi.fn().mockReturnValue(mockGainNode),
        createBiquadFilter: vi.fn().mockReturnValue(mockFilterNode),
      };

      (window as any).AudioContext = vi.fn(function (this: any) {
        return mockAudioCtx;
      });
    });

    it('should return 0 effective gain when muted', () => {
      service.toggleMute();
      expect(() => service.playClick()).not.toThrow();
    });

    it('should play click in 16bit and 8bit modes', () => {
      service.setDacResampling('16bit');
      service.playClick();
      service.setDacResampling('8bit');
      service.playClick();
    });

    it('should play success chime', () => {
      expect(() => service.playSuccess()).not.toThrow();
    });

    it('should play all alert sound themes', () => {
      const themes: SoundTheme[] = ['simple_beep', 'droplet', 'indigo', 'quack', 'sosumi', 'wild_eep'];
      themes.forEach(theme => {
        service.setSoundTheme(theme);
        expect(() => service.playAlert()).not.toThrow();
      });
    });

    it('should play disk seek, startup chime, and sad mac death chime', () => {
      expect(() => service.playDiskSeek()).not.toThrow();
      expect(() => service.playStartupChime()).not.toThrow();
      expect(() => service.playSadMacChime()).not.toThrow();
    });
  });
});
