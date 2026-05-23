import {
  ArBottomHud,
  ArSceneBackground,
  ArTopStatusHud,
  arColors,
} from "@/components/museiq/ar-flow";
import {
  getCabezaClavaModelAssetForArtwork,
  prepareCabezaClavaModel,
} from "@/components/museiq/cabeza-clava-model-view";
import { musePalette } from "@/components/museiq/theme";
import { useMuseIQ } from "@/providers/museiq-provider";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function getLoadingCopy(artworkTitle?: string) {
  return artworkTitle
    ? `Preparando el modelo 3D de ${artworkTitle}`
    : "Preparando la experiencia AR";
}

export default function CargandoArScreen() {
  const { artworkId } = useLocalSearchParams<{ artworkId?: string }>();
  const {
    currentArtwork,
    currentRoom,
    findArtworkById,
    findRoomById,
    museumProfile,
    selectArtwork,
  } = useMuseIQ();
  const artwork = findArtworkById(artworkId) ?? currentArtwork;
  const room = findRoomById(artwork?.roomId) ?? currentRoom;
  const [progress, setProgress] = useState(0);
  const [targetProgress, setTargetProgress] = useState(0);
  const [statusText, setStatusText] = useState("Iniciando carga del modelo 3D...");
  const [isModelReady, setIsModelReady] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((currentProgress) => {
        if (currentProgress >= targetProgress) {
          return currentProgress;
        }

        const remaining = targetProgress - currentProgress;
        const step = remaining > 24 ? 3 : remaining > 8 ? 2 : 1;
        return Math.min(targetProgress, currentProgress + step);
      });
    }, 28);

    return () => clearInterval(timer);
  }, [targetProgress]);

  useEffect(() => {
    if (!artwork) {
      return;
    }

    let isMounted = true;
    const model = getCabezaClavaModelAssetForArtwork(artwork.id);

    setProgress(0);
    setTargetProgress(0);
    setIsModelReady(false);
    setStatusText("Descargando el modelo 3D...");

    prepareCabezaClavaModel(model.asset, (nextProgress) => {
      if (!isMounted) {
        return;
      }

      setTargetProgress((currentProgress) => Math.max(currentProgress, nextProgress));

      if (nextProgress < 42) {
        setStatusText("Descargando el modelo 3D...");
        return;
      }
      if (nextProgress < 76) {
        setStatusText("Leyendo el archivo del modelo...");
        return;
      }
      if (nextProgress < 100) {
        setStatusText("Procesando la geometria y las texturas...");
        return;
      }
      setStatusText("Modelo listo. Abriendo la experiencia...");
    })
      .then(() => {
        if (!isMounted) {
          return;
        }

        setTargetProgress(100);
        setIsModelReady(true);
        setStatusText("Modelo listo. Abriendo la experiencia...");
      })
      .catch((error) => {
        if (!isMounted) {
          return;
        }

        setStatusText(
          error instanceof Error ? error.message : "No se pudo preparar el modelo 3D.",
        );
      });

    return () => {
      isMounted = false;
    };
  }, [artwork, selectArtwork]);

  const displayProgress = Math.max(0, Math.min(100, Math.round(progress)));

  useEffect(() => {
    if (!artwork || !isModelReady || displayProgress < 100) {
      return;
    }

    const timer = setTimeout(() => {
      selectArtwork(artwork.id);
      router.replace({
        pathname: "/ar-activo",
        params: { artworkId: artwork.id, prepared: "1" },
      } as never);
    }, 180);

    return () => clearTimeout(timer);
  }, [artwork, displayProgress, isModelReady, selectArtwork]);

  if (!artwork) {
    return (
      <View style={styles.screen}>
        <StatusBar style="light" />
        <SafeAreaView style={styles.safeArea}>
          <Pressable onPress={() => router.back()} style={styles.backOnly}>
            <Ionicons color="#FFFFFF" name="arrow-back" size={28} />
          </Pressable>
          <View style={styles.emptyState}>
            <Ionicons color={musePalette.primary} name="cube-outline" size={42} />
            <Text style={styles.emptyTitle}>Experiencia AR no disponible</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const museumName = museumProfile?.name ?? "MuseIQ";
  const roomName = room?.name ?? "Sala por confirmar";
  const statusLabel = room?.statusLabel ?? "Senal estable";
  const loadingCopy = getLoadingCopy(artwork.title);
  const progressLabel = `${displayProgress}%`;
  const showReadyState = isModelReady && displayProgress >= 100;

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <ArSceneBackground dim="rgba(5,8,13,0.32)" />

      <SafeAreaView style={styles.safeArea}>
        <ArTopStatusHud museumName={museumName} roomName={roomName} statusLabel={statusLabel} />

        <View style={styles.loadingCenter}>
          {showReadyState ? (
            <View style={styles.readyBlock}>
              <View style={styles.readyBadge}>
                <Ionicons color={musePalette.success} name="checkmark-circle" size={54} />
              </View>
              <Text style={styles.loadingTitle}>Modelo 3D listo</Text>
              <Text numberOfLines={2} style={styles.loadingSubtitle}>
                La experiencia AR se abrira automaticamente.
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.ringOuter}>
                <View style={styles.ringInner}>
                  <Text style={styles.progressText}>{progressLabel}</Text>
                </View>
              </View>

              <Text style={styles.loadingTitle}>Cargando experiencia AR...</Text>
              <Text numberOfLines={2} style={styles.loadingSubtitle}>
                {statusText || loadingCopy}
              </Text>

              <View style={styles.tipCard}>
                <View style={styles.tipCopy}>
                  <View style={styles.tipHeader}>
                    <Ionicons color={musePalette.success} name="bulb-outline" size={20} />
                    <Text style={styles.tipTitle}>Consejo</Text>
                  </View>
                  <Text style={styles.tipText}>
                    Esta carga ya prepara el modelo real. Cuando termine, la pantalla siguiente entrara con la obra lista.
                  </Text>
                </View>
                <Ionicons color="rgba(255,255,255,0.34)" name="phone-portrait-outline" size={54} />
              </View>
            </>
          )}
        </View>

        <ArBottomHud
          bottomIcon="cube-outline"
          bottomText={isModelReady ? "Modelo 3D listo." : "Cargando modelo 3D..."}
          centralActive
          centralLabel={isModelReady ? "Abriendo experiencia" : "Preparando modelo"}
          onCentral={() => undefined}
          onExplore={() => router.push("/home" as never)}
          onQr={() => router.push("/home" as never)}
          progress={displayProgress}
          progressLabel={progressLabel}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: "#05080D",
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  loadingCenter: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  readyBlock: {
    alignItems: "center",
    flex: 1,
    gap: 14,
    justifyContent: "center",
    width: "100%",
  },
  readyBadge: {
    alignItems: "center",
    justifyContent: "center",
  },
  ringOuter: {
    alignItems: "center",
    borderColor: "rgba(255,255,255,0.10)",
    borderRadius: 120,
    borderWidth: 15,
    height: 178,
    justifyContent: "center",
    width: 178,
  },
  ringInner: {
    alignItems: "center",
    borderColor: musePalette.success,
    borderRadius: 999,
    borderWidth: 12,
    height: 128,
    justifyContent: "center",
    width: 128,
  },
  progressText: {
    color: "#FFFFFF",
    fontSize: 35,
    fontWeight: "900",
  },
  loadingTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
    marginTop: 22,
    textAlign: "center",
  },
  loadingSubtitle: {
    color: "rgba(255,255,255,0.86)",
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 19,
    marginTop: 8,
    maxWidth: 310,
    textAlign: "center",
  },
  tipCard: {
    alignItems: "center",
    backgroundColor: arColors.glassFill,
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    gap: 14,
    marginTop: 28,
    minHeight: 112,
    paddingHorizontal: 16,
    width: "100%",
  },
  tipCopy: {
    flex: 1,
    gap: 8,
    minWidth: 0,
  },
  tipHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  tipTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  tipText: {
    color: "rgba(255,255,255,0.76)",
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 17,
  },
  backOnly: {
    alignItems: "center",
    height: 50,
    justifyContent: "center",
    marginLeft: 14,
    marginTop: 8,
    width: 50,
  },
  emptyState: {
    alignItems: "center",
    flex: 1,
    gap: 12,
    justifyContent: "center",
  },
  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
  },
});
