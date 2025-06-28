export interface GradientPalette {
  colorsLayer1: [string, string, ...string[]]
  colorsLayer2: [string, string, ...string[]]
  colorsLayer3: [string, string, ...string[]]
}

// Sunrise Serenity (Good for light themes or a warm, uplifting feel)
const sunriseSerenityGradient: GradientPalette = {
  colorsLayer1: [
    "#FFDAC1", // Light Peach / Apricot
    "#FFAB76", // Soft Coral
    "#FF8E5E", // Muted Orange
    "#FF7043" // Gentle Terracotta
  ],
  colorsLayer2: [
    "#B3E0FF", // Sky Blue
    "#81D4FA", // Light Cerulean
    "#4FC3F7", // Muted Cyan
    "#29B6F6" // Soft Azure
  ],
  colorsLayer3: [
    "#E0F7FA", // Light Cyan / Aqua
    "#B2EBF2", // Pale Turquoise
    "#80DEEA", // Muted Teal
    "#4DD0E1" // Calm Aqua
  ]
}

// Ocean Breeze Harmony (Good for light themes or a cool, refreshing feel)
const oceanBreezeHarmonyGradient: GradientPalette = {
  colorsLayer1: [
    "#BBDEFB", // Light Blue
    "#90CAF9", // Sky Blue
    "#64B5F6", // Cerulean Blue
    "#42A5F5" // Bright Blue
  ],
  colorsLayer2: [
    "#C8E6C9", // Light Mint Green
    "#A5D6A7", // Pastel Green
    "#81C784", // Muted Jade
    "#66BB6A" // Soft Emerald
  ],
  colorsLayer3: [
    "#E1BEE7", // Pale Lavender
    "#CE93D8", // Soft Amethyst
    "#BA68C8", // Muted Violet
    "#AB47BC" // Gentle Purple
  ]
}

export interface AppTheme {
  // Your existing properties (e.g., text, background, primary)
  text: string
  background: string
  primary: string
  button: string
  gradientPalette: GradientPalette
}

export const lightTheme: AppTheme = {
  background: "#FFFFFF",
  text: "#111111",
  primary: "#2196F3",
  button: "#817AC7",
  gradientPalette: sunriseSerenityGradient // Assign a default light theme gradient
}

export const darkTheme: AppTheme = {
  background: "#1E1E1E",
  text: "#FFFFFF",
  primary: "#2196F3",
  button: "#2196F3",
  gradientPalette: oceanBreezeHarmonyGradient // Assign a default dark theme gradient
}
