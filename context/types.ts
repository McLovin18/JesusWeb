import { WindowType, MinimizedWindow, WindowState, WindowPosition, WindowSize } from '@/types/window';

export interface WindowContextType {
  // Window state
  window: WindowState;
  minimizedWindows: MinimizedWindow[];

  // Actions
  openWindow: (type: WindowType) => void;
  closeWindow: () => void;
  toggleMaximize: () => void;
  minimizeWindow: () => void;
  restoreMinimized: (id: string) => void;

  // Position and size updates
  updateWindowPosition: (position: WindowPosition) => void;
  updateWindowSize: (size: WindowSize) => void;
}
