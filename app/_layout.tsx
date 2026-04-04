import 'react-native-gesture-handler';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { MuseIQProvider } from '@/providers/museiq-provider';

export default function RootLayout() {
  return (
    <MuseIQProvider>
      <ThemeProvider value={DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="splash" />
          <Stack.Screen name="(drawer)" />
          <Stack.Screen name="obra/[id]" options={{ headerShown: false, presentation: 'card' }} />
          <Stack.Screen
            name="permissions-modal"
            options={{ presentation: 'transparentModal', animation: 'fade' }}
          />
          <Stack.Screen
            name="pregunta-voz-modal"
            options={{ presentation: 'transparentModal', animation: 'fade' }}
          />
        </Stack>
        <StatusBar style="dark" />
      </ThemeProvider>
    </MuseIQProvider>
  );
}
