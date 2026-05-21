import { SensorPanel } from "@/components/museiq/home/sensor-panel";
import { BleSuggestionCard } from "@/components/museiq/home/ble-suggestion-card";
import { ExploreRoomSheet } from "@/components/museiq/home/explore-room-sheet";
import { QrScannerOverlay } from "@/components/museiq/home/qr-scanner-overlay";
import { musePalette } from "@/components/museiq/theme";
import { useHomeBleStatus } from "@/hooks/use-home-ble-status";
import { useHomeSensors } from "@/hooks/use-home-sensors";
import { getArtworkImageSource } from "@/lib/artwork-images";
import { useMuseIQ } from "@/providers/museiq-provider";
import { Ionicons } from "@expo/vector-icons";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ActiveSheet = "explore" | "qr" | null;

type HudActionButtonProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
};

function HudActionButton({ icon, label, onPress, style }: HudActionButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.hudAction,
        style,
        pressed ? styles.pressed : null,
      ]}
    >
      <Ionicons color="#FFFFFF" name={icon} size={38} />
      <Text style={styles.hudActionLabel}>{label}</Text>
    </Pressable>
  );
}

export default function HomeScreen() {
  const navigation = useNavigation();
  const {
    currentArtwork,
    currentRoom,
    currentArtworkId,
    debugModeEnabled,
    findRoomById,
    getArtworksForRoom,
    isArtworkNarrationPlaying,
    museumProfile,
    repeatArtworkNarration,
    selectArtwork,
    setCurrentRoomById,
    visitedArtworkIds,
  } = useMuseIQ();
  const {
    bleSignalLabel,
    bleStatusLabel,
    dominantBeacon,
    error: bleError,
  } = useHomeBleStatus();
  const [activeSheet, setActiveSheet] = useState<ActiveSheet>(null);
  const [dismissedSuggestionId, setDismissedSuggestionId] = useState<
    string | null
  >(null);
  const [isSuggestionVisible, setIsSuggestionVisible] = useState(false);
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [isSensorPanelOpen, setIsSensorPanelOpen] = useState(false);
  const {
    accelerometerStatus,
    compassStatus,
    headingState,
    movementState,
    stepCount,
    stepCountStatus,
  } = useHomeSensors();

  useEffect(() => {
    if (dominantBeacon?.roomId) {
      setCurrentRoomById(dominantBeacon.roomId);
    }
  }, [dominantBeacon?.roomId, setCurrentRoomById]);

  const detectedRoom = useMemo(() => {
    if (!dominantBeacon?.roomId) {
      return null;
    }

    return findRoomById(dominantBeacon.roomId) ?? currentRoom ?? null;
  }, [currentRoom, dominantBeacon?.roomId, findRoomById]);

  const isRoomDetected = Boolean(detectedRoom);
  const activeRoom = detectedRoom ?? currentRoom;
  const roomArtworks = activeRoom ? getArtworksForRoom(activeRoom.id) : [];
  const suggestedArtwork = roomArtworks[0] ?? currentArtwork;
  const suggestedArtworkImageSource = getArtworkImageSource(
    suggestedArtwork?.image,
  );
  const hasNearbySuggestion = isRoomDetected && Boolean(suggestedArtwork);
  const isSuggestionDismissed =
    Boolean(suggestedArtwork?.id) &&
    dismissedSuggestionId === suggestedArtwork?.id;
  const shouldShowSuggestionCta = hasNearbySuggestion && !isSuggestionDismissed;
  const museumName = museumProfile?.name ?? "MuseIQ";
  const roomName = activeRoom?.name ?? "Buscando sala";
  const centralLabel = shouldShowSuggestionCta
    ? "Ver sugerencia"
    : isRoomDetected
      ? "Preguntar sobre\nla sala"
      : "Preguntar sobre\nel museo";
  const bottomStatus = shouldShowSuggestionCta
    ? "Esto es una sugerencia, escanea el QR para confirmar."
    : isRoomDetected
      ? "Senal estable  -  Estas cerca de varias obras."
      : "Escanea un QR para identificar una obra.";

  useEffect(() => {
    if (!hasNearbySuggestion || !suggestedArtwork?.id || isSuggestionDismissed) {
      setIsSuggestionVisible(false);
      return;
    }

    setIsSuggestionVisible(true);
  }, [hasNearbySuggestion, isSuggestionDismissed, suggestedArtwork?.id]);

  const openChat = () => {
    router.push({
      pathname: "/ar-chat-ia",
      params: currentArtwork?.id ? { artworkId: currentArtwork.id } : {},
    } as never);
  };

  const openCentralQuestion = () => {
    router.push({
      pathname: "/ar-chat-ia",
      params: currentArtwork?.id ? { artworkId: currentArtwork.id } : {},
    } as never);
  };

  const dismissSuggestion = () => {
    if (suggestedArtwork?.id) {
      setDismissedSuggestionId(suggestedArtwork.id);
    }
    setIsSuggestionVisible(false);
  };

  const handleCentralAction = () => {
    if (shouldShowSuggestionCta) {
      setIsSuggestionVisible(true);
      return;
    }

    openCentralQuestion();
  };

  const handleViewSuggestedAr = () => {
    if (suggestedArtwork?.id) {
      selectArtwork(suggestedArtwork.id);
      setDismissedSuggestionId(suggestedArtwork.id);
    }
    setIsSuggestionVisible(false);
  };

  const handleExploreOtherSuggestions = () => {
    dismissSuggestion();
    setActiveSheet("explore");
  };

  const openExploreSheet = () => {
    setIsSuggestionVisible(false);
    setActiveSheet("explore");
  };

  const openQrScanner = () => {
    setIsSuggestionVisible(false);
    setActiveSheet("qr");
  };

  const closeQrScanner = () => {
    setIsTorchOn(false);
    setActiveSheet(null);
  };

  const openManualCodeEntry = () => {
    setActiveSheet(null);
    setIsTorchOn(false);
    router.push("/codigo-manual" as never);
  };

  const handleMockQrScan = () => {
    const artwork = suggestedArtwork ?? currentArtwork;
    if (!artwork) {
      return;
    }

    selectArtwork(artwork.id);
    setActiveSheet(null);
    setIsTorchOn(false);
    router.push({
      pathname: "/obra-identificada",
      params: { artworkId: artwork.id },
    } as never);
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <Image
        source={require("@/assets/images/fondo.png")}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        contentPosition="center"
      />
      <View style={styles.cameraShade} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.topHud}>
          <View style={styles.museumStatusCard}>
            <Ionicons color="#FFFFFF" name="business-outline" size={34} />
            <View style={styles.museumStatusText}>
              <Text numberOfLines={1} style={styles.museumName}>
                {museumName}
              </Text>
              <View style={styles.roomStatusRow}>
                <Text
                  numberOfLines={1}
                  style={[
                    styles.roomStatus,
                    !isRoomDetected ? styles.roomStatusSearching : null,
                  ]}
                >
                  {isRoomDetected ? roomName : "Sala por confirmar"}
                </Text>
                {isRoomDetected ? <View style={styles.signalDot} /> : null}
                {isRoomDetected ? (
                  <Text style={styles.signalText}>{bleSignalLabel}</Text>
                ) : (
                  <Text style={styles.searchingDot}>.</Text>
                )}
              </View>
            </View>
          </View>

          <View style={styles.topRightStack}>
            <Pressable
              onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
              style={({ pressed }) => [
                styles.menuButton,
                pressed ? styles.pressed : null,
              ]}
            >
              <Ionicons color="#FFFFFF" name="menu" size={38} />
            </Pressable>
            <View style={styles.bleMiniBadge}>
              <Ionicons
                color={isRoomDetected ? musePalette.primary : "#FFFFFF"}
                name="bluetooth-outline"
                size={25}
              />
            </View>
          </View>
        </View>

        {activeSheet === "qr" ? (
          <QrScannerOverlay
            artworkTitle={suggestedArtwork?.title ?? "Obra del museo"}
            isTorchOn={isTorchOn}
            museumName={museumName}
            onCancel={closeQrScanner}
            onManualEntry={openManualCodeEntry}
            onMockScan={handleMockQrScan}
            onToggleTorch={() => setIsTorchOn((value) => !value)}
            roomName={roomName}
          />
        ) : (
          <>
            <View style={styles.sceneLayer}>
              {isSuggestionVisible && shouldShowSuggestionCta && suggestedArtwork ? (
                <BleSuggestionCard
                  artworkTitle={suggestedArtwork.title}
                  imageSource={suggestedArtworkImageSource}
                  onClose={dismissSuggestion}
                  onExploreOther={handleExploreOtherSuggestions}
                  onViewAr={handleViewSuggestedAr}
                />
              ) : isRoomDetected ? (
                <View style={styles.roomDetectedCard}>
                  <Ionicons color="#FFFFFF" name="location-outline" size={52} />
                  <View style={styles.roomDetectedCopy}>
                    <Text style={styles.roomDetectedEyebrow}>Estas en</Text>
                    <Text style={styles.roomDetectedTitle}>{roomName}</Text>
                    <Text style={styles.roomDetectedText}>
                      Explora las obras de esta sala.
                    </Text>
                  </View>
                </View>
              ) : (
                <View style={styles.searchingCard}>
                  <Ionicons color="#FFFFFF" name="radio-outline" size={72} />
                  <Text style={styles.searchingTitle}>
                    Escanea el QR de una obra para iniciar
                  </Text>
                  <Text style={styles.searchingText}>
                    La deteccion por Bluetooth queda pausada mientras terminamos el flujo.
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.sideActions}>
              <Pressable
                onPress={openChat}
                style={({ pressed }) => [
                  styles.sideButton,
                  pressed ? styles.pressed : null,
                ]}
              >
                <Ionicons color="#FFFFFF" name="chatbubble-ellipses-outline" size={31} />
                <Text style={styles.sideButtonLabel}>Chat</Text>
              </Pressable>
              <Pressable
                onPress={repeatArtworkNarration}
                style={({ pressed }) => [
                  styles.sideButton,
                  isArtworkNarrationPlaying ? styles.sideButtonActive : null,
                  pressed ? styles.pressed : null,
                ]}
              >
                <Ionicons
                  color="#FFFFFF"
                  name={isArtworkNarrationPlaying ? "volume-mute-outline" : "mic-outline"}
                  size={34}
                />
                <Text style={styles.sideButtonLabel}>Audio</Text>
              </Pressable>
            </View>

            <View style={styles.bottomHud}>
              <View style={styles.bottomActionsRow}>
                <HudActionButton
                  icon="navigate-outline"
                  label="Explorar"
                  onPress={openExploreSheet}
                />

                <Pressable
                  onPress={handleCentralAction}
                  style={({ pressed }) => [
                    styles.centralAction,
                    shouldShowSuggestionCta ? styles.centralActionSuggested : null,
                    pressed ? styles.pressed : null,
                  ]}
                >
                  <Ionicons
                    color={shouldShowSuggestionCta ? musePalette.primary : "#FFFFFF"}
                    name="sparkles-outline"
                    size={55}
                  />
                </Pressable>

                <HudActionButton
                  icon="qr-code-outline"
                  label="Escanear QR"
                  onPress={openQrScanner}
                />
              </View>
              <Text
                style={[
                  styles.centralActionLabel,
                  shouldShowSuggestionCta
                    ? styles.centralActionLabelSuggested
                    : null,
                ]}
              >
                {centralLabel}
              </Text>

              <View style={styles.bottomStatusBar}>
                <Ionicons
                  color={musePalette.primary}
                  name={
                    shouldShowSuggestionCta || isRoomDetected
                      ? "radio-outline"
                      : "information-circle-outline"
                  }
                  size={21}
                />
                <Text numberOfLines={1} style={styles.bottomStatusText}>
                  {bottomStatus}
                </Text>
              </View>
            </View>
          </>
        )}
      </SafeAreaView>

      {activeSheet === "explore" ? (
        <View style={styles.sheetBackdrop}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setActiveSheet(null)}
          />
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <ExploreRoomSheet
              artworks={roomArtworks}
              currentArtworkId={currentArtworkId}
              isRoomDetected={isRoomDetected}
              roomName={roomName}
              visitedArtworkIds={visitedArtworkIds}
              onArtworkPress={(artworkId) => {
                selectArtwork(artworkId);
                setActiveSheet(null);
                router.push({
                  pathname: "/artwork-detail",
                  params: { artworkId },
                } as never);
              }}
            />
          </View>
        </View>
      ) : null}

      {debugModeEnabled ? (
        <SensorPanel
          accelerometerStatus={accelerometerStatus}
          bleStatus={bleError ? `error - ${bleError}` : bleStatusLabel}
          compassStatus={compassStatus}
          headingState={headingState}
          isOpen={isSensorPanelOpen}
          movementState={movementState}
          onToggle={() => setIsSensorPanelOpen((value) => !value)}
          stepCount={stepCount}
          stepCountStatus={stepCountStatus}
        />
      ) : null}
    </View>
  );
}

const glassBorder = "rgba(255,255,255,0.34)";
const glassFill = "rgba(8,10,14,0.58)";

const styles = StyleSheet.create({
  screen: {
    backgroundColor: "#05080D",
    flex: 1,
  },
  cameraShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(5,8,13,0.22)",
  },
  safeArea: {
    flex: 1,
  },
  topHud: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 22,
    paddingTop: 14,
  },
  museumStatusCard: {
    alignItems: "center",
    backgroundColor: glassFill,
    borderColor: glassBorder,
    borderRadius: 18,
    borderWidth: 1,
    flex: 1,
    flexDirection: "row",
    gap: 12,
    maxWidth: 315,
    minHeight: 78,
    paddingHorizontal: 16,
  },
  museumStatusText: {
    flex: 1,
    gap: 5,
    minWidth: 0,
  },
  museumName: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "800",
  },
  roomStatusRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 7,
  },
  roomStatus: {
    color: "#FFFFFF",
    flexShrink: 1,
    fontSize: 15,
    fontWeight: "700",
  },
  roomStatusSearching: {
    color: musePalette.primary,
  },
  signalDot: {
    backgroundColor: musePalette.primary,
    borderRadius: 999,
    height: 7,
    width: 7,
  },
  signalText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  searchingDot: {
    color: musePalette.primary,
    fontSize: 20,
    fontWeight: "900",
    marginLeft: "auto",
  },
  topRightStack: {
    alignItems: "center",
    gap: 14,
    marginLeft: 14,
  },
  menuButton: {
    alignItems: "center",
    backgroundColor: glassFill,
    borderColor: glassBorder,
    borderRadius: 18,
    borderWidth: 1,
    height: 66,
    justifyContent: "center",
    width: 66,
  },
  bleMiniBadge: {
    alignItems: "center",
    backgroundColor: "rgba(8,10,14,0.54)",
    borderColor: "rgba(255,255,255,0.24)",
    borderRadius: 16,
    borderWidth: 1,
    height: 46,
    justifyContent: "center",
    width: 46,
  },
  sceneLayer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 26,
  },
  searchingCard: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "rgba(22,24,28,0.72)",
    borderColor: "rgba(255,255,255,0.32)",
    borderRadius: 18,
    borderWidth: 1,
    gap: 14,
    maxWidth: 260,
    paddingHorizontal: 24,
    paddingVertical: 28,
  },
  searchingTitle: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "800",
    lineHeight: 27,
    textAlign: "center",
  },
  searchingText: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 15,
    fontWeight: "500",
    lineHeight: 21,
    textAlign: "center",
  },
  roomDetectedCard: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "rgba(8,10,14,0.74)",
    borderColor: "rgba(255,255,255,0.26)",
    borderLeftColor: musePalette.primary,
    borderLeftWidth: 2,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    gap: 18,
    marginLeft: 44,
    marginTop: 40,
    maxWidth: 300,
    minHeight: 132,
    paddingHorizontal: 24,
  },
  roomDetectedCopy: {
    flex: 1,
    gap: 6,
  },
  roomDetectedEyebrow: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  roomDetectedTitle: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "900",
  },
  roomDetectedText: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 16,
    fontWeight: "500",
    lineHeight: 22,
  },
  sideActions: {
    gap: 10,
    position: "absolute",
    right: 22,
    top: "43%",
  },
  sideButton: {
    alignItems: "center",
    backgroundColor: glassFill,
    borderColor: glassBorder,
    borderRadius: 17,
    borderWidth: 1,
    gap: 8,
    height: 89,
    justifyContent: "center",
    width: 72,
  },
  sideButtonActive: {
    borderColor: musePalette.primary,
  },
  sideButtonLabel: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  bottomHud: {
    paddingBottom: 18,
    paddingHorizontal: 22,
  },
  bottomActionsRow: {
    alignItems: "flex-end",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  hudAction: {
    alignItems: "center",
    gap: 10,
    width: 98,
  },
  hudActionLabel: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  centralAction: {
    alignItems: "center",
    backgroundColor: "rgba(28,23,18,0.62)",
    borderColor: "rgba(255,255,255,0.9)",
    borderRadius: 999,
    borderWidth: 2,
    height: 132,
    justifyContent: "center",
    marginBottom: 18,
    width: 132,
  },
  centralActionSuggested: {
    backgroundColor: "rgba(5,8,13,0.62)",
    borderColor: "rgba(255,255,255,0.92)",
  },
  centralActionLabel: {
    alignSelf: "center",
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
    lineHeight: 25,
    marginTop: -10,
    minHeight: 54,
    textAlign: "center",
    width: 170,
  },
  centralActionLabelSuggested: {
    color: musePalette.primary,
  },
  bottomStatusBar: {
    alignItems: "center",
    backgroundColor: "rgba(5,8,13,0.62)",
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
    minHeight: 44,
    paddingHorizontal: 17,
  },
  bottomStatusText: {
    color: "rgba(255,255,255,0.74)",
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.84,
    transform: [{ scale: 0.99 }],
  },
  sheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.16)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "rgba(5,8,13,0.96)",
    borderColor: "rgba(255,255,255,0.18)",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    maxHeight: "58%",
    paddingBottom: 28,
    paddingHorizontal: 22,
    paddingTop: 12,
  },
  sheetHandle: {
    alignSelf: "center",
    backgroundColor: "rgba(255,255,255,0.28)",
    borderRadius: 999,
    height: 5,
    marginBottom: 14,
    width: 58,
  },
});
