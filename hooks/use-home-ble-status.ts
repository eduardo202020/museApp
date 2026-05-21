import { useBleScanner } from "@/hooks/use-ble-scanner";
import { useEffect, useMemo } from "react";

export function useHomeBleStatus() {
  const scanner = useBleScanner();

  useEffect(() => {
    scanner.startScanning().catch(() => undefined);

    return () => {
      scanner.stopScanning();
    };
  }, [scanner.startScanning, scanner.stopScanning]);

  const dominantBeacon = scanner.beacons[0];

  const bleStatusLabel = useMemo(() => {
    if (dominantBeacon) {
      return `${dominantBeacon.roomId} · M${dominantBeacon.beaconNode}`;
    }

    if (scanner.error) {
      return `error · ${scanner.error}`;
    }

    return scanner.isScanning ? "esperando senal" : "sin senal";
  }, [dominantBeacon, scanner.error, scanner.isScanning]);

  const bleSignalLabel = useMemo(() => {
    if (dominantBeacon) {
      return "Senal estable";
    }

    if (scanner.error) {
      return "Error BLE";
    }

    return scanner.isScanning ? "Buscando sala" : "Sin senal";
  }, [dominantBeacon, scanner.error, scanner.isScanning]);

  return {
    ...scanner,
    dominantBeacon,
    bleSignalLabel,
    bleStatusLabel,
  };
}
