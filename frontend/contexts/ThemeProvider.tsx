'use client';

import {createContext, ReactNode, useContext, useEffect, useState} from 'react';

type Theme = 'light' | 'dark';

const ThemeCtx = createContext<{
  theme: Theme;
  toggleTheme: () => void;
}>({ theme: 'light', toggleTheme: () => {} });

export function useTheme() {
  return useContext(ThemeCtx);
}

export function ThemeProvider({
                                children,
                                serverTheme = 'light',
                              }: {
  children: ReactNode;
  serverTheme?: Theme;
}) {
  // 1. Start with the value the server rendered (or light).
  const [theme, setTheme] = useState<Theme>(serverTheme);

  // 2. Once hydrated on the client, read the cookie
  useEffect(() => {
    const cookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('theme='))
      ?.split('=')[1] as Theme | undefined;

    setTheme(cookie ?? 'light');
  }, []);

  // 3. Whenever the theme changes, update the cookie + <html> class
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.cookie = `theme=${theme}; path=/; max-age=31536000`; // 1 year
  }, [theme]);

  const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));

  return (
    <ThemeCtx.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeCtx.Provider>
  );
}