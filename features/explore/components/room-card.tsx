import { musePalette } from "@/components/museiq/theme";
import type { RoomMock } from "@/datos";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

type RoomCardProps = {
  active: boolean;
  onPress: () => void;
  room: RoomMock;
  total: number;
  visited: number;
};

export function RoomCard({
  active,
  onPress,
  room,
  total,
  visited,
}: RoomCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.roomCard,
        active ? styles.roomCardActive : null,
        pressed ? styles.pressed : null,
      ]}
    >
      <View style={[styles.roomIcon, active ? styles.roomIconActive : null]}>
        <Ionicons
          color={active ? "#FFFFFF" : musePalette.primary}
          name="business-outline"
          size={22}
        />
      </View>
      <Text numberOfLines={2} style={styles.roomName}>
        {room.name}
      </Text>
      <Text style={styles.roomMeta}>
        {visited}/{total} obras
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  roomCard: {
    backgroundColor: "rgba(255,255,255,0.045)",
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
    minHeight: 126,
    padding: 13,
    width: "48%",
  },
  roomCardActive: {
    backgroundColor: "rgba(22,137,206,0.12)",
    borderColor: musePalette.primary,
  },
  roomIcon: {
    alignItems: "center",
    backgroundColor: "rgba(22,137,206,0.12)",
    borderRadius: 999,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  roomIconActive: {
    backgroundColor: musePalette.primary,
  },
  roomName: {
    color: "#FFFFFF",
    flex: 1,
    fontSize: 15,
    fontWeight: "900",
    lineHeight: 19,
  },
  roomMeta: {
    color: "rgba(255,255,255,0.62)",
    fontSize: 12,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.84,
  },
});
