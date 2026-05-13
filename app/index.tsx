import { ArtworkCard } from "@/components/museiq/home/artwork-card";
import { SensorPanel } from "@/components/museiq/home/sensor-panel";
import { musePalette } from "@/components/museiq/theme";
import { AppScreen, TopBar } from "@/components/museiq/ui";
import { useHomeSensors } from "@/hooks/use-home-sensors";
import { useBleScanner } from "@/hooks/use-ble-scanner";
import { getArtworkImageSource } from "@/lib/artwork-images";
import { useMuseIQ } from "@/providers/museiq-provider";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";

export default function IndexScreen() {
  const {
    currentArtwork,
    currentRoom,
    artworks,
    currentArtworkId,
    selectArtwork,
  } = useMuseIQ();

  const roomArtworks = useMemo(
    () =>
      artworks
        .filter((artwork) => artwork.roomId === (currentRoom?.id ?? "SALA_1"))
        .sort((left, right) => left.order - right.order),
    [artworks, currentRoom?.id],
  );

  const currentIndex = roomArtworks.findIndex(
    (artwork) => artwork.id === currentArtworkId,
  );
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

  const previousArtwork =
    currentIndex > 0 ? roomArtworks[currentIndex - 1] : undefined;
  const nextArtwork =
    currentIndex >= 0 && currentIndex < roomArtworks.length - 1
      ? roomArtworks[currentIndex + 1]
      : undefined;

  const imageSource = getArtworkImageSource(currentArtwork?.image);
  const dominantBeacon = beacons[0];
  const bleStatus = dominantBeacon
    ? `${dominantBeacon.roomId} · M${dominantBeacon.beaconNode}`
    : bleError
      ? `error · ${bleError}`
      : isScanning
        ? "buscando sala..."
        : "sin lectura";

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
        <TopBar title="MuseIQ" subtitle={currentRoom?.name ?? "Sala 1"} />
        <ArtworkCard
          roomName={currentRoom?.name ?? "Sala 1"}
          artworkTitle={currentArtwork?.title ?? "Obra actual"}
          artworkSummary={
            currentArtwork?.summary ??
            "Selecciona una obra para ver su contexto y conversar con la guia."
          }
          artworkLocation={currentArtwork?.locationHint}
          imageSource={imageSource}
          onOpenChat={openVoiceModal}
          onSelectPrevious={() =>
            previousArtwork && selectArtwork(previousArtwork.id)
          }
          onSelectNext={() => nextArtwork && selectArtwork(nextArtwork.id)}
          previousDisabled={!previousArtwork}
          nextDisabled={!nextArtwork}
        />
      </AppScreen>
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
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: musePalette.background,
  },
  content: {
    gap: 16,
    paddingBottom: 28,
  },
});
