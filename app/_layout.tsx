import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-gesture-handler";
import "react-native-reanimated";

import { MuseIQProvider } from "@/providers/museiq-provider";

export default function RootLayout() {
  return (
    <MuseIQProvider>
      <ThemeProvider value={DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
        </Stack>
        <StatusBar style="dark" />
      </ThemeProvider>
    </MuseIQProvider>
  );
}
