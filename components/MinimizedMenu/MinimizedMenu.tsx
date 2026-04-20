'use client';

import React, { useEffect, useRef } from 'react';
import { useWindow } from '@/hooks/useWindow';
import styles from './MinimizedMenu.module.css';

interface MinimizedMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MinimizedMenu({ isOpen, onClose }: MinimizedMenuProps) {
  const { minimizedWindows, restoreMinimized } = useWindow();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isOpen, onClose]);

  return (
    <div
      ref={menuRef}
      className={`${styles.minimizedMenu} ${isOpen ? styles.open : ''}`}
      aria-hidden={!isOpen}
    >
      {minimizedWindows.length === 0 ? (
        <div className={styles.minimizedEmpty}>No hay ventanas minimizadas</div>
      ) : (
        minimizedWindows
          .slice()
          .reverse()
          .map((item) => (
            <button
              key={item.id}
              className={styles.minimizedItem}
              onClick={() => {
                restoreMinimized(item.id);
                onClose();
              }}
            >
              <div className={styles.miTitle}>{item.title}</div>
              <div className={styles.miDesc}>{item.description}</div>
            </button>
          ))
      )}
    </div>
  );
}
