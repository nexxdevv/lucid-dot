import LottieView from "lottie-react-native"
import React, { useEffect, useRef } from "react"
import { Animated, Dimensions, Easing, ViewStyle } from "react-native"

interface FlyingBirdsProps {
  source: any
  id: string
  onAnimationEnd: (id: string) => void
  style?: ViewStyle
  triggerStart: boolean
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window")

// --- CHANGES HERE ---
const MIN_FLY_HEIGHT = SCREEN_HEIGHT * 0.05 // 5% from top of screen
const MAX_FLY_HEIGHT = SCREEN_HEIGHT * 0.3 // 30% from top of screen
// --- END CHANGES ---

const FlyingBirds: React.FC<FlyingBirdsProps> = ({
  source,
  id,
  onAnimationEnd,
  style,
  triggerStart
}) => {
  const lottieRef = useRef<LottieView>(null)
  const translateX = useRef(new Animated.Value(0)).current
  const translateY = useRef(new Animated.Value(0)).current
  const opacity = useRef(new Animated.Value(0)).current
  const scale = useRef(new Animated.Value(2)).current

  const flyDirection = useRef(Math.random() > 0.5 ? 1 : -1).current
  const initialX = flyDirection === 1 ? -SCREEN_WIDTH * 0.5 : SCREEN_WIDTH * 1.5
  const targetX = flyDirection === 1 ? SCREEN_WIDTH * 1.5 : -SCREEN_WIDTH * 0.5

  const initialY = useRef(
    MIN_FLY_HEIGHT + Math.random() * (MAX_FLY_HEIGHT - MIN_FLY_HEIGHT)
  ).current

  const flyDuration = useRef(Math.random() * (25000 - 15000) + 15000).current
  const fadeDuration = 1500

  const flockScale = useRef(Math.random() * (2 - 0.8) + 0.8).current

  useEffect(() => {
    if (triggerStart) {
      lottieRef.current?.play()

      translateX.setValue(initialX)
      translateY.setValue(initialY)
      scale.setValue(flockScale)

      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: fadeDuration,
          useNativeDriver: true
        }),
        Animated.parallel([
          Animated.timing(translateX, {
            toValue: targetX,
            duration: flyDuration,
            easing: Easing.linear,
            useNativeDriver: true
          }),
          Animated.loop(
            Animated.sequence([
              Animated.timing(translateY, {
                toValue: initialY + 30,
                duration: flyDuration / 4,
                easing: Easing.ease,
                useNativeDriver: true
              }),
              Animated.timing(translateY, {
                toValue: initialY - 30,
                duration: flyDuration / 4,
                easing: Easing.ease,
                useNativeDriver: true
              }),
              Animated.timing(translateY, {
                toValue: initialY,
                duration: flyDuration / 2,
                easing: Easing.ease,
                useNativeDriver: true
              })
            ]),
            { iterations: -1 }
          )
        ]),
        Animated.timing(opacity, {
          toValue: 0,
          duration: fadeDuration,
          useNativeDriver: true
        })
      ]).start(({ finished }) => {
        if (finished) {
          onAnimationEnd(id)
        }
      })
    }

    return () => {
      translateX.stopAnimation()
      translateY.stopAnimation()
      opacity.stopAnimation()
      scale.stopAnimation()
      lottieRef.current?.pause()
    }
  }, [
    triggerStart,
    id,
    initialX,
    initialY,
    targetX,
    flyDuration,
    fadeDuration,
    flockScale,
    onAnimationEnd,
    opacity,
    scale,
    translateX,
    translateY
  ])

  return (
    <Animated.View
      style={{
        position: "absolute",
        transform: [
          { translateX },
          { translateY },
          { scaleX: flyDirection * flockScale },
          { scaleY: flockScale }
        ],
        opacity,
        width: 250,
        height: 250,
        pointerEvents: "none",

        ...style
      }}
    >
      <LottieView
        ref={lottieRef}
        source={source}
        autoPlay={false}
        loop
        speed={Math.random() * (1.1 - 0.9) + 0.9}
        style={{ flex: 1 }} // Add this
      />
    </Animated.View>
  )
}

export default FlyingBirds
