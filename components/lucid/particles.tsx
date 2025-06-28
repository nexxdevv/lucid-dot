// Particle.tsx
import React from 'react';
import { Animated } from 'react-native';

interface ParticleProps {
  animationValue: Animated.Value;
  type: 'charge' | 'explode';
  cardWidth: number;
  cardHeight: number;
  borderRadius: number;
}

const Particle = ({ animationValue, type, cardWidth, cardHeight, borderRadius }: ParticleProps) => {
  const size = type === 'charge' ? Math.random() * 5 + 2 : Math.random() * 10 + 5; // Smaller for charge, larger for explode
  const color = type === 'charge' ? `rgba(255, ${Math.floor(Math.random() * 100) + 100}, 0, 0.7)` : // Orange/gold for charge
                                    `rgba(255, 255, 255, ${Math.random() * 0.8 + 0.2})`; // White for explosion

  // Randomize initial position slightly around the card's center or edges
  const initialX = cardWidth / 2 + (Math.random() - 0.5) * cardWidth * 0.2;
  const initialY = cardHeight / 2 + (Math.random() - 0.5) * cardHeight * 0.2;

  // Charge Particle Animation
  const chargeTransform = animationValue.interpolate({
    inputRange: [0, 1],
    outputRange: [
      `translateY(0) translateX(0) scale(1)`,
      `translateY(${-Math.random() * 50 - 20}) translateX(${(Math.random() - 0.5) * 50}) scale(0.5)`, // Float up/out
    ],
  });
  const chargeOpacity = animationValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 1, 0], // Fade in and out
  });

  // Explosion Particle Animation
  const explodeTransform = animationValue.interpolate({
    inputRange: [0, 1],
    outputRange: [
      `translateY(0) translateX(0) scale(1) rotate(0deg)`,
      `translateY(${(Math.random() - 0.5) * 200}) translateX(${(Math.random() - 0.5) * 200}) scale(0) rotate(${Math.random() * 720}deg)`, // Burst out, fade, rotate
    ],
  });
  const explodeOpacity = animationValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1, 0], // Stay opaque then fade out
  });

  const particleStyle = {
    position: "absolute" as const,
    width: size,
    height: size,
    borderRadius: size / 2, // Make them circular
    backgroundColor: color,
    // Start particles roughly in the middle for charging, or on the card surface for explosion
    left: initialX - size / 2,
    top: initialY - size / 2,
    transform: [
      { perspective: 1000 },
      {
        translateX:
          type === 'charge'
            ? animationValue.interpolate({
                inputRange: [0, 1],
                outputRange: [0, (Math.random() - 0.5) * 50],
              })
            : animationValue.interpolate({
                inputRange: [0, 1],
                outputRange: [0, (Math.random() - 0.5) * 200],
              }),
      },
      {
        translateY:
          type === 'charge'
            ? animationValue.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -Math.random() * 50 - 20],
              })
            : animationValue.interpolate({
                inputRange: [0, 1],
                outputRange: [0, (Math.random() - 0.5) * 200],
              }),
      },
      {
        scale:
          type === 'charge'
            ? animationValue.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 0.5],
              })
            : animationValue.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 0],
              }),
      },
      {
        rotate:
          type === 'explode'
            ? animationValue.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', `${Math.random() * 720}deg`],
              })
            : '0deg',
      },
    ],
    opacity: type === 'charge' ? chargeOpacity : explodeOpacity,
  };

  return <Animated.View style={particleStyle} pointerEvents="none" />;
};

export default Particle;