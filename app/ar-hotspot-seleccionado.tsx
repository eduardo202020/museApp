import {
  ArArtifactModel,
  ArSceneBackground,
  ArSideRail,
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

export default function ArHotspotSeleccionadoScreen() {
  const { artworkId, hotspotLabel } = useLocalSearchParams<{
    artworkId?: string;
    hotspotLabel?: string;
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
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Hotspot no disponible</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const imageSource = getArtworkImageSource(artwork.image);
  const museumName = museumProfile?.name ?? "MuseIQ";
  const roomName = room?.name ?? "Sala por confirmar";
  const statusLabel = room?.statusLabel ?? "Senal estable";
  const selectedHotspot = hotspotLabel ?? "Cabeza felinica";

  const openChat = () => {
    selectArtwork(artwork.id);
    router.push({ pathname: "/pregunta-voz-modal", params: { artworkId: artwork.id } } as never);
  };

  const openAudioActive = () => {
    selectArtwork(artwork.id);
    router.push({ pathname: "/ar-audio-activo", params: { artworkId: artwork.id } } as never);
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <ArSceneBackground dim="rgba(5,8,13,0.26)" />

      <SafeAreaView style={styles.safeArea}>
        <ArTopStatusHud museumName={museumName} roomName={roomName} statusLabel={statusLabel} />

        <View style={styles.sceneArea}>
          <ArArtifactModel
            artworkId={artwork.id}
            autoRotate={false}
            interactive
            style={styles.model}
          />
          <View style={styles.hotspotMarker}>
            <View style={styles.hotspotPulse} />
            <View style={styles.hotspotCore} />
          </View>
        </View>

        <ArSideRail onAudio={openAudioActive} onChat={openChat} style={styles.sideRail} />

        <View style={styles.bottomSheet}>
          <View style={styles.sheetHandle} />

          <View style={styles.hotspotCard}>
            <Image
              source={imageSource ?? arSceneImage}
              style={styles.hotspotThumb}
              contentFit="cover"
              contentPosition="center"
            />
            <View style={styles.hotspotCopy}>
              <Text numberOfLines={2} style={styles.hotspotTitle}>
                {selectedHotspot}
              </Text>
              <Text numberOfLines={4} style={styles.hotspotText}>
                Representa al felino andino, simbolo de poder y transformacion. Esta asociado al mundo espiritual y al rol de los chamanes.
              </Text>
            </View>
          </View>

          <View style={styles.actionRow}>
            <Pressable
              onPress={openChat}
              style={({ pressed }) => [styles.secondaryButton, pressed ? styles.pressed : null]}
            >
              <Ionicons color="#FFFFFF" name="chatbubble-ellipses-outline" size={18} />
              <Text style={styles.secondaryButtonText}>Explicar con IA</Text>
            </Pressable>
            <Pressable
              onPress={openAudioActive}
              style={({ pressed }) => [styles.primaryButton, pressed ? styles.pressed : null]}
            >
              <Ionicons color="#FFFFFF" name="volume-high-outline" size={18} />
              <Text style={styles.primaryButtonText}>Escuchar</Text>
            </Pressable>
          </View>

          <Pressable
            onPress={() => router.push({ pathname: "/artwork-detail", params: { artworkId: artwork.id } } as never)}
            style={({ pressed }) => [styles.detailLinkCard, pressed ? styles.pressed : null]}
          >
            <View style={styles.detailIcon}>
              <Ionicons color="#FFFFFF" name="image-outline" size={19} />
            </View>
            <View style={styles.detailLinkCopy}>
              <Text style={styles.detailLinkTitle}>Ver en la obra</Text>
              <Text numberOfLines={1} style={styles.detailLinkSubtitle}>
                Ver mas detalles en la obra completa
              </Text>
            </View>
            <Ionicons color="#FFFFFF" name="chevron-forward" size={20} />
          </Pressable>
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
  sceneArea: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    overflow: "visible",
    paddingTop: 8,
  },
  model: {
    alignSelf: "stretch",
    flex: 1,
    width: "100%",
  },
  hotspotMarker: {
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    right: 125,
    top: "32%",
  },
  hotspotPulse: {
    backgroundColor: "rgba(98,215,88,0.20)",
    borderColor: "rgba(98,215,88,0.56)",
    borderRadius: 999,
    borderWidth: 1,
    height: 56,
    position: "absolute",
    width: 56,
  },
  hotspotCore: {
    backgroundColor: "rgba(8,10,14,0.78)",
    borderColor: musePalette.success,
    borderRadius: 999,
    borderWidth: 4,
    height: 25,
    width: 25,
  },
  sideRail: {
    top: "37%",
  },
  bottomSheet: {
    backgroundColor: arColors.glassFillStrong,
    borderColor: "rgba(255,255,255,0.16)",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderWidth: 1,
    gap: 12,
    paddingBottom: 18,
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
  hotspotCard: {
    backgroundColor: "rgba(255,255,255,0.035)",
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    padding: 10,
  },
  hotspotThumb: {
    borderRadius: 12,
    height: 108,
    width: 86,
  },
  hotspotCopy: {
    flex: 1,
    gap: 7,
    justifyContent: "center",
    minWidth: 0,
  },
  hotspotTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
    lineHeight: 24,
  },
  hotspotText: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 18,
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
  },
  secondaryButton: {
    alignItems: "center",
    borderColor: "rgba(255,255,255,0.24)",
    borderRadius: 13,
    borderWidth: 1,
    flex: 1,
    flexDirection: "row",
    gap: 7,
    justifyContent: "center",
    minHeight: 44,
  },
  secondaryButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: arColors.primaryGreen,
    borderRadius: 13,
    flex: 1,
    flexDirection: "row",
    gap: 7,
    justifyContent: "center",
    minHeight: 44,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
  detailLinkCard: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.02)",
    borderColor: "rgba(255,255,255,0.14)",
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    minHeight: 64,
    paddingHorizontal: 12,
  },
  detailIcon: {
    alignItems: "center",
    justifyContent: "center",
    width: 24,
  },
  detailLinkCopy: {
    flex: 1,
    gap: 3,
    minWidth: 0,
  },
  detailLinkTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  detailLinkSubtitle: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 12,
    fontWeight: "600",
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
