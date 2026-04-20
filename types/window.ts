export type WindowType = 'servicios' | 'sobre' | 'tienda' | 'blogs';

export interface MinimizedWindow {
  id: string;
  title: string;
  content: React.ReactNode;
  description: string;
  type: WindowType;
}

export interface WindowPosition {
  left: number;
  top: number;
}

export interface WindowSize {
  width: number;
  height: number;
}

export interface WindowState {
  isOpen: boolean;
  type: WindowType | null;
  position: WindowPosition;
  size: WindowSize;
  isMaximized: boolean;
  isMinimized: boolean;
}
