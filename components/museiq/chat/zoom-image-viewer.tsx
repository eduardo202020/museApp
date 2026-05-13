import Animated, {
  FadeIn,
  FadeOut,
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

type ZoomImageViewerProps = {
  label?: string;
  onClose: () => void;
  uri: string;
};

export function ZoomImageViewer({
  label,
  onClose,
  uri,
}: ZoomImageViewerProps) {
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
        resetZoomStateWorklet();
      }
    });

  const zoomGesture = Gesture.Simultaneous(pinchGesture, panGesture);

  const zoomImageStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: zoomScale.value },
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

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
            <Image source={{ uri }} style={styles.zoomImage} resizeMode="contain" />
          </Animated.View>
        </GestureDetector>
        {label ? <Text style={styles.zoomFigureLabel}>{label}</Text> : null}
        <Text style={styles.zoomLegend}>
          Pellizca para zoom, arrastra para mover y toca afuera para cerrar.
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
});
