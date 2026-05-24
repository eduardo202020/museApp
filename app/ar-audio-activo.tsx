import {
  ArSceneBackground,
  ArTopStatusHud,
  arColors,
  arSceneImage,
} from "@/components/museiq/ar-flow";
import { musePalette } from "@/components/museiq/theme";
import { getArtworkImageSource } from "@/lib/artwork-images";
import { useMuseIQ } from "@/providers/museiq-provider";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ArAudioActivoScreen() {
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

  if (!artwork) {
    return (
      <View style={styles.screen}>
        <StatusBar style="light" />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Audio no disponible</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const imageSource = getArtworkImageSource(artwork.image);
  const museumName = museumProfile?.name ?? "MuseIQ";
  const roomName = room?.name ?? "Sala por confirmar";
  const statusLabel = room?.statusLabel ?? "Senal estable";

  const openChat = () => {
    selectArtwork(artwork.id);
    router.push({ pathname: "/pregunta-voz-modal", params: { artworkId: artwork.id } } as never);
  };

  const openQr = () => {
    selectArtwork(artwork.id);
    router.push({ pathname: "/obra-identificada", params: { artworkId: artwork.id } } as never);
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <ArSceneBackground dim="rgba(5,8,13,0.24)" />

      <SafeAreaView style={styles.safeArea}>
        <ArTopStatusHud museumName={museumName} roomName={roomName} statusLabel={statusLabel} />

        <View style={styles.leftRailActions}>
          <Pressable onPress={openChat} style={({ pressed }) => [styles.railButton, pressed ? styles.pressed : null]}>
            <Ionicons color="#FFFFFF" name="chatbubble-ellipses-outline" size={22} />
            <Text style={styles.railButtonLabel}>Chat</Text>
          </Pressable>
          <Pressable onPress={openQr} style={({ pressed }) => [styles.railButton, pressed ? styles.pressed : null]}>
            <Ionicons color="#FFFFFF" name="scan-circle-outline" size={22} />
            <Text style={styles.railButtonLabel}>Escanear QR</Text>
          </Pressable>
        </View>

        <View style={styles.bottomSheet}>
          <View style={styles.sheetHandle} />
          <View style={styles.audioHeaderRow}>
            <Ionicons color={arColors.primary} name="pulse-outline" size={17} />
            <Text style={styles.audioHeaderText}>Audio activo</Text>
          </View>

          <View style={styles.trackCard}>
            <View style={styles.trackTopRow}>
              <Image
                source={imageSource ?? arSceneImage}
                style={styles.trackThumb}
                contentFit="cover"
                contentPosition="center"
              />
              <View style={styles.trackCopy}>
                <Text numberOfLines={2} style={styles.trackTitle}>
                  {artwork.title}
                </Text>
                <Text numberOfLines={1} style={styles.trackYear}>
                  {artwork.year}
                </Text>
              </View>
              <Text style={styles.trackTimer}>01:28 / 02:45</Text>
            </View>

            <View style={styles.progressTrack}>
              <View style={styles.progressFill} />
            </View>

            <Text numberOfLines={4} style={styles.trackSummary}>
              {artwork.audioText || artwork.summary}
            </Text>

            <View style={styles.transportRow}>
              <Pressable style={({ pressed }) => [styles.circleControl, pressed ? styles.pressed : null]}>
                <Ionicons color="#FFFFFF" name="play-back-outline" size={19} />
                <Text style={styles.circleControlLabel}>15</Text>
              </Pressable>
              <Pressable style={({ pressed }) => [styles.mainPlayControl, pressed ? styles.pressed : null]}>
                <Ionicons color="#FFFFFF" name="pause" size={29} />
                <Text style={styles.mainPlayLabel}>Pausar audio</Text>
              </Pressable>
              <Pressable style={({ pressed }) => [styles.circleControl, pressed ? styles.pressed : null]}>
                <Ionicons color="#FFFFFF" name="play-forward-outline" size={19} />
                <Text style={styles.circleControlLabel}>15</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.utilityRow}>
            <Pressable style={({ pressed }) => [styles.utilityButton, pressed ? styles.pressed : null]}>
              <Ionicons color="#FFFFFF" name="speedometer-outline" size={17} />
              <Text style={styles.utilityLabel}>Velocidad 1.0x</Text>
            </Pressable>
            <Pressable style={({ pressed }) => [styles.utilityButton, pressed ? styles.pressed : null]}>
              <Ionicons color="#FFFFFF" name="document-text-outline" size={17} />
              <Text style={styles.utilityLabel}>Transcripcion</Text>
            </Pressable>
          </View>
        </View>
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
  leftRailActions: {
    gap: 10,
    left: 14,
    position: "absolute",
    top: 220,
    zIndex: 3,
  },
  railButton: {
    alignItems: "center",
    backgroundColor: arColors.glassFill,
    borderColor: arColors.glassBorder,
    borderRadius: 16,
    borderWidth: 1,
    gap: 5,
    height: 72,
    justifyContent: "center",
    paddingHorizontal: 6,
    width: 68,
  },
  railButtonLabel: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
  },
  bottomSheet: {
    backgroundColor: arColors.glassFillStrong,
    borderColor: "rgba(255,255,255,0.16)",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderWidth: 1,
    gap: 11,
    marginTop: "auto",
    paddingBottom: 16,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  sheetHandle: {
    alignSelf: "center",
    backgroundColor: "rgba(255,255,255,0.28)",
    borderRadius: 999,
    height: 4,
    width: 54,
  },
  audioHeaderRow: {
    alignItems: "center",
    alignSelf: "center",
    flexDirection: "row",
    gap: 6,
  },
  audioHeaderText: {
    color: arColors.primary,
    fontSize: 15,
    fontWeight: "800",
  },
  trackCard: {
    backgroundColor: "rgba(255,255,255,0.035)",
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 16,
    borderWidth: 1,
    gap: 9,
    padding: 12,
  },
  trackTopRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  trackThumb: {
    borderRadius: 10,
    height: 58,
    width: 58,
  },
  trackCopy: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  trackTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    lineHeight: 20,
  },
  trackYear: {
    color: "rgba(255,255,255,0.76)",
    fontSize: 12,
    fontWeight: "600",
  },
  trackTimer: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 11,
    fontWeight: "700",
  },
  progressTrack: {
    backgroundColor: "rgba(255,255,255,0.11)",
    borderRadius: 999,
    height: 5,
    overflow: "hidden",
  },
  progressFill: {
    backgroundColor: arColors.primary,
    height: "100%",
    width: "54%",
  },
  trackSummary: {
    color: "rgba(255,255,255,0.84)",
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 18,
  },
  transportRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 2,
  },
  circleControl: {
    alignItems: "center",
    borderColor: "rgba(255,255,255,0.26)",
    borderRadius: 999,
    borderWidth: 1,
    gap: 1,
    height: 56,
    justifyContent: "center",
    width: 56,
  },
  circleControlLabel: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  mainPlayControl: {
    alignItems: "center",
    backgroundColor: arColors.primary,
    borderRadius: 999,
    gap: 2,
    height: 94,
    justifyContent: "center",
    width: 94,
  },
  mainPlayLabel: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
    textAlign: "center",
  },
  utilityRow: {
    flexDirection: "row",
    gap: 10,
  },
  utilityButton: {
    alignItems: "center",
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
    minHeight: 44,
  },
  utilityLabel: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
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
