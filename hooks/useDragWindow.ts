import { useCallback, useRef, useState } from 'react';
import { WindowPosition } from '@/types/window';

export interface UseDragWindowOptions {
  onPositionChange?: (position: WindowPosition) => void;
  initialPosition?: WindowPosition;
}

export function useDragWindow(options: UseDragWindowOptions = {}) {
  const { onPositionChange, initialPosition = { left: 0, top: 0 } } = options;
  
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState<WindowPosition>(initialPosition);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('.controls')) return;

    setIsDragging(true);
    dragOffsetRef.current = {
      x: e.clientX - position.left,
      y: e.clientY - position.top,
    };
  }, [position.left, position.top]);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;

      const newPosition: WindowPosition = {
        left: e.clientX - dragOffsetRef.current.x,
        top: e.clientY - dragOffsetRef.current.y,
      };

      setPosition(newPosition);
      onPositionChange?.(newPosition);
    },
    [isDragging, onPositionChange]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  return {
    isDragging,
    position,
    setPosition,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  };
}
