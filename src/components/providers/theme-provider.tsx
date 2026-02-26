'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const [theme, setTheme] = useState<Theme>('system');

    useEffect(() => {
        const root = window.document.documentElement;
        const initialTheme = (localStorage.getItem('csao_theme') as Theme) || 'system';
        setTheme(initialTheme);

        const applyTheme = (t: Theme) => {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            const activeTheme = t === 'system' ? systemTheme : t;

            root.setAttribute('data-theme', activeTheme);
            if (activeTheme === 'dark') {
                root.classList.add('dark');
            } else {
                root.classList.remove('dark');
            }
        };

        applyTheme(initialTheme);

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const listener = () => {
            if (localStorage.getItem('csao_theme') === 'system' || !localStorage.getItem('csao_theme')) {
                applyTheme('system');
            }
        };
        mediaQuery.addEventListener('change', listener);
        return () => mediaQuery.removeEventListener('change', listener);
    }, []);

    const handleSetTheme = (t: Theme) => {
        setTheme(t);
        localStorage.setItem('csao_theme', t);
        const root = window.document.documentElement;
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        const activeTheme = t === 'system' ? systemTheme : t;
        root.setAttribute('data-theme', activeTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme: handleSetTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error('useTheme must be used within a ThemeProvider');
    return context;
};
