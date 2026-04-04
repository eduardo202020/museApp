import { musePalette } from '@/components/museiq/theme';
import {
  AppScreen,
  FloatingVoiceButton,
  PrimaryButton,
  SecondaryButton,
  SectionCard,
  SectionEyebrow,
  StatusPill,
  TopBar,
} from '@/components/museiq/ui';
import { useBleScanner } from '@/hooks/use-ble-scanner';
import { useMuseIQ } from '@/providers/museiq-provider';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { Image } from 'expo-image';
import { router, useNavigation } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function RecorridoHomeScreen() {
  const navigation = useNavigation();
  const {
    artworks,
    currentArtwork,
    currentArtworkId,
    currentRoom,
    currentZoneLabel,
    goToNextArtwork,
    repeatArtworkNarration,
    selectArtwork,
    setCurrentRoomById,
    setCurrentZoneLabel,
  } = useMuseIQ();
  const { beacons, bleState, error, isScanning, startScanning, stopScanning } = useBleScanner({
    defaultTxPowerDbm: -52,
    rssiWindowSize: 7,
    emaAlpha: 0.4,
  });

  useEffect(() => {
    if (beacons.length === 0) {
      return;
    }

    const strongest = beacons[0];
    if (strongest.roomId) {
      setCurrentRoomById(strongest.roomId);
      if (strongest.rssi > -63) {
        setCurrentZoneLabel('frente a la obra');
      } else if (strongest.rssi > -72) {
        setCurrentZoneLabel('zona media');
      } else {
        setCurrentZoneLabel('cerca de la entrada');
      }
    }
  }, [beacons, setCurrentRoomById, setCurrentZoneLabel]);

  const currentSequence = useMemo(() => {
    const index = artworks.findIndex((artwork) => artwork.id === currentArtworkId);
    return {
      previous: artworks[index - 1],
      current: artworks[index],
      next: artworks[index + 1],
    };
  }, [artworks, currentArtworkId]);

  return (
    <View style={{ flex: 1, backgroundColor: musePalette.background }}>
      <AppScreen contentContainerStyle={{ paddingBottom: 120 }}>
        <TopBar
          title="MuseIQ"
          subtitle={currentRoom?.name ?? 'Recorrido'}
          left={
            <Pressable onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
              <Ionicons color={musePalette.primary} name="menu" size={28} />
            </Pressable>
          }
          right={<StatusPill label={`${currentRoom?.name ?? 'Sala'} - ${isScanning ? 'conectado' : 'listo'}`} />}
        />

        <View style={styles.heading}>
          <SectionEyebrow>Ubicación inteligente</SectionEyebrow>
          <Text style={styles.headingTitle}>Sala actual: {currentRoom?.name ?? 'Sin detectar'}</Text>
          <Text style={styles.headingSubtitle}>Zona: {currentZoneLabel}</Text>
        </View>

        <SectionCard style={{ padding: 0, overflow: 'hidden' }}>
          <Image contentFit="cover" source={{ uri: currentArtwork?.image }} style={styles.heroImage} />
          <View style={styles.overlay} />
          <View style={styles.heroCopy}>
            <Text style={styles.heroTag}>Inteligencia de proximidad</Text>
            <Text style={styles.heroHint}>Probablemente estás frente a esta obra</Text>
            <Text style={styles.heroTitle}>{currentArtwork?.title}</Text>
            <Text style={styles.heroMeta}>
              {currentArtwork?.author} · {currentArtwork?.year}
            </Text>
          </View>
          <View style={styles.heroBody}>
            <Text style={styles.summary}>{currentArtwork?.summary}</Text>
            <PrimaryButton icon="play" label="Escuchar" onPress={repeatArtworkNarration} />
            <View style={styles.inlineActions}>
              <SecondaryButton
                icon="information-circle-outline"
                label="Ver detalle"
                onPress={() =>
                  currentArtwork
                    ? router.push({
                        pathname: '/obra/[id]',
                        params: { id: currentArtwork.id },
                      } as never)
                    : undefined
                }
              />
              <SecondaryButton icon="refresh" label="Repetir" onPress={repeatArtworkNarration} />
            </View>
          </View>
        </SectionCard>

        <SectionCard>
          <SectionEyebrow>Orientación en sala</SectionEyebrow>
          <Text style={styles.infoLine}>Sala actual: {currentRoom?.name ?? 'Sin detectar'}</Text>
          <Text style={styles.infoLine}>Zona estimada: {currentZoneLabel}</Text>
          <Text style={styles.infoLine}>Dirección del recorrido: {currentRoom?.directionHint ?? 'continúa adelante'}</Text>
        </SectionCard>

        <SectionCard>
          <SectionEyebrow>Secuencia de obras</SectionEyebrow>
          <View style={styles.sequenceRow}>
            <Text style={styles.sequenceMuted}>{currentSequence.previous?.order.toString().padStart(2, '0') ?? '--'}</Text>
            <View style={styles.sequenceDivider} />
            <Pressable onPress={() => currentArtwork && selectArtwork(currentArtwork.id)} style={styles.sequenceCurrent}>
              <Text style={styles.sequenceCurrentText}>
                {currentSequence.current?.order.toString().padStart(2, '0')} actual
              </Text>
            </Pressable>
            <View style={styles.sequenceDivider} />
            <Text style={styles.sequenceMuted}>{currentSequence.next?.order.toString().padStart(2, '0') ?? '--'}</Text>
          </View>
          <PrimaryButton icon="arrow-forward" label="Siguiente obra" onPress={goToNextArtwork} />
        </SectionCard>

        <SectionCard>
          <SectionEyebrow>Estado del sistema</SectionEyebrow>
          <Text style={styles.infoLine}>
            Bluetooth: {bleState === 'PoweredOn' ? 'activo' : bleState === 'PoweredOff' ? 'apagado' : 'no disponible'}
          </Text>
          <Text style={styles.infoLine}>
            Detección BLE: {beacons.length > 0 ? `${beacons.length} beacon(s) detectados` : 'sin señal BLE'}
          </Text>
          {error ? <Text style={[styles.infoLine, { color: musePalette.danger }]}>{error}</Text> : null}
          {isScanning ? (
            <SecondaryButton icon="pause" label="Detener escaneo" onPress={stopScanning} />
          ) : (
            <PrimaryButton icon="scan" label="Buscar sala" onPress={startScanning} />
          )}
        </SectionCard>
      </AppScreen>

      <FloatingVoiceButton
        onPress={() =>
          router.push({
            pathname: '/pregunta-voz-modal',
            params: { artworkId: currentArtwork?.id },
          } as never)
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  heading: {
    gap: 4,
  },
  headingTitle: {
    color: musePalette.text,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.8,
  },
  headingSubtitle: {
    color: musePalette.textMuted,
    fontSize: 15,
    fontWeight: '600',
  },
  heroImage: {
    height: 360,
    width: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(9,31,51,0.18)',
  },
  heroCopy: {
    bottom: 154,
    gap: 6,
    left: 18,
    position: 'absolute',
    right: 18,
  },
  heroTag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.78)',
    borderRadius: 999,
    color: musePalette.primary,
    fontSize: 11,
    fontWeight: '800',
    overflow: 'hidden',
    paddingHorizontal: 12,
    paddingVertical: 7,
    textTransform: 'uppercase',
  },
  heroHint: {
    color: '#EEF7FF',
    fontSize: 14,
    fontStyle: 'italic',
    fontWeight: '600',
  },
  heroTitle: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: -0.8,
  },
  heroMeta: {
    color: '#EEF7FF',
    fontSize: 14,
    fontWeight: '700',
  },
  heroBody: {
    gap: 14,
    padding: 18,
  },
  summary: {
    color: musePalette.textMuted,
    fontSize: 14,
    lineHeight: 21,
  },
  inlineActions: {
    gap: 10,
  },
  infoLine: {
    color: musePalette.text,
    fontSize: 14,
    lineHeight: 21,
  },
  sequenceRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 6,
  },
  sequenceMuted: {
    color: musePalette.textMuted,
    fontSize: 18,
    fontWeight: '700',
  },
  sequenceDivider: {
    backgroundColor: musePalette.border,
    height: 1,
    marginHorizontal: 12,
    width: 30,
  },
  sequenceCurrent: {
    backgroundColor: musePalette.primarySoft,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  sequenceCurrentText: {
    color: musePalette.primary,
    fontSize: 14,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
});
