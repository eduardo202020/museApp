import { musePalette } from "@/components/museiq/theme";
import { ArtworkRow } from "@/features/explore/components/artwork-row";
import { ExploreHeroCard } from "@/features/explore/components/explore-hero-card";
import { ExploreScreenHeader } from "@/features/explore/components/explore-screen-header";
import { RoomCard } from "@/features/explore/components/room-card";
import { RoomDetailCard } from "@/features/explore/components/room-detail-card";
import { useExploreScreenController } from "@/features/explore/hooks/use-explore-screen-controller";
import { StatusBar } from "expo-status-bar";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function InfoRecorridoScreen() {
  const {
    currentArtworkId,
    artworks,
    museumProfile,
    openArtworkChat,
    openArtworkDetail,
    roomArtworks,
    roomSummaries,
    rooms,
    setCurrentRoomById,
    visibleRoom,
    visitedArtworkIds,
    visitedInRoom,
  } = useExploreScreenController();

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeArea}>
        <ExploreScreenHeader title="Explorar salas" />

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <ExploreHeroCard
            artworksCount={artworks.length}
            museumProfile={museumProfile}
            roomsCount={rooms.length}
          />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Salas disponibles</Text>
            <View style={styles.roomGrid}>
              {rooms.map((room) => {
                const summary = roomSummaries.find((item) => item.roomId === room.id);
                return (
                  <RoomCard
                    active={visibleRoom?.id === room.id}
                    key={room.id}
                    onPress={() => setCurrentRoomById(room.id)}
                    room={room}
                    total={summary?.total ?? 0}
                    visited={summary?.visited ?? 0}
                  />
                );
              })}
            </View>
          </View>

          <RoomDetailCard
            description={visibleRoom?.description ?? "Selecciona una sala para comenzar."}
            title={visibleRoom?.name ?? "Sala"}
            total={roomArtworks.length}
            visited={visitedInRoom}
          />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Obras de la sala</Text>
            <View style={styles.artworkList}>
              {roomArtworks.map((artwork) => (
                <ArtworkRow
                  artwork={artwork}
                  current={artwork.id === currentArtworkId}
                  key={artwork.id}
                  onAsk={() => openArtworkChat(artwork)}
                  onOpen={() => openArtworkDetail(artwork)}
                  visited={visitedArtworkIds.includes(artwork.id)}
                />
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: "#02070B",
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    gap: 18,
    paddingBottom: 34,
    paddingHorizontal: 22,
  },
  section: {
    gap: 9,
  },
  sectionTitle: {
    color: musePalette.primary,
    fontSize: 13,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  roomGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  artworkList: {
    gap: 12,
  },
});
