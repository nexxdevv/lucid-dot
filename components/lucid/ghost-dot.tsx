import React, { useEffect, useRef } from "react"
import { Animated, StyleSheet } from "react-native"

const DOT_SIZE = 80

export function GhostDot({ x, y }: { x: number; y: number }) {
  const opacity = useRef(new Animated.Value(0.8)).current
  const scale = useRef(new Animated.Value(1)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true
      }),
      Animated.timing(scale, {
        toValue: 2,
        duration: 600,
        useNativeDriver: true
      })
    ]).start()
  }, [])

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.ghost,
        {
          left: x - DOT_SIZE / 2,
          top: y - DOT_SIZE / 2,
          opacity,
          transform: [{ scale }]
        }
      ]}
    />
  )
}

const styles = StyleSheet.create({
  ghost: {
    position: "absolute",
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: "rgba(0,255,255,0.25)",
    shadowColor: "#00ffff",
    shadowOpacity: 0.5,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 0 }
  }
})
