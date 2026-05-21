import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

type ArtworkInfoRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
};

export function ArtworkInfoRow({ icon, label, value }: ArtworkInfoRowProps) {
  return (
    <View style={styles.row}>
      <Ionicons color="#FFFFFF" name={icon} size={29} />
      <View style={styles.copy}>
        <Text style={styles.label}>{label}</Text>
        <Text numberOfLines={2} style={styles.value}>
          {value}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.035)",
    borderColor: "rgba(255,255,255,0.16)",
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    gap: 16,
    minHeight: 69,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  copy: {
    flex: 1,
    gap: 3,
    minWidth: 0,
  },
  label: {
    color: "rgba(255,255,255,0.76)",
    fontSize: 15,
    fontWeight: "500",
  },
  value: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 21,
  },
});
