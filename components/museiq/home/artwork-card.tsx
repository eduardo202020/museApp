import { musePalette } from "@/components/museiq/theme";
import {
  PrimaryButton,
  SecondaryButton,
  SectionCard,
  StatusPill,
} from "@/components/museiq/ui";
import { Ionicons } from "@expo/vector-icons";
import { getArtworkImageSource } from "@/lib/artwork-images";
import { Image } from "expo-image";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type ArtworkCardProps = {
  roomName: string;
  progressLabel: string;
  zoneLabel?: string;
  routeHint?: string;
  artworkTitle: string;
  artworkSummary: string;
  artworkContext?: string;
  artworkLocation?: string;
  imageSource: ReturnType<typeof getArtworkImageSource>;
  onListenArtwork: () => void;
  onOpenChat: () => void;
  onSelectNext: () => void;
  nextDisabled: boolean;
};

export function ArtworkCard({
  roomName,
  progressLabel,
  zoneLabel,
  routeHint,
  artworkTitle,
  artworkSummary,
  artworkContext,
  artworkLocation,
  imageSource,
  onListenArtwork,
  onOpenChat,
  onSelectNext,
  nextDisabled,
}: ArtworkCardProps) {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const hasMoreContext = Boolean(artworkContext || artworkLocation || routeHint);

  return (
    <SectionCard style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerMain}>
          <StatusPill label={roomName} />
          {zoneLabel ? <Text style={styles.zoneLabel}>{zoneLabel}</Text> : null}
        </View>
        <Text style={styles.helper}>{progressLabel}</Text>
      </View>

      <View style={styles.copyBlock}>
        <Text style={styles.title} numberOfLines={2}>
          {artworkTitle}
        </Text>
        <Text ellipsizeMode="tail" numberOfLines={2} style={styles.summary}>
          {artworkSummary}
        </Text>
      </View>

      <View style={styles.imageWrap}>
        {imageSource ? (
          <Image
            source={imageSource}
            style={styles.image}
            contentFit="cover"
            contentPosition="center"
            transition={180}
          />
        ) : (
          <View style={[styles.image, styles.placeholder]}>
            <Text style={styles.placeholderText}>Obra actual</Text>
          </View>
        )}
      </View>

      <View style={styles.actionStack}>
        <PrimaryButton
          icon="chatbubble-ellipses"
          label="Conversar con la guia"
          onPress={onOpenChat}
        />
        <View style={styles.secondaryActionsRow}>
          <SecondaryButton
            icon="volume-high-outline"
            label="Escuchar"
            onPress={onListenArtwork}
            style={styles.secondaryActionButton}
          />
          <SecondaryButton
            icon="play-forward-outline"
            label="Siguiente"
            onPress={onSelectNext}
            disabled={nextDisabled}
            style={styles.secondaryActionButton}
          />
        </View>
      </View>

      {hasMoreContext ? (
        <View style={styles.moreBlock}>
          <Pressable
            onPress={() => setIsMoreOpen((value) => !value)}
            style={({ pressed }) => [
              styles.moreToggle,
              pressed ? styles.moreTogglePressed : null,
            ]}
          >
            <Text style={styles.moreToggleText}>
              {isMoreOpen ? "Ocultar detalles de la obra" : "Ver mas sobre esta obra"}
            </Text>
            <Ionicons
              color={musePalette.primary}
              name={isMoreOpen ? "chevron-up" : "chevron-down"}
              size={18}
            />
          </Pressable>

          {isMoreOpen ? (
            <View style={styles.moreContent}>
              {artworkContext ? (
                <Text style={styles.context}>{artworkContext}</Text>
              ) : null}
              {artworkLocation ? (
                <Text style={styles.location}>{`Mirala primero en: ${artworkLocation}`}</Text>
              ) : null}
              {routeHint ? <Text style={styles.routeHint}>{routeHint}</Text> : null}
            </View>
          ) : null}
        </View>
      ) : null}
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 12,
  },
  headerRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  headerMain: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  helper: {
    color: musePalette.textMuted,
    fontSize: 12,
    fontWeight: "800",
  },
  zoneLabel: {
    color: musePalette.primary,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
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
    color: musePalette.text,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
  },
  context: {
    color: musePalette.textMuted,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 22,
  },
  location: {
    color: musePalette.primary,
    fontSize: 12,
    fontWeight: "800",
  },
  routeHint: {
    color: "#8A5A2B",
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 18,
  },
  imageWrap: {
    borderRadius: 22,
    overflow: "hidden",
  },
  image: {
    backgroundColor: musePalette.surfaceMuted,
    height: 356,
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
  actionStack: {
    gap: 8,
  },
  secondaryActionsRow: {
    flexDirection: "row",
    gap: 8,
  },
  secondaryActionButton: {
    flex: 1,
  },
  moreBlock: {
    gap: 6,
  },
  moreToggle: {
    alignItems: "center",
    backgroundColor: "#F6F9FC",
    borderColor: musePalette.border,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  moreTogglePressed: {
    opacity: 0.84,
  },
  moreToggleText: {
    color: musePalette.primary,
    fontSize: 12,
    fontWeight: "800",
  },
  moreContent: {
    backgroundColor: "#FAFCFE",
    borderColor: musePalette.border,
    borderRadius: 14,
    borderWidth: 1,
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
});
