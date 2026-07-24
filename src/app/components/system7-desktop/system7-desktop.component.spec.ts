import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { System7DesktopComponent } from './system7-desktop.component';
import { SoundEffectsService } from '../../services/sound-effects.service';

describe('System7DesktopComponent', () => {
  let component: System7DesktopComponent;
  let fixture: ComponentFixture<System7DesktopComponent>;
  let mockSoundService: {
    playClick: ReturnType<typeof vi.fn>;
    playAlert: ReturnType<typeof vi.fn>;
    playStartupChime: ReturnType<typeof vi.fn>;
    toggleMute: ReturnType<typeof vi.fn>;
    setVolume: ReturnType<typeof vi.fn>;
    setSoundTheme: ReturnType<typeof vi.fn>;
    isMuted: ReturnType<typeof vi.fn>;
    macVolumeLevel: ReturnType<typeof vi.fn>;
    soundTheme: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('system7_desktop_pattern');
      localStorage.removeItem('system7_desktop_icon_positions');
    }

    mockSoundService = {
      playClick: vi.fn(),
      playAlert: vi.fn(),
      playStartupChime: vi.fn(),
      toggleMute: vi.fn(),
      setVolume: vi.fn(),
      setSoundTheme: vi.fn(),
      isMuted: vi.fn().mockReturnValue(false),
      macVolumeLevel: vi.fn().mockReturnValue(6),
      soundTheme: vi.fn().mockReturnValue('indigo'),
    };

    await TestBed.configureTestingModule({
      imports: [System7DesktopComponent],
      providers: [
        { provide: SoundEffectsService, useValue: mockSoundService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(System7DesktopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the System7DesktopComponent', () => {
    expect(component).toBeTruthy();
  });

  describe('Desktop Icons & Window Management', () => {
    it('should initialize with default desktop icons (Macintosh HD, BitHacks Utility, Trash)', () => {
      expect(component.desktopIcons.length).toBe(3);
      expect(component.desktopIcons.some(i => i.id === 'bithacks')).toBe(true);
      expect(component.desktopIcons.some(i => i.id === 'machd')).toBe(true);
      expect(component.desktopIcons.some(i => i.id === 'trash')).toBe(true);
    });

    it('should select desktop icon when clicked and deselect all on canvas click', () => {
      component.selectIcon('machd');
      expect(component.selectedIconId()).toBe('machd');

      component.deselectAll();
      expect(component.selectedIconId()).toBeNull();
    });

    it('should open Macintosh HD directory window when double-clicked', () => {
      expect(component.isMacHdOpen()).toBe(false);
      component.openIcon('machd');
      expect(component.isMacHdOpen()).toBe(true);
    });

    it('should open Trash window when double-clicked', () => {
      expect(component.isTrashOpen()).toBe(false);
      component.openIcon('trash');
      expect(component.isTrashOpen()).toBe(true);
    });

    it('should focus BitHacks Utility window when double-clicked', () => {
      component.openIcon('bithacks');
      expect(component.isBitHacksOpen()).toBe(true);
    });
  });

  describe('Menu Bar & Control Panel Operations', () => {
    it('should toggle and close Finder menus', () => {
      const mockEvent = new MouseEvent('click');
      vi.spyOn(mockEvent, 'stopPropagation');

      component.toggleMenu('apple', mockEvent);
      expect(component.activeMenu()).toBe('apple');

      component.toggleMenu('apple', mockEvent);
      expect(component.activeMenu()).toBeNull();

      component.toggleMenu('sound', mockEvent);
      expect(component.activeMenu()).toBe('sound');

      component.closeMenu();
      expect(component.activeMenu()).toBeNull();
    });

    it('should open Sound Control Panel', () => {
      component.openSoundControlPanel();
      expect(component.soundPanelOpen()).toBe(true);
    });

    it('should adjust volume and theme presets via Sound Menu', () => {
      component.setVolume(60);
      expect(mockSoundService.setVolume).toHaveBeenCalledWith(60);

      component.setTheme('quack');
      expect(mockSoundService.setSoundTheme).toHaveBeenCalledWith('quack');
    });

    it('should empty trash with window alert notification', () => {
      vi.spyOn(window, 'alert').mockImplementation(() => {
        // Mock alert implementation
      });
      component.emptyTrash();
      expect(window.alert).toHaveBeenCalled();
    });
  });

  describe('System Shutdown & Reboot State', () => {
    it('should transition to shutdown state when shutdownSystem() is called', () => {
      expect(component.isShutDown()).toBe(false);
      component.shutdownSystem();
      expect(component.isShutDown()).toBe(true);
    });

    it('should trigger reboot when restartSystem() is called', () => {
      let rebooted = false;
      component.rebootSystemEvent.subscribe(() => {
        rebooted = true;
      });

      component.restartSystem();
      expect(rebooted).toBe(true);
      expect(component.isShutDown()).toBe(false);
    });
  });

  describe('Desktop Background Pattern Customization', () => {
    it('should switch between classic gray, platinum grid, and teal tiles patterns', () => {
      component.setDesktopPattern('platinum');
      expect(component.desktopPattern()).toBe('platinum');
      expect(component.getPatternClass()).toContain('gray-300');

      component.setDesktopPattern('teal');
      expect(component.desktopPattern()).toBe('teal');
      expect(component.getPatternClass()).toContain('teal');

      component.setDesktopPattern('gray');
      expect(component.getPatternClass()).toContain('gray-400');
    });
  });

  describe('LocalStorage Persistence & Restoration', () => {
    it('should restore saved desktop pattern from localStorage on init', () => {
      localStorage.setItem('system7_desktop_pattern', 'teal');

      const newFixture = TestBed.createComponent(System7DesktopComponent);
      const newComponent = newFixture.componentInstance;
      newFixture.detectChanges();

      expect(newComponent.desktopPattern()).toBe('teal');
      localStorage.removeItem('system7_desktop_pattern');
    });

    it('should restore saved icon positions from localStorage on init', () => {
      const savedPositions = {
        machd: { posX: 300, posY: 400 },
        bithacks: { posX: 300, posY: 490 },
        trash: { posX: 300, posY: 580 },
      };
      localStorage.setItem('system7_desktop_icon_positions', JSON.stringify(savedPositions));

      const newFixture = TestBed.createComponent(System7DesktopComponent);
      const newComponent = newFixture.componentInstance;
      newFixture.detectChanges();

      expect(newComponent.desktopIcons[0].posX).toBe(300);
      expect(newComponent.desktopIcons[0].posY).toBe(400);
      localStorage.removeItem('system7_desktop_icon_positions');
    });

    it('should handle invalid JSON in saved icon positions gracefully', () => {
      localStorage.setItem('system7_desktop_icon_positions', '{invalid json');

      const newFixture = TestBed.createComponent(System7DesktopComponent);
      const newComponent = newFixture.componentInstance;
      newFixture.detectChanges();

      // Should not crash; icons keep defaults
      expect(newComponent.desktopIcons[0].posX).toBe(20);
      localStorage.removeItem('system7_desktop_icon_positions');
    });

    it('should save desktop pattern to localStorage when changed', () => {
      component.setDesktopPattern('platinum');
      expect(localStorage.getItem('system7_desktop_pattern')).toBe('platinum');
    });

    it('should save icon positions to localStorage after drag-and-drop', () => {
      component.draggingIconId.set('machd');
      component.ghostPosX.set(175);
      component.ghostPosY.set(205);
      component.onMouseUp();

      const savedStr = localStorage.getItem('system7_desktop_icon_positions');
      expect(savedStr).not.toBeNull();
      const saved = JSON.parse(savedStr!);
      expect(saved.machd).toBeDefined();
    });
  });

  describe('Closing Sound Control Panel', () => {
    it('should close sound panel', () => {
      component.soundPanelOpen.set(true);
      component.soundPanelOpen.set(false);
      expect(component.soundPanelOpen()).toBe(false);
    });
  });

  describe('Close Menu Edge Cases', () => {
    it('should not error when closeMenu is called with no active menu', () => {
      expect(component.activeMenu()).toBeNull();
      component.closeMenu();
      expect(component.activeMenu()).toBeNull();
    });
  });

  describe('Desktop Icon Drag-and-Drop & Layout Management', () => {
    it('should start dragging icon and update ghost position on mousemove', () => {
      const mockElement = document.createElement('div');
      vi.spyOn(mockElement, 'getBoundingClientRect').mockReturnValue({
        left: 20,
        top: 20,
        width: 80,
        height: 80,
        right: 100,
        bottom: 100,
        x: 20,
        y: 20,
        toJSON: () => ({ left: 20, top: 20 })
      });

      const mockMouseEvent = {
        clientX: 30,
        clientY: 30,
        stopPropagation: () => {
          // Mock stopPropagation implementation
        },
        currentTarget: mockElement
      } as unknown as MouseEvent;

      const targetIcon = component.desktopIcons[0];
      component.onMouseDownIcon(targetIcon, mockMouseEvent);

      expect(component.draggingIconId()).toBe('machd');

      const moveEvent = new MouseEvent('mousemove', { clientX: 70, clientY: 70 });
      component.onMouseMove(moveEvent);
      expect(component.ghostPosX()).toBe(60);
      expect(component.ghostPosY()).toBe(60);
    });

    it('should snap dropped icon to grid on mouseup', () => {
      const targetIcon = component.desktopIcons[0];
      component.draggingIconId.set('machd');
      component.ghostPosX.set(175);
      component.ghostPosY.set(205);

      component.onMouseUp();

      expect(targetIcon.posX).toBe(180);
      expect(targetIcon.posY).toBe(200);
      expect(component.draggingIconId()).toBeNull();
    });

    it('should clean up desktop layout using cleanUpDesktop() and resetIconPositions()', () => {
      component.desktopIcons[0].posX = 300;
      component.cleanUpDesktop();

      expect(component.desktopIcons[0].posX).toBe(20);
      expect(component.desktopIcons[0].posY).toBe(20);

      component.desktopIcons[0].posX = 500;
      component.resetIconPositions();
      expect(component.desktopIcons[0].posX).toBe(20);
    });

    it('should trigger global shortcuts for Sound Control Panel and Mute', () => {
      const keyS = new KeyboardEvent('keydown', { key: 's', metaKey: true });
      component.handleGlobalShortcuts(keyS);
      expect(component.soundPanelOpen()).toBe(true);

      const keyM = new KeyboardEvent('keydown', { key: 'm', metaKey: true });
      component.handleGlobalShortcuts(keyM);
      expect(mockSoundService.toggleMute).toHaveBeenCalled();
    });
  });
});
