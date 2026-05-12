import { BeaconList } from "@/components/beacon-list";
import { musePalette } from "@/components/museiq/theme";
import {
    AppScreen,
    PrimaryButton,
    SectionCard,
    SectionEyebrow,
    StatusPill,
    TopBar,
} from "@/components/museiq/ui";
import { useBleScanner } from "@/hooks/use-ble-scanner";
import { useMuseIQ } from "@/providers/museiq-provider";
import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function IndexScreen() {
  const {
    artworks,
    currentArtworkId,
    currentRoom,
    selectArtwork,
    setCurrentRoomById,
    setCurrentZoneLabel,
  } = useMuseIQ();
  const { beacons, bleState, error, isScanning, startScanning, stopScanning } =
    useBleScanner({
      defaultTxPowerDbm: -52,
      rssiWindowSize: 7,
      emaAlpha: 0.4,
    });

  useEffect(() => {
    startScanning();
    return () => {
      stopScanning();
    };
  }, [startScanning, stopScanning]);

  useEffect(() => {
    if (beacons.length === 0) {
      return;
    }

    const strongest = beacons[0];
    if (strongest.roomId) {
      setCurrentRoomById(strongest.roomId);
      if (strongest.rssi > -63) {
        setCurrentZoneLabel("frente a la obra");
      } else if (strongest.rssi > -72) {
        setCurrentZoneLabel("zona media");
      } else {
        setCurrentZoneLabel("cerca de la entrada");
      }
    }
  }, [beacons, setCurrentRoomById, setCurrentZoneLabel]);

  return (
    <View style={{ flex: 1, backgroundColor: musePalette.background }}>
      <AppScreen contentContainerStyle={{ paddingBottom: 40 }}>
        <TopBar
          title="MuseIQ"
          subtitle={currentRoom?.name ?? "Escaneo BLE"}
          right={
            <StatusPill label={`${isScanning ? "escaneando" : "en pausa"}`} />
          }
        />

        <SectionCard>
          <SectionEyebrow>Estado BLE</SectionEyebrow>
          <Text style={styles.infoLine}>
            Bluetooth: {bleState === "PoweredOn" ? "activo" : "no activo"}
          </Text>
          <Text style={styles.infoLine}>
            Beacons detectados: {beacons.length}
          </Text>
          {error ? (
            <Text style={[styles.infoLine, { color: musePalette.danger }]}>
              {error}
            </Text>
          ) : null}
          {isScanning ? (
            <PrimaryButton
              icon="pause"
              label="Detener escaneo"
              onPress={stopScanning}
            />
          ) : (
            <PrimaryButton
              icon="scan"
              label="Iniciar escaneo"
              onPress={startScanning}
            />
          )}
        </SectionCard>

        <SectionCard>
          <SectionEyebrow>Lista de obras</SectionEyebrow>
          <View style={styles.artworksList}>
            {artworks.map((artwork) => {
              const isCurrent = artwork.id === currentArtworkId;
              return (
                <Pressable
                  key={artwork.id}
                  onPress={() => selectArtwork(artwork.id)}
                  style={[
                    styles.artworkRow,
                    isCurrent ? styles.artworkRowCurrent : null,
                  ]}
                >
                  <Text style={styles.artworkOrder}>
                    {artwork.order.toString().padStart(2, "0")}
                  </Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.artworkTitle}>{artwork.title}</Text>
                    <Text style={styles.artworkMeta}>
                      {artwork.author} · {artwork.roomId}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </SectionCard>

        <SectionCard style={styles.beaconSection}>
          <SectionEyebrow>Beacons escaneados</SectionEyebrow>
          <BeaconList
            beacons={beacons}
            distanceN={2}
            isScanning={isScanning}
            scrollEnabled={false}
          />
        </SectionCard>
      </AppScreen>
    </View>
  );
}

const styles = StyleSheet.create({
  infoLine: {
    color: musePalette.text,
    fontSize: 14,
    lineHeight: 21,
  },
  artworksList: {
    gap: 8,
  },
  artworkRow: {
    alignItems: "center",
    backgroundColor: musePalette.surfaceMuted,
    borderRadius: 12,
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  artworkRowCurrent: {
    borderColor: musePalette.primary,
    borderWidth: 1,
  },
  artworkOrder: {
    color: musePalette.primary,
    fontSize: 13,
    fontWeight: "800",
    minWidth: 24,
  },
  artworkTitle: {
    color: musePalette.text,
    fontSize: 14,
    fontWeight: "700",
  },
  artworkMeta: {
    color: musePalette.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  beaconSection: {
    paddingHorizontal: 0,
    paddingVertical: 18,
  },
});
