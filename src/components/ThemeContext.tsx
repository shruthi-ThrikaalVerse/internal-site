// @ts-nocheck
import React, { createContext, useContext, useState, useEffect } from 'react';

const ACCENT_MAP = {
  orange: '#f37321',
  teal: '#2d6b7e',
  green: '#227548',
};

const ThemeContext = createContext();

// Apply theme synchronously when module loads (before React renders)
const applyThemeSync = () => {
  try {
    const mode = localStorage.getItem('themeMode') || 'dark';
    const accent = localStorage.getItem('themeAccent') || 'orange';
    const root = window.document.documentElement;

    root.classList.remove('light', 'dark');
    root.classList.add(mode);
    root.style.setProperty('--current-accent', ACCENT_MAP[accent] || ACCENT_MAP.orange);
  } catch (e) {
    // ignore storage errors
  }
};

// Apply theme immediately on module load
applyThemeSync();

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    try {
      return localStorage.getItem('themeMode') || 'dark';
    } catch (e) {
      return 'dark';
    }
  });

  const [accent, setAccentState] = useState(() => {
    try {
      return localStorage.getItem('themeAccent') || 'orange';
    } catch (e) {
      return 'orange';
    }
  });

  // Apply theme whenever mode or accent changes
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(mode);
    root.style.setProperty('--current-accent', ACCENT_MAP[accent] || ACCENT_MAP.orange);

    try {
      localStorage.setItem('themeMode', mode);
      localStorage.setItem('themeAccent', accent);
    } catch (e) {
      // ignore storage errors (private mode, SSR, etc.)
    }
  }, [mode, accent]);

  const toggleMode = () => setMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  const setAccent = (newAccent) => setAccentState(newAccent);

  return (
    <ThemeContext.Provider value={{ mode, accent, toggleMode, setAccent, accentHex: ACCENT_MAP[accent] }}>
      <div className="theme-transition">{children}</div>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};
