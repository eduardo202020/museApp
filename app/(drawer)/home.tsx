import { ArtworkCard } from "@/components/museiq/home/artwork-card";
import { SensorPanel } from "@/components/museiq/home/sensor-panel";
import { musePalette } from "@/components/museiq/theme";
import { AppScreen, PrimaryButton, TopBar } from "@/components/museiq/ui";
import { useHomeSensors } from "@/hooks/use-home-sensors";
import { useBleScanner } from "@/hooks/use-ble-scanner";
import { getArtworkImageSource } from "@/lib/artwork-images";
import { useMuseIQ } from "@/providers/museiq-provider";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

function WelcomeOverlay({
  museumName,
  routeName,
  durationMinutes,
  onStart,
}: {
  museumName: string;
  routeName: string;
  durationMinutes: number;
  onStart: () => void;
}) {
  return (
    <View style={styles.welcomeOverlay}>
      <View style={styles.welcomeCard}>
        <Text style={styles.welcomeEyebrow}>Bienvenida</Text>
        <Text style={styles.welcomeTitle}>{museumName}</Text>
        <Text style={styles.welcomeSubtitle}>{routeName}</Text>

        <View style={styles.welcomeHighlights}>
          <View style={styles.welcomeHighlight}>
            <Ionicons color={musePalette.primaryStrong} name="time-outline" size={18} />
            <Text style={styles.welcomeHighlightText}>{`${durationMinutes} minutos sugeridos`}</Text>
          </View>
          <View style={styles.welcomeHighlight}>
            <Ionicons color={musePalette.primaryStrong} name="chatbubble-ellipses-outline" size={18} />
            <Text style={styles.welcomeHighlightText}>Haz preguntas y sigue la narrativa obra por obra</Text>
          </View>
          <View style={styles.welcomeHighlight}>
            <Ionicons color={musePalette.primaryStrong} name="ear-outline" size={18} />
            <Text style={styles.welcomeHighlightText}>Escucha cada obra si prefieres una visita más guiada</Text>
          </View>
        </View>

        <PrimaryButton
          icon="arrow-forward"
          label="Comenzar recorrido"
          onPress={onStart}
        />
      </View>
    </View>
  );
}

export default function IndexScreen() {
  const navigation = useNavigation();
  const {
    currentArtwork,
    currentRoom,
    currentZoneLabel,
    museumProfile,
    routeProgress,
    routeProgressLabel,
    routeTotal,
    currentRouteStep,
    hasCompletedWelcome,
    debugModeEnabled,
    completeWelcome,
    goToNextArtwork,
    repeatArtworkNarration,
  } = useMuseIQ();

  const { beacons, isScanning, error: bleError, startScanning, stopScanning } =
    useBleScanner();
  const [isSensorPanelOpen, setIsSensorPanelOpen] = useState(false);
  const {
    accelerometerStatus,
    compassStatus,
    headingState,
    movementState,
    stepCount,
    stepCountStatus,
  } = useHomeSensors();

  const imageSource = getArtworkImageSource(currentArtwork?.image);
  const dominantBeacon = beacons[0];
  const bleStatus = dominantBeacon
    ? `${dominantBeacon.roomId} · M${dominantBeacon.beaconNode}`
    : bleError
      ? `error · ${bleError}`
      : isScanning
        ? "esperando señal"
        : "sin señal";

  useEffect(() => {
    startScanning().catch(() => undefined);

    return () => {
      stopScanning();
    };
  }, [startScanning, stopScanning]);

  const openVoiceModal = () => {
    router.push({
      pathname: "/pregunta-voz-modal",
      params: currentArtwork?.id ? { artworkId: currentArtwork.id } : {},
    } as never);
  };

  return (
    <View style={styles.screen}>
      <AppScreen contentContainerStyle={styles.content}>
        <TopBar
          title={museumProfile?.name ?? "Museo"}
          left={
            <Pressable
              onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
              style={({ pressed }) => [
                styles.menuButton,
                pressed ? styles.debugChipPressed : null,
              ]}
            >
              <Ionicons color={musePalette.primary} name="menu" size={18} />
            </Pressable>
          }
        />

        <ArtworkCard
          roomName={currentRoom?.name ?? "Sala actual"}
          progressLabel={routeProgressLabel}
          zoneLabel={currentZoneLabel}
          routeHint={currentRouteStep?.hint}
          artworkTitle={currentArtwork?.title ?? "Obra actual"}
          artworkSummary={
            currentArtwork?.summary ??
            "Selecciona una obra para comenzar la visita conversacional."
          }
          artworkContext={currentArtwork?.context}
          artworkLocation={currentArtwork?.locationHint}
          imageSource={imageSource}
          onListenArtwork={repeatArtworkNarration}
          onOpenChat={openVoiceModal}
          onSelectNext={goToNextArtwork}
          nextDisabled={routeProgress >= routeTotal}
        />
      </AppScreen>

      {debugModeEnabled ? (
        <SensorPanel
          accelerometerStatus={accelerometerStatus}
          bleStatus={bleStatus}
          compassStatus={compassStatus}
          headingState={headingState}
          isOpen={isSensorPanelOpen}
          movementState={movementState}
          onToggle={() => setIsSensorPanelOpen((value) => !value)}
          stepCount={stepCount}
          stepCountStatus={stepCountStatus}
        />
      ) : null}

      {!hasCompletedWelcome && museumProfile ? (
        <WelcomeOverlay
          museumName={museumProfile.name}
          routeName={museumProfile.routeName}
          durationMinutes={museumProfile.estimatedDurationMinutes}
          onStart={completeWelcome}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: musePalette.background,
  },
  content: {
    gap: 12,
    paddingBottom: 24,
  },
  menuButton: {
    alignItems: "center",
    backgroundColor: musePalette.surfaceMuted,
    borderRadius: 999,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  debugChipPressed: {
    opacity: 0.9,
  },
  welcomeOverlay: {
    alignItems: "center",
    backgroundColor: "rgba(20,33,45,0.42)",
    justifyContent: "center",
    padding: 20,
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  welcomeCard: {
    backgroundColor: musePalette.surface,
    borderRadius: 32,
    gap: 18,
    maxWidth: 430,
    paddingHorizontal: 22,
    paddingVertical: 26,
    width: "100%",
  },
  welcomeEyebrow: {
    color: musePalette.primary,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  welcomeTitle: {
    color: musePalette.text,
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: -0.7,
  },
  welcomeSubtitle: {
    color: musePalette.textMuted,
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 23,
  },
  welcomeHighlights: {
    gap: 12,
  },
  welcomeHighlight: {
    alignItems: "flex-start",
    backgroundColor: musePalette.surfaceMuted,
    borderRadius: 18,
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  welcomeHighlightText: {
    color: musePalette.text,
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
  },
});
