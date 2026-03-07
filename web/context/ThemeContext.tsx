"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light";

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>("dark");

    useEffect(() => {
        Promise.resolve().then(() => {
            // 1. Check local storage
            const savedTheme = localStorage.getItem("tagt-theme") as Theme;
            if (savedTheme) {
                setTheme(savedTheme);
                document.documentElement.className = savedTheme;
            } else {
                // 2. Check system preference
                const systemTheme = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
                setTheme(systemTheme);
                document.documentElement.className = systemTheme;
            }
        });
    }, []);

    const toggleTheme = () => {
        const nextTheme = theme === "dark" ? "light" : "dark";
        setTheme(nextTheme);
        localStorage.setItem("tagt-theme", nextTheme);
        document.documentElement.className = nextTheme;
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) throw new Error("useTheme must be used within a ThemeProvider");
    return context;
}
