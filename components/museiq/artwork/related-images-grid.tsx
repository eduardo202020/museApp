import { musePalette } from "@/components/museiq/theme";
import { getArtworkImageSource } from "@/lib/artwork-images";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";

type RelatedImagesGridProps = {
  imageSource: ReturnType<typeof getArtworkImageSource>;
  primaryTag?: string;
  technique?: string;
};

const imagePositions = ["center", "top", "bottom", "left", "right"] as const;

export function RelatedImagesGrid({
  imageSource,
  primaryTag,
  technique,
}: RelatedImagesGridProps) {
  const cards = [
    { label: "Vista frontal", wide: false },
    { label: `Detalle: ${primaryTag ?? "pieza principal"}`, wide: false },
    { label: "Detalle: iconografia", wide: false },
    { label: `Detalle: ${technique ?? "material"}`, wide: false },
    { label: "Vista lateral", wide: true },
  ];

  return (
    <View style={styles.grid}>
      {cards.map((card, index) => (
        <View
          key={`${card.label}-${index}`}
          style={[styles.card, card.wide ? styles.cardWide : null]}
        >
          {imageSource ? (
            <Image
              source={imageSource}
              style={[styles.image, card.wide ? styles.imageWide : null]}
              contentFit="cover"
              contentPosition={imagePositions[index]}
              transition={160}
            />
          ) : (
            <View style={[styles.image, card.wide ? styles.imageWide : null, styles.fallback]}>
              <Ionicons color={musePalette.primary} name="image-outline" size={30} />
            </View>
          )}
          <View style={styles.caption}>
            <View style={styles.dot} />
            <Text numberOfLines={2} style={styles.captionText}>
              {card.label}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.035)",
    borderColor: "rgba(255,255,255,0.16)",
    borderRadius: 10,
    borderWidth: 1,
    flexBasis: "48.7%",
    flexGrow: 1,
    minWidth: 150,
    overflow: "hidden",
  },
  cardWide: {
    flexBasis: "100%",
  },
  image: {
    backgroundColor: "rgba(255,255,255,0.07)",
    height: 126,
    width: "100%",
  },
  imageWide: {
    height: 130,
  },
  fallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  caption: {
    alignItems: "center",
    flexDirection: "row",
    gap: 9,
    minHeight: 42,
    paddingHorizontal: 11,
    paddingVertical: 8,
  },
  dot: {
    backgroundColor: musePalette.primary,
    borderRadius: 999,
    height: 10,
    width: 10,
  },
  captionText: {
    color: "#FFFFFF",
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 19,
  },
});
