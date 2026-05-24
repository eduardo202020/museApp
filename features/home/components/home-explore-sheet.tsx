import { ExploreRoomSheet } from "@/components/museiq/home/explore-room-sheet";
import { Pressable, StyleSheet, View } from "react-native";

type HomeExploreSheetProps = {
  currentArtworkId: string;
  isRoomDetected: boolean;
  onArtworkPress: (artworkId: string) => void;
  onClose: () => void;
  roomArtworks: Parameters<typeof ExploreRoomSheet>[0]["artworks"];
  roomName: string;
  visitedArtworkIds: string[];
};

export function HomeExploreSheet({
  currentArtworkId,
  isRoomDetected,
  onArtworkPress,
  onClose,
  roomArtworks,
  roomName,
  visitedArtworkIds,
}: HomeExploreSheetProps) {
  return (
    <View style={styles.sheetBackdrop}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.sheetHandle} />
        <ExploreRoomSheet
          artworks={roomArtworks}
          currentArtworkId={currentArtworkId}
          isRoomDetected={isRoomDetected}
          roomName={roomName}
          visitedArtworkIds={visitedArtworkIds}
          onArtworkPress={onArtworkPress}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.16)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "rgba(5,8,13,0.96)",
    borderColor: "rgba(255,255,255,0.18)",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    maxHeight: "58%",
    paddingBottom: 28,
    paddingHorizontal: 22,
    paddingTop: 12,
  },
  sheetHandle: {
    alignSelf: "center",
    backgroundColor: "rgba(255,255,255,0.28)",
    borderRadius: 999,
    height: 5,
    marginBottom: 14,
    width: 58,
  },
});
