import { musePalette } from "@/components/museiq/theme";
import { Pressable, StyleSheet, Text, View } from "react-native";

type HomeImmersiveSheetProps = {
  ctaLabel: string;
  description: string;
  onClose: () => void;
  onEnter: () => void;
  roomName: string;
  title: string;
};

export function HomeImmersiveSheet({
  ctaLabel,
  description,
  onClose,
  onEnter,
  roomName,
  title,
}: HomeImmersiveSheetProps) {
  return (
    <View style={styles.sheetBackdrop}>
      <Pressable onPress={onClose} style={StyleSheet.absoluteFill} />
      <View style={styles.sheet}>
        <View style={styles.sheetHandle} />
        <Text style={styles.eyebrow}>Sala detectada</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.roomName}>{roomName}</Text>
        <Text style={styles.description}>{description}</Text>

        <Pressable
          onPress={onEnter}
          style={({ pressed }) => [styles.primaryButton, pressed ? styles.pressed : null]}
        >
          <Text style={styles.primaryButtonText}>{ctaLabel}</Text>
        </Pressable>

        <Pressable
          onPress={onClose}
          style={({ pressed }) => [styles.secondaryButton, pressed ? styles.pressed : null]}
        >
          <Text style={styles.secondaryButtonText}>Saltar por ahora</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.18)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "rgba(5,8,13,0.96)",
    borderColor: "rgba(255,255,255,0.18)",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    gap: 12,
    paddingBottom: 28,
    paddingHorizontal: 22,
    paddingTop: 14,
  },
  sheetHandle: {
    alignSelf: "center",
    backgroundColor: "rgba(255,255,255,0.28)",
    borderRadius: 999,
    height: 5,
    marginBottom: 8,
    width: 58,
  },
  eyebrow: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  title: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "900",
  },
  roomName: {
    color: musePalette.primarySoft,
    fontSize: 16,
    fontWeight: "800",
  },
  description: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 21,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: musePalette.primary,
    borderRadius: 16,
    justifyContent: "center",
    minHeight: 54,
    marginTop: 6,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },
  secondaryButton: {
    alignItems: "center",
    borderColor: "rgba(255,255,255,0.20)",
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 50,
  },
  secondaryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.88,
  },
});
