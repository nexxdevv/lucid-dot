import { BlurView } from "expo-blur"
import { LinearGradient } from "expo-linear-gradient"
import React from "react"
import { Animated, Dimensions, StyleSheet, Text, View } from "react-native" // Import Dimensions
import { useTheme } from "../../themes/ThemeContext" // Ensure this path is correct

const CARD_HEIGHT = 550
const CARD_WIDTH = Dimensions.get("window").width * 0.9 // Define card width based on screen size
const CARD_BORDER_RADIUS = 28

// Interfaces for data (from useHoldInteraction)
export interface Card {
  statement: string
  tags: string[]
}

// CardProps now simplified to consume values directly from the hook
interface CardProps {
  chargeProgress: Animated.Value
  currentCard: { statement: string; tags: string[] } | null
  glowOpacity: Animated.Value
  glowScale: Animated.Value
  cardOpacity: Animated.Value
  cardScale: Animated.Value
  cardTranslateY: Animated.Value
  cardTranslateX: Animated.Value // New prop from hook
  cardRotateZ: Animated.Value // New prop from hook
  flashOpacity: Animated.Value
  shadowRadiusInterpolate: Animated.AnimatedInterpolation<number>
  shadowOpacityInterpolate: Animated.AnimatedInterpolation<number>
  animatedElevation: Animated.AnimatedInterpolation<number>
}

export function Card({
  chargeProgress,
  currentCard,
  cardOpacity,
  cardScale,
  glowOpacity,
  glowScale,
  cardTranslateY,
  cardTranslateX,
  cardRotateZ,
  flashOpacity,
  shadowRadiusInterpolate,
  shadowOpacityInterpolate,
  animatedElevation
}: CardProps) {
  const { theme, isDarkMode } = useTheme()

  // Handle case where currentCard is null or statement is missing
  // This early return prevents errors if data isn't ready
  if (!currentCard || !currentCard.statement) {
    return null
  }

  // Interpolate rotation from a raw value (e.g., -20 to 20) to a degrees string
  // Ensure the input range matches what your `cardRotateZ` Animated.Value will output.
  // In useHoldInteraction, you're setting `toValue: 20 * flingDirection`, so an inputRange of -20 to 20 is appropriate.
  const rotateString = cardRotateZ.interpolate({
    inputRange: [-20, 20], // Reflects max rotation from useHoldInteraction
    outputRange: ["-20deg", "20deg"], // Actual CSS transform values
    extrapolate: "clamp" // Keep rotation within bounds
  })

  const statement = currentCard.statement // Now guaranteed to exist

  const gradientColors: [string, string, ...string[]] = isDarkMode
    ? [
        "rgba(255, 255, 255, 0.15)",
        "rgba(255, 255, 255, 0.05)",
        "rgba(255, 255, 255, 0.0)"
      ]
    : ["rgba(0, 0, 0, 0.08)", "rgba(0, 0, 0, 0.02)", "rgba(0, 0, 0, 0.0)"]

  const borderColor = isDarkMode
    ? "rgba(255, 255, 255, 0.2)"
    : "rgba(0, 0, 0, 0.1)"

  // The style object for the main card container (Animated.View)
  // This is where all the transform properties from the hook should be applied.
  const cardOuterStyle = {
    position: "absolute" as "absolute", // Explicitly set position
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    // Center the card on the screen. Adjust if you want it off-center initially.
    left: (Dimensions.get("window").width - CARD_WIDTH) / 2,
    top: (Dimensions.get("window").height - CARD_HEIGHT) / 1.8, // Adjust this as needed for vertical centering

    // Apply all animated transforms here
    opacity: cardOpacity,
    transform: [
      { scale: cardScale },
      { translateX: cardTranslateX }, // Horizontal movement
      { translateY: cardTranslateY }, // Vertical movement (if used in hook)
      { rotateZ: rotateString } // Rotation
    ],
    zIndex: 100 // Ensure it's above other elements like background
  }

  // The internal style for the card content (the BlurView or a regular View inside it)
  // This internal view should NOT have its own transform properties that conflict
  // with the outer Animated.View.
  const cardInnerStyle = {
    ...styles.cardContentBase, // Base styles for the inner card
    // backgroundColor: animatedBgColor,
    borderColor: borderColor,
    shadowOffset: { width: 0, height: animatedElevation }, // Shadow offset should likely use elevation if it's animated for depth
    shadowOpacity: shadowOpacityInterpolate,
    shadowRadius: shadowRadiusInterpolate,
    elevation: animatedElevation // Android elevation
  }

  // Animated style for the white flash overlay
  const flashOverlayStyle = {
    ...StyleSheet.absoluteFillObject,
    borderRadius: CARD_BORDER_RADIUS,
    opacity: flashOpacity
  }

  // Animated style for the blurry glow behind the card
  const glowStyle = {
    ...StyleSheet.absoluteFillObject,
    borderRadius: CARD_BORDER_RADIUS,
    backgroundColor: "transparent", // Glow comes from shadow
    shadowColor: isDarkMode ? "rgba(255, 255, 0, 1)" : "rgba(255, 165, 0, 1)", // Yellow/Orange glow
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: glowOpacity,
    shadowRadius: 100,
    elevation: 30, // For Android shadows
    transform: [{ scale: glowScale }]
  }

  return (
    // Outer Animated.View for all transformations (scale, translate, rotate)
    <Animated.View style={cardOuterStyle}>
      {/* The glowing element positioned behind the card */}
      <Animated.View style={glowStyle} pointerEvents="none" />

      {/* The BlurView that wraps the card content and internal animations */}
      <BlurView
        intensity={48}
        tint="light"
        // This BlurView takes up the full space defined by cardOuterStyle
        style={{
          ...StyleSheet.absoluteFillObject, // Make it fill its parent (cardOuterStyle's Animated.View)
          borderRadius: CARD_BORDER_RADIUS,
          overflow: "hidden" // Clip content to border radius
          // Do NOT apply transform properties here that are already on cardOuterStyle
        }}
      >
        <Animated.View style={cardInnerStyle}>
          {/* Optional: Keep soft linear gradient on top */}
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientOverlay}
          />

          {/* Container for the statement text */}
          <View style={styles.textContainer}>
            <Text style={[styles.statement, { color: theme.text }]}>
              {statement}
            </Text>
          </View>

          {/* White flash overlay for success animation */}
          <Animated.View style={flashOverlayStyle} pointerEvents="none" />
        </Animated.View>
      </BlurView>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  cardContentBase: {
    pointerEvents: "none", // Ensures touches pass through to underlying dot
    width: "100%", // Fills the BlurView
    height: "100%", // Fills the BlurView
    borderRadius: CARD_BORDER_RADIUS,
    padding: 36,
    justifyContent: "center",
    alignItems: "center", // Added to center text horizontally
    overflow: "hidden",
    borderWidth: 1.5,
    // Shadow properties are controlled by animated values and passed via style prop
    zIndex: 120, // Ensure card content is above glow and blur in terms of z-index
    backgroundColor: "transparent" // Will be overridden by animatedBgColor
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: CARD_BORDER_RADIUS
  },
  textContainer: {
    flex: 1,
    zIndex: 100 // Ensure text is above gradient
  },
  statement: {
    fontSize: 36,
    fontWeight: "700",
    lineHeight: 40,
    fontFamily: "SF-Pro-Display-Bold",
    textShadowColor: "rgba(0,0,0,0.15)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 2,
    marginBottom: 20
  }
})
