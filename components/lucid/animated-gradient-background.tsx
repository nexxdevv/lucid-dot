import { LinearGradient } from "expo-linear-gradient"
import React, { useEffect, useRef } from "react"
import { Animated, Easing, StyleSheet } from "react-native"
import { useTheme } from "../../themes/ThemeContext"

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient)

interface AnimatedGradientBackgroundProps {
  progress: Animated.Value // Ensure progress is an Animated.Value, not Animated.AnimatedInterpolation<number>
  panX: Animated.Value
  panY: Animated.Value
}

export function AnimatedGradientBackground({
  progress,
  panX,
  panY
}: AnimatedGradientBackgroundProps) {
  const { currentGradientPalette } = useTheme() // Access the current gradient palette directly
  const translate1 = useRef(new Animated.Value(0)).current // Controls layer 1 position
  const translate2 = useRef(new Animated.Value(0)).current // Controls layer 2 position
  const rotateValue = useRef(new Animated.Value(0)).current // For subtle background rotation
  const opacityPulse1 = useRef(new Animated.Value(0)).current // For subtle opacity pulse on layer 1
  const opacityPulse2 = useRef(new Animated.Value(0)).current // For subtle opacity pulse on layer 2

  const { theme } = useTheme()

  useEffect(() => {
    // Animation for first gradient layer (slower, fluid movement)
    Animated.loop(
      Animated.sequence([
        Animated.timing(translate1, {
          toValue: 1,
          duration: 8000, // Slower duration for a more ethereal feel
          easing: Easing.inOut(Easing.quad), // Quad easing for smoother acceleration/deceleration
          useNativeDriver: false
        }),
        Animated.timing(translate1, {
          toValue: 0,
          duration: 8000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: false
        })
      ])
    ).start()

    // Animation for second gradient layer (faster, more energetic movement)
    Animated.loop(
      Animated.sequence([
        Animated.timing(translate2, {
          toValue: 1,
          duration: 6000, // Faster duration for a distinct rhythm
          easing: Easing.inOut(Easing.cubic), // Cubic easing for a slightly more pronounced curve
          useNativeDriver: false
        }),
        Animated.timing(translate2, {
          toValue: 0,
          duration: 6000,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: false
        })
      ])
    ).start()

    // Subtle background rotation
    Animated.loop(
      Animated.sequence([
        Animated.timing(rotateValue, {
          toValue: 1,
          duration: 12000, // Very slow rotation
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false
        }),
        Animated.timing(rotateValue, {
          toValue: 0,
          duration: 12000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false
        })
      ])
    ).start()

    // Opacity pulse for Layer 1 (subtle shimmer)
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacityPulse1, {
          toValue: 1,
          duration: 4000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false
        }),
        Animated.timing(opacityPulse1, {
          toValue: 0,
          duration: 4000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false
        })
      ])
    ).start()

    // Opacity pulse for Layer 2 (more pronounced, but still subtle)
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacityPulse2, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false
        }),
        Animated.timing(opacityPulse2, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false
        })
      ])
    ).start()
  }, [translate1, translate2, rotateValue, opacityPulse1, opacityPulse2])

  // --- Interpolations for Gradient Positions ---

  // Layer 1 (wider, more sweeping movement)
  const startX1 = translate1.interpolate({
    inputRange: [0, 1],
    outputRange: [-0.5, 1.5] // Start further left, sweep to right
  })
  const endX1 = translate1.interpolate({
    inputRange: [0, 1],
    outputRange: [1.5, -0.5] // End further right, sweep to left
  })
  const startY1 = translate1.interpolate({
    inputRange: [0, 1],
    outputRange: [-0.3, 0.7] // Vertical offset for diagonal motion
  })
  const endY1 = translate1.interpolate({
    inputRange: [0, 1],
    outputRange: [1.3, 0.3] // Vertical offset for diagonal motion
  })

  // Layer 2 (also sweeping, but perhaps a different axis or range)
  const startX2 = translate2.interpolate({
    inputRange: [0, 1],
    outputRange: [1.5, -0.5] // Start further right, sweep to left
  })
  const endX2 = translate2.interpolate({
    inputRange: [0, 1],
    outputRange: [-0.5, 1.5] // End further left, sweep to right
  })
  const startY2 = translate2.interpolate({
    inputRange: [0, 1],
    outputRange: [0.7, -0.3] // Vertical offset for diagonal motion
  })
  const endY2 = translate2.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1.3] // Vertical offset for diagonal motion
  })

  // --- Interpolations for Opacity and Rotation ---

  // Overall background opacity, more subtle initial state, and influenced by 'progress'
  const overallOpacity = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 0.8] // Start at 40% opaque, ramp up to full
  })

  // Pulsing opacity for the first layer, ranges from 0.8 to 1 (very subtle)
  const layer1Opacity = panX.interpolate({
    inputRange: [0, 1],
    outputRange: [0.2, 1]
  })

  // Pulsing opacity for the second layer, ranges from 0.6 to 0.9 (more noticeable)
  const layer2Opacity = panY.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 0.7]
  })

  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFill,
        {
          opacity: overallOpacity // Overall opacity controlled by 'progress'
        }
      ]}
    >
      {/* First gradient layer - deeper, more cosmic feel */}
      <AnimatedLinearGradient
        colors={currentGradientPalette.colorsLayer1} // Use currentGradientPalette
        start={{ x: startX1, y: startY1 }}
        end={{ x: endX1, y: endY1 }}
        style={[StyleSheet.absoluteFill, { opacity: layer1Opacity }]}
      />

      <AnimatedLinearGradient
        colors={currentGradientPalette.colorsLayer2} // Use currentGradientPalette
        start={{ x: startX2, y: startY2 }}
        end={{ x: endX2, y: endY2 }}
        style={[StyleSheet.absoluteFill, { opacity: layer2Opacity }]}
      />

      <AnimatedLinearGradient
        colors={currentGradientPalette.colorsLayer3} // Use currentGradientPalette
        start={{ x: endX1, y: startY2 }}
        end={{ x: startX2, y: endY1 }}
        style={[
          StyleSheet.absoluteFill,
          {
            opacity: progress.interpolate({
              inputRange: [0, 1],
              outputRange: [0.1, 0.4]
            }),
            transform: [
              {
                scale: progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.05]
                })
              }
            ]
          }
        ]}
      />
    </Animated.View>
  )
}
