import { musePalette } from '@/components/museiq/theme';
import { useMuseIQ } from '@/providers/museiq-provider';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export default function SplashScreen() {
  const { allPermissionsGranted, isDatabaseReady, museumProfile } = useMuseIQ();

  useEffect(() => {
    if (!isDatabaseReady) {
      return;
    }

    const timeout = setTimeout(() => {
      router.replace('/(drawer)/(tabs)/recorrido' as never);
      if (!allPermissionsGranted) {
        requestAnimationFrame(() => router.push('/permissions-modal' as never));
      }
    }, 2200);

    return () => clearTimeout(timeout);
  }, [allPermissionsGranted, isDatabaseReady]);

  return (
    <View style={styles.container}>
      <View style={styles.logoWrap}>
        <Image contentFit="contain" source={require('@/assets/images/logo.png')} style={styles.logo} />
      </View>
      <Text style={styles.title}>{museumProfile?.name ?? 'MuseIQ'}</Text>
      <Text style={styles.subtitle}>{museumProfile?.routeName ?? 'Preparando recorrido'}</Text>
      <View style={styles.statusBlock}>
        <ActivityIndicator color={musePalette.primaryStrong} />
        <Text style={styles.statusText}>Preparando recorrido</Text>
        <Text style={styles.helperText}>Verificando permisos y configuración del museo</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: musePalette.background,
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  logoWrap: {
    alignItems: 'center',
    backgroundColor: musePalette.surface,
    borderRadius: 36,
    elevation: 4,
    height: 132,
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#15304B',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    width: 132,
  },
  logo: {
    height: 74,
    width: 74,
  },
  title: {
    color: musePalette.primary,
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -1,
  },
  subtitle: {
    color: musePalette.textMuted,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 26,
  },
  statusBlock: {
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    color: musePalette.text,
    fontSize: 16,
    fontWeight: '700',
  },
  helperText: {
    color: musePalette.textMuted,
    fontSize: 13,
    textAlign: 'center',
  },
});
