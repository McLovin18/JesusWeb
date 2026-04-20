"use client";
import React, { useEffect, useState } from "react";
import { themeManager } from "./themeManager";
import styles from "./ThemeToggle.module.css";

const ThemeToggle = () => {
  const [theme, setTheme] = useState("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    setMounted(true);
    setTheme(themeManager.getTheme());
    const handler = (e: any) => setTheme(e.detail?.theme || e.detail);
    window.addEventListener("theme-changed", handler);
    return () => window.removeEventListener("theme-changed", handler);
  }, []);

  const handleToggleTheme = () => {
    themeManager.toggleTheme();
    setTheme(themeManager.getTheme());
  };

  if (!mounted) return null;

  const isLight = theme === "light";

  return (
    <button
      onClick={handleToggleTheme}
      title={isLight ? "Cambiar a modo oscuro" : "Cambiar a modo claro"}
      className={`${styles.themeToggleSwitch} ${isLight ? styles.light : styles.dark}`}
      aria-label="Toggle theme"
    >
      {/* Light side */}
      <div className={`${styles.toggleSide} ${isLight ? styles.active : ""}`}>
        <svg className={styles.toggleIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="5" strokeWidth="2" />
          <line x1="12" y1="1" x2="12" y2="3" strokeWidth="2" strokeLinecap="round" />
          <line x1="12" y1="21" x2="12" y2="23" strokeWidth="2" strokeLinecap="round" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" strokeWidth="2" strokeLinecap="round" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" strokeWidth="2" strokeLinecap="round" />
          <line x1="1" y1="12" x2="3" y2="12" strokeWidth="2" strokeLinecap="round" />
          <line x1="21" y1="12" x2="23" y2="12" strokeWidth="2" strokeLinecap="round" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" strokeWidth="2" strokeLinecap="round" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>

      {/* Dark side */}
      <div className={`${styles.toggleSide} ${!isLight ? styles.active : ""}`}>
        <svg className={styles.toggleIcon} viewBox="0 0 24 24" fill="currentColor">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      </div>

      {/* Slider indicator */}
      <div className={`${styles.toggleSlider} ${isLight ? styles.light : styles.dark}`} />
    </button>
  );
};

export default ThemeToggle;
