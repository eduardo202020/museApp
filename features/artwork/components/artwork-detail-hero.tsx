import { musePalette } from "@/components/museiq/theme";
import { getArtworkImageSource } from "@/lib/artwork-images";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";

type ArtworkDetailHeroProps = {
  imageSource: ReturnType<typeof getArtworkImageSource>;
  summary: string;
  title: string;
  year: string;
};

export function ArtworkDetailHero({
  imageSource,
  summary,
  title,
  year,
}: ArtworkDetailHeroProps) {
  return (
    <View style={styles.hero}>
      {imageSource ? (
        <Image
          source={imageSource}
          style={styles.heroImage}
          contentFit="cover"
          contentPosition="center"
          transition={180}
        />
      ) : (
        <View style={[styles.heroImage, styles.heroFallback]}>
          <Ionicons color={musePalette.primary} name="image-outline" size={40} />
        </View>
      )}

      <View style={styles.heroCopy}>
        <Text numberOfLines={3} style={styles.artworkTitle}>
          {title}
        </Text>
        <Text style={styles.year}>{year}</Text>
        <Text numberOfLines={5} style={styles.summary}>
          {summary}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    flexDirection: "row",
    gap: 20,
  },
  heroImage: {
    backgroundColor: "rgba(255,255,255,0.07)",
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: 13,
    borderWidth: 1,
    height: 258,
    overflow: "hidden",
    width: "42%",
  },
  heroFallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  heroCopy: {
    flex: 1,
    gap: 14,
    justifyContent: "center",
    minWidth: 0,
  },
  artworkTitle: {
    color: "#FFFFFF",
    fontSize: 29,
    fontWeight: "900",
    lineHeight: 37,
  },
  year: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "500",
  },
  summary: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 17,
    fontWeight: "500",
    lineHeight: 26,
  },
});
