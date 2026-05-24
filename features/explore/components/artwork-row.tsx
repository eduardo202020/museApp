import { musePalette } from "@/components/museiq/theme";
import type { ArtworkMock } from "@/datos";
import { getArtworkImageSource } from "@/lib/artwork-images";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";

type ArtworkRowProps = {
  artwork: ArtworkMock;
  current: boolean;
  onAsk: () => void;
  onOpen: () => void;
  visited: boolean;
};

export function ArtworkRow({
  artwork,
  current,
  onAsk,
  onOpen,
  visited,
}: ArtworkRowProps) {
  const imageSource = getArtworkImageSource(artwork.image);

  return (
    <View style={[styles.artworkCard, current ? styles.artworkCardCurrent : null]}>
      <Pressable onPress={onOpen} style={styles.artworkMain}>
        {imageSource ? (
          <Image contentFit="cover" source={imageSource} style={styles.artworkImage} />
        ) : (
          <View style={[styles.artworkImage, styles.artworkImageFallback]}>
            <Ionicons color={musePalette.primary} name="image-outline" size={22} />
          </View>
        )}
        <View style={styles.artworkCopy}>
          <Text numberOfLines={2} style={styles.artworkTitle}>
            {artwork.title}
          </Text>
          <Text numberOfLines={1} style={styles.artworkMeta}>
            {artwork.period} · {artwork.technique}
          </Text>
          <View style={styles.artworkTags}>
            {visited ? <MiniTag icon="checkmark-circle" label="Vista" /> : null}
            {current ? <MiniTag icon="sparkles" label="Actual" /> : null}
          </View>
        </View>
        <Ionicons color="#FFFFFF" name="chevron-forward" size={20} />
      </Pressable>

      <View style={styles.artworkActions}>
        <Pressable
          onPress={onOpen}
          style={({ pressed }) => [styles.secondaryButton, pressed ? styles.pressed : null]}
        >
          <Text style={styles.secondaryButtonText}>Ver detalle</Text>
        </Pressable>
        <Pressable
          onPress={onAsk}
          style={({ pressed }) => [styles.primaryButton, pressed ? styles.pressed : null]}
        >
          <Ionicons color="#FFFFFF" name="chatbubble-ellipses-outline" size={17} />
          <Text style={styles.primaryButtonText}>Preguntar</Text>
        </Pressable>
      </View>
    </View>
  );
}

function MiniTag({
  icon,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}) {
  return (
    <View style={styles.miniTag}>
      <Ionicons color={musePalette.primary} name={icon} size={12} />
      <Text style={styles.miniTagText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  artworkCard: {
    backgroundColor: "rgba(255,255,255,0.045)",
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
    padding: 12,
  },
  artworkCardCurrent: {
    borderColor: musePalette.primary,
  },
  artworkMain: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },
  artworkImage: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 10,
    height: 64,
    overflow: "hidden",
    width: 58,
  },
  artworkImageFallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  artworkCopy: {
    flex: 1,
    gap: 4,
  },
  artworkTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
    lineHeight: 20,
  },
  artworkMeta: {
    color: "rgba(255,255,255,0.62)",
    fontSize: 12,
    fontWeight: "700",
  },
  artworkTags: {
    flexDirection: "row",
    gap: 6,
    minHeight: 20,
  },
  miniTag: {
    alignItems: "center",
    backgroundColor: "rgba(22,137,206,0.12)",
    borderRadius: 999,
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },
  miniTagText: {
    color: musePalette.primary,
    fontSize: 11,
    fontWeight: "800",
  },
  artworkActions: {
    flexDirection: "row",
    gap: 9,
  },
  secondaryButton: {
    alignItems: "center",
    borderColor: "rgba(255,255,255,0.28)",
    borderRadius: 999,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    minHeight: 42,
  },
  secondaryButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: musePalette.primary,
    borderRadius: 999,
    flex: 1,
    flexDirection: "row",
    gap: 7,
    justifyContent: "center",
    minHeight: 42,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
  },
  pressed: {
    opacity: 0.84,
  },
});
