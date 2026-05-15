import { musePalette } from "@/components/museiq/theme";
import { Pressable, StyleSheet, Text, View } from "react-native";

type SensorPanelProps = {
  accelerometerStatus: string;
  bleStatus: string;
  compassStatus: string;
  headingState: string | null;
  isOpen: boolean;
  movementState: string;
  onToggle: () => void;
  stepCount: number | null;
  stepCountStatus: string;
};

export function SensorPanel({
  accelerometerStatus,
  bleStatus,
  compassStatus,
  headingState,
  isOpen,
  movementState,
  onToggle,
  stepCount,
  stepCountStatus,
}: SensorPanelProps) {
  return (
    <View style={styles.wrap}>
      {isOpen ? (
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Modo tecnico</Text>
          <Text style={styles.row}>Acelerometro: {accelerometerStatus}</Text>
          <Text style={styles.row}>Movimiento: {movementState}</Text>
          <Text style={styles.row}>
            Orientacion / brujula: {compassStatus}
            {headingState ? ` · ${headingState}` : ""}
          </Text>
          <Text style={styles.row}>
            Pasos: {stepCountStatus}
            {stepCount !== null ? ` · ${stepCount}` : ""}
          </Text>
          <Text style={styles.row}>BLE: {bleStatus}</Text>
        </View>
      ) : null}

      <Pressable
        onPress={onToggle}
        style={({ pressed }) => [
          styles.toggle,
          pressed ? styles.togglePressed : null,
        ]}
      >
        <Text style={styles.toggleText}>
          {isOpen ? "Ocultar modo tecnico" : "Modo tecnico"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    bottom: 14,
    position: "absolute",
    right: 12,
    alignItems: "flex-end",
    gap: 8,
  },
  toggle: {
    backgroundColor: musePalette.primaryStrong,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: musePalette.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 4,
  },
  togglePressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  toggleText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "800",
  },
  panel: {
    backgroundColor: "rgba(255,255,255,0.92)",
    borderColor: musePalette.border,
    borderRadius: 16,
    borderWidth: 1,
    gap: 4,
    maxWidth: 220,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  panelTitle: {
    color: musePalette.text,
    fontSize: 13,
    fontWeight: "900",
    marginBottom: 2,
  },
  row: {
    color: musePalette.textMuted,
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 17,
  },
});
