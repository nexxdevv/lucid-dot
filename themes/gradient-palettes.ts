
export interface GradientPalette {
  name: string
  colorsLayer1: [string, string, ...string[]]
  colorsLayer2: [string, string, ...string[]]
  colorsLayer3: [string, string, ...string[]]
}

export const GradientPalettes = {
  sunriseSerenity: {
    name: "Sunrise Serenity",
    colorsLayer1: [
      "#FFDAC1",
      "#FFAB76",
      "#FF8E5E",
      "#FF7043" // example colors, replace as needed
    ],
    colorsLayer2: [
      "#B3E0FF", // Sky Blue
      "#81D4FA", // Light Cerulean
      "#4FC3F7", // Muted Cyan
      "#29B6F6" // example colors, replace as needed
    ],
    colorsLayer3: [
      "#E0F7FA", // Light Cyan / Aqua
      "#B2EBF2", // Pale Turquoise
      "#80DEEA", // Muted Teal
      "#4DD0E1" // example colors, replace as needed
    ]
  } as GradientPalette & { name: string },

  oceanBreezeHarmony: {
    name: "Ocean Breeze Harmony",
    colorsLayer1: [
      "#BBDEFB", // Light Blue
      "#90CAF9", // Sky Blue
      "#64B5F6", // Cerulean Blue
      "#42A5F5" /// example colors, replace as needed
    ],
    colorsLayer2: [
      "#C8E6C9", // Light Mint Green
      "#A5D6A7", // Pastel Green
      "#81C784", // Muted Jade
      "#66BB6A" //// example colors, replace as needed
    ],
    colorsLayer3: [
      "#E1BEE7", // Pale Lavender
      "#CE93D8", // Soft Amethyst
      "#BA68C8", // Muted Violet
      "#AB47BC" /// example colors, replace as needed
    ]
  } as GradientPalette & { name: string }
}
