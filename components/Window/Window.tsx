'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useWindow } from '@/hooks/useWindow';
import { useDragWindow } from '@/hooks/useDragWindow';
import { WINDOW_CONTENT } from '@/content/windowContent';
import { Titlebar } from './Titlebar';
import styles from './Window.module.css';

export function Window() {
  const {
    window: windowState,
    closeWindow,
    toggleMaximize,
    minimizeWindow,
    updateWindowPosition,
    updateWindowSize,
  } = useWindow();

  const { isDragging, position, handleMouseDown, handleMouseMove, handleMouseUp } =
    useDragWindow({
      onPositionChange: updateWindowPosition,
      initialPosition: { left: 0, top: 80 },
    });

  const panelRef = useRef<HTMLDivElement>(null);
  const [isResizing, setIsResizing] = useState(false);
  const resizeStartRef = useRef({ x: 0, y: 0, width: 0, height: 0 });

  // Drag listeners
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  // Resize listeners
  useEffect(() => {
    const handleResizeMouseMove = (e: MouseEvent) => {
      if (!isResizing || !panelRef.current) return;

      const deltaX = e.clientX - resizeStartRef.current.x;
      const deltaY = e.clientY - resizeStartRef.current.y;

      const newWidth = Math.max(400, resizeStartRef.current.width + deltaX);
      const newHeight = Math.max(300, resizeStartRef.current.height + deltaY);

      updateWindowSize({ width: newWidth, height: newHeight });
    };

    const handleResizeMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleResizeMouseMove);
      window.addEventListener('mouseup', handleResizeMouseUp);

      return () => {
        window.removeEventListener('mousemove', handleResizeMouseMove);
        window.removeEventListener('mouseup', handleResizeMouseUp);
      };
    }
  }, [isResizing, updateWindowSize]);

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    resizeStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      width: windowState.size.width,
      height: windowState.size.height,
    };
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeWindow();
      }
    };

    if (windowState.isOpen) {
      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    }
  }, [windowState.isOpen, closeWindow]);

  if (!windowState.isOpen || !windowState.type) return null;

  const content = WINDOW_CONTENT[windowState.type];

  return (
    <div
      className={`${styles.subwindow} ${windowState.isOpen ? styles.open : ''}`}
      aria-hidden={!windowState.isOpen}
    >
      <div
        ref={panelRef}
        className={`${styles.subwindowPanel} ${
          windowState.isMaximized ? styles.maximized : ''
        } ${isResizing ? styles.resizing : ''}`}
        role="dialog"
        aria-modal="true"
        style={{
          left: windowState.isMaximized ? '50%' : `${position.left}px`,
          top: windowState.isMaximized ? '30px' : `${position.top}px`,
          transform: windowState.isMaximized ? 'translateX(-50%)' : 'none',
          width: windowState.isMaximized ? '96vw' : `${windowState.size.width}px`,
          height: windowState.isMaximized ? '92vh' : `${windowState.size.height}px`,
        }}
      >
        <Titlebar
          title={content.title}
          isDragging={isDragging}
          onMouseDown={handleMouseDown}
          onMinimize={minimizeWindow}
          onMaximize={toggleMaximize}
          onClose={closeWindow}
          isMaximized={windowState.isMaximized}
        />
        <div className={styles.subBody}>{content.content}</div>

        {/* Resize handle - bottom right corner */}
        {!windowState.isMaximized && (
          <div
            className={styles.resizeHandle}
            onMouseDown={handleResizeStart}
            title="Redimensionar ventana"
          />
        )}
      </div>
    </div>
  );
}
