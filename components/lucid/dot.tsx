import { LinearGradient } from "expo-linear-gradient"
import React, { useEffect, useRef } from "react"
import { Animated, StyleSheet } from "react-native"

const DOT_SIZE = 80
const DOT_RADIUS = DOT_SIZE / 2

interface DotProps {
  panResponder: any
  dotPosition: Animated.ValueXY
  dotScale: Animated.Value
}

export function Dot({ panResponder, dotPosition, dotScale }: DotProps) {
  const glowScale = useRef(new Animated.Value(1)).current

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowScale, {
          toValue: 1.25,
          duration: 1200,
          useNativeDriver: true
        }),
        Animated.timing(glowScale, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true
        })
      ])
    ).start()
  }, [])

  return (
    <Animated.View
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        transform: [
          { translateX: dotPosition.x },
          { translateY: dotPosition.y },
          { scale: dotScale }
        ],
        zIndex: 100
      }}
    >
      <Animated.View
        {...panResponder.panHandlers}
        style={styles.touchableDotArea}
      >
        <LinearGradient
          colors={["rgba(0,255,255,0.3)", "transparent"]}
          style={styles.radialGlow}
        />

        <Animated.View
          pointerEvents="none"
          style={[styles.dotGlow, { transform: [{ scale: glowScale }] }]}
        />
      </Animated.View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  dot: {
    position: "absolute",
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_RADIUS,
    backgroundColor: "rgba(255,255,255,.4)",
    elevation: 20, // Android brightness
    zIndex: 20,
    shadowColor: "#ffffff",
    shadowOpacity: 0.8,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 }
  },

  dotGlow: {
    position: "absolute",
    top: -DOT_RADIUS,
    left: -DOT_RADIUS,
    width: DOT_SIZE * 2,
    height: DOT_SIZE * 2,
    borderRadius: DOT_SIZE,
    backgroundColor: "rgba(0, 255, 255, 0.1)", // outer pulse color
    shadowColor: "#87f2ff",
    shadowOpacity: 0.8,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 0 },
    zIndex: 90
  },
  radialGlow: {
    position: "absolute",
    width: DOT_SIZE * 4,
    height: DOT_SIZE * 4,
    top: -DOT_SIZE * 1.5,
    left: -DOT_SIZE * 1.5,
    borderRadius: DOT_SIZE * 2,
    zIndex: 80
  },
  smoke: {
    position: "absolute",
    bottom: -DOT_RADIUS * 0.5,
    left: DOT_RADIUS * 0.25,
    width: DOT_SIZE * 0.5,
    height: DOT_SIZE * 2,
    zIndex: 10
  },
  smokeGradient: {
    width: "100%",
    height: "100%",
    borderRadius: DOT_SIZE * 0.25
  },
  touchableDotArea: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_RADIUS,
    backgroundColor: "rgba(255,255,255,0.4)",
    shadowColor: "#ffffff",
    shadowOpacity: 0.8,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 },
    elevation: 20,
    zIndex: 20
  }
})
