import { musePalette } from "@/components/museiq/theme";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

type RoomDetailCardProps = {
  description: string;
  title: string;
  total: number;
  visited: number;
};

export function RoomDetailCard({
  description,
  title,
  total,
  visited,
}: RoomDetailCardProps) {
  return (
    <View style={styles.roomDetailCard}>
      <View style={styles.roomDetailHeader}>
        <View style={styles.roomDetailIcon}>
          <Ionicons color="#FFFFFF" name="location-outline" size={26} />
        </View>
        <View style={styles.roomDetailCopy}>
          <Text style={styles.roomDetailTitle}>{title}</Text>
          <Text style={styles.roomDetailMeta}>
            {visited} de {total} obras vistas
          </Text>
        </View>
      </View>
      <Text style={styles.roomDetailText}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  roomDetailCard: {
    backgroundColor: "rgba(255,255,255,0.045)",
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    padding: 16,
  },
  roomDetailHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 13,
  },
  roomDetailIcon: {
    alignItems: "center",
    borderColor: musePalette.primary,
    borderRadius: 999,
    borderWidth: 1,
    height: 46,
    justifyContent: "center",
    width: 46,
  },
  roomDetailCopy: {
    flex: 1,
    gap: 4,
  },
  roomDetailTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "900",
  },
  roomDetailMeta: {
    color: musePalette.primary,
    fontSize: 12,
    fontWeight: "800",
  },
  roomDetailText: {
    color: "rgba(255,255,255,0.68)",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 21,
  },
});
