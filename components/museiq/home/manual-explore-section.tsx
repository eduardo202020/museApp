import { musePalette } from "@/components/museiq/theme";
import type { ArtworkMock, RoomMock } from "@/datos";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

type ManualExploreSectionProps = {
  currentArtworkId: string;
  currentRoomId?: string;
  onSelectArtwork: (artworkId: string) => void;
  onSelectRoom: (roomId: string) => void;
  roomArtworks: ArtworkMock[];
  rooms: RoomMock[];
  visitedArtworkIds: string[];
};

export function ManualExploreSection({
  currentArtworkId,
  currentRoomId,
  onSelectArtwork,
  onSelectRoom,
  roomArtworks,
  rooms,
  visitedArtworkIds,
}: ManualExploreSectionProps) {
  return (
    <View style={styles.exploreBlock}>
      <Text style={styles.sectionTitle}>Explora el recorrido manualmente</Text>
      <Text style={styles.sectionCopy}>
        Cambia de sala o salta a otra obra para continuar la visita a tu ritmo.
      </Text>

      <View style={styles.roomChipRow}>
        {rooms.map((room) => (
          <Pressable
            key={room.id}
            onPress={() => onSelectRoom(room.id)}
            style={({ pressed }) => [
              styles.roomChip,
              currentRoomId === room.id ? styles.roomChipActive : null,
              pressed ? styles.pressed : null,
            ]}
          >
            <Text
              style={[
                styles.roomChipText,
                currentRoomId === room.id ? styles.roomChipTextActive : null,
              ]}
            >
              {room.name}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.artworkRail}>
        {roomArtworks.map((artwork) => {
          const isCurrent = artwork.id === currentArtworkId;
          const isVisited = visitedArtworkIds.includes(artwork.id);

          return (
            <Pressable
              key={artwork.id}
              onPress={() => onSelectArtwork(artwork.id)}
              style={({ pressed }) => [
                styles.artworkRailCard,
                isCurrent ? styles.artworkRailCardActive : null,
                pressed ? styles.pressed : null,
              ]}
            >
              <View style={styles.artworkRailHeader}>
                <Text style={styles.artworkRailOrder}>{`${artwork.order}.`}</Text>
                {isVisited ? (
                  <Ionicons
                    color={isCurrent ? "#FFFFFF" : musePalette.success}
                    name="checkmark-circle"
                    size={16}
                  />
                ) : null}
              </View>
              <Text
                numberOfLines={2}
                style={[
                  styles.artworkRailTitle,
                  isCurrent ? styles.artworkRailTitleActive : null,
                ]}
              >
                {artwork.title}
              </Text>
              <Text
                numberOfLines={2}
                style={[
                  styles.artworkRailMeta,
                  isCurrent ? styles.artworkRailMetaActive : null,
                ]}
              >
                {artwork.roomRelation}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  exploreBlock: {
    backgroundColor: "#F7F2EA",
    borderColor: "#E6D8C6",
    borderRadius: 24,
    borderWidth: 1,
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionTitle: {
    color: musePalette.text,
    fontSize: 18,
    fontWeight: "900",
  },
  sectionCopy: {
    color: musePalette.textMuted,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 19,
  },
  roomChipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  roomChip: {
    backgroundColor: "#FFFDFC",
    borderColor: "#D8C8B2",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  roomChipActive: {
    backgroundColor: musePalette.primary,
    borderColor: musePalette.primary,
  },
  roomChipText: {
    color: musePalette.primary,
    fontSize: 12,
    fontWeight: "800",
  },
  roomChipTextActive: {
    color: "#FFFFFF",
  },
  artworkRail: {
    gap: 10,
  },
  artworkRailCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E5D8C7",
    borderRadius: 18,
    borderWidth: 1,
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  artworkRailCardActive: {
    backgroundColor: musePalette.primary,
    borderColor: musePalette.primary,
  },
  artworkRailHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  artworkRailOrder: {
    color: "#8A5A2B",
    fontSize: 11,
    fontWeight: "900",
  },
  artworkRailTitle: {
    color: musePalette.text,
    fontSize: 15,
    fontWeight: "800",
    lineHeight: 20,
  },
  artworkRailTitleActive: {
    color: "#FFFFFF",
  },
  artworkRailMeta: {
    color: musePalette.textMuted,
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 18,
  },
  artworkRailMetaActive: {
    color: "rgba(255,255,255,0.86)",
  },
  pressed: {
    opacity: 0.9,
  },
});
