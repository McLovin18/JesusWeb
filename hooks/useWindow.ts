import { useContext } from 'react';
import { WindowContext } from '@/context/WindowContext';

export function useWindow() {
  const context = useContext(WindowContext);

  if (!context) {
    throw new Error('useWindow must be used within WindowProvider');
  }

  return context;
}
