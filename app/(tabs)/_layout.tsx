// Suppress useInsertionEffect warning in React 17
import { Tabs } from "expo-router"
import React, { useLayoutEffect } from "react"
import { Platform } from "react-native"

import { HapticTab } from "@/components/HapticTab"
import { IconSymbol } from "@/components/ui/IconSymbol"
import TabBarBackground from "@/components/ui/TabBarBackground"

if (!React.useInsertionEffect) {
  // @ts-ignore
  React.useInsertionEffect = useLayoutEffect
}

export default function TabLayout() {

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: "absolute"
          },
          default: {}
        })
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarStyle: { display: "none" },

          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          )
        }}
      />
      <Tabs.Screen
        name="lucid"
        options={{
          title: "Lucid",
          tabBarStyle: { display: "none" },

          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="paperplane.fill" color={color} />
          )
        }}
      />
    </Tabs>
  )
}

// @ts-ignore
React.useInsertionEffect = React.useInsertionEffect || useLayoutEffect
