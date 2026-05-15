import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-gesture-handler";
import "react-native-reanimated";

import { MuseIQProvider } from "@/providers/museiq-provider";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <MuseIQProvider>
        <ThemeProvider value={DefaultTheme}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(drawer)" />
            <Stack.Screen
              name="pregunta-voz-modal"
              options={{ presentation: "transparentModal", animation: "slide_from_bottom" }}
            />
            <Stack.Screen
              name="permissions-modal"
              options={{ presentation: "transparentModal", animation: "slide_from_bottom" }}
            />
          </Stack>
          <StatusBar style="dark" />
        </ThemeProvider>
      </MuseIQProvider>
    </GestureHandlerRootView>
  );
}
