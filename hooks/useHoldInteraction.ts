import { useAudioPlayer } from "expo-audio"
import { useCallback, useEffect, useRef, useState } from "react"
import {
  Animated,
  Dimensions,
  Easing,
  InteractionManager,
  PanResponder,
  Vibration
} from "react-native"

interface Card {
  statement: string
  tags: string[]
}

interface Deck {
  id: string
  title: string
  cards: Card[]
}

const DOT_RADIUS = 40
const LONG_PRESS_DELAY = 200 // The duration to wait before classifying as a long press
const HOLD_ANIMATION_DURATION = 17000 // 17 seconds in milliseconds
const COLOR_RESET_DURATION_GENTLE = 2000 // 1 second for gentle drain when release
const COLOR_RESET_DURATION_SUCCESS_RETURN = 1000 // 1 second for graceful fade back after success
const DOT_POP_DURATION = 200 // Duration for the dot to pop up
const FLASH_DURATION = 300 // Duration for the white flash

// New constants for card transition
const CARD_TRANSITION_DURATION = 400 // Duration for outgoing/incoming card animation
const CARD_WIGGLE_AMOUNT = 28 // How much the card wiggles horizontally

export function useHoldInteraction(deck?: Deck): {
  isHolding: boolean
  timeElapsed: number
  cardVisible: boolean
  currentCard: Card | null
  currentCardIndex: number | null
  dotPosition: Animated.ValueXY
  cardOpacity: Animated.Value
  cardScale: Animated.Value
  cardTranslateY: Animated.Value
  cardTranslateX: Animated.Value // New: for horizontal card movement
  cardRotateZ: Animated.Value // New: for card rotation
  uiOpacity: Animated.Value
  dotScale: Animated.Value
  panResponder: any
  resetToInitialState: () => Promise<void>
  getRandomCard: () => void
  glowOpacity: Animated.Value
  glowScale: Animated.Value
  flashOpacity: Animated.Value
  shadowRadiusInterpolate: Animated.AnimatedInterpolation<number>
  shadowOpacityInterpolate: Animated.AnimatedInterpolation<number>
  animatedElevation: Animated.AnimatedInterpolation<number>
  chargeProgress: Animated.Value
  panX: Animated.Value
  panY: Animated.Value
  onSetContainerDimensions: (width: number, height: number) => void
} {
  const isHolding = useRef(false)
  const touchOffsetFromDotCenter = useRef({ x: 0, y: 0 })

  const longPressTimer = useRef<NodeJS.Timeout | null>(null)
  const holdTimer = useRef<NodeJS.Timeout | null>(null)
  const decayTimer = useRef<NodeJS.Timeout | null>(null)

  const [cardVisible, setCardVisible] = useState(false)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [currentCard, setCurrentCard] = useState<Card | null>(null)
  const [currentCardIndex, setCurrentCardIndex] = useState<number | null>(null)
  const [lastQuoteIndex, setLastQuoteIndex] = useState<number | null>(null)

  // Animated values for Dot and overall UI
  const dotPosition = useRef(new Animated.ValueXY()).current
  const cardOpacity = useRef(new Animated.Value(0)).current // Still useful for initial fade-in/out
  const cardScale = useRef(new Animated.Value(0.8)).current // Initial scale slightly smaller
  const cardTranslateY = useRef(new Animated.Value(0)).current // Keep at 0 for card main position

  // New: Animated values for card transition
  const cardTranslateX = useRef(new Animated.Value(0)).current // For horizontal movement
  const cardRotateZ = useRef(new Animated.Value(0)).current // For rotation (wiggle/fling)
  const cardEntryExitProgress = useRef(new Animated.Value(0)).current // Controls show/hide animation

  const uiOpacity = useRef(new Animated.Value(1)).current
  const dotScale = useRef(new Animated.Value(0.25)).current // Initial dot scale

  // New: Animated values for the raw finger position, normalized
  const fingerX = useRef(new Animated.Value(0)).current // Represents normalized X position
  const fingerY = useRef(new Animated.Value(0)).current // Represents normalized Y position

  // New: State to hold the dimensions of the area where the touch is occurring.
  // This is crucial for normalizing touch coordinates.
  const [containerDimensions, setContainerDimensions] = useState({
    width: 0,
    height: 0
  })

  // Animated values for Card-specific animations (new)
  const cardBackgroundColorAnim = useRef(new Animated.Value(0)).current
  const glowOpacity = useRef(new Animated.Value(0)).current
  const glowScale = useRef(new Animated.Value(1)).current
  const flashOpacity = useRef(new Animated.Value(0)).current
  const chargeProgress = useRef(new Animated.Value(0)).current

  // Ref to hold the 17-second animation sequence, so it can be stopped
  const longHoldAnimation = useRef<Animated.CompositeAnimation | null>(null)

  const holdSound = useAudioPlayer(require("../assets/sounds/hold-sound.mp3"))
  const introSound = useAudioPlayer(require("../assets/sounds/reset-sound.mp3"))
  const finishSound = useAudioPlayer(
    require("../assets/sounds/finish-sound.mp3")
  )

  // Card-specific interpolations (defined here to use isDarkMode)

  const shadowRadiusInterpolate = chargeProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [15, 30]
  })

  const shadowOpacityInterpolate = chargeProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.2, 1]
  })

  const animatedElevation = chargeProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [10, 30]
  })

  // Continuous glow animation for the card (independent of holding state)
  useEffect(() => {
    // Glow Opacity Pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowOpacity, {
          toValue: 0.8,
          duration: 1500,
          useNativeDriver: true
        }),
        Animated.timing(glowOpacity, {
          toValue: 0.3,
          duration: 1500,
          useNativeDriver: true
        })
      ]),
      { iterations: -1 }
    ).start()

    // Glow Scale Pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowScale, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true
        }),
        Animated.timing(glowScale, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true
        })
      ]),
      { iterations: -1 }
    ).start()
  }, [])

  useEffect(() => {
    const { width, height } = Dimensions.get("window")
    dotPosition.setValue({
      x: width / 2 - DOT_RADIUS,
      y: height / 2 - DOT_RADIUS
    })

    // Initial card appearance: slide in from bottom or simple fade
    // We'll use cardEntryExitProgress for this
    Animated.timing(cardEntryExitProgress, {
      toValue: 1, // Represents card fully visible
      duration: 500, // Duration for initial slide-in
      easing: Easing.out(Easing.ease),
      useNativeDriver: true
    }).start(() => {
      setCardVisible(true) // Now the card is fully in place and visible
    })

    return () => {
      // Clear timers
      if (holdTimer.current) clearInterval(holdTimer.current)
      if (decayTimer.current) clearInterval(decayTimer.current)
      if (longPressTimer.current) clearTimeout(longPressTimer.current)
      // Stop and reset all animations explicitly on unmount
      if (longHoldAnimation.current) longHoldAnimation.current.stop()
      cardBackgroundColorAnim.stopAnimation()
      glowOpacity.stopAnimation()
      glowScale.stopAnimation()
      flashOpacity.stopAnimation()
      chargeProgress.stopAnimation()
      dotPosition.stopAnimation()
      cardOpacity.stopAnimation()
      cardScale.stopAnimation()
      cardTranslateY.stopAnimation()
      cardTranslateX.stopAnimation() // Stop new animations
      cardRotateZ.stopAnimation() // Stop new animations
      cardEntryExitProgress.stopAnimation() // Stop new animations
      uiOpacity.stopAnimation()
      dotScale.stopAnimation()
    }
  }, [])

  const getNextCardAndAnimate = useCallback(async () => {
    if (!deck || deck.cards.length === 0) {
      setCurrentCard(null)
      setCurrentCardIndex(null)
      setLastQuoteIndex(null)
      return
    }

    let randomIndex
    do {
      randomIndex = Math.floor(Math.random() * deck.cards.length)
    } while (deck.cards.length > 1 && randomIndex === lastQuoteIndex)

    const nextCard = deck.cards[randomIndex]
    const { width } = Dimensions.get("window")
    const flingDirection = 1

    // Phase 1: Wiggle and fling current card out
    await new Promise<void>((resolve) => {
      Animated.sequence([
        Animated.timing(cardTranslateX, {
          toValue: CARD_WIGGLE_AMOUNT * flingDirection, // Wiggle
          duration: CARD_TRANSITION_DURATION * 0.2,
          easing: Easing.ease,
          useNativeDriver: true
        }),
        Animated.parallel([
          Animated.timing(cardTranslateX, {
            toValue: width * flingDirection * 1.5, // Fling far off-screen
            duration: CARD_TRANSITION_DURATION * 0.8,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true
          }),
          Animated.timing(cardRotateZ, {
            toValue: 20 * flingDirection, // Rotate as it flings
            duration: CARD_TRANSITION_DURATION * 0.8,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true
          }),
          Animated.timing(cardOpacity, {
            toValue: 0, // Fade out during fling
            duration: CARD_TRANSITION_DURATION * 0.8,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true
          }),
          Animated.timing(cardScale, {
            toValue: 0.8, // Slightly shrink as it leaves
            duration: CARD_TRANSITION_DURATION * 0.8,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true
          })
        ])
      ]).start(() => {
        // Reset values instantly after fling for the next card's entrance
        cardTranslateX.setValue(-width * flingDirection * 1.5) // Position new card off-screen
        cardRotateZ.setValue(-20 * flingDirection) // Initial rotation for incoming card
        cardOpacity.setValue(0) // Ensure new card starts invisible
        cardScale.setValue(0.8) // Ensure new card starts slightly shrunk
        resolve()
      })
    })

    // Update to the new card's content
    setCurrentCardIndex(randomIndex)
    setLastQuoteIndex(randomIndex)
    setCurrentCard({
      tags: nextCard.tags.length > 0 ? [nextCard.tags[0]] : ["General"],
      statement: nextCard.statement
    })

    // Phase 2: Slide new card in
    Animated.parallel([
      Animated.timing(cardTranslateX, {
        toValue: 0, // Slide to center
        duration: CARD_TRANSITION_DURATION,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true
      }),
      Animated.timing(cardRotateZ, {
        toValue: 0, // Rotate to straight
        duration: CARD_TRANSITION_DURATION,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true
      }),
      Animated.timing(cardOpacity, {
        toValue: 1, // Fade in
        duration: CARD_TRANSITION_DURATION,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true
      }),
      Animated.timing(cardScale, {
        toValue: 1, // Expand to full size
        duration: CARD_TRANSITION_DURATION,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true
      })
    ]).start(() => {
      setCardVisible(true)
    })
  }, [
    deck,
    lastQuoteIndex,
    cardTranslateX,
    cardRotateZ,
    cardOpacity,
    cardScale
  ]) // Add animated values to deps

  // Update references to getRandomCard with the new getNextCardAndAnimate
  const getRandomCard = getNextCardAndAnimate

  const resetToInitialState = useCallback(async () => {
    const { width, height } = Dimensions.get("window")
    const centerX = width / 2 - DOT_RADIUS
    const centerY = height / 2 - DOT_RADIUS

    try {
      await introSound.seekTo(0)
      await introSound.play()
    } catch (err) {
      console.warn("Failed to play reset sound", err)
    }

    if (longHoldAnimation.current) {
      longHoldAnimation.current.stop()
      longHoldAnimation.current = null
    }
    cardBackgroundColorAnim.setValue(0)
    chargeProgress.setValue(0)
    flashOpacity.setValue(0)
    dotScale.setValue(0.25) // Ensure dot starts at this size

    // Animate card out before resetting state
    await new Promise<void>((resolve) => {
      Animated.parallel([
        Animated.timing(uiOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true
        }),
        Animated.timing(cardOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true
        }),
        Animated.timing(cardScale, {
          toValue: 0.8,
          duration: 300,
          useNativeDriver: true
        }),
        Animated.timing(cardTranslateX, {
          toValue: -width, // Fling off left (or choose a consistent direction)
          duration: 300,
          useNativeDriver: true
        }),
        Animated.timing(cardRotateZ, {
          toValue: -10, // Slight rotation
          duration: 300,
          useNativeDriver: true
        })
      ]).start(() => {
        // Reset card specific animated values
        cardTranslateX.setValue(0)
        cardRotateZ.setValue(0)
        cardEntryExitProgress.setValue(0) // Reset for next show
        resolve()
      })
    })

    setCardVisible(false)
    setCurrentCard(null)
    setCurrentCardIndex(null)
    setLastQuoteIndex(null)
    setTimeElapsed(0)

    InteractionManager.runAfterInteractions(() => {
      requestAnimationFrame(() => {
        Animated.timing(dotPosition, {
          toValue: { x: centerX, y: centerY },
          duration: 500,
          useNativeDriver: true
        }).start()
      })
    })

    if (holdTimer.current) clearInterval(holdTimer.current)
    holdTimer.current = null

    if (decayTimer.current) clearInterval(decayTimer.current)
    decayTimer.current = null

    isHolding.current = false
  }, [
    dotPosition,
    uiOpacity,
    cardOpacity,
    cardScale,
    dotScale,
    introSound,
    cardBackgroundColorAnim,
    chargeProgress,
    flashOpacity,
    cardTranslateX,
    cardRotateZ,
    cardEntryExitProgress
  ])

  const startHolding = useCallback(async () => {
    if (isHolding.current) return

    setCardVisible(true) // Ensure visible for hold
    isHolding.current = true
    Vibration.vibrate([50, 50, 50])

    if (!currentCard) {
      getRandomCard() // Use the new function which also animates in
    }

    try {
      holdSound.play()
    } catch (err) {
      console.warn("Failed to play hold sound", err)
    }

    // No need to reset cardOpacity/Scale/TranslateX/RotateZ here directly,
    // as getRandomCard/resetToInitialState will handle the full animation.
    // If a card is already visible and we start holding it, it just stays.

    cardBackgroundColorAnim.setValue(0)
    chargeProgress.setValue(0)
    flashOpacity.setValue(0)

    Animated.parallel([
      Animated.timing(dotScale, {
        toValue: 0.5, // Dot scales UP to 0.5 when holding starts
        duration: 600,
        useNativeDriver: true
      }),
      Animated.timing(uiOpacity, {
        toValue: 0, // UI fades out
        duration: 600,
        useNativeDriver: true
      })
      // Keep card visible and at current transform for holding state.
      // If we need a specific "on hold" scale/opacity/transform, apply it here.
      // For now, assume it's already visible after initial show or previous getRandomCard.
    ]).start()

    longHoldAnimation.current = Animated.parallel([
      Animated.timing(cardBackgroundColorAnim, {
        toValue: 1,
        duration: HOLD_ANIMATION_DURATION,
        useNativeDriver: false
      }),
      Animated.timing(chargeProgress, {
        toValue: 1,
        duration: HOLD_ANIMATION_DURATION,
        useNativeDriver: false
      })
    ])

    // Define the recursive callback outside so it can be referenced by name
    const startLongHoldAnimation = ({ finished }: { finished: boolean }) => {
      if (finished && isHolding.current) {
        Vibration.vibrate(500)
        finishSound.play()

        Animated.sequence([
          Animated.parallel([
            Animated.timing(dotScale, {
              toValue: 1.9,
              duration: DOT_POP_DURATION,
              useNativeDriver: true
            }),
            Animated.timing(flashOpacity, {
              toValue: 1,
              duration: FLASH_DURATION,
              useNativeDriver: true
            })
          ]),
          Animated.parallel([
            Animated.timing(dotScale, {
              toValue: 0.5,
              duration: 300,
              useNativeDriver: true
            }),
            Animated.timing(flashOpacity, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true
            })
          ]),
          Animated.parallel([
            Animated.timing(cardBackgroundColorAnim, {
              toValue: 0,
              duration: COLOR_RESET_DURATION_SUCCESS_RETURN,
              useNativeDriver: false
            }),
            Animated.timing(chargeProgress, {
              toValue: 0,
              duration: COLOR_RESET_DURATION_SUCCESS_RETURN,
              useNativeDriver: false
            })
          ])
        ]).start(() => {
          getRandomCard()

          if (isHolding.current) {
            longHoldAnimation.current = Animated.parallel([
              Animated.timing(cardBackgroundColorAnim, {
                toValue: 1,
                duration: HOLD_ANIMATION_DURATION,
                useNativeDriver: false
              }),
              Animated.timing(chargeProgress, {
                toValue: 1,
                duration: HOLD_ANIMATION_DURATION,
                useNativeDriver: false
              })
            ])

            longHoldAnimation.current.start(startLongHoldAnimation)
          }
        })
      }
    }

    longHoldAnimation.current.start(startLongHoldAnimation)

    if (!holdTimer.current) {
      holdTimer.current = setInterval(() => {
        setTimeElapsed((prev) => prev + 1)
      }, 1000) as unknown as NodeJS.Timeout
    }

    if (decayTimer.current) {
      clearInterval(decayTimer.current)
      decayTimer.current = null
    }
  }, [
    dotScale,
    uiOpacity,
    getRandomCard, // Added
    holdSound,
    cardBackgroundColorAnim,
    chargeProgress,
    flashOpacity,
    currentCard
  ])

  const endHolding = useCallback(async () => {
    // 1. Clear any pending long press timer first, regardless of `isHolding.current`
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }

    // 2. ONLY proceed with ending the 'hold' state if a hold was truly established
    if (isHolding.current) {
      // Stop the 17-second animation if it's still running
      if (longHoldAnimation.current) {
        longHoldAnimation.current.stop()
        longHoldAnimation.current = null
      }

      // Pause hold sound
      try {
        holdSound.pause()
      } catch (err) {
        console.warn("Failed to pause hold sound", err)
      }

      // Gently drain color and reset charge progress if user stops holding
      Animated.parallel([
        Animated.timing(cardBackgroundColorAnim, {
          toValue: 0, // Drains back to normal
          duration: COLOR_RESET_DURATION_GENTLE,
          useNativeDriver: false
        }),
        Animated.timing(chargeProgress, {
          toValue: 0, // Shadows reset
          duration: COLOR_RESET_DURATION_GENTLE,
          useNativeDriver: false
        }),
        Animated.timing(dotScale, {
          // Dot shrinks back to initial size (0.25) after a successful hold
          toValue: 0.25,
          duration: 900,
          useNativeDriver: true
        }),
        // Also hide flash if it was mid-animation
        Animated.timing(flashOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true
        })
      ]).start(() => {
        // After gentle decay, if card is still visible, prepare to hide it smoothly
        // Optionally, you might want to fling it off too, but a simple fade/shrink back might be better here
        if (cardVisible && !isHolding.current) {
          // Ensure we only hide if no longer holding
          Animated.parallel([
            Animated.timing(cardOpacity, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true
            }),
            Animated.timing(cardScale, {
              toValue: 0.8,
              duration: 300,
              useNativeDriver: true
            }),
            Animated.timing(cardTranslateX, {
              toValue: 0,
              duration: 1,
              useNativeDriver: true
            }), // Reset quickly
            Animated.timing(cardRotateZ, {
              toValue: 0,
              duration: 1,
              useNativeDriver: true
            }) // Reset quickly
          ]).start(() => {
            setCardVisible(false)
            setCurrentCard(null) // Clear card content
          })
        }
      })
    } else {
      // This block runs if the finger was lifted *before* the long press delay
      // or if startHolding simply never set isHolding.current to true.
      // We still need to ensure dotScale is at its initial state.
      Animated.timing(dotScale, {
        toValue: 0.25, // Dot shrinks back to initial size
        duration: 300, // Quick reset
        useNativeDriver: true
      }).start()

      // If card was initially shown (cardVisible=true) but no hold was established, hide it
      if (cardVisible) {
        Animated.parallel([
          Animated.timing(cardOpacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true
          }),
          Animated.timing(cardScale, {
            toValue: 0.8,
            duration: 300,
            useNativeDriver: true
          }),
          Animated.timing(cardTranslateX, {
            toValue: 0,
            duration: 1,
            useNativeDriver: true
          }),
          Animated.timing(cardRotateZ, {
            toValue: 0,
            duration: 1,
            useNativeDriver: true
          })
        ]).start(() => {
          setCardVisible(false)
          setCurrentCard(null)
        })
      }
    }

    // Clear timeElapsed interval ONLY when user stops holding, not on 17-sec success
    if (holdTimer.current) {
      clearInterval(holdTimer.current)
      holdTimer.current = null
    }

    if (decayTimer.current) {
      clearInterval(decayTimer.current)
      decayTimer.current = null
    }

    isHolding.current = false // Crucially, reset this at the very end
  }, [
    dotScale,
    holdSound,
    cardBackgroundColorAnim,
    chargeProgress,
    flashOpacity,
    isHolding,
    cardOpacity, // Added
    cardScale, // Added
    cardVisible, // Added
    cardTranslateX, // Added
    cardRotateZ // Added
  ])

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (e) => {
        const { pageX, pageY } = e.nativeEvent
        const { x, y } = (dotPosition as any).__getValue()
        const dx = pageX - (x + DOT_RADIUS)
        const dy = pageY - (y + DOT_RADIUS)
        // Allow pan responder to activate if touch is within dot area
        return Math.sqrt(dx * dx + dy * dy) <= DOT_RADIUS
      },
      onMoveShouldSetPanResponder: () => true, // Always allow move to be handled once initiated
      onPanResponderGrant: (e) => {
        const { x, y } = (dotPosition as any).__getValue()
        touchOffsetFromDotCenter.current = {
          x: e.nativeEvent.pageX - x - DOT_RADIUS,
          y: e.nativeEvent.pageY - y - DOT_RADIUS
        }

        // Clear any previous timer if a new press starts
        if (longPressTimer.current) clearTimeout(longPressTimer.current)

        longPressTimer.current = setTimeout(() => {
          longPressTimer.current = null // Clear the timer once it fires
          // This ensures startHolding is called only after the long press delay
          startHolding()
        }, LONG_PRESS_DELAY) as unknown as NodeJS.Timeout
        // Initialize fingerX/Y on grant (touch down)
        if (containerDimensions.width > 0 && containerDimensions.height > 0) {
          fingerX.setValue(
            (e.nativeEvent.pageX - containerDimensions.width / 2) /
              containerDimensions.width
          )
          fingerY.setValue(
            (e.nativeEvent.pageY - containerDimensions.height / 2) /
              containerDimensions.height
          )
        }
      },
      onPanResponderMove: (e, gestureState) => {
        // Dot position updates regardless of hold state
        dotPosition.setValue({
          x:
            gestureState.moveX -
            touchOffsetFromDotCenter.current.x -
            DOT_RADIUS,
          y:
            gestureState.moveY - touchOffsetFromDotCenter.current.y - DOT_RADIUS
        })
        // New: Update fingerX and fingerY based on current touch position
        if (containerDimensions.width > 0 && containerDimensions.height > 0) {
          fingerX.setValue(
            (e.nativeEvent.pageX - containerDimensions.width / 2) /
              containerDimensions.width
          )
          fingerY.setValue(
            (e.nativeEvent.pageY - containerDimensions.height / 2) /
              containerDimensions.height
          )
        }
      },
      onPanResponderRelease: (e, gestureState) => {
        // Always call endHolding when finger is lifted
        endHolding()
        // New: Animate fingerX and fingerY back to neutral (0) on release
        Animated.parallel([
          Animated.timing(fingerX, {
            toValue: 0,
            duration: 500, // Smooth return
            easing: Easing.out(Easing.ease),
            useNativeDriver: false
          }),
          Animated.timing(fingerY, {
            toValue: 0,
            duration: 500, // Smooth return
            easing: Easing.out(Easing.ease),
            useNativeDriver: false
          })
        ]).start()
      },
      onPanResponderTerminate: () => {
        // Always call endHolding if gesture is interrupted by system
        endHolding()
        // New: Also animate back on terminate
        Animated.parallel([
          Animated.timing(fingerX, {
            toValue: 0,
            duration: 500,
            easing: Easing.out(Easing.ease),
            useNativeDriver: false
          }),
          Animated.timing(fingerY, {
            toValue: 0,
            duration: 500,
            easing: Easing.out(Easing.ease),
            useNativeDriver: false
          })
        ]).start()
      }
    })
  ).current

  // New: Add a function to set the dimensions of the component that is listening for touches
  const onSetContainerDimensions = useCallback(
    (width: number, height: number) => {
      setContainerDimensions({ width, height })
    },
    []
  )

  return {
    isHolding: isHolding.current,
    timeElapsed,
    cardVisible,
    currentCard,
    currentCardIndex,
    dotPosition,
    cardOpacity,
    cardScale,
    cardTranslateY,
    cardTranslateX, // Return new Animated.Value
    cardRotateZ, // Return new Animated.Value
    uiOpacity,
    dotScale,
    panResponder,
    resetToInitialState,
    getRandomCard, // Still the exposed function
    glowOpacity,
    glowScale,
    flashOpacity,
    shadowRadiusInterpolate,
    shadowOpacityInterpolate,
    animatedElevation,
    chargeProgress,
    panX: fingerX,
    panY: fingerY,
    onSetContainerDimensions
  }
}
