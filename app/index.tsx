import { musePalette } from "@/components/museiq/theme";
import {
    AppScreen,
    SectionCard,
    SectionEyebrow,
    TopBar,
} from "@/components/museiq/ui";
import { useBleScanner } from "@/hooks/use-ble-scanner";
import { getArtworkImageSource } from "@/lib/artwork-images";
import { useMuseIQ } from "@/providers/museiq-provider";
import { Image } from "expo-image";
import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

const GRID_ROWS = [1, 2, 3, 4] as const;
const GRID_COLUMNS = [1, 2, 3] as const;
const GRID_ROW_LABELS: Record<(typeof GRID_ROWS)[number], string> = {
  1: "Entrada",
  2: "Beacon 1-2",
  3: "Beacon 2-3",
  4: "Salida",
};
const GRID_COLUMN_LABELS: Record<(typeof GRID_COLUMNS)[number], string> = {
  1: "Izq",
  2: "Centro",
  3: "Der",
};

const BEACON_ROW_CALIBRATION = {
  minStableRssi: -85,
  dominantGapDb: 4,
  transitionWindowDb: 7,
} as const;

const HEADING_CALIBRATION = {
  hysteresisDegrees: 12,
} as const;

type BeaconLite = {
  beaconNode: number;
  rssi: number;
};

function resolveRowFromBeacons(beacons: BeaconLite[]) {
  if (beacons.length === 0) {
    return 1;
  }

  const ordered = [...beacons].sort((left, right) => right.rssi - left.rssi);
  const strongest = ordered[0];
  const runnerUp = ordered[1];

  if (strongest.rssi < BEACON_ROW_CALIBRATION.minStableRssi) {
    return 1;
  }

  if (
    strongest.beaconNode === 1 &&
    (runnerUp?.beaconNode !== 2 ||
      strongest.rssi - runnerUp.rssi >= BEACON_ROW_CALIBRATION.dominantGapDb)
  ) {
    return 1;
  }

  if (
    strongest.beaconNode === 2 &&
    (runnerUp?.beaconNode !== 1 ||
      strongest.rssi - runnerUp.rssi >= BEACON_ROW_CALIBRATION.dominantGapDb)
  ) {
    return 2;
  }

  if (
    strongest.beaconNode === 3 &&
    (runnerUp?.beaconNode !== 2 ||
      strongest.rssi - runnerUp.rssi >= BEACON_ROW_CALIBRATION.dominantGapDb)
  ) {
    return 4;
  }

  const weightedNode =
    ordered.reduce((sum, beacon) => {
      const weight = Math.max(1, 100 + beacon.rssi);
      return sum + beacon.beaconNode * weight;
    }, 0) /
    ordered.reduce((sum, beacon) => sum + Math.max(1, 100 + beacon.rssi), 0);

  if (weightedNode <= 1.45) {
    return 1;
  }

  if (weightedNode <= 2.15) {
    return 2;
  }

  if (weightedNode <= 2.75) {
    return 3;
  }

  return 4;
}

function resolveColumnFromHeading(headingDegrees: number | null) {
  if (headingDegrees === null) {
    return 2;
  }

  const normalizedHeading = (headingDegrees + 360) % 360;

  if (normalizedHeading >= 300 || normalizedHeading < 60) {
    return 1;
  }

  if (normalizedHeading >= 60 && normalizedHeading < 180) {
    return 2;
  }

  return 3;
}

export default function IndexScreen() {
  const {
    artworks,
    currentArtworkId,
    currentRoom,
    currentZoneLabel,
    selectArtwork,
    setCurrentRoomById,
    setCurrentZoneLabel,
  } = useMuseIQ();
  const { beacons, isScanning, startScanning } = useBleScanner({
    defaultTxPowerDbm: -52,
    rssiWindowSize: 7,
    emaAlpha: 0.4,
  });
  const [headingDegrees, setHeadingDegrees] = useState<number | null>(null);
  const [stableRow, setStableRow] = useState(1);
  const [stableColumn, setStableColumn] = useState<1 | 2 | 3>(2);

  useEffect(() => {
    let isMounted = true;
    let subscription: { remove: () => void } | null = null;

    const startHeadingTracking = async () => {
      try {
        const sensorsModule = await import("expo-sensors");
        const Magnetometer = sensorsModule.Magnetometer;
        const isAvailable = await Magnetometer.isAvailableAsync();

        if (!isAvailable || !isMounted) {
          return;
        }

        Magnetometer.setUpdateInterval(250);
        subscription = Magnetometer.addListener((reading) => {
          const rawHeading =
            Math.atan2(reading.y ?? 0, reading.x ?? 0) * (180 / Math.PI);
          setHeadingDegrees((rawHeading + 360) % 360);
        });
      } catch {
        // Si el módulo nativo no existe en el dev client actual, seguimos sin orientación.
        setHeadingDegrees(null);
        return;
      }
    };

    startHeadingTracking().catch(() => {
      setHeadingDegrees(null);
    });

    return () => {
      isMounted = false;
      subscription?.remove();
    };
  }, []);

  const toShortRoom = (roomId: string) => {
    const match = roomId.match(/^SALA_(\d+)$/i);
    if (match) {
      return `S${match[1]}`;
    }
    return roomId;
  };

  const gridRoomId = currentRoom?.id ?? "SALA_1";
  const roomArtworks = artworks.filter(
    (artwork) => artwork.roomId === gridRoomId,
  );
  const gridArtworks =
    roomArtworks.length > 0
      ? roomArtworks
      : artworks.filter((artwork) => artwork.roomId === "SALA_1");
  const sortedGridArtworks = [...gridArtworks].sort((left, right) => {
    const rowDiff = (left.row ?? 99) - (right.row ?? 99);
    if (rowDiff !== 0) {
      return rowDiff;
    }

    const colDiff = (left.col ?? 99) - (right.col ?? 99);
    if (colDiff !== 0) {
      return colDiff;
    }

    return left.order - right.order;
  });

  const derivedRow = resolveRowFromBeacons(beacons);
  const derivedColumn = resolveColumnFromHeading(headingDegrees);

  useEffect(() => {
    if (beacons.length === 0) {
      return;
    }

    const nextRow = resolveRowFromBeacons(beacons);
    const nextColumn = resolveColumnFromHeading(headingDegrees);

    setStableRow((current) => {
      if (current === nextRow) {
        return current;
      }

      const strongest = beacons[0];
      if (
        strongest &&
        strongest.rssi > -70 &&
        Math.abs(nextRow - current) === 1
      ) {
        return nextRow;
      }

      return current;
    });

    setStableColumn((current) => {
      if (current === nextColumn) {
        return current;
      }

      if (headingDegrees === null) {
        return current;
      }

      const normalizedHeading = (headingDegrees + 360) % 360;
      const currentCenter = current === 1 ? 0 : current === 2 ? 120 : 240;
      const distance = Math.min(
        Math.abs(normalizedHeading - currentCenter),
        360 - Math.abs(normalizedHeading - currentCenter),
      );

      if (distance > HEADING_CALIBRATION.hysteresisDegrees) {
        return nextColumn;
      }

      return current;
    });
  }, [beacons, headingDegrees]);

  const derivedArtwork = useMemo(() => {
    if (sortedGridArtworks.length === 0) {
      return undefined;
    }

    const exactMatch = sortedGridArtworks.find(
      (artwork) => artwork.row === stableRow && artwork.col === stableColumn,
    );

    if (exactMatch) {
      return exactMatch;
    }

    const rowMatch = sortedGridArtworks.find(
      (artwork) => artwork.row === stableRow,
    );
    return rowMatch ?? sortedGridArtworks[0];
  }, [sortedGridArtworks, stableColumn, stableRow]);

  const currentSequenceIndex = useMemo(
    () =>
      sortedGridArtworks.findIndex(
        (artwork) => artwork.id === currentArtworkId,
      ),
    [currentArtworkId, sortedGridArtworks],
  );

  const currentSequenceArtwork =
    sortedGridArtworks[currentSequenceIndex] ?? derivedArtwork;
  const totalSequenceItems = sortedGridArtworks.length;
  const currentArtworkImageSource = getArtworkImageSource(
    currentSequenceArtwork?.image,
  );
  const previousSequenceArtwork =
    currentSequenceIndex > 0
      ? sortedGridArtworks[currentSequenceIndex - 1]
      : undefined;
  const nextSequenceArtwork =
    currentSequenceIndex >= 0 &&
    currentSequenceIndex < sortedGridArtworks.length - 1
      ? sortedGridArtworks[currentSequenceIndex + 1]
      : undefined;

  useEffect(() => {
    if (!derivedArtwork) {
      return;
    }

    if (derivedArtwork.roomId && derivedArtwork.roomId !== currentRoom?.id) {
      setCurrentRoomById(derivedArtwork.roomId);
    }

    if (derivedArtwork.zone && derivedArtwork.zone !== currentZoneLabel) {
      setCurrentZoneLabel(derivedArtwork.zone);
    }

    if (derivedArtwork.id !== currentArtworkId) {
      selectArtwork(derivedArtwork.id);
    }
  }, [
    currentArtworkId,
    currentRoom?.id,
    currentZoneLabel,
    derivedArtwork,
    selectArtwork,
    setCurrentRoomById,
    setCurrentZoneLabel,
  ]);

  return (
    <View style={{ flex: 1, backgroundColor: musePalette.background }}>
      <AppScreen contentContainerStyle={{ paddingBottom: 170 }}>
        <TopBar
          title="MuseIQ"
          subtitle={currentRoom?.name ?? "Escaneo BLE"}
          right={
            <Pressable
              disabled={isScanning}
              onPress={startScanning}
              style={[
                styles.scanButton,
                isScanning ? styles.scanButtonDisabled : null,
              ]}
            >
              <Text style={styles.scanButtonText}>
                {isScanning ? "Escaneando" : "Escaneado"}
              </Text>
            </Pressable>
          }
        />

        <SectionCard>
          <SectionEyebrow>Secuencia activa</SectionEyebrow>
          {currentArtworkImageSource ? (
            <View style={styles.heroImageWrap}>
              <Image
                source={currentArtworkImageSource}
                style={styles.heroImage}
                contentFit="cover"
                transition={200}
              />
            </View>
          ) : null}
          <View style={styles.sequenceBanner}>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={styles.sequenceTitle}>
                {currentSequenceArtwork?.title ?? "Buscando posición"}
              </Text>
              <Text style={styles.sequenceMeta}>
                {currentRoom?.name ?? "Sala 1"} · Fila {stableRow} ·{" "}
                {GRID_COLUMN_LABELS[stableColumn]}
                {headingDegrees !== null
                  ? ` · ${Math.round(headingDegrees)}°`
                  : ""}
              </Text>
              <Text style={styles.sequenceMeta}>
                Calibración: beacons {derivedRow} / columna {derivedColumn}
              </Text>
            </View>
            <View style={styles.sequenceChip}>
              <Text style={styles.sequenceChipText}>
                {currentSequenceIndex >= 0
                  ? `${currentSequenceIndex + 1}/${totalSequenceItems}`
                  : `1/${Math.max(totalSequenceItems, 1)}`}
              </Text>
            </View>
          </View>
          <View style={styles.sequenceTrail}>
            <Text style={styles.sequenceTrailText} numberOfLines={1}>
              {previousSequenceArtwork
                ? `Prev: ${previousSequenceArtwork.title}`
                : "Prev: -"}
            </Text>
            <Text style={styles.sequenceTrailText} numberOfLines={1}>
              {nextSequenceArtwork
                ? `Next: ${nextSequenceArtwork.title}`
                : "Next: -"}
            </Text>
          </View>
          <SectionEyebrow>Grilla espacial</SectionEyebrow>
          <Text style={styles.gridDescription}>
            La grilla usa 4 filas por 3 columnas y se adapta a la sala activa.
            En la Sala 2 pueden aparecer celdas vacias porque el recorrido tiene
            10 obras en lugar de 12.
          </Text>
          <View style={styles.gridLegend}>
            {GRID_COLUMNS.map((column) => (
              <View key={column} style={styles.legendPill}>
                <Text style={styles.legendPillText}>
                  {GRID_COLUMN_LABELS[column]}
                </Text>
              </View>
            ))}
          </View>
          <View style={styles.roomGrid}>
            {GRID_ROWS.map((row) => (
              <View key={row} style={styles.rowBlock}>
                <View style={styles.rowHeader}>
                  <Text style={styles.rowLabel}>Fila {row}</Text>
                  <Text style={styles.rowZone}>{GRID_ROW_LABELS[row]}</Text>
                </View>
                <View style={styles.gridRow}>
                  {GRID_COLUMNS.map((column) => {
                    const artwork = sortedGridArtworks.find(
                      (item) => item.row === row && item.col === column,
                    );

                    if (!artwork) {
                      return (
                        <View
                          key={column}
                          style={[styles.gridCell, styles.gridCellEmpty]}
                        >
                          <Text style={styles.gridCellEmptyText}>Sin obra</Text>
                        </View>
                      );
                    }

                    const isCurrent = artwork.id === currentArtworkId;

                    return (
                      <Pressable
                        key={artwork.id}
                        onPress={() => selectArtwork(artwork.id)}
                        style={[
                          styles.gridCell,
                          isCurrent ? styles.gridCellCurrent : null,
                        ]}
                      >
                        <View style={styles.gridCellTop}>
                          <Text style={styles.gridCellOrder}>
                            {artwork.order.toString().padStart(2, "0")}
                          </Text>
                          <Text style={styles.gridCellTag}>
                            {artwork.colName ?? ""}
                          </Text>
                        </View>
                        <View style={{ gap: 4 }}>
                          <Text style={styles.gridCellTitle} numberOfLines={2}>
                            {artwork.title}
                          </Text>
                          <Text style={styles.gridCellMeta} numberOfLines={2}>
                            {artwork.author}
                          </Text>
                        </View>
                        <Text style={styles.gridCellZone} numberOfLines={1}>
                          {artwork.zone ?? GRID_ROW_LABELS[row]}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ))}
          </View>
        </SectionCard>
      </AppScreen>

      <View style={styles.stickyBeaconBar}>
        <Text style={styles.stickyTitle}>Beacons</Text>
        <View style={styles.stickyItems}>
          {beacons.length > 0 ? (
            beacons.map((beacon) => (
              <View key={beacon.id} style={styles.stickyChip}>
                <Text style={styles.stickyChipText}>
                  {`${toShortRoom(beacon.roomId)}-B${beacon.beaconNode}-TX${beacon.txPowerPayload}`}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.stickyEmptyText}>Sin beacons detectados</Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scanButton: {
    backgroundColor: musePalette.primaryStrong,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  scanButtonDisabled: {
    opacity: 0.7,
  },
  scanButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  heroImageWrap: {
    borderRadius: 22,
    marginBottom: 14,
    overflow: "hidden",
  },
  heroImage: {
    backgroundColor: musePalette.surfaceMuted,
    height: 220,
    width: "100%",
  },
  sequenceBanner: {
    backgroundColor: musePalette.surfaceMuted,
    borderColor: musePalette.border,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  sequenceTitle: {
    color: musePalette.text,
    fontSize: 18,
    fontWeight: "900",
  },
  sequenceMeta: {
    color: musePalette.textMuted,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 17,
  },
  sequenceChip: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: musePalette.primarySoft,
    borderRadius: 999,
    minWidth: 54,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  sequenceChipText: {
    color: musePalette.primary,
    fontSize: 12,
    fontWeight: "900",
  },
  sequenceTrail: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-between",
    marginBottom: 16,
  },
  sequenceTrailText: {
    color: musePalette.textMuted,
    flex: 1,
    fontSize: 11,
    fontWeight: "700",
  },
  gridDescription: {
    color: musePalette.textMuted,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 14,
  },
  gridLegend: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  legendPill: {
    backgroundColor: musePalette.surfaceMuted,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  legendPillText: {
    color: musePalette.primary,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  roomGrid: {
    gap: 12,
  },
  rowBlock: {
    gap: 8,
  },
  rowHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowLabel: {
    color: musePalette.text,
    fontSize: 13,
    fontWeight: "800",
  },
  rowZone: {
    color: musePalette.textMuted,
    fontSize: 12,
    fontWeight: "700",
  },
  gridRow: {
    flexDirection: "row",
    gap: 8,
  },
  gridCell: {
    backgroundColor: musePalette.surfaceMuted,
    borderColor: musePalette.border,
    borderRadius: 18,
    borderWidth: 1,
    flex: 1,
    minHeight: 118,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  gridCellCurrent: {
    backgroundColor: musePalette.primarySoft,
    borderColor: musePalette.primary,
    borderWidth: 1.5,
  },
  gridCellEmpty: {
    backgroundColor: "transparent",
    borderStyle: "dashed",
    justifyContent: "center",
  },
  gridCellEmptyText: {
    color: musePalette.textMuted,
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
  },
  gridCellTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  gridCellOrder: {
    color: musePalette.primary,
    fontSize: 12,
    fontWeight: "900",
  },
  gridCellTag: {
    color: musePalette.textMuted,
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  gridCellTitle: {
    color: musePalette.text,
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 18,
    minHeight: 36,
  },
  gridCellMeta: {
    color: musePalette.textMuted,
    fontSize: 11,
    lineHeight: 15,
  },
  gridCellZone: {
    color: musePalette.primary,
    fontSize: 10,
    fontWeight: "800",
    marginTop: 10,
    textTransform: "uppercase",
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
  stickyBeaconBar: {
    backgroundColor: musePalette.surface,
    borderColor: musePalette.border,
    borderTopWidth: 1,
    bottom: 0,
    left: 0,
    paddingBottom: 14,
    paddingHorizontal: 16,
    paddingTop: 10,
    position: "absolute",
    right: 0,
  },
  stickyTitle: {
    color: musePalette.primary,
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  stickyItems: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  stickyChip: {
    backgroundColor: musePalette.primarySoft,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  stickyChipText: {
    color: musePalette.primary,
    fontSize: 12,
    fontWeight: "800",
  },
  stickyEmptyText: {
    color: musePalette.textMuted,
    fontSize: 12,
    fontWeight: "600",
  },
});
