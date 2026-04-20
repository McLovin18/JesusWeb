import React from 'react';
import styles from './Window.module.css';

interface TitlebarProps {
  title: string;
  isDragging: boolean;
  onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onClose: () => void;
  isMaximized?: boolean;
}

export function Titlebar({
  title,
  isDragging,
  onMouseDown,
  onMinimize,
  onMaximize,
  onClose,
  isMaximized = false,
}: TitlebarProps) {
  return (
    <div
      className={`${styles.titlebar} ${isDragging ? styles.dragging : ''}`}
      onMouseDown={onMouseDown}
    >
      <div className={styles.title}>{title}</div>
      <div className={styles.controls}>
        <button
          className={`${styles.winBtn} ${styles.winMin}`}
          onClick={onMinimize}
          title="Minimizar"
          aria-label="Minimizar ventana"
        >
          —
        </button>
        <button
          className={`${styles.winBtn} ${styles.winResize}`}
          onClick={onMaximize}
          title={isMaximized ? 'Restaurar tamaño' : 'Maximizar'}
          aria-label={isMaximized ? 'Restaurar tamaño de ventana' : 'Maximizar ventana'}
        >
          {isMaximized ? '❒' : '▢'}
        </button>
        <button
          className={`${styles.winBtn} ${styles.winClose}`}
          onClick={onClose}
          title="Cerrar"
          aria-label="Cerrar ventana"
        >
          ×
        </button>
      </div>
    </div>
  );
}
