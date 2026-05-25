import {
  CabezaClavaModelView,
  type HeadTrackingDebugState,
} from "@/components/museiq/cabeza-clava-model-view";
import { arColors } from "@/components/museiq/ar-flow";
import { getRoomImmersiveExperience } from "@/lib/room-experiences";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

type MotionPermissionState = "checking" | "granted" | "prompt" | "blocked" | "unavailable";
type MotionCapabilities = {
  accelerometerAvailable: boolean | null;
  deviceMotionAvailable: boolean | null;
  gyroscopeAvailable: boolean | null;
  magnetometerAvailable: boolean | null;
};

const ENABLE_VR_TERMINAL_LOGS = false;
const VR_FRAME_HEIGHT_RATIO = 0.72;
const VR_FRAME_WIDTH_RATIO = 0.82;

function logVr(...args: Parameters<typeof console.log>) {
  if (ENABLE_VR_TERMINAL_LOGS) {
    console.log(...args);
  }
}

function warnVr(...args: Parameters<typeof console.warn>) {
  if (ENABLE_VR_TERMINAL_LOGS) {
    console.warn(...args);
  }
}

export default function SalaInmersivaScreen() {
  const insets = useSafeAreaInsets();
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  const { roomId } = useLocalSearchParams<{ roomId?: string }>();
  const experience = getRoomImmersiveExperience(roomId);
  const [headTrackingDebug, setHeadTrackingDebug] = useState<HeadTrackingDebugState | null>(null);
  const [motionCapabilities, setMotionCapabilities] = useState<MotionCapabilities>({
    accelerometerAvailable: null,
    deviceMotionAvailable: null,
    gyroscopeAvailable: null,
    magnetometerAvailable: null,
  });
  const [motionPermissionState, setMotionPermissionState] =
    useState<MotionPermissionState>("checking");
  const [isDebugCollapsed, setDebugCollapsed] = useState(true);
  const lastTerminalLogAtRef = useRef(0);
  const lastTerminalLogSignatureRef = useRef("");
  const [modelCanMount, setModelCanMount] = useState(false);
  const [recenterSignal, setRecenterSignal] = useState(0);
  const [nativeLandscapeLockReady, setNativeLandscapeLockReady] = useState(false);

  useEffect(() => {
    if (!experience) {
      return;
    }

    let isMounted = true;
    let screenOrientationModule: {
      OrientationLock: { LANDSCAPE: number; PORTRAIT_UP: number };
      lockAsync: (lock: number) => Promise<void>;
    } | null = null;

    const lockLandscape = async () => {
      try {
        const loadedModule = await import("expo-screen-orientation");
        screenOrientationModule = loadedModule;
        await loadedModule.lockAsync(loadedModule.OrientationLock.LANDSCAPE);
        if (isMounted) {
          setNativeLandscapeLockReady(true);
        }
      } catch (error) {
        warnVr("[MuseIQ][VR] No se pudo bloquear landscape nativo", error);
        if (isMounted) {
          setNativeLandscapeLockReady(false);
        }
      }
    };

    lockLandscape().catch((error) => {
      warnVr("[MuseIQ][VR] No se pudo bloquear landscape nativo", error);
      if (isMounted) {
        setNativeLandscapeLockReady(false);
      }
    });

    return () => {
      isMounted = false;
      setNativeLandscapeLockReady(false);
      screenOrientationModule
        ?.lockAsync(screenOrientationModule.OrientationLock.PORTRAIT_UP)
        .catch((error) => {
          warnVr("[MuseIQ][VR] No se pudo restaurar portrait", error);
        });
    };
  }, [experience]);

  const requestMotionPermission = useCallback(async () => {
    try {
      const sensorsModule = await import("expo-sensors");
      const Accelerometer = sensorsModule.Accelerometer;
      const DeviceMotion = sensorsModule.DeviceMotion;
      const Gyroscope = sensorsModule.Gyroscope;
      const Magnetometer = sensorsModule.Magnetometer;
      const MagnetometerUncalibrated = sensorsModule.MagnetometerUncalibrated;

      if (Platform.OS === "android") {
        const [
          accelerometerAvailable,
          deviceMotionAvailable,
          gyroscopeAvailable,
          magnetometerAvailable,
          uncalibratedMagnetometerAvailable,
        ] = await Promise.all([
          Accelerometer.isAvailableAsync().catch(() => false),
          DeviceMotion.isAvailableAsync().catch(() => false),
          Gyroscope.isAvailableAsync().catch(() => false),
          Magnetometer.isAvailableAsync().catch(() => false),
          MagnetometerUncalibrated.isAvailableAsync().catch(() => false),
        ]);
        const anyMagnetometerAvailable =
          magnetometerAvailable || uncalibratedMagnetometerAvailable;
        setMotionCapabilities({
          accelerometerAvailable,
          deviceMotionAvailable,
          gyroscopeAvailable,
          magnetometerAvailable: anyMagnetometerAvailable,
        });

        setMotionPermissionState(
          deviceMotionAvailable ||
            gyroscopeAvailable ||
            (accelerometerAvailable && anyMagnetometerAvailable)
            ? "granted"
            : "unavailable",
        );
        return;
      }

      const available = await DeviceMotion.isAvailableAsync();

      if (!available) {
        setMotionPermissionState("unavailable");
        return;
      }

      const permissions = await DeviceMotion.getPermissionsAsync();
      if (permissions.granted) {
        setMotionPermissionState("granted");
        return;
      }

      if (!permissions.canAskAgain) {
        setMotionPermissionState("blocked");
        return;
      }

      const nextPermissions = await DeviceMotion.requestPermissionsAsync();
      setMotionPermissionState(nextPermissions.granted ? "granted" : "blocked");
    } catch {
      setMotionPermissionState("unavailable");
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const checkMotionPermission = async () => {
      try {
        logVr("[MuseIQ][VR] Iniciando chequeo de sensores");
        const sensorsModule = await import("expo-sensors");
        const Accelerometer = sensorsModule.Accelerometer;
        const DeviceMotion = sensorsModule.DeviceMotion;
        const Gyroscope = sensorsModule.Gyroscope;
        const Magnetometer = sensorsModule.Magnetometer;
        const MagnetometerUncalibrated = sensorsModule.MagnetometerUncalibrated;

        if (Platform.OS === "android") {
          const [
            accelerometerAvailable,
            deviceMotionAvailable,
            gyroscopeAvailable,
            magnetometerAvailable,
            uncalibratedMagnetometerAvailable,
          ] = await Promise.all([
            Accelerometer.isAvailableAsync().catch(() => false),
            DeviceMotion.isAvailableAsync().catch(() => false),
            Gyroscope.isAvailableAsync().catch(() => false),
            Magnetometer.isAvailableAsync().catch(() => false),
            MagnetometerUncalibrated.isAvailableAsync().catch(() => false),
          ]);
          const anyMagnetometerAvailable =
            magnetometerAvailable || uncalibratedMagnetometerAvailable;
          setMotionCapabilities({
            accelerometerAvailable,
            deviceMotionAvailable,
            gyroscopeAvailable,
            magnetometerAvailable: anyMagnetometerAvailable,
          });
          logVr("[MuseIQ][VR] Sensores Android", {
            accelerometerAvailable,
            deviceMotionAvailable,
            gyroscopeAvailable,
            magnetometerAvailable,
            uncalibratedMagnetometerAvailable,
          });

          if (!isMounted) {
            return;
          }

          setMotionPermissionState(
            deviceMotionAvailable ||
              gyroscopeAvailable ||
              (accelerometerAvailable && anyMagnetometerAvailable)
              ? "granted"
              : "unavailable",
          );
          return;
        }

        const available = await DeviceMotion.isAvailableAsync();

        if (!isMounted) {
          return;
        }

        if (!available) {
          setMotionPermissionState("unavailable");
          return;
        }

        const permissions = await DeviceMotion.getPermissionsAsync();
        if (!isMounted) {
          return;
        }

        if (permissions.granted) {
          setMotionPermissionState("granted");
          return;
        }

        setMotionPermissionState(permissions.canAskAgain ? "prompt" : "blocked");
      } catch (error) {
        warnVr("[MuseIQ][VR] Error al chequear sensores", error);
        if (isMounted) {
          setMotionPermissionState("unavailable");
        }
      }
    };

    checkMotionPermission().catch(() => {
      if (isMounted) {
        setMotionPermissionState("unavailable");
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    setModelCanMount(false);

    if (!experience || motionPermissionState === "checking") {
      return;
    }

    const timeout = setTimeout(() => {
      logVr("[MuseIQ][VR] Montando visor 3D inmersivo");
      setModelCanMount(true);
    }, 350);

    return () => {
      clearTimeout(timeout);
    };
  }, [experience, motionPermissionState, windowHeight, windowWidth]);

  useEffect(() => {
    const payload = {
      dmAvail:
        headTrackingDebug?.deviceMotionAvailable ?? motionCapabilities.deviceMotionAvailable,
      accelAvail:
        headTrackingDebug?.accelerometerAvailable ?? motionCapabilities.accelerometerAvailable,
      dmEvents: headTrackingDebug?.deviceMotionEvents ?? 0,
      error: headTrackingDebug?.error ?? null,
      accel: [
        formatMetric(headTrackingDebug?.accelX),
        formatMetric(headTrackingDebug?.accelY),
        formatMetric(headTrackingDebug?.accelZ),
      ],
      gyro: [
        formatMetric(headTrackingDebug?.gyroX),
        formatMetric(headTrackingDebug?.gyroY),
        formatMetric(headTrackingDebug?.gyroZ),
      ],
      gyroAvail: headTrackingDebug?.gyroscopeAvailable ?? motionCapabilities.gyroscopeAvailable,
      gyroEvents: headTrackingDebug?.gyroscopeEvents ?? 0,
      mag: [
        formatMetric(headTrackingDebug?.magX),
        formatMetric(headTrackingDebug?.magY),
        formatMetric(headTrackingDebug?.magZ),
      ],
      magAvail:
        headTrackingDebug?.magnetometerAvailable ?? motionCapabilities.magnetometerAvailable,
      magEvents: headTrackingDebug?.magnetometerEvents ?? 0,
      permission: motionPermissionState,
      pitch: formatMetric(headTrackingDebug?.pitch),
      source: headTrackingDebug?.source ?? "none",
      yaw: formatMetric(headTrackingDebug?.yaw),
    };
    const signature = JSON.stringify(payload);
    const now = Date.now();
    const enoughTimePassed = now - lastTerminalLogAtRef.current > 250;
    const changed = signature !== lastTerminalLogSignatureRef.current;

    if (!changed || !enoughTimePassed) {
      return;
    }

    lastTerminalLogAtRef.current = now;
    lastTerminalLogSignatureRef.current = signature;
    logVr("[MuseIQ][VR]", payload);
  }, [headTrackingDebug, motionCapabilities, motionPermissionState]);

  useEffect(() => {
    if (motionPermissionState !== "granted") {
      return;
    }

    const timeout = setTimeout(() => {
      setRecenterSignal((current) => current + 1);
    }, 1200);

    return () => {
      clearTimeout(timeout);
    };
  }, [motionPermissionState]);

  if (!experience) {
    return (
      <View style={styles.screen}>
        <StatusBar style="light" />
        <SafeAreaView edges={["top", "left", "right"]} style={styles.overlaySafeArea}>
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Experiencia inmersiva no disponible</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const usesLandscapeFallback = Platform.OS === "android" && windowWidth < windowHeight;
  const effectiveViewerWidth = usesLandscapeFallback ? windowHeight : windowWidth;
  const effectiveViewerHeight = usesLandscapeFallback ? windowWidth : windowHeight;
  const framedViewerWidth = Math.round(effectiveViewerWidth * VR_FRAME_WIDTH_RATIO);
  const framedViewerHeight = Math.round(effectiveViewerHeight * VR_FRAME_HEIGHT_RATIO);
  const viewerStageStyle = usesLandscapeFallback
    ? [
        styles.viewerStage,
        styles.viewerStageLandscapeFallback,
        {
          height: framedViewerHeight,
          left: (windowWidth - framedViewerWidth) / 2,
          top: (windowHeight - framedViewerHeight) / 2,
          width: framedViewerWidth,
        },
      ]
    : [
        styles.viewerStage,
        {
          bottom: "auto" as const,
          height: framedViewerHeight,
          left: (windowWidth - framedViewerWidth) / 2,
          right: "auto" as const,
          top: (windowHeight - framedViewerHeight) / 2,
          width: framedViewerWidth,
        },
      ];

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <View style={viewerStageStyle}>
        {modelCanMount ? (
          <CabezaClavaModelView
            key={`${framedViewerWidth}x${framedViewerHeight}-${
              motionPermissionState === "granted" ? "tracked" : "manual"
            }`}
            headTracking={motionPermissionState === "granted"}
            interactive={motionPermissionState !== "granted"}
            modelAsset={experience.modelAsset}
            modelLabel={experience.modelLabel}
            onHeadTrackingDebug={setHeadTrackingDebug}
            recenterSignal={recenterSignal}
            stereo
            style={styles.model}
            viewMode="immersive"
          />
        ) : (
          <View style={styles.modelBootOverlay}>
            <ActivityIndicator color={arColors.primary} size="small" />
            <Text style={styles.modelBootText}>Inicializando sensores</Text>
          </View>
        )}
      </View>

      <SafeAreaView edges={["top", "left", "right"]} style={styles.overlaySafeArea}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.backButton,
            { top: insets.top + 10 },
            pressed ? styles.pressed : null,
          ]}
        >
          <Ionicons color="#FFFFFF" name="arrow-back" size={28} />
        </Pressable>
        <View pointerEvents="box-none" style={styles.debugOverlay}>
          {isDebugCollapsed ? (
            <Pressable
              onPress={() => setDebugCollapsed(false)}
              style={({ pressed }) => [
                styles.debugCollapsedButton,
                pressed ? styles.pressed : null,
              ]}
            >
              <Ionicons color="#7DD3FC" name="bug-outline" size={16} />
              <Text style={styles.debugCollapsedLabel}>Debug</Text>
            </Pressable>
          ) : (
            <View style={styles.debugCard}>
              <View style={styles.debugHeader}>
                <Text style={styles.debugTitle}>VR Debug</Text>
                <Pressable
                  onPress={() => setDebugCollapsed(true)}
                  style={({ pressed }) => [
                    styles.debugCollapseButton,
                    pressed ? styles.pressed : null,
                  ]}
                >
                  <Ionicons color="#7DD3FC" name="chevron-up-outline" size={16} />
                </Pressable>
              </View>
              <Text style={styles.debugLine}>
                {`permiso=${motionPermissionState} source=${headTrackingDebug?.source ?? "none"}`}
              </Text>
              <Text style={styles.debugLine}>
                {`native_landscape=${nativeLandscapeLockReady ? "si" : "no"} fallback=${usesLandscapeFallback ? "si" : "no"}`}
              </Text>
              <Text style={styles.debugLine}>
                {`dm_avail=${formatFlag(headTrackingDebug?.deviceMotionAvailable ?? motionCapabilities.deviceMotionAvailable)} dm_events=${headTrackingDebug?.deviceMotionEvents ?? 0}`}
              </Text>
              <Text style={styles.debugLine}>
                {`gyro_avail=${formatFlag(headTrackingDebug?.gyroscopeAvailable ?? motionCapabilities.gyroscopeAvailable)} gyro_events=${headTrackingDebug?.gyroscopeEvents ?? 0}`}
              </Text>
              <Text style={styles.debugLine}>
                {`accel_avail=${formatFlag(headTrackingDebug?.accelerometerAvailable ?? motionCapabilities.accelerometerAvailable)} accel_events=${headTrackingDebug?.accelerometerEvents ?? 0}`}
              </Text>
              <Text style={styles.debugLine}>
                {`mag_avail=${formatFlag(headTrackingDebug?.magnetometerAvailable ?? motionCapabilities.magnetometerAvailable)} mag_events=${headTrackingDebug?.magnetometerEvents ?? 0}`}
              </Text>
              <Text style={styles.debugLine}>
                {`alpha=${formatMetric(headTrackingDebug?.alpha)} beta=${formatMetric(headTrackingDebug?.beta)}`}
              </Text>
              <Text style={styles.debugLine}>
                {`accel=(${formatMetric(headTrackingDebug?.accelX)}, ${formatMetric(headTrackingDebug?.accelY)}, ${formatMetric(headTrackingDebug?.accelZ)})`}
              </Text>
              <Text style={styles.debugLine}>
                {`gyro=(${formatMetric(headTrackingDebug?.gyroX)}, ${formatMetric(headTrackingDebug?.gyroY)}, ${formatMetric(headTrackingDebug?.gyroZ)})`}
              </Text>
              <Text style={styles.debugLine}>
                {`mag=(${formatMetric(headTrackingDebug?.magX)}, ${formatMetric(headTrackingDebug?.magY)}, ${formatMetric(headTrackingDebug?.magZ)})`}
              </Text>
              <Text style={styles.debugLine}>
                {`yaw=${formatMetric(headTrackingDebug?.yaw)} pitch=${formatMetric(headTrackingDebug?.pitch)}`}
              </Text>
              <Text style={styles.debugLine}>
                {`error=${headTrackingDebug?.error ?? "--"} platform=${headTrackingDebug?.platform ?? Platform.OS}`}
              </Text>
              <Pressable
                onPress={() => {
                  setRecenterSignal((current) => current + 1);
                }}
                style={({ pressed }) => [
                  styles.recenterButton,
                  pressed ? styles.pressed : null,
                ]}
              >
                <Ionicons color="#03131E" name="locate-outline" size={15} />
                <Text style={styles.recenterButtonLabel}>Recentrar vista</Text>
              </Pressable>
            </View>
          )}
        </View>

        {motionPermissionState !== "granted" ? (
          <View pointerEvents="box-none" style={styles.permissionOverlay}>
            <View style={styles.permissionCard}>
              <Text style={styles.permissionTitle}>Permiso de movimiento</Text>
              <Text style={styles.permissionBody}>
                {motionPermissionState === "checking"
                  ? "Verificando sensores para activar el visor inmersivo."
                  : motionPermissionState === "blocked"
                    ? "El permiso fue bloqueado. Activalo desde ajustes para mover la vista con tu cabeza."
                  : motionPermissionState === "unavailable"
                      ? "Este dispositivo no expone Device Motion, Gyroscope ni el combo Accelerometer + Magnetometer para la experiencia inmersiva."
                      : "Activa el permiso de movimiento para que el visor responda a tu cabeza en Android."}
              </Text>
              {motionPermissionState === "checking" ? (
                <ActivityIndicator color={arColors.primary} size="small" />
              ) : motionPermissionState === "prompt" ? (
                <Pressable
                  onPress={() => {
                    requestMotionPermission().catch(() => {
                      setMotionPermissionState("unavailable");
                    });
                  }}
                  style={({ pressed }) => [
                    styles.permissionButton,
                    pressed ? styles.pressed : null,
                  ]}
                >
                  <Ionicons color="#03131E" name="compass-outline" size={18} />
                  <Text style={styles.permissionButtonLabel}>Activar movimiento</Text>
                </Pressable>
              ) : null}
            </View>
          </View>
        ) : null}
      </SafeAreaView>
    </View>
  );
}

function formatFlag(value: boolean | null | undefined) {
  if (value === null || value === undefined) {
    return "--";
  }

  return value ? "si" : "no";
}

function formatMetric(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "--";
  }

  return value.toFixed(2);
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: "#05080D",
    flex: 1,
    overflow: "hidden",
  },
  overlaySafeArea: {
    ...StyleSheet.absoluteFillObject,
  },
  backButton: {
    alignItems: "center",
    backgroundColor: arColors.glassFill,
    borderColor: arColors.glassBorder,
    borderRadius: 18,
    borderWidth: 1,
    height: 58,
    justifyContent: "center",
    left: 22,
    position: "absolute",
    width: 58,
    zIndex: 30,
  },
  viewerStage: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000000",
  },
  viewerStageLandscapeFallback: {
    bottom: "auto",
    right: "auto",
    transform: [{ rotate: "90deg" }],
  },
  model: {
    ...StyleSheet.absoluteFillObject,
  },
  modelBootOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    gap: 10,
    justifyContent: "center",
  },
  modelBootText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
  debugOverlay: {
    left: 16,
    maxWidth: 320,
    position: "absolute",
    top: 140,
    zIndex: 45,
  },
  debugCard: {
    backgroundColor: "rgba(4,7,12,0.88)",
    borderColor: "rgba(89,190,255,0.32)",
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  debugCollapsedButton: {
    alignItems: "center",
    backgroundColor: "rgba(4,7,12,0.82)",
    borderColor: "rgba(89,190,255,0.32)",
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: 6,
    minHeight: 38,
    paddingHorizontal: 13,
  },
  debugCollapsedLabel: {
    color: "#D5ECFF",
    fontSize: 12,
    fontWeight: "900",
  },
  debugHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  debugCollapseButton: {
    alignItems: "center",
    height: 26,
    justifyContent: "center",
    width: 26,
  },
  debugTitle: {
    color: "#7DD3FC",
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  debugLine: {
    color: "#D5ECFF",
    fontSize: 11,
    fontWeight: "600",
    lineHeight: 15,
  },
  recenterButton: {
    alignItems: "center",
    backgroundColor: "#7DD3FC",
    borderRadius: 999,
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
    marginTop: 10,
    minHeight: 34,
    paddingHorizontal: 12,
  },
  recenterButtonLabel: {
    color: "#03131E",
    fontSize: 12,
    fontWeight: "900",
  },
  permissionOverlay: {
    alignItems: "center",
    bottom: 28,
    left: 18,
    position: "absolute",
    right: 18,
    zIndex: 40,
  },
  permissionCard: {
    alignItems: "center",
    backgroundColor: "rgba(7,10,15,0.9)",
    borderColor: "rgba(255,255,255,0.16)",
    borderRadius: 22,
    borderWidth: 1,
    gap: 14,
    maxWidth: 480,
    paddingHorizontal: 20,
    paddingVertical: 18,
    width: "100%",
  },
  permissionTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "900",
  },
  permissionBody: {
    color: "rgba(255,255,255,0.76)",
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 19,
    textAlign: "center",
  },
  permissionButton: {
    alignItems: "center",
    backgroundColor: arColors.primary,
    borderRadius: 999,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    minHeight: 46,
    paddingHorizontal: 18,
  },
  permissionButtonLabel: {
    color: "#03131E",
    fontSize: 14,
    fontWeight: "900",
  },
  emptyState: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
  },
  pressed: {
    opacity: 0.84,
    transform: [{ scale: 0.99 }],
  },
});
