'use client';

import React, { createContext, useCallback, useReducer } from 'react';
import { WindowType, MinimizedWindow, WindowState, WindowPosition, WindowSize } from '@/types/window';
import { WINDOW_CONTENT } from '@/content/windowContent';
import { WindowContextType } from './types';

// Default sizes for different window types
const DEFAULT_SIZES: Record<WindowType, WindowSize> = {
  servicios: { width: 880, height: 600 },
  sobre: { width: 880, height: 600 },
  tienda: { width: 1200, height: 700 },  // Larger for shop
  blogs: { width: 1200, height: 700 },   // Larger for blogs
};

const initialWindowState: WindowState = {
  isOpen: false,
  type: null,
  position: { left: 0, top: 0 },
  size: { width: 880, height: 600 },
  isMaximized: false,
  isMinimized: false,
};

type WindowAction =
  | { type: 'OPEN_WINDOW'; payload: WindowType }
  | { type: 'CLOSE_WINDOW' }
  | { type: 'TOGGLE_MAXIMIZE' }
  | { type: 'MINIMIZE_WINDOW' }
  | { type: 'UPDATE_POSITION'; payload: WindowPosition }
  | { type: 'UPDATE_SIZE'; payload: WindowSize };

type MinimizedAction =
  | { type: 'ADD_MINIMIZED'; payload: MinimizedWindow }
  | { type: 'REMOVE_MINIMIZED'; payload: string };

function windowReducer(state: WindowState, action: WindowAction): WindowState {
  switch (action.type) {
    case 'OPEN_WINDOW':
      return {
        ...state,
        isOpen: true,
        type: action.payload,
        isMinimized: false,
        size: DEFAULT_SIZES[action.payload],
      };
    case 'CLOSE_WINDOW':
      return {
        ...initialWindowState,
      };
    case 'TOGGLE_MAXIMIZE':
      return {
        ...state,
        isMaximized: !state.isMaximized,
      };
    case 'MINIMIZE_WINDOW':
      return {
        ...state,
        isMinimized: true,
        isOpen: false,
      };
    case 'UPDATE_POSITION':
      return {
        ...state,
        position: action.payload,
      };
    case 'UPDATE_SIZE':
      return {
        ...state,
        size: action.payload,
      };
    default:
      return state;
  }
}

function minimizedReducer(
  state: MinimizedWindow[],
  action: MinimizedAction
): MinimizedWindow[] {
  switch (action.type) {
    case 'ADD_MINIMIZED': {
      // Avoid duplicates - remove existing minimized window of same type
      const filtered = state.filter((w) => w.type !== action.payload.type);
      return [...filtered, action.payload];
    }
    case 'REMOVE_MINIMIZED':
      return state.filter((w) => w.id !== action.payload);
    default:
      return state;
  }
}

export const WindowContext = createContext<WindowContextType | undefined>(undefined);

export function WindowProvider({ children }: { children: React.ReactNode }) {
  const [window, dispatch] = useReducer(windowReducer, initialWindowState);
  const [minimizedWindows, dispatchMinimized] = useReducer(minimizedReducer, []);

  const openWindow = useCallback((type: WindowType) => {
    dispatch({ type: 'OPEN_WINDOW', payload: type });
  }, []);

  const closeWindow = useCallback(() => {
    dispatch({ type: 'CLOSE_WINDOW' });
  }, []);

  const toggleMaximize = useCallback(() => {
    dispatch({ type: 'TOGGLE_MAXIMIZE' });
  }, []);

  const minimizeWindow = useCallback(() => {
    if (!window.isOpen || !window.type) return;

    const windowContent = WINDOW_CONTENT[window.type];
    const minimized: MinimizedWindow = {
      id: `${Date.now()}-${Math.random()}`,
      title: windowContent.title,
      content: windowContent.content,
      description: windowContent.description,
      type: window.type,
    };

    dispatchMinimized({ type: 'ADD_MINIMIZED', payload: minimized });
    dispatch({ type: 'MINIMIZE_WINDOW' });
  }, [window.isOpen, window.type]);

  const restoreMinimized = useCallback((id: string) => {
    const minimized = minimizedWindows.find((w) => w.id === id);
    if (!minimized) return;

    dispatch({ type: 'OPEN_WINDOW', payload: minimized.type });
    dispatchMinimized({ type: 'REMOVE_MINIMIZED', payload: id });
  }, [minimizedWindows]);

  const updateWindowPosition = useCallback((position: WindowPosition) => {
    dispatch({ type: 'UPDATE_POSITION', payload: position });
  }, []);

  const updateWindowSize = useCallback((size: WindowSize) => {
    dispatch({ type: 'UPDATE_SIZE', payload: size });
  }, []);

  const value: WindowContextType = {
    window,
    minimizedWindows,
    openWindow,
    closeWindow,
    toggleMaximize,
    minimizeWindow,
    restoreMinimized,
    updateWindowPosition,
    updateWindowSize,
  };

  return (
    <WindowContext.Provider value={value}>
      {children}
    </WindowContext.Provider>
  );
}
