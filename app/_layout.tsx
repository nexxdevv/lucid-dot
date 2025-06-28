// app/_layout.tsx
import { Stack } from "expo-router"
import { useFonts } from "expo-font"
import * as SplashScreen from "expo-splash-screen"
import { useCallback, useEffect } from "react"
import { ThemeProvider } from "@/themes/ThemeContext"
import { StatusBar, View } from "react-native"

// Prevent auto-hiding splash screen
SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "SF-Pro": require("../assets/fonts/SF-Pro-Display-Regular.otf"),
    "SF-Pro-Bold": require("../assets/fonts/SF-Pro-Display-Bold.otf"),
    "SF-Pro-Light": require("../assets/fonts/SF-Pro-Display-Light.otf")
  })

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync()
    }
  }, [fontsLoaded])

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync()
    }
  }, [fontsLoaded])

  if (!fontsLoaded) return null

  return (
    <ThemeProvider>
      <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar barStyle="default" />
      </View>
    </ThemeProvider>
  )
}
