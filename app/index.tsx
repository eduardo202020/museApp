import { musePalette } from "@/components/museiq/theme";
import {
    AppScreen,
    PrimaryButton,
    SecondaryButton,
    SectionCard,
    StatusPill,
    TopBar,
} from "@/components/museiq/ui";
import { useBleScanner } from "@/hooks/use-ble-scanner";
import { getArtworkImageSource } from "@/lib/artwork-images";
import { useMuseIQ } from "@/providers/museiq-provider";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function IndexScreen() {
  const {
    currentArtwork,
    currentRoom,
    artworks,
    currentArtworkId,
    selectArtwork,
  } = useMuseIQ();

  const roomArtworks = useMemo(
    () =>
      artworks
        .filter((artwork) => artwork.roomId === (currentRoom?.id ?? "SALA_1"))
        .sort((left, right) => left.order - right.order),
    [artworks, currentRoom?.id],
  );

  const currentIndex = roomArtworks.findIndex(
    (artwork) => artwork.id === currentArtworkId,
  );
  const { beacons, isScanning, error: bleError, startScanning, stopScanning } =
    useBleScanner();

  const [isSensorPanelOpen, setIsSensorPanelOpen] = useState(false);
  const [accelerometerStatus, setAccelerometerStatus] = useState("cargando");
  const [compassStatus, setCompassStatus] = useState("cargando");
  const [stepCountStatus, setStepCountStatus] = useState("cargando");
  const [stepCount, setStepCount] = useState<number | null>(null);
  const [movementState, setMovementState] = useState("--");
  const [headingState, setHeadingState] = useState<string | null>(null);
  const fallbackStepCountRef = useRef(0);
  const nativeStepSeenRef = useRef(false);
  const lastEstimatedStepAtRef = useRef(0);
  const smoothedMagnitudeRef = useRef<number | null>(null);

  const previousArtwork =
    currentIndex > 0 ? roomArtworks[currentIndex - 1] : undefined;
  const nextArtwork =
    currentIndex >= 0 && currentIndex < roomArtworks.length - 1
      ? roomArtworks[currentIndex + 1]
      : undefined;

  const imageSource = getArtworkImageSource(currentArtwork?.image);
  const dominantBeacon = beacons[0];
  const bleStatus = dominantBeacon
    ? `${dominantBeacon.roomId} · M${dominantBeacon.beaconNode}`
    : bleError
      ? `error · ${bleError}`
      : isScanning
        ? "buscando sala..."
        : "sin lectura";

  useEffect(() => {
    startScanning().catch(() => undefined);

    return () => {
      stopScanning();
    };
  }, [startScanning, stopScanning]);

  useEffect(() => {
    let isMounted = true;
    let accelerometerSubscription: { remove: () => void } | null = null;
    let magnetometerSubscription: { remove: () => void } | null = null;

    const startCompassTracking = async () => {
      try {
        const sensorsModule = await import("expo-sensors");
        const Accelerometer = sensorsModule.Accelerometer;
        const Magnetometer = sensorsModule.Magnetometer;

        const accelerometerAvailable = await Accelerometer.isAvailableAsync();
        const magnetometerAvailable = await Magnetometer.isAvailableAsync();

        if (!isMounted) {
          return;
        }

        setAccelerometerStatus(
          accelerometerAvailable ? "activo" : "no disponible",
        );
        setCompassStatus(magnetometerAvailable ? "activo" : "no disponible");

        if (accelerometerAvailable) {
          let smoothedDelta = 0;

          Accelerometer.setUpdateInterval(250);
          accelerometerSubscription = Accelerometer.addListener((reading) => {
            const x = reading.x ?? 0;
            const y = reading.y ?? 0;
            const z = reading.z ?? 0;
            const magnitude = Math.sqrt(x * x + y * y + z * z);
            const previousSmoothedMagnitude = smoothedMagnitudeRef.current;
            const nextSmoothedMagnitude =
              previousSmoothedMagnitude === null
                ? magnitude
                : previousSmoothedMagnitude * 0.75 + magnitude * 0.25;
            smoothedMagnitudeRef.current = nextSmoothedMagnitude;

            if (previousSmoothedMagnitude === null) {
              return;
            }

            const delta = Math.abs(magnitude - previousSmoothedMagnitude);
            smoothedDelta = smoothedDelta * 0.8 + delta * 0.2;

            if (isMounted) {
              setMovementState(
                smoothedDelta > 0.06 ? "en movimiento" : "quieto",
              );

              const now = Date.now();
              const canEstimateFallbackStep =
                !nativeStepSeenRef.current &&
                smoothedDelta > 0.09 &&
                now - lastEstimatedStepAtRef.current > 450;

              if (canEstimateFallbackStep) {
                fallbackStepCountRef.current += 1;
                lastEstimatedStepAtRef.current = now;
                setStepCount(fallbackStepCountRef.current);
                setStepCountStatus("estimado por movimiento");
              }
            }
          });
        }

        if (!magnetometerAvailable) {
          return;
        }

        Magnetometer.setUpdateInterval(250);
        magnetometerSubscription = Magnetometer.addListener((reading) => {
          const rawHeading =
            Math.atan2(reading.y ?? 0, reading.x ?? 0) * (180 / Math.PI);
          const normalized = (rawHeading - 90 + 360) % 360;

          if (isMounted) {
            setHeadingState(`${Math.round(normalized)}°`);
          }
        });
      } catch {
        if (isMounted) {
          setAccelerometerStatus("error");
          setCompassStatus("error");
          setMovementState("--");
          setHeadingState(null);
        }
      }
    };

    startCompassTracking().catch(() => {
      if (isMounted) {
        setAccelerometerStatus("error");
        setCompassStatus("error");
        setMovementState("--");
        setHeadingState(null);
      }
    });

    return () => {
      isMounted = false;
      accelerometerSubscription?.remove();
      magnetometerSubscription?.remove();
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    let pedometerSubscription: { remove: () => void } | null = null;

    const startStepTracking = async () => {
      try {
        const sensorsModule = await import("expo-sensors");
        const Pedometer = sensorsModule.Pedometer;
        const permissionResponse = await Pedometer.requestPermissionsAsync();

        if (!permissionResponse.granted) {
          if (isMounted) {
            setStepCountStatus("permiso requerido");
            setStepCount(null);
          }
          return;
        }

        const pedometerAvailable = await Pedometer.isAvailableAsync();

        if (!isMounted) {
          return;
        }

        setStepCountStatus(pedometerAvailable ? "activo" : "no disponible");

        if (!pedometerAvailable) {
          return;
        }

        const runningOnIos = Platform.OS === "ios";

        if (runningOnIos) {
          const startOfDay = new Date();
          startOfDay.setHours(0, 0, 0, 0);

          try {
            const initialCount = await Pedometer.getStepCountAsync(
              startOfDay,
              new Date(),
            );

            if (isMounted) {
              setStepCount(initialCount.steps);
              setStepCountStatus("activo");
            }
          } catch {
            if (isMounted) {
              setStepCount(null);
              setStepCountStatus("esperando lectura");
            }
          }
        } else if (isMounted) {
          setStepCount(null);
          setStepCountStatus("activo · esperando pasos");
        }

        pedometerSubscription = Pedometer.watchStepCount((result) => {
          if (isMounted) {
            nativeStepSeenRef.current = true;
            setStepCount(result.steps);
            setStepCountStatus("activo");
          }
        });
      } catch {
        if (isMounted) {
          setStepCountStatus("error");
          setStepCount(null);
        }
      }
    };

    startStepTracking().catch(() => {
      if (isMounted) {
        setStepCountStatus("error");
        setStepCount(null);
      }
    });

    return () => {
      isMounted = false;
      pedometerSubscription?.remove();
    };
  }, []);

  const openVoiceModal = () => {
    router.push({
      pathname: "/pregunta-voz-modal",
      params: currentArtwork?.id ? { artworkId: currentArtwork.id } : {},
    } as never);
  };

  return (
    <View style={styles.screen}>
      <AppScreen contentContainerStyle={styles.content}>
        <TopBar title="MuseIQ" subtitle={currentRoom?.name ?? "Sala 1"} />

        <SectionCard style={styles.card}>
          <View style={styles.headerRow}>
            <StatusPill label={currentRoom?.name ?? "Sala 1"} />
            <Text style={styles.helper}>Guía curatorial</Text>
          </View>

          <View style={styles.imageWrap}>
            {imageSource ? (
              <Image
                source={imageSource}
                style={styles.image}
                contentFit="contain"
                transition={180}
              />
            ) : (
              <View style={[styles.image, styles.placeholder]}>
                <Text style={styles.placeholderText}>Obra actual</Text>
              </View>
            )}
          </View>

          <PrimaryButton icon="mic" label="Chat" onPress={openVoiceModal} />

          <View style={styles.navRow}>
            <SecondaryButton
              icon="chevron-back"
              label="Anterior"
              onPress={() =>
                previousArtwork && selectArtwork(previousArtwork.id)
              }
              disabled={!previousArtwork}
            />
            <SecondaryButton
              icon="chevron-forward"
              label="Siguiente"
              onPress={() => nextArtwork && selectArtwork(nextArtwork.id)}
              disabled={!nextArtwork}
            />
          </View>
        </SectionCard>
      </AppScreen>

      <View style={styles.sensorPanelWrap}>
        {isSensorPanelOpen ? (
          <View style={styles.sensorPanel}>
            <Text style={styles.sensorPanelTitle}>Sensores</Text>
            <Text style={styles.sensorRow}>
              Acelerómetro: {accelerometerStatus}
            </Text>
            <Text style={styles.sensorRow}>Movimiento: {movementState}</Text>
            <Text style={styles.sensorRow}>
              Orientación / brújula: {compassStatus}
              {headingState ? ` · ${headingState}` : ""}
            </Text>
            <Text style={styles.sensorRow}>
              Pasos: {stepCountStatus}
              {stepCount !== null ? ` · ${stepCount}` : ""}
            </Text>
            <Text style={styles.sensorRow}>BLE: {bleStatus}</Text>
          </View>
        ) : null}

        <Pressable
          onPress={() => setIsSensorPanelOpen((value) => !value)}
          style={({ pressed }) => [
            styles.sensorToggle,
            pressed ? styles.sensorTogglePressed : null,
          ]}
        >
          <Text style={styles.sensorToggleText}>
            {isSensorPanelOpen ? "Ocultar sensores" : "Sensores"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: musePalette.background,
  },
  content: {
    gap: 16,
    paddingBottom: 28,
  },
  card: {
    gap: 14,
  },
  headerRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  helper: {
    color: musePalette.textMuted,
    fontSize: 12,
    fontWeight: "700",
  },
  imageWrap: {
    borderRadius: 22,
    overflow: "hidden",
  },
  image: {
    backgroundColor: musePalette.surfaceMuted,
    height: 340,
    width: "100%",
  },
  placeholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    color: musePalette.textMuted,
    fontSize: 15,
    fontWeight: "800",
  },
  navRow: {
    flexDirection: "row",
    gap: 10,
  },
  sensorPanelWrap: {
    bottom: 14,
    position: "absolute",
    right: 12,
    alignItems: "flex-end",
    gap: 8,
  },
  sensorToggle: {
    backgroundColor: musePalette.primaryStrong,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: musePalette.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 4,
  },
  sensorTogglePressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  sensorToggleText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "800",
  },
  sensorPanel: {
    backgroundColor: "rgba(255,255,255,0.92)",
    borderColor: musePalette.border,
    borderRadius: 16,
    borderWidth: 1,
    gap: 4,
    maxWidth: 220,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  sensorPanelTitle: {
    color: musePalette.text,
    fontSize: 13,
    fontWeight: "900",
    marginBottom: 2,
  },
  sensorRow: {
    color: musePalette.textMuted,
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 17,
  },
});
