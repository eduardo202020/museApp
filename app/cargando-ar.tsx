import {
  ArArtifactModel,
  ArBottomHud,
  ArSceneBackground,
  ArTopStatusHud,
  arColors,
} from "@/components/museiq/ar-flow";
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

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((value) => {
        if (value >= 100) {
          clearInterval(timer);
          return 100;
        }

        return Math.min(100, value + 4);
      });
    }, 90);

    return () => clearInterval(timer);
  }, []);

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
  const progressLabel = `${progress}%`;
  const isModelReady = progress >= 100;

  const openArActive = () => {
    selectArtwork(artwork.id);
    router.push({ pathname: "/ar-activo", params: { artworkId: artwork.id } } as never);
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <ArSceneBackground dim="rgba(5,8,13,0.32)" />

      <SafeAreaView style={styles.safeArea}>
        <ArTopStatusHud museumName={museumName} roomName={roomName} statusLabel={statusLabel} />

        <View style={styles.loadingCenter}>
          {isModelReady ? (
            <View style={styles.readyBlock}>
              <ArArtifactModel artworkId={artwork.id} interactive style={styles.readyModel} />
              <Text style={styles.loadingTitle}>Modelo 3D listo</Text>
              <Text numberOfLines={2} style={styles.loadingSubtitle}>
                Modelo 3D preparado para la vista temporal.
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
                {loadingCopy}
              </Text>

              <View style={styles.tipCard}>
                <View style={styles.tipCopy}>
                  <View style={styles.tipHeader}>
                    <Ionicons color={musePalette.success} name="bulb-outline" size={20} />
                    <Text style={styles.tipTitle}>Consejo</Text>
                  </View>
                  <Text style={styles.tipText}>
                    AR aun no esta operativo. Primero terminaremos las pantallas y usaremos el modelo 3D como vista temporal.
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
          centralLabel={isModelReady ? "Ver modelo 3D" : "Preparando modelo"}
          onCentral={openArActive}
          onExplore={() => router.push("/home" as never)}
          onQr={() => router.push("/home" as never)}
          progress={progress}
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
    justifyContent: "center",
    width: "100%",
  },
  readyModel: {
    alignSelf: "stretch",
    flex: 1,
    minHeight: 0,
    width: "100%",
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
