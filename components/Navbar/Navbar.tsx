'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useWindow } from '@/hooks/useWindow';
import { MinimizedMenu } from '@/components/MinimizedMenu/MinimizedMenu';
import ThemeToggle from '@/components/ThemeToggle';
import { getCurrentUser } from '@/lib/firebase-auth';
import styles from './Navbar.module.css';

export function Navbar() {
  const { openWindow, minimizedWindows } = useWindow();
  const [isMinimizedMenuOpen, setIsMinimizedMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    setMounted(true);
    
    // Get current user
    const checkUser = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    };
    checkUser();

    // Get current theme
    const currentTheme = (localStorage.getItem('tecno-theme') ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')) as 'light' | 'dark';
    setTheme(currentTheme);

    // Listen for theme changes
    const handleThemeChange = (e: Event) => {
      const newTheme = (e as CustomEvent).detail as 'light' | 'dark';
      setTheme(newTheme);
    };

    window.addEventListener('theme-changed', handleThemeChange);
    return () => window.removeEventListener('theme-changed', handleThemeChange);
  }, []);

  if (!mounted) return null;

  return (
    <header className={styles.siteHeader}>
      <nav className={styles.navbar}>
        <div className={styles.brand}>
          <Image
            src={theme === 'dark' ? '/dark.png' : '/light.png'}
            alt="Logo"
            width={40}
            height={40}
            style={{ height: 'auto' }}
          />
        </div>
        
        <ul className={styles.navList}>
          <li>
            <button
              id="btn-tienda"
              className={styles.navBtn}
              onClick={() => openWindow('tienda')}
            >
              🛍️ Mi Tienda
            </button>
          </li>
          <li>
            <button
              id="btn-blogs"
              className={styles.navBtn}
              onClick={() => openWindow('blogs')}
            >
              📝 Blogs
            </button>
          </li>
          <li>
            <button
              id="btn-servicios"
              className={styles.navBtn}
              onClick={() => openWindow('servicios')}
            >
              ⚡ Mis servicios
            </button>
          </li>
          <li>
            <button
              id="btn-sobre"
              className={styles.navBtn}
              onClick={() => openWindow('sobre')}
            >
              👤 Sobre mí
            </button>
          </li>
        </ul>

        <div className={styles.navActions}>
          <div className={styles.minimizedWrapper} style={{ position: 'relative' }}>
            <button
              id="minimized-toggle"
              className={styles.minimizedBtn}
              aria-label="Ventanas minimizadas"
              onClick={() => setIsMinimizedMenuOpen(!isMinimizedMenuOpen)}
              style={{
                display: minimizedWindows.length > 0 ? 'inline-flex' : 'none',
              }}
            >
              <span className={styles.minIcon}>▦</span>
              <span
                id="minimized-count"
                className={styles.badge}
                aria-hidden="true"
              >
                {minimizedWindows.length}
              </span>
            </button>
            
            <MinimizedMenu
              isOpen={isMinimizedMenuOpen}
              onClose={() => setIsMinimizedMenuOpen(false)}
            />
          </div>

          {mounted && <ThemeToggle />}
        </div>
      </nav>
    </header>
  );
}
