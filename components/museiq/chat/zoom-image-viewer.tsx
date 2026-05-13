import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import Animated, {
  FadeIn,
  FadeOut,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

function clamp(value: number, min: number, max: number) {
  "worklet";
  return Math.min(Math.max(value, min), max);
}

const ZOOM_MAX_SCALE = 4;
const SWIPE_NAV_THRESHOLD = 56;

type ZoomImageViewerProps = {
  images: {
    id: string;
    uri: string;
    label?: string;
  }[];
  initialIndex: number;
  onClose: () => void;
};

export function ZoomImageViewer({
  images,
  initialIndex,
  onClose,
}: ZoomImageViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(
    Math.max(0, Math.min(initialIndex, images.length - 1)),
  );
  const zoomScale = useSharedValue(1);
  const pinchStartScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const panStartX = useSharedValue(0);
  const panStartY = useSharedValue(0);

  const resetZoomStateWorklet = () => {
    "worklet";
    zoomScale.value = withTiming(1);
    translateX.value = withTiming(0);
    translateY.value = withTiming(0);
  };

  const resetZoomState = () => {
    resetZoomStateWorklet();
  };

  const goToNextImage = () => {
    setCurrentIndex((previous) => {
      if (previous >= images.length - 1) {
        return previous;
      }
      return previous + 1;
    });
  };

  const goToPreviousImage = () => {
    setCurrentIndex((previous) => {
      if (previous <= 0) {
        return previous;
      }
      return previous - 1;
    });
  };

  useEffect(() => {
    setCurrentIndex(Math.max(0, Math.min(initialIndex, images.length - 1)));
  }, [images, initialIndex]);

  useEffect(() => {
    resetZoomState();
  }, [currentIndex]);

  const currentImage = useMemo(
    () => images[currentIndex],
    [currentIndex, images],
  );

  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      pinchStartScale.value = zoomScale.value;
    })
    .onUpdate((event) => {
      zoomScale.value = clamp(
        pinchStartScale.value * event.scale,
        1,
        ZOOM_MAX_SCALE,
      );
    })
    .onEnd(() => {
      if (zoomScale.value <= 1) {
        resetZoomStateWorklet();
      }
    });

  const panGesture = Gesture.Pan()
    .onStart(() => {
      panStartX.value = translateX.value;
      panStartY.value = translateY.value;
    })
    .onUpdate((event) => {
      if (zoomScale.value <= 1) {
        return;
      }

      const maxOffset = 180 * zoomScale.value;
      translateX.value = clamp(
        panStartX.value + event.translationX,
        -maxOffset,
        maxOffset,
      );
      translateY.value = clamp(
        panStartY.value + event.translationY,
        -maxOffset,
        maxOffset,
      );
    })
    .onEnd(() => {
      if (zoomScale.value <= 1) {
        const isHorizontalSwipe =
          Math.abs(translateX.value) < 8 &&
          Math.abs(translateY.value) < 8;
        if (isHorizontalSwipe) {
          return;
        }
      }
    });

  const swipeGesture = Gesture.Pan()
    .onEnd((event) => {
      if (zoomScale.value > 1) {
        return;
      }

      if (
        Math.abs(event.translationX) < SWIPE_NAV_THRESHOLD ||
        Math.abs(event.translationX) < Math.abs(event.translationY)
      ) {
        return;
      }

      if (event.translationX < 0) {
        runOnJS(goToNextImage)();
        return;
      }

      runOnJS(goToPreviousImage)();
    });

  const zoomGesture = Gesture.Simultaneous(
    pinchGesture,
    panGesture,
    swipeGesture,
  );

  const zoomImageStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: zoomScale.value },
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  if (!currentImage) {
    return null;
  }

  return (
    <Animated.View
      style={styles.zoomBackdrop}
      entering={FadeIn.duration(100)}
      exiting={FadeOut.duration(100)}
      pointerEvents="auto"
    >
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      <View style={styles.zoomContainer}>
        <GestureDetector gesture={zoomGesture}>
          <Animated.View style={[styles.zoomImageWrapper, zoomImageStyle]}>
            <Image
              source={{ uri: currentImage.uri }}
              style={styles.zoomImage}
              resizeMode="contain"
            />
          </Animated.View>
        </GestureDetector>
        {images.length > 1 ? (
          <View style={styles.navRow}>
            <Pressable
              onPress={goToPreviousImage}
              disabled={currentIndex === 0}
              style={({ pressed }) => [
                styles.navButton,
                currentIndex === 0 ? styles.navButtonDisabled : null,
                pressed && currentIndex !== 0 ? styles.navButtonPressed : null,
              ]}
            >
              <Ionicons name="chevron-back" size={18} color="#F4E8D8" />
            </Pressable>
            <Text style={styles.navLabel}>
              {`${currentIndex + 1} de ${images.length}`}
            </Text>
            <Pressable
              onPress={goToNextImage}
              disabled={currentIndex === images.length - 1}
              style={({ pressed }) => [
                styles.navButton,
                currentIndex === images.length - 1
                  ? styles.navButtonDisabled
                  : null,
                pressed && currentIndex !== images.length - 1
                  ? styles.navButtonPressed
                  : null,
              ]}
            >
              <Ionicons name="chevron-forward" size={18} color="#F4E8D8" />
            </Pressable>
          </View>
        ) : null}
        {currentImage.label ? (
          <Text style={styles.zoomFigureLabel}>{currentImage.label}</Text>
        ) : null}
        <Text style={styles.zoomLegend}>
          {images.length > 1
            ? "Desliza a izquierda o derecha para cambiar de imagen. Pellizca para zoom y toca afuera para cerrar."
            : "Pellizca para zoom, arrastra para mover y toca afuera para cerrar."}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  zoomBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.92)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  zoomContainer: {
    width: "100%",
    alignItems: "center",
    gap: 10,
    zIndex: 1000,
  },
  zoomImageWrapper: {
    width: "100%",
    height: 420,
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "auto",
  },
  zoomImage: {
    width: "100%",
    height: "100%",
  },
  zoomFigureLabel: {
    color: "#E7E7E7",
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },
  zoomLegend: {
    color: "#CFCFCF",
    fontSize: 12,
    textAlign: "center",
  },
  navRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 14,
  },
  navButton: {
    alignItems: "center",
    backgroundColor: "rgba(244, 232, 216, 0.16)",
    borderColor: "rgba(244, 232, 216, 0.24)",
    borderRadius: 999,
    borderWidth: 1,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  navButtonDisabled: {
    opacity: 0.4,
  },
  navButtonPressed: {
    opacity: 0.82,
  },
  navLabel: {
    color: "#F4E8D8",
    fontSize: 12,
    fontWeight: "700",
    minWidth: 54,
    textAlign: "center",
  },
});
