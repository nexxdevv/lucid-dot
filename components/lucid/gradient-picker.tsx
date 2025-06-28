// src/components/GradientPicker.tsx
import { LinearGradient } from "expo-linear-gradient"
import React from "react"
import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { useTheme } from "../../themes/ThemeContext" // Adjust path if needed
import { GradientPalettes } from "../../themes/gradient-palettes"

interface GradientCircleProps {
  palette: (typeof GradientPalettes)[keyof typeof GradientPalettes] // Type for a single palette object
  onPress: () => void
  isSelected: boolean
}

const GradientCircle: React.FC<GradientCircleProps> = ({
  palette,
  onPress,
  isSelected
}) => {
  // We'll create a simplified "preview" of the gradient by combining a few key colors
  // from the first two layers. You can adjust this to your liking.
  const previewColorsRaw = [
    palette.colorsLayer1[0],
    palette.colorsLayer1[Math.floor(palette.colorsLayer1.length / 2)],
    palette.colorsLayer2[0],
    palette.colorsLayer2[Math.floor(palette.colorsLayer2.length / 2)],
    palette.colorsLayer3[0],
    palette.colorsLayer3[Math.floor(palette.colorsLayer3.length / 2)]
  ].filter(Boolean) // Remove any undefined if a layer has fewer colors

  // Ensure at least two colors for LinearGradient
  const previewColors: [string, string, ...string[]] =
    previewColorsRaw.length >= 2
      ? [previewColorsRaw[0], previewColorsRaw[1], ...previewColorsRaw.slice(2)]
      : ["#000", "#fff"] // fallback to two colors if not enough

  return (
    <TouchableOpacity onPress={onPress} style={styles.circleContainer}>
      <LinearGradient
        colors={previewColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }} // Diagonal gradient for a varied preview
        style={styles.gradientCircle}
      />
      {isSelected && (
        <View style={styles.selectedOverlay}>
          {/* You can use an icon here, e.g., <MaterialCommunityIcons name="check-circle" size={24} color="white" /> */}
          <Text style={styles.checkMark}>✓</Text>
        </View>
      )}
    </TouchableOpacity>
  )
}

export const GradientPicker: React.FC = () => {
  const { currentGradientPalette, setGradientPalette } = useTheme()

  return (
    <View style={styles.pickerContainer}>
      <GradientCircle
        palette={GradientPalettes.sunriseSerenity}
        onPress={() => setGradientPalette("sunriseSerenity")}
        isSelected={
          currentGradientPalette.name === GradientPalettes.sunriseSerenity.name
        }
      />
      <GradientCircle
        palette={GradientPalettes.oceanBreezeHarmony}
        onPress={() => setGradientPalette("oceanBreezeHarmony")}
        isSelected={
          currentGradientPalette.name ===
          GradientPalettes.oceanBreezeHarmony.name
        }
      />
      {/* Add more GradientCircle components here if you add more palettes */}
    </View>
  )
}

const CIRCLE_SIZE = 54
const BORDER_WIDTH = 2

const styles = StyleSheet.create({
  pickerContainer: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute", // Position it absolutely on the screen
    bottom: 80, // Adjust as needed
    zIndex: 1000,
    right: 8,
    gap: 8
  },
  circleContainer: {
    width: CIRCLE_SIZE + BORDER_WIDTH * 2, // Account for border if selected
    height: CIRCLE_SIZE + BORDER_WIDTH * 2,
    borderRadius: (CIRCLE_SIZE + BORDER_WIDTH * 2) / 2,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 10
    // The selection border will be managed by the overlay directly for better control
  },
  gradientCircle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    overflow: "hidden", // Ensure the gradient is clipped to the circle
    borderWidth: 2, // A subtle border to define the circle
    borderColor: "rgba(255,255,255,0.3)" // Light border
  },
  selectedOverlay: {
    ...StyleSheet.absoluteFillObject, // Covers the entire circleContainer
    borderRadius: (CIRCLE_SIZE + BORDER_WIDTH * 2) / 2,
    borderWidth: BORDER_WIDTH,
    borderColor: "white", // Bright border for selected
    justifyContent: "center",
    alignItems: "center",
    // We make the inner circle slightly smaller to create the border effect
    transform: [{ scale: 1.02 }] // Slightly scale up to ensure border is visible
  },
  checkMark: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    textShadowColor: "rgba(0,0,0,0.5)", // Adds a slight shadow for readability
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2
  }
})
