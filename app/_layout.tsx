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
            <Stack.Screen name="seleccionar-museo" />
            <Stack.Screen name="preparacion-visita" />
            <Stack.Screen name="obra-identificada" />
            <Stack.Screen name="cargando-ar" />
            <Stack.Screen name="ar-no-disponible" />
            <Stack.Screen name="ar-activo" />
            <Stack.Screen name="ar-chat-ia" />
            <Stack.Screen name="ar-hotspot-seleccionado" />
            <Stack.Screen name="ar-audio-activo" />
            <Stack.Screen name="visor-3d" />
            <Stack.Screen name="artwork-detail" />
            <Stack.Screen name="artwork-images" />
            <Stack.Screen name="(drawer)" />
            <Stack.Screen
              name="pregunta-voz-modal"
              options={{ presentation: "transparentModal", animation: "slide_from_bottom" }}
            />
          </Stack>
          <StatusBar style="dark" />
        </ThemeProvider>
      </MuseIQProvider>
    </GestureHandlerRootView>
  );
}
