import { musePalette } from "@/components/museiq/theme";
import type { ArtworkMock } from "@/datos";
import { getArtworkImageSource } from "@/lib/artwork-images";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

type ExploreRoomSheetProps = {
  artworks: ArtworkMock[];
  currentArtworkId: string;
  isRoomDetected: boolean;
  roomName: string;
  visitedArtworkIds: string[];
  onArtworkPress: (artworkId: string) => void;
};

function hasArPreview(artwork: ArtworkMock) {
  return artwork.order === 1 || artwork.order % 3 === 0;
}

export function ExploreRoomSheet({
  artworks,
  currentArtworkId,
  isRoomDetected,
  roomName,
  visitedArtworkIds,
  onArtworkPress,
}: ExploreRoomSheetProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Explorar sala</Text>
        <Text style={styles.roomLabel}>
          {isRoomDetected ? roomName : "Sala por detectar"}
        </Text>
      </View>

      <ScrollView
        style={styles.listViewport}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {artworks.length > 0 ? (
          artworks.map((artwork) => {
            const imageSource = getArtworkImageSource(artwork.image);
            const isCurrent = artwork.id === currentArtworkId;
            const isVisited = visitedArtworkIds.includes(artwork.id);
            const arAvailable = hasArPreview(artwork);

            return (
              <Pressable
                key={artwork.id}
                onPress={() => onArtworkPress(artwork.id)}
                style={({ pressed }) => [
                  styles.row,
                  isCurrent ? styles.rowActive : null,
                  pressed ? styles.pressed : null,
                ]}
              >
                {imageSource ? (
                  <Image
                    source={imageSource}
                    style={styles.thumbnail}
                    contentFit="cover"
                    contentPosition="center"
                    transition={160}
                  />
                ) : (
                  <View style={[styles.thumbnail, styles.thumbnailFallback]}>
                    <Ionicons
                      color={musePalette.primary}
                      name="image-outline"
                      size={25}
                    />
                  </View>
                )}

                <View style={styles.copy}>
                  <View style={styles.titleRow}>
                    <Text numberOfLines={1} style={styles.artworkTitle}>
                      {artwork.title}
                    </Text>
                    {isVisited ? (
                      <Ionicons
                        color={musePalette.primary}
                        name="checkmark-circle"
                        size={16}
                      />
                    ) : null}
                  </View>
                  <Text numberOfLines={1} style={styles.artworkMeta}>
                    {artwork.period}
                  </Text>
                  <Text numberOfLines={1} style={styles.artworkMeta}>
                    {artwork.year}
                  </Text>
                </View>

                <View style={styles.resourceBlock}>
                  {arAvailable ? (
                    <View style={styles.arBadge}>
                      <Text style={styles.arBadgeText}>AR</Text>
                    </View>
                  ) : (
                    <View style={styles.imageBadge}>
                      <Ionicons color="#FFFFFF" name="image-outline" size={22} />
                    </View>
                  )}
                  <Ionicons color="#FFFFFF" name="chevron-forward" size={22} />
                </View>
              </Pressable>
            );
          })
        ) : (
          <View style={styles.emptyState}>
            <Ionicons
              color={musePalette.primary}
              name="search-outline"
              size={32}
            />
            <Text style={styles.emptyTitle}>Aun no hay obras detectadas</Text>
            <Text style={styles.emptyText}>
              Camina por la sala o escanea un QR para identificar una obra.
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footerNote}>
        <Ionicons
          color={musePalette.primary}
          name="information-circle-outline"
          size={22}
        />
        <Text numberOfLines={2} style={styles.footerText}>
          Estas obras son las mas relevantes de esta sala.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 15,
  },
  header: {
    gap: 4,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900",
  },
  roomLabel: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "500",
  },
  list: {
    gap: 10,
    paddingBottom: 2,
  },
  listViewport: {
    flexShrink: 1,
    maxHeight: 296,
  },
  row: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.035)",
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: 17,
    borderWidth: 1,
    flexDirection: "row",
    gap: 15,
    minHeight: 92,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  rowActive: {
    borderColor: musePalette.primary,
  },
  thumbnail: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 13,
    height: 76,
    overflow: "hidden",
    width: 76,
  },
  thumbnailFallback: {
    alignItems: "center",
    borderColor: "rgba(255,255,255,0.16)",
    borderWidth: 1,
    justifyContent: "center",
  },
  copy: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  titleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
  },
  artworkTitle: {
    color: "#FFFFFF",
    flex: 1,
    fontSize: 18,
    fontWeight: "800",
  },
  artworkMeta: {
    color: "rgba(255,255,255,0.76)",
    fontSize: 14,
    fontWeight: "500",
  },
  resourceBlock: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },
  arBadge: {
    alignItems: "center",
    borderColor: musePalette.primary,
    borderRadius: 999,
    borderWidth: 1.3,
    height: 34,
    justifyContent: "center",
    width: 42,
  },
  arBadgeText: {
    color: musePalette.primary,
    fontSize: 14,
    fontWeight: "900",
  },
  imageBadge: {
    alignItems: "center",
    height: 34,
    justifyContent: "center",
    width: 42,
  },
  footerNote: {
    alignItems: "center",
    backgroundColor: "rgba(5,8,13,0.62)",
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    minHeight: 50,
    paddingHorizontal: 18,
  },
  footerText: {
    color: "rgba(255,255,255,0.78)",
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
  },
  emptyState: {
    alignItems: "center",
    borderColor: "rgba(255,255,255,0.16)",
    borderRadius: 17,
    borderWidth: 1,
    gap: 8,
    minHeight: 150,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
    textAlign: "center",
  },
  emptyText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
    textAlign: "center",
  },
  pressed: {
    opacity: 0.84,
    transform: [{ scale: 0.99 }],
  },
});
