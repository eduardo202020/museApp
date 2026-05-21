import { musePalette } from "@/components/museiq/theme";
import { getArtworkImageSource } from "@/lib/artwork-images";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { Pressable, StyleSheet, Text, View } from "react-native";

type BleSuggestionCardProps = {
  artworkTitle: string;
  imageSource: ReturnType<typeof getArtworkImageSource>;
  onClose: () => void;
  onExploreOther: () => void;
  onViewAr: () => void;
};

export function BleSuggestionCard({
  artworkTitle,
  imageSource,
  onClose,
  onExploreOther,
  onViewAr,
}: BleSuggestionCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.signalMark}>
          <Ionicons color={musePalette.primary} name="radio-outline" size={48} />
        </View>
        <Text style={styles.eyebrow}>Obra cercana sugerida</Text>
        <Pressable
          accessibilityLabel="Cerrar sugerencia"
          onPress={onClose}
          style={({ pressed }) => [
            styles.closeButton,
            pressed ? styles.pressed : null,
          ]}
        >
          <Ionicons color="#FFFFFF" name="close" size={27} />
        </Pressable>
      </View>

      <View style={styles.body}>
        {imageSource ? (
          <Image
            source={imageSource}
            style={styles.image}
            contentFit="cover"
            contentPosition="center"
            transition={160}
          />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Ionicons color={musePalette.primary} name="image-outline" size={26} />
          </View>
        )}

        <View style={styles.copy}>
          <Text numberOfLines={3} style={styles.title}>
            Estas observando {artworkTitle}?
          </Text>
          <Text style={styles.subtitle}>Segun la senal y tu orientacion</Text>

          <View style={styles.actions}>
            <Pressable
              onPress={onViewAr}
              style={({ pressed }) => [
                styles.primaryAction,
                pressed ? styles.pressed : null,
              ]}
            >
              <Text style={styles.primaryActionText}>Ver en AR</Text>
            </Pressable>
            <Pressable
              onPress={onExploreOther}
              style={({ pressed }) => [
                styles.secondaryAction,
                pressed ? styles.pressed : null,
              ]}
            >
              <Text style={styles.secondaryActionText}>
                No, explorar otras
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignSelf: "center",
    backgroundColor: "rgba(8,10,14,0.86)",
    borderColor: musePalette.primary,
    borderRadius: 18,
    borderWidth: 1.4,
    gap: 8,
    maxWidth: 392,
    minHeight: 190,
    paddingBottom: 18,
    paddingHorizontal: 16,
    paddingTop: 15,
    width: "100%",
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },
  signalMark: {
    alignItems: "center",
    height: 52,
    justifyContent: "center",
    width: 52,
  },
  eyebrow: {
    color: "rgba(255,255,255,0.84)",
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
  },
  closeButton: {
    alignItems: "center",
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  body: {
    flexDirection: "row",
    gap: 15,
  },
  image: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 13,
    height: 104,
    overflow: "hidden",
    width: 64,
  },
  imagePlaceholder: {
    alignItems: "center",
    borderColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    justifyContent: "center",
  },
  copy: {
    flex: 1,
    gap: 8,
    minWidth: 0,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
    lineHeight: 28,
  },
  subtitle: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 15,
    fontWeight: "500",
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  primaryAction: {
    alignItems: "center",
    backgroundColor: musePalette.primary,
    borderRadius: 13,
    flex: 1,
    justifyContent: "center",
    minHeight: 43,
    paddingHorizontal: 12,
  },
  primaryActionText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  secondaryAction: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderColor: "rgba(255,255,255,0.42)",
    borderRadius: 13,
    borderWidth: 1,
    flex: 1.25,
    justifyContent: "center",
    minHeight: 43,
    paddingHorizontal: 10,
  },
  secondaryActionText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },
  pressed: {
    opacity: 0.84,
    transform: [{ scale: 0.99 }],
  },
});
