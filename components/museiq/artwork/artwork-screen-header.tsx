import { musePalette } from "@/components/museiq/theme";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

type ArtworkScreenHeaderProps = {
  cultureLabel: string;
  onBack: () => void;
  roomName: string;
  title: string;
};

export function ArtworkScreenHeader({
  cultureLabel,
  onBack,
  roomName,
  title,
}: ArtworkScreenHeaderProps) {
  return (
    <View style={styles.header}>
      <Pressable
        accessibilityLabel="Volver"
        onPress={onBack}
        style={({ pressed }) => [
          styles.iconButton,
          pressed ? styles.pressed : null,
        ]}
      >
        <Ionicons color="#FFFFFF" name="arrow-back" size={28} />
      </Pressable>

      <View style={styles.copy}>
        <Text numberOfLines={1} style={styles.title}>
          {title}
        </Text>
        <View style={styles.metaRow}>
          <Text numberOfLines={1} style={styles.metaText}>
            {roomName}
          </Text>
          <View style={styles.dot} />
          <Text numberOfLines={1} style={styles.metaText}>
            {cultureLabel}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: 14,
    minHeight: 64,
  },
  iconButton: {
    alignItems: "center",
    height: 46,
    justifyContent: "center",
    width: 42,
  },
  copy: {
    flex: 1,
    gap: 5,
    minWidth: 0,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
  },
  metaRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  metaText: {
    color: "rgba(255,255,255,0.82)",
    flexShrink: 1,
    fontSize: 15,
    fontWeight: "500",
  },
  dot: {
    backgroundColor: musePalette.primary,
    borderRadius: 999,
    height: 7,
    width: 7,
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.98 }],
  },
});
