import { useNavigation, useRoute } from "@react-navigation/native"
import React, { useCallback, useEffect, useRef, useState } from "react"
import {
  Pressable,
  Animated as RNAnimated,
  StatusBar,
  StyleSheet,
  Text,
  View
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

import { AnimatedGradientBackground } from "@/components/lucid/animated-gradient-background"
import { Card } from "@/components/lucid/card"
import { Dot } from "@/components/lucid/dot"
import { GradientPicker } from "@/components/lucid/gradient-picker"
import { IconSymbol } from "@/components/ui/IconSymbol"
import { useHoldInteraction } from "@/hooks/useHoldInteraction"
import { formatTime } from "@/lib/format-time"
import { useTheme } from "../../themes/ThemeContext"

const BIRD_FLOCK_LOTTIE_1 = require("../../assets/animations/birds-1.json")
const BIRD_FLOCK_LOTTIE_2 = require("../../assets/animations/birds-2.json")

const LOTTIE_FLOCKS = [BIRD_FLOCK_LOTTIE_1, BIRD_FLOCK_LOTTIE_2]

export default function Lucid() {
  type RouteParams = {
    deck?: any
  }
  const route = useRoute()
  const navigation = useNavigation()
  const { deck } = (route.params as RouteParams) ?? {}

  const { theme } = useTheme()

  const {
    isHolding,
    panX,
    panY,
    timeElapsed,
    cardOpacity,
    cardScale,
    panResponder,
    dotPosition,
    uiOpacity,
    dotScale,
    resetToInitialState,
    currentCard,
    glowOpacity,
    glowScale,
    flashOpacity,
    shadowRadiusInterpolate,
    shadowOpacityInterpolate,
    animatedElevation,
    cardTranslateX,
    cardTranslateY,
    cardRotateZ,
    chargeProgress,
    onSetContainerDimensions
  } = useHoldInteraction(deck)

  interface FlockInstance {
    id: string
    source: any
    triggerStart: boolean // Indicates if this flock should start its animation
  }
  const [flocks, setFlocks] = useState<FlockInstance[]>([])
  const nextFlockId = useRef(0)
  const flockSpawnTimer = useRef<NodeJS.Timeout | null>(null)

  // Function to add a new flock
  const addNewFlock = useCallback(() => {
    const newFlock: FlockInstance = {
      id: `flock-${nextFlockId.current++}`,
      source: LOTTIE_FLOCKS[Math.floor(Math.random() * LOTTIE_FLOCKS.length)],
      triggerStart: true // Mark it to start animation immediately
    }
    setFlocks((prevFlocks) => [...prevFlocks, newFlock])
  }, [])

  // Function to remove a flock when its animation is done
  const handleFlockAnimationEnd = useCallback((id: string) => {
    setFlocks((prevFlocks) => prevFlocks.filter((flock) => flock.id !== id))
  }, [])

  // Effect to manage flock spawning based on isHolding
  useEffect(() => {
    if (isHolding) {
      if (flockSpawnTimer.current) {
        clearInterval(flockSpawnTimer.current) // Use clearInterval for previous setInterval
        clearTimeout(flockSpawnTimer.current) // Use clearTimeout for previous setTimeout
        flockSpawnTimer.current = null
      }

      const initialDelay = 2000 + Math.random() * 5000
      flockSpawnTimer.current = setTimeout(() => {
        addNewFlock()
        // Subsequent flocks at regular intervals
        flockSpawnTimer.current = setInterval(() => {
          if (flocks.length < 2) {
            addNewFlock()
          }
        }, 30000 + Math.random() * 10000) as unknown as NodeJS.Timeout // Every 30-40 seconds
      }, initialDelay) as unknown as NodeJS.Timeout
    } else {
      if (flockSpawnTimer.current) {
        // Clear both setTimeout and setInterval if holding stops
        clearInterval(flockSpawnTimer.current)
        clearTimeout(flockSpawnTimer.current)
        flockSpawnTimer.current = null
      }
    }

    return () => {
      if (flockSpawnTimer.current) {
        clearInterval(flockSpawnTimer.current)
        clearTimeout(flockSpawnTimer.current)
        flockSpawnTimer.current = null
      }
    }
  }, [isHolding, addNewFlock, flocks.length])

  return (
    <View style={styles.container}>
      {/* <AnimatedGradientBackground
        progress={chargeProgress}
        panX={panX}
        panY={panY}
      /> */}
      {/* Render your flying flocks */}
      {/* {flocks.map((flock) => (
        <FlyingBirds
          key={flock.id}
          id={flock.id}
          source={flock.source}
          onAnimationEnd={handleFlockAnimationEnd}
          triggerStart={flock.triggerStart} // Pass the trigger prop
        />
      ))} */}
      {/* Back Button */}
      <RNAnimated.View
        style={{
          top: 47, // Status bar height
          zIndex: 99,
          opacity: uiOpacity
        }}
      >
        <Pressable
          onPress={() => navigation.goBack()}
          style={{
            padding: 10,
            borderRadius: 10
          }}
        >
          <IconSymbol name="arrow.left" size={20} color={theme.text} />
        </Pressable>
      </RNAnimated.View>

      <Dot
        dotPosition={dotPosition}
        dotScale={dotScale}
        panResponder={panResponder}
      />

      <SafeAreaView style={{ flex: 1, backgroundColor: "transparent" }}>
        <StatusBar hidden backgroundColor={theme.background} />
        {!isHolding && <GradientPicker />}

        {/* Time Display */}
        <View
          style={{
            left: 0,
            top: 0,
            right: 0,
            zIndex: 99,
            alignItems: "center"
          }}
        >
          <RNAnimated.Text
            style={{
              fontSize: 86,
              fontWeight: "900",
              textAlign: "center",
              color: theme.text
            }}
          >
            {formatTime(timeElapsed)}
          </RNAnimated.Text>
        </View>
        {/* Save Session Button */}
        <RNAnimated.View
          style={{
            position: "absolute",
            bottom: 56,
            left: 0,
            right: 0,
            alignItems: "center",
            opacity: uiOpacity
          }}
        >
          <Pressable
            style={{
              alignSelf: "center",
              paddingVertical: 10,
              paddingHorizontal: 20,
              backgroundColor: theme.button,
              borderRadius: 20
            }}
            onPress={() => {
              // TODO: implement save session logic
              console.log("Session saved")
            }}
          >
            <Text
              style={{ color: theme.text, fontWeight: "bold", fontSize: 18 }}
            >
              Save Session
            </Text>
          </Pressable>
        </RNAnimated.View>
        <Card
          chargeProgress={chargeProgress}
          currentCard={currentCard}
          cardOpacity={cardOpacity}
          cardScale={cardScale}
          glowOpacity={glowOpacity}
          glowScale={glowScale}
          flashOpacity={flashOpacity}
          shadowRadiusInterpolate={shadowRadiusInterpolate}
          shadowOpacityInterpolate={shadowOpacityInterpolate}
          animatedElevation={animatedElevation}
          cardTranslateY={cardTranslateY}
          cardTranslateX={cardTranslateX}
          cardRotateZ={cardRotateZ}
        />
      </SafeAreaView>
      <Pressable
        onPress={resetToInitialState}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 80,
          zIndex: 999
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#add8e6"
    // justifyContent: "center",
    // alignItems: "center"
  }
})
