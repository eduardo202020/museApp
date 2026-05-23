import {
  ArArtifactModel,
  ArBottomHud,
  ArSceneBackground,
  ArSideRail,
  ArTopStatusHud,
  arColors,
} from "@/components/museiq/ar-flow";
import { musePalette } from "@/components/museiq/theme";
import { useMuseIQ } from "@/providers/museiq-provider";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Hotspot = {
  id: string;
  label: string;
  top: number;
};

const defaultHotspots: Hotspot[] = [
  { id: "h1", label: "Cabeza felinica", top: 78 },
  { id: "h2", label: "Colmillos", top: 186 },
  { id: "h3", label: "Serpientes entrelazadas", top: 304 },
];

export default function ArActivoScreen() {
  const { artworkId, prepared } = useLocalSearchParams<{
    artworkId?: string;
    prepared?: string;
  }>();
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
            <Text style={styles.emptyTitle}>AR activo no disponible</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const museumName = museumProfile?.name ?? "MuseIQ";
  const roomName = room?.name ?? "Sala por confirmar";
  const statusLabel = room?.statusLabel ?? "Senal estable";
  const hotspots = defaultHotspots;
  const showModelStatus = prepared !== "1";

  const openChat = () => {
    selectArtwork(artwork.id);
    router.push({ pathname: "/pregunta-voz-modal", params: { artworkId: artwork.id } } as never);
  };

  const openAudioActive = () => {
    selectArtwork(artwork.id);
    router.push({ pathname: "/ar-audio-activo", params: { artworkId: artwork.id } } as never);
  };

  const openHotspotSelected = (hotspotLabel: string) => {
    selectArtwork(artwork.id);
    router.push({
      pathname: "/ar-hotspot-seleccionado",
      params: { artworkId: artwork.id, hotspotLabel },
    } as never);
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <ArSceneBackground dim="rgba(5,8,13,0.18)" />

      <SafeAreaView style={styles.safeArea}>
        <ArTopStatusHud museumName={museumName} roomName={roomName} statusLabel={statusLabel} />

        <View style={styles.sceneArea}>
          <View style={styles.modelStage}>
            <ArArtifactModel artworkId={artwork.id} interactive showStatus={showModelStatus} />
            {hotspots.map((hotspot) => (
              <Pressable
                key={hotspot.id}
                onPress={() => openHotspotSelected(hotspot.label)}
                style={({ pressed }) => [
                  styles.hotspotRow,
                  { top: hotspot.top },
                  pressed ? styles.pressed : null,
                ]}
              >
                <View style={styles.hotspotDot} />
                <View style={styles.hotspotLabelWrap}>
                  <Text numberOfLines={1} style={styles.hotspotLabel}>
                    {hotspot.label}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>

          <Pressable
            onPress={openAudioActive}
            style={({ pressed }) => [styles.audioPill, pressed ? styles.pressed : null]}
          >
            <Ionicons color="#FFFFFF" name="play-circle-outline" size={22} />
            <Text numberOfLines={1} style={styles.audioText}>
              Narracion: {artwork.title}
            </Text>
            <Text style={styles.audioTime}>00:18 / 01:30</Text>
            <Ionicons color={musePalette.success} name="volume-high-outline" size={19} />
          </Pressable>
        </View>

        <ArSideRail
          active="audio"
          onAudio={openAudioActive}
          onChat={openChat}
          style={styles.sideRail}
        />

        <ArBottomHud
          bottomIcon="radio-outline"
          bottomText="Narracion activa y hotspots disponibles."
          centralLabel="Preguntar sobre esta obra"
          onCentral={openChat}
          onExplore={() => router.push("/home" as never)}
          onQr={() => router.push({ pathname: "/obra-identificada", params: { artworkId: artwork.id } } as never)}
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
  sceneArea: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    paddingTop: 6,
  },
  modelStage: {
    alignItems: "center",
    alignSelf: "stretch",
    flex: 1,
    justifyContent: "center",
    minHeight: 0,
    overflow: "visible",
    width: "100%",
  },
  hotspotRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    position: "absolute",
    right: 0,
  },
  hotspotDot: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderColor: musePalette.success,
    borderRadius: 999,
    borderWidth: 3,
    height: 22,
    width: 22,
  },
  hotspotLabelWrap: {
    backgroundColor: arColors.glassFill,
    borderColor: "rgba(255,255,255,0.24)",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  hotspotLabel: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
    maxWidth: 118,
  },
  audioPill: {
    alignItems: "center",
    backgroundColor: "rgba(8,10,14,0.78)",
    borderColor: "rgba(255,255,255,0.20)",
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    minHeight: 42,
    paddingHorizontal: 12,
    width: "100%",
  },
  audioText: {
    color: "#FFFFFF",
    flex: 1,
    fontSize: 12,
    fontWeight: "700",
  },
  audioTime: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 11,
    fontWeight: "700",
  },
  sideRail: {
    top: "35%",
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
  pressed: {
    opacity: 0.84,
    transform: [{ scale: 0.99 }],
  },
});
