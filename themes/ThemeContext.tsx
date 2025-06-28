// src/context/ThemeContext.tsx
import React, { createContext, useContext, useState, ReactNode } from "react"
import { useColorScheme } from "react-native"
import { lightTheme, darkTheme, AppTheme } from "./themes" // Your existing themes
import { GradientPalettes, GradientPalette } from './gradient-palettes'; // NEW: Import gradient palettes

interface ThemeContextType {
  theme: AppTheme;
  isDarkMode: boolean;
  toggleTheme: () => void;
  currentGradientPalette: GradientPalette; // NEW: The currently active gradient palette
  setGradientPalette: (paletteName: keyof typeof GradientPalettes) => void; // NEW: Function to change it
}

const ThemeContext = createContext<ThemeContextType>({
  theme: lightTheme,
  isDarkMode: false,
  toggleTheme: () => {},
  currentGradientPalette: GradientPalettes.sunriseSerenity, // Default gradient
  setGradientPalette: () => {},
})

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const colorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(colorScheme === "dark");
  const [selectedGradientPaletteName, setSelectedGradientPaletteName] = useState<keyof typeof GradientPalettes>('sunriseSerenity'); // NEW state for gradient

  const theme = isDarkMode ? darkTheme : lightTheme;
  const currentGradientPalette = GradientPalettes[selectedGradientPaletteName]; // Resolve the current gradient object

  const toggleTheme = () => setIsDarkMode((prev) => !prev);
  const setGradientPalette = (paletteName: keyof typeof GradientPalettes) => {
    setSelectedGradientPaletteName(paletteName);
  };

  return (
    <ThemeContext.Provider value={{
      theme,
      isDarkMode,
      toggleTheme,
      currentGradientPalette, // NEW: Provide current gradient
      setGradientPalette,     // NEW: Provide setter
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext)