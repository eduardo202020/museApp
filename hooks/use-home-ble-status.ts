import { useBleScanner } from "@/hooks/use-ble-scanner";
import { useMemo } from "react";

export function useHomeBleStatus() {
  const scanner = useBleScanner();

  const dominantBeacon = scanner.beacons[0];

  const bleStatusLabel = useMemo(() => {
    if (dominantBeacon) {
      return `${dominantBeacon.roomId} · M${dominantBeacon.beaconNode}`;
    }

    if (scanner.error) {
      return `error · ${scanner.error}`;
    }

    return scanner.isScanning ? "esperando senal" : "BLE en pausa";
  }, [dominantBeacon, scanner.error, scanner.isScanning]);

  const bleSignalLabel = useMemo(() => {
    if (dominantBeacon) {
      return "Senal estable";
    }

    if (scanner.error) {
      return "Error BLE";
    }

    return scanner.isScanning ? "Buscando sala" : "BLE opcional";
  }, [dominantBeacon, scanner.error, scanner.isScanning]);

  return {
    ...scanner,
    dominantBeacon,
    bleSignalLabel,
    bleStatusLabel,
  };
}
