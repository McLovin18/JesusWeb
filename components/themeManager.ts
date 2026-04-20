// Sistema de Temas - Paleta basada en Logos Jesus Oswaldo Checa
export const colors = {
  // Dark Mode - Logo Blanco
  dark: {
    primary: "#ffffff",      // Blanco puro
    accent: "#60a5fa",       // Azul brillante
    accentDark: "#3b82f6",   // Azul más oscuro
    bg: "#0a0a0a",           // Negro casi puro
    bgSecondary: "#1a1a1a",  // Gris muy oscuro
    text: "#ffffff",         // Texto blanco
    textSecondary: "#cbd5e1",// Gris claro para subtítulos
    border: "#333333",       // Bordes oscuros
    hover: "#2a2a2a",        // Hover overlay
    cardBg: "#1f1f1f",       // Card background
    navBg: "rgba(10, 10, 10, 0.95)",
  },
  
  // Light Mode - Logo Azul
  light: {
    primary: "#1e40af",      // Azul profundo (del logo)
    accent: "#2563eb",       // Azul medio
    accentLight: "#60a5fa",  // Azul claro
    bg: "#f8fafc",           // Fondo blanco grisáceo
    bgSecondary: "#ffffff",  // Blanco puro
    text: "#1e3a8a",         // Azul muy oscuro para texto
    textSecondary: "#475569",// Gris oscuro para subtítulos
    border: "#e2e8f0",       // Bordes claros
    hover: "#f1f5f9",        // Hover overlay
    cardBg: "#ffffff",       // Card background blanco
    navBg: "rgba(255, 255, 255, 0.95)",
  },

  // Colores Auxiliares
  status: {
    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444",
    info: "#3b82f6",
  },
};

export type ThemeName = 'light' | 'dark';
export type ThemeColors = {
  [key: string]: string;
};
export const themes: Record<ThemeName, ThemeColors> = {
  light: {
    bg: colors.light.bg,
    bgSecondary: colors.light.bgSecondary,
    text: colors.light.text,
    textSecondary: colors.light.textSecondary,
    border: colors.light.border,
    hover: colors.light.hover,
    navBg: colors.light.navBg,
    cardBg: colors.light.cardBg,
    dropdownBg: colors.light.bgSecondary,
    accent: colors.light.accent,
    accentLight: colors.light.accentLight,
    primary: colors.light.primary,
  },
  dark: {
    bg: colors.dark.bg,
    bgSecondary: colors.dark.bgSecondary,
    text: colors.dark.text,
    textSecondary: colors.dark.textSecondary,
    border: colors.dark.border,
    hover: colors.dark.hover,
    navBg: colors.dark.navBg,
    cardBg: colors.dark.cardBg,
    dropdownBg: colors.dark.bgSecondary,
    accent: colors.dark.accent,
    accentDark: colors.dark.accentDark,
    primary: colors.dark.primary,
  },
};

export class ThemeManager {
  currentTheme: string;
  constructor() {
    const isAdmin = typeof window !== "undefined" && window.location.pathname.startsWith('/admin');
    this.currentTheme = isAdmin ? 'light' : (this.getStoredTheme() || this.getSystemTheme());
    this.applyTheme(this.currentTheme);
  }
  getStoredTheme() {
    return typeof window !== "undefined" ? localStorage.getItem('tecno-theme') : null;
  }
  setStoredTheme(theme: string) {
    if (typeof window !== "undefined") {
      localStorage.setItem('tecno-theme', theme);
    }
  }
  getSystemTheme() {
    if (typeof window !== "undefined") {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  }
  applyTheme(theme: string) {
    this.currentTheme = theme;
    if (typeof document !== "undefined") {
      const html = document.documentElement;
      // No aplicar dark mode en rutas admin
      const isAdmin = typeof window !== "undefined" && window.location.pathname.startsWith('/admin');
      const finalTheme = isAdmin ? 'light' : theme;
      
      // Set dark class for Tailwind compatibility
      if (finalTheme === 'dark') {
        html.classList.add('dark');
      } else {
        html.classList.remove('dark');
      }
      // Set CSS variables for theme colors
      const themeColors: ThemeColors = themes[finalTheme as ThemeName];
      Object.entries(themeColors).forEach(([key, value]) => {
        html.style.setProperty(`--${key}`, String(value));
      });
    }
    this.setStoredTheme(theme);
    this.dispatchThemeChangeEvent();
  }
  toggleTheme() {
    const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.applyTheme(newTheme);
  }
  dispatchThemeChangeEvent() {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent('theme-changed', {
        detail: { theme: this.currentTheme }
      }));
    }
  }
  getTheme() {
    return this.currentTheme;
  }
  getThemeColors() {
    return themes[this.currentTheme as ThemeName];
  }
}

export const themeManager = (() => {
  if (typeof window === 'undefined') {
    // Return a dummy object for server-side rendering
    return {
      getTheme: () => 'light',
      toggleTheme: () => {},
      applyTheme: () => {},
      getThemeColors: () => themes.light,
      dispatchThemeChangeEvent: () => {},
    };
  }
  return new ThemeManager();
})();
