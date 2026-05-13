import { musePalette } from "@/components/museiq/theme";
import {
  PrimaryButton,
  SecondaryButton,
  SectionCard,
  StatusPill,
} from "@/components/museiq/ui";
import { getArtworkImageSource } from "@/lib/artwork-images";
import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";

type ArtworkCardProps = {
  roomName: string;
  artworkTitle: string;
  artworkSummary: string;
  artworkLocation?: string;
  imageSource: ReturnType<typeof getArtworkImageSource>;
  onOpenChat: () => void;
  onSelectPrevious: () => void;
  onSelectNext: () => void;
  previousDisabled: boolean;
  nextDisabled: boolean;
};

export function ArtworkCard({
  roomName,
  artworkTitle,
  artworkSummary,
  artworkLocation,
  imageSource,
  onOpenChat,
  onSelectPrevious,
  onSelectNext,
  previousDisabled,
  nextDisabled,
}: ArtworkCardProps) {
  return (
    <SectionCard style={styles.card}>
      <View style={styles.headerRow}>
        <StatusPill label={roomName} />
        <Text style={styles.helper}>Guia curatorial</Text>
      </View>

      <View style={styles.copyBlock}>
        <Text style={styles.title}>{artworkTitle}</Text>
        <Text style={styles.summary}>{artworkSummary}</Text>
        {artworkLocation ? (
          <Text style={styles.location}>{`Ubicacion sugerida: ${artworkLocation}`}</Text>
        ) : null}
      </View>

      <View style={styles.imageWrap}>
        {imageSource ? (
          <Image
            source={imageSource}
            style={styles.image}
            contentFit="contain"
            transition={180}
          />
        ) : (
          <View style={[styles.image, styles.placeholder]}>
            <Text style={styles.placeholderText}>Obra actual</Text>
          </View>
        )}
      </View>

      <PrimaryButton
        icon="chatbubble-ellipses"
        label="Chat"
        onPress={onOpenChat}
      />

      <View style={styles.navRow}>
        <SecondaryButton
          icon="chevron-back"
          label="Anterior"
          onPress={onSelectPrevious}
          disabled={previousDisabled}
          style={styles.navButton}
        />
        <SecondaryButton
          icon="chevron-forward"
          label="Siguiente"
          onPress={onSelectNext}
          disabled={nextDisabled}
          style={styles.navButton}
        />
      </View>
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 14,
  },
  headerRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  helper: {
    color: musePalette.textMuted,
    fontSize: 12,
    fontWeight: "700",
  },
  copyBlock: {
    gap: 6,
  },
  title: {
    color: musePalette.text,
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: -0.4,
  },
  summary: {
    color: musePalette.textMuted,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 21,
  },
  location: {
    color: musePalette.primary,
    fontSize: 12,
    fontWeight: "800",
  },
  imageWrap: {
    borderRadius: 22,
    overflow: "hidden",
  },
  image: {
    backgroundColor: musePalette.surfaceMuted,
    height: 340,
    width: "100%",
  },
  placeholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    color: musePalette.textMuted,
    fontSize: 15,
    fontWeight: "800",
  },
  navRow: {
    flexDirection: "row",
    gap: 10,
  },
  navButton: {
    flex: 1,
  },
});
