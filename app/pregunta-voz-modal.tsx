import { ChatSheet } from "@/components/museiq/chat/chat-sheet";
import { ZoomImageViewer } from "@/components/museiq/chat/zoom-image-viewer";
import { musePalette } from "@/components/museiq/theme";
import { useArtworkChatController } from "@/hooks/use-artwork-chat-controller";
import { router, useLocalSearchParams } from "expo-router";
import { StyleSheet, View } from "react-native";

export default function PreguntaVozModal() {
  const params = useLocalSearchParams<{ artworkId?: string }>();
  const artworkId =
    typeof params.artworkId === "string" ? params.artworkId : undefined;
  const { chatSheetProps, closeZoomViewer, zoomImage } =
    useArtworkChatController({ artworkId });

  return (
    <View style={styles.backdrop}>
      <ChatSheet {...chatSheetProps} onClose={() => router.back()} />

      {zoomImage ? (
        <ZoomImageViewer
          images={zoomImage.images}
          initialIndex={zoomImage.initialIndex}
          onClose={closeZoomViewer}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: musePalette.overlay,
    flex: 1,
    justifyContent: "flex-end",
  },
});
