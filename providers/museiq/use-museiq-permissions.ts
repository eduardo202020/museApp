import { defaultPermissionStatuses } from "@/datos";
import type { PermissionKey } from "@/providers/museiq/types";
import { Dispatch, SetStateAction } from "react";
import { PermissionsAndroid, Platform } from "react-native";

type PermissionState = Record<
  PermissionKey,
  "pending" | "granted" | "denied" | "blocked"
>;

type UseMuseIQPermissionsParams = {
  setPermissions: Dispatch<SetStateAction<PermissionState>>;
  setPermissionsAccepted: Dispatch<SetStateAction<boolean>>;
};

export function useMuseIQPermissions({
  setPermissions,
  setPermissionsAccepted,
}: UseMuseIQPermissionsParams) {
  const requestAllPermissions = async () => {
    setPermissionsAccepted(true);

    if (Platform.OS !== "android") {
      setPermissions({
        bluetooth: "granted",
        physicalActivity: "granted",
        location: "granted",
        microphone: "granted",
      });
      return true;
    }

    const granted = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      PermissionsAndroid.PERMISSIONS.ACTIVITY_RECOGNITION,
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    ]);

    const bluetoothGranted =
      granted["android.permission.BLUETOOTH_SCAN"] ===
        PermissionsAndroid.RESULTS.GRANTED &&
      granted["android.permission.BLUETOOTH_CONNECT"] ===
        PermissionsAndroid.RESULTS.GRANTED;

    const nextPermissions = {
      bluetooth: bluetoothGranted ? "granted" : "denied",
      physicalActivity:
        granted["android.permission.ACTIVITY_RECOGNITION"] ===
        PermissionsAndroid.RESULTS.GRANTED
          ? "granted"
          : "denied",
      location:
        granted["android.permission.ACCESS_FINE_LOCATION"] ===
        PermissionsAndroid.RESULTS.GRANTED
          ? "granted"
          : "denied",
      microphone:
        granted["android.permission.RECORD_AUDIO"] ===
        PermissionsAndroid.RESULTS.GRANTED
          ? "granted"
          : "denied",
    } as const;

    setPermissions(nextPermissions);

    return Object.values(nextPermissions).every(
      (status) => status === "granted",
    );
  };

  const declinePermissions = () => {
    setPermissionsAccepted(false);
    setPermissions((previous) => ({
      bluetooth: previous.bluetooth === "granted" ? "granted" : "denied",
      physicalActivity:
        previous.physicalActivity === "granted" ? "granted" : "denied",
      location: previous.location === "granted" ? "granted" : "denied",
      microphone: previous.microphone === "granted" ? "granted" : "denied",
    }));
  };

  const resetPermissionsState = () => {
    setPermissionsAccepted(false);
    setPermissions(defaultPermissionStatuses);
  };

  return {
    declinePermissions,
    requestAllPermissions,
    resetPermissionsState,
  };
}
