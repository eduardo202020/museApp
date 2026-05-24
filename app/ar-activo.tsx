import {
  ArArtifactModel,
  ArBottomHud,
  ArSceneBackground,
  ArSideRail,
  arSceneImage,
  arColors,
} from "@/components/museiq/ar-flow";
import { QrScannerOverlay } from "@/components/museiq/home/qr-scanner-overlay";
import { getArtworkImageSource } from "@/lib/artwork-images";
import { musePalette } from "@/components/museiq/theme";
import { useMuseIQ } from "@/providers/museiq-provider";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

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
  const insets = useSafeAreaInsets();
  const [isAudioSheetOpen, setIsAudioSheetOpen] = useState(false);
  const [isQrSheetOpen, setIsQrSheetOpen] = useState(false);
  const [isTorchOn, setIsTorchOn] = useState(false);
  const { artworkId, prepared } = useLocalSearchParams<{
    artworkId?: string;
    prepared?: string;
  }>();
  const {
    artworks,
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
  const hotspots = defaultHotspots;
  const showModelStatus = prepared !== "1";
  const imageSource = getArtworkImageSource(artwork.image);
  const museumName = museumProfile?.name ?? "MuseIQ";
  const roomName = room?.name ?? "Sala por confirmar";
  const currentArtworkIndex = artworks.findIndex((candidate) => candidate.id === artwork.id);
  const qrTargetArtwork =
    artworks[currentArtworkIndex + 1] ??
    artworks.find((candidate) => candidate.id !== artwork.id) ??
    artwork;

  const openChat = () => {
    selectArtwork(artwork.id);
    router.push({ pathname: "/pregunta-voz-modal", params: { artworkId: artwork.id } } as never);
  };

  const openAudioSheet = () => {
    setIsQrSheetOpen(false);
    setIsAudioSheetOpen(true);
  };
  const closeAudioSheet = () => setIsAudioSheetOpen(false);
  const openQrSheet = () => {
    setIsAudioSheetOpen(false);
    setIsQrSheetOpen(true);
  };
  const closeQrSheet = () => {
    setIsTorchOn(false);
    setIsQrSheetOpen(false);
  };

  const openHotspotSelected = (hotspotLabel: string) => {
    selectArtwork(artwork.id);
    router.push({
      pathname: "/ar-hotspot-seleccionado",
      params: { artworkId: artwork.id, hotspotLabel },
    } as never);
  };

  const openManualCodeEntry = () => {
    closeQrSheet();
    router.push("/codigo-manual" as never);
  };

  const handleMockQrScan = () => {
    selectArtwork(qrTargetArtwork.id);
    setIsTorchOn(false);
    setIsQrSheetOpen(false);
    router.push({
      pathname: "/obra-identificada",
      params: { artworkId: qrTargetArtwork.id },
    } as never);
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <ArSceneBackground dim="rgba(5,8,13,0.18)" />

      <SafeAreaView style={styles.safeArea}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.topBackButton,
            { top: insets.top + 10 },
            pressed ? styles.pressed : null,
          ]}
        >
          <Ionicons color="#FFFFFF" name="arrow-back" size={28} />
        </Pressable>

        <View style={styles.sceneArea}>
          <View style={styles.modelStage}>
            <ArArtifactModel
              artworkId={artwork.id}
              interactive
              showStatus={showModelStatus}
              style={StyleSheet.absoluteFill}
            />
            <View pointerEvents="box-none" style={styles.hotspotLayer}>
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
          </View>
        </View>

        <Pressable
          onPress={openAudioSheet}
          style={({ pressed }) => [styles.audioPill, pressed ? styles.pressed : null]}
        >
          <Ionicons color="#FFFFFF" name="play-circle-outline" size={22} />
          <Text numberOfLines={1} style={styles.audioText}>
            Narracion: {artwork.title}
          </Text>
          <Text style={styles.audioTime}>00:18 / 01:30</Text>
          <Ionicons color={arColors.primary} name="volume-high-outline" size={19} />
        </Pressable>

        <ArSideRail
          active={isAudioSheetOpen ? "audio" : undefined}
          showChat={false}
          onAudio={openAudioSheet}
          onChat={openChat}
          style={[styles.sideRail, { top: insets.top + 10 }]}
        />

        <ArBottomHud
          bottomIcon="radio-outline"
          bottomText="Narracion activa y hotspots disponibles."
          centralLabel="Preguntar IA"
          exploreIcon="home-outline"
          exploreLabel="Home"
          hideBottomStatus
          onCentral={openChat}
          onExplore={() => router.push("/home" as never)}
          onQr={openQrSheet}
          style={styles.bottomHud}
        />

        {isAudioSheetOpen ? (
          <View style={styles.audioSheetOverlay}>
            <Pressable onPress={closeAudioSheet} style={styles.audioSheetBackdrop} />
            <View style={styles.audioSheet}>
              <View style={styles.audioSheetHandle} />
              <View style={styles.audioSheetHeader}>
                <View style={styles.audioHeaderRow}>
                  <Ionicons color={arColors.primary} name="pulse-outline" size={17} />
                  <Text style={styles.audioHeaderText}>Audio activo</Text>
                </View>
                <Pressable
                  onPress={closeAudioSheet}
                  style={({ pressed }) => [styles.audioCloseButton, pressed ? styles.pressed : null]}
                >
                  <Ionicons color="#FFFFFF" name="close" size={18} />
                </Pressable>
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
          </View>
        ) : null}

        {isQrSheetOpen ? (
          <View style={styles.qrSheetOverlay}>
            <Pressable onPress={closeQrSheet} style={styles.qrSheetBackdrop} />
            <View style={styles.qrSheet}>
              <View style={styles.qrSheetHandle} />
              <QrScannerOverlay
                artworkTitle={qrTargetArtwork.title}
                isTorchOn={isTorchOn}
                museumName={museumName}
                onCancel={closeQrSheet}
                onManualEntry={openManualCodeEntry}
                onMockScan={handleMockQrScan}
                onToggleTorch={() => setIsTorchOn((value) => !value)}
                roomName={roomName}
              />
            </View>
          </View>
        ) : null}
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
  topBackButton: {
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
  sceneArea: {
    ...StyleSheet.absoluteFillObject,
  },
  modelStage: {
    ...StyleSheet.absoluteFillObject,
    overflow: "visible",
  },
  hotspotLayer: {
    alignSelf: "center",
    bottom: 164,
    left: "18%",
    position: "absolute",
    right: 24,
    top: 104,
    zIndex: 12,
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
    borderColor: arColors.primary,
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
    bottom: 172,
    flexDirection: "row",
    gap: 8,
    left: 16,
    minHeight: 42,
    paddingHorizontal: 12,
    position: "absolute",
    right: 16,
    zIndex: 20,
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
    right: 22,
    zIndex: 30,
  },
  bottomHud: {
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    zIndex: 20,
  },
  audioSheetOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    zIndex: 40,
  },
  audioSheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(5,8,13,0.48)",
  },
  audioSheet: {
    backgroundColor: arColors.glassFillStrong,
    borderColor: "rgba(255,255,255,0.16)",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderWidth: 1,
    gap: 11,
    paddingBottom: 16,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  audioSheetHandle: {
    alignSelf: "center",
    backgroundColor: "rgba(255,255,255,0.28)",
    borderRadius: 999,
    height: 4,
    width: 54,
  },
  audioSheetHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  audioHeaderRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
  },
  audioHeaderText: {
    color: arColors.primary,
    fontSize: 15,
    fontWeight: "800",
  },
  audioCloseButton: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderColor: "rgba(255,255,255,0.20)",
    borderRadius: 999,
    borderWidth: 1,
    height: 32,
    justifyContent: "center",
    width: 32,
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
  qrSheetOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    zIndex: 45,
  },
  qrSheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(5,8,13,0.58)",
  },
  qrSheet: {
    backgroundColor: arColors.glassFillStrong,
    borderColor: "rgba(255,255,255,0.16)",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderWidth: 1,
    minHeight: "78%",
    overflow: "hidden",
  },
  qrSheetHandle: {
    alignSelf: "center",
    backgroundColor: "rgba(255,255,255,0.28)",
    borderRadius: 999,
    height: 4,
    marginTop: 8,
    position: "absolute",
    top: 0,
    width: 54,
    zIndex: 2,
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
