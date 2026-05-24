import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

type ChatModalHeaderProps = {
  onClose: () => void;
  subtitle: string;
  title: string;
};

export function ChatModalHeader({
  onClose,
  subtitle,
  title,
}: ChatModalHeaderProps) {
  return (
    <View style={styles.sheetHeaderRow}>
      <View>
        <Text style={styles.sheetTitle}>{title}</Text>
        <Text numberOfLines={1} style={styles.sheetSubtitle}>
          {subtitle}
        </Text>
      </View>
      <Pressable
        onPress={onClose}
        style={({ pressed }) => [styles.closeButton, pressed ? styles.pressed : null]}
      >
        <Ionicons color="#FFFFFF" name="close" size={18} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  sheetHeaderRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sheetTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },
  sheetSubtitle: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
    maxWidth: 240,
  },
  closeButton: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderColor: "rgba(255,255,255,0.20)",
    borderRadius: 999,
    borderWidth: 1,
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  pressed: {
    opacity: 0.84,
    transform: [{ scale: 0.99 }],
  },
});
