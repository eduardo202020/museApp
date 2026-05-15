import { musePalette } from "@/components/museiq/theme";
import { resolveMuseRagUrl, type SourceSnippet } from "@/lib/muserag-api";
import { useEffect, useMemo, useState } from "react";
import {
  LayoutChangeEvent,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const DEFAULT_CAROUSEL_CARD_WIDTH = 280;
const CAROUSEL_GAP = 12;

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
  const [carouselWidth, setCarouselWidth] = useState(0);
  const [activeCarouselIndex, setActiveCarouselIndex] = useState(0);
  const [imageLoadErrors, setImageLoadErrors] = useState<Record<string, boolean>>(
    {},
  );

  const cardWidth = carouselWidth > 0 ? carouselWidth : DEFAULT_CAROUSEL_CARD_WIDTH;
  const snapInterval = cardWidth + CAROUSEL_GAP;

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
    const nextIndex = Math.round(offsetX / snapInterval);
    const boundedIndex = Math.max(
      0,
      Math.min(nextIndex, imageSources.length - 1),
    );
    setActiveCarouselIndex(boundedIndex);
  };

  const handleCarouselLayout = (event: LayoutChangeEvent) => {
    const width = event.nativeEvent.layout.width;
    if (width > 0 && width !== carouselWidth) {
      setCarouselWidth(width);
    }
  };

  if (imageSources.length === 0) {
    return null;
  }

  return (
    <>
      <View onLayout={handleCarouselLayout} style={styles.carouselLayout}> 
        <ScrollView
          horizontal
          pagingEnabled
          style={styles.carousel}
          contentContainerStyle={styles.carouselContent}
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          snapToAlignment="start"
          snapToInterval={snapInterval}
          disableIntervalMomentum
          onMomentumScrollEnd={handleCarouselMomentumEnd}
        >
          {imageSources.map((source, index) => {
            const imageItem = zoomImages[index];
            const imageKey = imageItem.id;
            const figureRef = imageItem.label;
            const imageUri = imageItem.uri;

            return (
              <View key={imageKey} style={[styles.imageCard, { width: cardWidth }]}>
                <Pressable
                  style={styles.sourceImagePressable}
                  onPress={() => onOpenImage(zoomImages, index)}
                >
                  <Image
                    source={{ uri: imageUri }}
                    style={styles.sourceImage}
                    resizeMode="cover"
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
                {imageLoadErrors[imageKey] ? (
                  <Text style={styles.errorText}>
                    No se pudo cargar la imagen de la fuente.
                  </Text>
                ) : null}
              </View>
            );
          })}
        </ScrollView>
      </View>

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
  carouselLayout: {
    width: "100%",
  },
  carousel: {
    marginTop: 12,
  },
  carouselContent: {
    gap: 12,
    paddingRight: 6,
  },
  imageCard: {
    alignItems: "center",
    gap: 8,
  },
  sourceImagePressable: {
    alignSelf: "stretch",
    borderRadius: 12,
    overflow: "hidden",
  },
  sourceImage: {
    width: "100%",
    height: 360,
    borderRadius: 12,
    backgroundColor: musePalette.surface,
  },
  figureLabel: {
    color: musePalette.textMuted,
    fontSize: 12,
    fontWeight: "600",
    fontStyle: "italic",
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
