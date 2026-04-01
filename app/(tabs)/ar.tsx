import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { ViroARScene } from "@reactvision/react-viro/dist/components/AR/ViroARScene";
import { ViroARSceneNavigator } from "@reactvision/react-viro/dist/components/AR/ViroARSceneNavigator";
import { isARSupportedOnDevice } from "@reactvision/react-viro/dist/components/Utilities/ViroUtils";
import { Viro3DSceneNavigator } from "@reactvision/react-viro/dist/components/Viro3DSceneNavigator";
import { ViroScene } from "@reactvision/react-viro/dist/components/ViroScene";
import { ViroText } from "@reactvision/react-viro/dist/components/ViroText";
import Constants from "expo-constants";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    NativeModules,
    Platform,
    StyleSheet,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ARSupportStatus = "supported" | "unsupported" | "transient";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const toSupportStatus = (value: unknown): ARSupportStatus => {
  if (typeof value === "string") {
    const normalized = value.toLowerCase();
    if (normalized.includes("transient")) return "transient";
    if (normalized.includes("unsupported")) return "unsupported";
    if (normalized.includes("supported")) return "supported";
  }

  if (
    value &&
    typeof value === "object" &&
    "isARSupported" in value &&
    typeof (value as { isARSupported: unknown }).isARSupported === "boolean"
  ) {
    return (value as { isARSupported: boolean }).isARSupported
      ? "supported"
      : "unsupported";
  }

  return "unsupported";
};

const isTransientError = (error: unknown): boolean => {
  const message =
    error instanceof Error
      ? error.message.toLowerCase()
      : String(error).toLowerCase();
  return message.includes("transient");
};

export default function ARScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const [isChecking, setIsChecking] = useState(true);
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const checkARSupport = async () => {
      const isExpoGo = Constants.appOwnership === "expo";
      const hasViroNativeBridge = Boolean(NativeModules.VRTMaterialManager);

      if (Platform.OS === "web") {
        if (mounted) {
          setIsSupported(false);
          setError("AR no esta disponible en web.");
          setIsChecking(false);
        }
        return;
      }

      if (isExpoGo) {
        if (mounted) {
          setIsSupported(false);
          setError(
            "AR con Viro no funciona en Expo Go. Abre la app usando tu Development Build (APK dev client).",
          );
          setIsChecking(false);
        }
        return;
      }

      if (!hasViroNativeBridge) {
        if (mounted) {
          setIsSupported(false);
          setError(
            "No se detecto el modulo nativo de Viro en esta build. Recompila el dev client con `npm run android` o `npm run ios` y luego reinicia Metro con `npm run dev:client`.",
          );
          setIsChecking(false);
        }
        return;
      }

      try {
        let status: ARSupportStatus = "transient";

        for (let attempt = 0; attempt < 6 && mounted; attempt += 1) {
          try {
            const rawSupport = await isARSupportedOnDevice();
            status = toSupportStatus(rawSupport);
          } catch (checkError) {
            if (isTransientError(checkError)) {
              status = "transient";
            } else {
              throw checkError;
            }
          }

          if (status !== "transient") {
            break;
          }

          if (mounted) {
            setError("Inicializando ARCore, espera unos segundos...");
          }

          await sleep(1200);
        }

        if (mounted) {
          if (status === "supported") {
            setIsSupported(true);
            setError(null);
          } else {
            setIsSupported(false);
            setError(
              status === "transient"
                ? "ARCore sigue en estado transient. Abre Google Play y actualiza 'Google Play Services for AR', luego reinicia la app."
                : "Este dispositivo no soporta ARCore/ARKit.",
            );
          }
        }
      } catch (supportError) {
        if (mounted) {
          const message =
            supportError instanceof Error
              ? supportError.message
              : "No se pudo verificar AR en este dispositivo.";
          setError(message);
          setIsSupported(false);
        }
      } finally {
        if (mounted) {
          setIsChecking(false);
        }
      }
    };

    checkARSupport();

    return () => {
      mounted = false;
    };
  }, []);

  const errorText = (error ?? "").toLowerCase();
  const shouldShow3DFallback =
    !isChecking &&
    Platform.OS !== "web" &&
    !isSupported &&
    (errorText.includes("unsupported") || errorText.includes("no soporta"));

  const InitialARScene = () => {
    return (
      <ViroARScene>
        <ViroText
          text="Hola AR"
          position={[0, 0, -1]}
          scale={[0.2, 0.2, 0.2]}
          style={styles.viroText}
        />
      </ViroARScene>
    );
  };

  const Initial3DScene = () => {
    return (
      <ViroScene>
        <ViroText
          text="Viro 3D activo (sin ARCore)"
          position={[0, 0, -2]}
          scale={[0.3, 0.3, 0.3]}
          style={styles.viroText}
        />
      </ViroScene>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">AR Test</ThemedText>
        <ThemedText style={styles.subtitle}>
          Prueba base de Viro React con una escena AR simple.
        </ThemedText>
      </ThemedView>

      <View style={[styles.viewerContainer, { borderColor: colors.border }]}>
        {isChecking ? (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color={colors.tint} />
            <ThemedText style={styles.statusText}>
              Verificando soporte AR...
            </ThemedText>
          </View>
        ) : null}

        {!isChecking && Platform.OS === "web" ? (
          <View style={styles.centerContent}>
            <ThemedText style={styles.statusText}>
              AR no esta disponible en web.
            </ThemedText>
          </View>
        ) : null}

        {!isChecking &&
        Platform.OS !== "web" &&
        !isSupported &&
        !shouldShow3DFallback ? (
          <View style={styles.centerContent}>
            <ThemedText style={styles.statusText}>
              No se pudo iniciar AR.
            </ThemedText>
            {error ? (
              <ThemedText style={styles.errorText}>{error}</ThemedText>
            ) : null}
          </View>
        ) : null}

        {shouldShow3DFallback ? (
          <View style={styles.badgeContainer}>
            <ThemedText style={styles.badgeText}>
              Modo 3D (AR no soportado)
            </ThemedText>
          </View>
        ) : null}

        {shouldShow3DFallback ? (
          <Viro3DSceneNavigator
            initialScene={{ scene: Initial3DScene as unknown as never }}
            debug={false}
            onExitViro={() => {}}
            hdrEnabled={false}
            pbrEnabled={false}
            bloomEnabled={false}
            shadowsEnabled={false}
            multisamplingEnabled={false}
            style={StyleSheet.absoluteFillObject}
          />
        ) : null}

        {!isChecking && Platform.OS !== "web" && isSupported ? (
          <ViroARSceneNavigator
            autofocus
            initialScene={{ scene: InitialARScene as unknown as never }}
            style={StyleSheet.absoluteFillObject}
          />
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  header: {
    marginBottom: 12,
    gap: 6,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.8,
  },
  viewerContainer: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  centerContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    gap: 8,
  },
  statusText: {
    textAlign: "center",
    fontSize: 14,
  },
  errorText: {
    textAlign: "center",
    fontSize: 12,
    opacity: 0.7,
  },
  badgeContainer: {
    position: "absolute",
    top: 12,
    left: 12,
    right: 12,
    zIndex: 10,
    alignItems: "center",
  },
  badgeText: {
    fontSize: 12,
    backgroundColor: "rgba(0,0,0,0.55)",
    color: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  viroText: {
    fontFamily: "Arial",
    fontSize: 30,
    color: "#ffffff",
    textAlign: "center",
    textAlignVertical: "center",
  },
});
