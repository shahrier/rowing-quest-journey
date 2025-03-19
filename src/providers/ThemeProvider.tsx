import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  console.log("🎨 ThemeProvider rendering", { defaultTheme, storageKey });
  
  // Get initial theme with fallback
  const getInitialTheme = (): Theme => {
    try {
      console.log("🔍 Getting initial theme from localStorage");
      const storedTheme = localStorage.getItem(storageKey);
      console.log("📊 Stored theme:", storedTheme);
      
      if (storedTheme && ["dark", "light", "system"].includes(storedTheme)) {
        console.log("✅ Using stored theme:", storedTheme);
        return storedTheme as Theme;
      }
    } catch (e) {
      console.warn("⚠️ Could not access localStorage for theme:", e);
    }
    
    console.log("ℹ️ Using default theme:", defaultTheme);
    return defaultTheme;
  };

  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [mounted, setMounted] = useState(false);

  // Apply theme to document
  useEffect(() => {
    console.log("🔄 Applying theme:", theme);
    const root = window.document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove("light", "dark");
    console.log("🧹 Removed existing theme classes");

    // Apply theme
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
      console.log("🖥️ System theme detected:", systemTheme);
      root.classList.add(systemTheme);
    } else {
      console.log("🎨 Adding theme class:", theme);
      root.classList.add(theme);
    }
    
    // Log the result
    console.log("📊 Current document classes:", root.className);
  }, [theme]);

  // Set mounted state after hydration
  useEffect(() => {
    console.log("🔄 ThemeProvider mounted effect running");
    setMounted(true);
    console.log("✅ ThemeProvider mounted state set to true");
    
    return () => {
      console.log("🧹 ThemeProvider cleanup");
    };
  }, []);

  // Save theme to localStorage
  const setThemeWithStorage = (newTheme: Theme) => {
    console.log("🔄 Setting new theme:", newTheme);
    try {
      localStorage.setItem(storageKey, newTheme);
      console.log("✅ Theme saved to localStorage");
    } catch (e) {
      console.warn("⚠️ Could not save theme to localStorage:", e);
    }
    setTheme(newTheme);
  };

  // Context value
  const value = {
    theme,
    setTheme: setThemeWithStorage,
  };

  // Log mounted state
  console.log("📊 ThemeProvider mounted state:", mounted);

  // Prevent flash of incorrect theme during SSR/hydration
  if (!mounted) {
    console.log("⏳ ThemeProvider not yet mounted, rendering hidden content");
    return (
      <div style={{ visibility: "hidden" }} data-testid="theme-provider-loading">
        {children}
      </div>
    );
  }

  console.log("🖌️ ThemeProvider rendering visible content with theme:", theme);
  return (
    <ThemeProviderContext.Provider {...props} value={value} data-testid="theme-provider">
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined) {
    console.error("❌ useTheme hook used outside of ThemeProvider");
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
};