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
  imageSource: ReturnType<typeof getArtworkImageSource>;
  onOpenChat: () => void;
  onSelectPrevious: () => void;
  onSelectNext: () => void;
  previousDisabled: boolean;
  nextDisabled: boolean;
};

export function ArtworkCard({
  roomName,
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
        />
        <SecondaryButton
          icon="chevron-forward"
          label="Siguiente"
          onPress={onSelectNext}
          disabled={nextDisabled}
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
});
