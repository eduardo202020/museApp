import { musePalette } from "@/components/museiq/theme";
import { resolveMuseRagUrl, type SourceSnippet } from "@/lib/muserag-api";
import { useEffect, useMemo, useState } from "react";
import {
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const CAROUSEL_CARD_WIDTH = 260;
const CAROUSEL_GAP = 12;
const CAROUSEL_SNAP_INTERVAL = CAROUSEL_CARD_WIDTH + CAROUSEL_GAP;

function resolveImageUrl(imageUrl?: string) {
  if (!imageUrl) {
    return "";
  }

  if (/^https?:\/\//i.test(imageUrl)) {
    return imageUrl;
  }

  return `${resolveMuseRagUrl()}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
}

export type SourceImageItem = {
  id: string;
  label?: string;
  uri: string;
};

type SourceImageCarouselProps = {
  onOpenImage: (images: SourceImageItem[], initialIndex: number) => void;
  sources: SourceSnippet[];
};

export function SourceImageCarousel({
  onOpenImage,
  sources,
}: SourceImageCarouselProps) {
  const [activeCarouselIndex, setActiveCarouselIndex] = useState(0);
  const [imageLoadErrors, setImageLoadErrors] = useState<Record<string, boolean>>(
    {},
  );

  const imageSources = useMemo(
    () =>
      sources.filter(
        (source) =>
          typeof source.image_url === "string" &&
          source.image_url.trim().length > 0,
      ),
    [sources],
  );

  const zoomImages = useMemo<SourceImageItem[]>(
    () =>
      imageSources.map((source, index) => {
        const figureRef =
          source.metadata && typeof source.metadata.figure_ref === "string"
            ? source.metadata.figure_ref
            : undefined;

        return {
          id: source.id || `${source.source}-${index}`,
          label: figureRef,
          uri: resolveImageUrl(source.image_url),
        };
      }),
    [imageSources],
  );

  useEffect(() => {
    setImageLoadErrors({});
    setActiveCarouselIndex(0);
  }, [imageSources]);

  const handleCarouselMomentumEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const nextIndex = Math.round(offsetX / CAROUSEL_SNAP_INTERVAL);
    const boundedIndex = Math.max(
      0,
      Math.min(nextIndex, imageSources.length - 1),
    );
    setActiveCarouselIndex(boundedIndex);
  };

  if (imageSources.length === 0) {
    return null;
  }

  return (
    <>
      <ScrollView
        horizontal
        pagingEnabled
        style={styles.carousel}
        contentContainerStyle={styles.carouselContent}
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToAlignment="start"
        snapToInterval={CAROUSEL_SNAP_INTERVAL}
        disableIntervalMomentum
        onMomentumScrollEnd={handleCarouselMomentumEnd}
      >
        {imageSources.map((source, index) => {
          const imageItem = zoomImages[index];
          const imageKey = imageItem.id;
          const figureRef = imageItem.label;
          const imageUri = imageItem.uri;

          return (
            <View key={imageKey} style={styles.imageCard}>
              <Pressable
                style={styles.sourceImagePressable}
                onPress={() => onOpenImage(zoomImages, index)}
              >
                <Image
                  source={{ uri: imageUri }}
                  style={styles.sourceImage}
                  resizeMode="contain"
                  onError={() =>
                    setImageLoadErrors((prev) => ({
                      ...prev,
                      [imageKey]: true,
                    }))
                  }
                />
              </Pressable>
              {figureRef ? (
                <Text style={styles.figureLabel}>{figureRef}</Text>
              ) : null}
              {!imageLoadErrors[imageKey] ? (
                <Text style={styles.zoomHint}>Toca para ampliar</Text>
              ) : null}
              {imageLoadErrors[imageKey] ? (
                <Text style={styles.errorText}>
                  No se pudo cargar la imagen de la fuente.
                </Text>
              ) : null}
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.carouselDots}>
        {imageSources.map((source, index) => {
          const dotKey = source.id || `${source.source}-dot-${index}`;
          const isActive = index === activeCarouselIndex;

          return (
            <View
              key={dotKey}
              style={[
                styles.carouselDot,
                isActive ? styles.carouselDotActive : null,
              ]}
            />
          );
        })}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  carousel: {
    marginTop: 12,
  },
  carouselContent: {
    gap: 12,
    paddingRight: 6,
  },
  imageCard: {
    width: CAROUSEL_CARD_WIDTH,
    alignItems: "center",
    gap: 8,
  },
  sourceImagePressable: {
    borderRadius: 12,
    overflow: "hidden",
  },
  sourceImage: {
    width: CAROUSEL_CARD_WIDTH,
    height: 220,
    borderRadius: 12,
    backgroundColor: musePalette.surface,
  },
  figureLabel: {
    color: musePalette.textMuted,
    fontSize: 12,
    fontWeight: "600",
    fontStyle: "italic",
  },
  zoomHint: {
    color: musePalette.textMuted,
    fontSize: 11,
    fontWeight: "600",
  },
  errorText: {
    color: "#A12626",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
  },
  carouselDots: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 10,
  },
  carouselDot: {
    width: 7,
    height: 7,
    borderRadius: 999,
    backgroundColor: musePalette.border,
  },
  carouselDotActive: {
    width: 18,
    backgroundColor: musePalette.text,
  },
});
