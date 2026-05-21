import { musePalette } from "@/components/museiq/theme";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

type QrScannerOverlayProps = {
  artworkTitle: string;
  isTorchOn: boolean;
  museumName: string;
  onCancel: () => void;
  onManualEntry: () => void;
  onMockScan: () => void;
  onToggleTorch: () => void;
  roomName: string;
};

const qrCells = Array.from({ length: 81 }, (_, index) => index);

function ScannerActionButton({
  icon,
  label,
  onPress,
  active,
}: {
  active?: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.action,
        active ? styles.actionActive : null,
        pressed ? styles.pressed : null,
      ]}
    >
      <Ionicons color="#FFFFFF" name={icon} size={38} />
      <Text style={styles.actionLabel}>{label}</Text>
    </Pressable>
  );
}

export function QrScannerOverlay({
  artworkTitle,
  isTorchOn,
  museumName,
  onCancel,
  onManualEntry,
  onMockScan,
  onToggleTorch,
  roomName,
}: QrScannerOverlayProps) {
  return (
    <View style={styles.container}>
      <View style={styles.copy}>
        <Text style={styles.title}>Escanear codigo QR</Text>
        <Text style={styles.subtitle}>Apunta al codigo de la obra</Text>
      </View>

      <Pressable
        accessibilityLabel="Simular lectura del codigo QR"
        onPress={onMockScan}
        style={({ pressed }) => [
          styles.scannerFrame,
          pressed ? styles.pressed : null,
        ]}
      >
        <View style={[styles.corner, styles.cornerTopLeft]} />
        <View style={[styles.corner, styles.cornerTopRight]} />
        <View style={[styles.corner, styles.cornerBottomLeft]} />
        <View style={[styles.corner, styles.cornerBottomRight]} />
        <View style={styles.scanWindow}>
          <View style={styles.qrCard}>
            <View style={styles.qrHeader}>
              <Ionicons
                color="#1B1E22"
                name="business-outline"
                size={22}
              />
              <Text numberOfLines={2} style={styles.qrMuseum}>
                {museumName}
              </Text>
            </View>
            <View style={styles.qrGrid}>
              {qrCells.map((cell) => {
                const isDark =
                  cell % 2 === 0 ||
                  cell % 7 === 0 ||
                  cell === 10 ||
                  cell === 16 ||
                  cell === 64;

                return (
                  <View
                    key={cell}
                    style={[
                      styles.qrCell,
                      isDark ? styles.qrCellDark : null,
                    ]}
                  />
                );
              })}
            </View>
            <Text numberOfLines={1} style={styles.qrArtwork}>
              {artworkTitle}
            </Text>
            <Text numberOfLines={1} style={styles.qrRoom}>
              {roomName}
            </Text>
          </View>
          <View style={styles.scanBand} />
          <View style={styles.scanLine} />
        </View>
      </Pressable>

      <Pressable
        onPress={onManualEntry}
        style={({ pressed }) => [
          styles.manualEntryButton,
          pressed ? styles.pressed : null,
        ]}
      >
        <Ionicons color={musePalette.primary} name="keypad-outline" size={20} />
        <Text style={styles.manualEntryText}>Ingresar codigo manualmente</Text>
      </Pressable>

      <View style={styles.actions}>
        <ScannerActionButton
          icon="close-outline"
          label="Cancelar"
          onPress={onCancel}
        />
        <ScannerActionButton
          active={isTorchOn}
          icon="flashlight-outline"
          label="Linterna"
          onPress={onToggleTorch}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingBottom: 56,
    paddingHorizontal: 30,
    paddingTop: 46,
  },
  copy: {
    alignItems: "center",
    gap: 12,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900",
    textAlign: "center",
  },
  subtitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "500",
    textAlign: "center",
  },
  scannerFrame: {
    alignSelf: "center",
    aspectRatio: 1,
    justifyContent: "center",
    maxWidth: 390,
    padding: 24,
    width: "100%",
  },
  scanWindow: {
    alignItems: "center",
    borderColor: "rgba(255,255,255,0.28)",
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    overflow: "hidden",
  },
  corner: {
    borderColor: "#FFFFFF",
    height: 60,
    position: "absolute",
    width: 60,
  },
  cornerTopLeft: {
    borderLeftWidth: 4,
    borderTopWidth: 4,
    left: 0,
    top: 0,
  },
  cornerTopRight: {
    borderRightWidth: 4,
    borderTopWidth: 4,
    right: 0,
    top: 0,
  },
  cornerBottomLeft: {
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    bottom: 0,
    left: 0,
  },
  cornerBottomRight: {
    borderBottomWidth: 4,
    borderRightWidth: 4,
    bottom: 0,
    right: 0,
  },
  qrCard: {
    alignItems: "center",
    backgroundColor: "rgba(245,239,226,0.94)",
    borderRadius: 3,
    gap: 6,
    paddingHorizontal: 17,
    paddingVertical: 13,
    width: 170,
  },
  qrHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 7,
    width: "100%",
  },
  qrMuseum: {
    color: "#25282C",
    flex: 1,
    fontSize: 9,
    fontWeight: "700",
    lineHeight: 11,
  },
  qrGrid: {
    backgroundColor: "#E9E2D2",
    flexDirection: "row",
    flexWrap: "wrap",
    height: 116,
    padding: 7,
    width: 116,
  },
  qrCell: {
    height: 11.3,
    width: 11.3,
  },
  qrCellDark: {
    backgroundColor: "#1F2528",
  },
  qrArtwork: {
    color: "#101317",
    fontSize: 14,
    fontWeight: "800",
    marginTop: 3,
    textAlign: "center",
    width: "100%",
  },
  qrRoom: {
    color: "#20252A",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
    width: "100%",
  },
  scanBand: {
    backgroundColor: "rgba(22,137,206,0.28)",
    height: 66,
    left: 0,
    position: "absolute",
    right: 0,
    top: "44%",
  },
  scanLine: {
    backgroundColor: musePalette.primary,
    height: 2,
    left: 0,
    position: "absolute",
    right: 0,
    top: "51%",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 12,
  },
  manualEntryButton: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "rgba(5,8,13,0.62)",
    borderColor: "rgba(255,255,255,0.20)",
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: 9,
    minHeight: 44,
    paddingHorizontal: 16,
  },
  manualEntryText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  action: {
    alignItems: "center",
    gap: 12,
    width: 102,
  },
  actionActive: {
    opacity: 1,
  },
  actionLabel: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  pressed: {
    opacity: 0.84,
    transform: [{ scale: 0.99 }],
  },
});
