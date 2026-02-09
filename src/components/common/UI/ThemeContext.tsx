// @ts-nocheck
import React, { createContext, useContext, useState, useEffect } from 'react';

const ACCENT_MAP = {
  orange: '#f37321',
  teal: '#2d6b7e',
  green: '#227548',
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState('dark');
  const [accent, setAccentState] = useState('orange');

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(mode);
    root.style.setProperty('--current-accent', ACCENT_MAP[accent]);
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
