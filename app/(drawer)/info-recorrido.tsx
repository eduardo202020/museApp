import { musePalette } from "@/components/museiq/theme";
import type { ArtworkMock, RoomMock } from "@/datos";
import { getArtworkImageSource } from "@/lib/artwork-images";
import { useMuseIQ } from "@/providers/museiq-provider";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function InfoRecorridoScreen() {
  const {
    artworks,
    currentArtworkId,
    currentRoom,
    getArtworksForRoom,
    museumProfile,
    rooms,
    selectArtwork,
    setCurrentRoomById,
    visitedArtworkIds,
  } = useMuseIQ();

  const visibleRoom = currentRoom ?? rooms[0];
  const roomArtworks = visibleRoom ? getArtworksForRoom(visibleRoom.id) : [];
  const visitedInRoom = roomArtworks.filter((artwork) =>
    visitedArtworkIds.includes(artwork.id),
  ).length;

  const openArtworkDetail = (artwork: ArtworkMock) => {
    selectArtwork(artwork.id);
    router.push({
      pathname: "/artwork-detail",
      params: { artworkId: artwork.id },
    } as never);
  };

  const openArtworkChat = (artwork: ArtworkMock) => {
    selectArtwork(artwork.id);
    router.push({
      pathname: "/pregunta-voz-modal",
      params: { artworkId: artwork.id },
    } as never);
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeArea}>
        <Header title="Explorar salas" />

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.heroCard}>
            <View style={styles.heroIcon}>
              <Ionicons color={musePalette.primary} name="map-outline" size={30} />
            </View>
            <View style={styles.heroCopy}>
              <Text style={styles.heroTitle}>
                {museumProfile?.routeName ?? "Recorrido curatorial"}
              </Text>
              <Text style={styles.heroText}>
                {museumProfile?.description ??
                  "Explora las salas, revisa obras y abre el guia de IA desde cada pieza."}
              </Text>
            </View>
            <View style={styles.statsRow}>
              <StatPill icon="business-outline" label={`${rooms.length} salas`} />
              <StatPill icon="cube-outline" label={`${artworks.length} obras`} />
              <StatPill
                icon="time-outline"
                label={`${museumProfile?.estimatedDurationMinutes ?? 0} min`}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Salas disponibles</Text>
            <View style={styles.roomGrid}>
              {rooms.map((room) => (
                <RoomCard
                  active={visibleRoom?.id === room.id}
                  key={room.id}
                  onPress={() => setCurrentRoomById(room.id)}
                  room={room}
                  total={getArtworksForRoom(room.id).length}
                  visited={getArtworksForRoom(room.id).filter((artwork) =>
                    visitedArtworkIds.includes(artwork.id),
                  ).length}
                />
              ))}
            </View>
          </View>

          <View style={styles.roomDetailCard}>
            <View style={styles.roomDetailHeader}>
              <View style={styles.roomDetailIcon}>
                <Ionicons color="#FFFFFF" name="location-outline" size={26} />
              </View>
              <View style={styles.roomDetailCopy}>
                <Text style={styles.roomDetailTitle}>{visibleRoom?.name ?? "Sala"}</Text>
                <Text style={styles.roomDetailMeta}>
                  {visitedInRoom} de {roomArtworks.length} obras vistas
                </Text>
              </View>
            </View>
            <Text style={styles.roomDetailText}>
              {visibleRoom?.description ?? "Selecciona una sala para comenzar."}
            </Text>
          </View>

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

function Header({ title }: { title: string }) {
  return (
    <View style={styles.header}>
      <Pressable onPress={() => router.back()} style={styles.headerButton}>
        <Ionicons color="#FFFFFF" name="arrow-back" size={28} />
      </Pressable>
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={styles.headerButton} />
    </View>
  );
}

function StatPill({
  icon,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}) {
  return (
    <View style={styles.statPill}>
      <Ionicons color={musePalette.primary} name={icon} size={16} />
      <Text style={styles.statPillText}>{label}</Text>
    </View>
  );
}

function RoomCard({
  active,
  onPress,
  room,
  total,
  visited,
}: {
  active: boolean;
  onPress: () => void;
  room: RoomMock;
  total: number;
  visited: number;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.roomCard,
        active ? styles.roomCardActive : null,
        pressed ? styles.pressed : null,
      ]}
    >
      <View style={[styles.roomIcon, active ? styles.roomIconActive : null]}>
        <Ionicons color={active ? "#FFFFFF" : musePalette.primary} name="business-outline" size={22} />
      </View>
      <Text numberOfLines={2} style={styles.roomName}>{room.name}</Text>
      <Text style={styles.roomMeta}>{visited}/{total} obras</Text>
    </Pressable>
  );
}

function ArtworkRow({
  artwork,
  current,
  onAsk,
  onOpen,
  visited,
}: {
  artwork: ArtworkMock;
  current: boolean;
  onAsk: () => void;
  onOpen: () => void;
  visited: boolean;
}) {
  const imageSource = getArtworkImageSource(artwork.image);

  return (
    <View style={[styles.artworkCard, current ? styles.artworkCardCurrent : null]}>
      <Pressable onPress={onOpen} style={styles.artworkMain}>
        {imageSource ? (
          <Image contentFit="cover" source={imageSource} style={styles.artworkImage} />
        ) : (
          <View style={[styles.artworkImage, styles.artworkImageFallback]}>
            <Ionicons color={musePalette.primary} name="image-outline" size={22} />
          </View>
        )}
        <View style={styles.artworkCopy}>
          <Text numberOfLines={2} style={styles.artworkTitle}>{artwork.title}</Text>
          <Text numberOfLines={1} style={styles.artworkMeta}>
            {artwork.period} · {artwork.technique}
          </Text>
          <View style={styles.artworkTags}>
            {visited ? <MiniTag icon="checkmark-circle" label="Vista" /> : null}
            {current ? <MiniTag icon="sparkles" label="Actual" /> : null}
          </View>
        </View>
        <Ionicons color="#FFFFFF" name="chevron-forward" size={20} />
      </Pressable>

      <View style={styles.artworkActions}>
        <Pressable onPress={onOpen} style={({ pressed }) => [styles.secondaryButton, pressed ? styles.pressed : null]}>
          <Text style={styles.secondaryButtonText}>Ver detalle</Text>
        </Pressable>
        <Pressable onPress={onAsk} style={({ pressed }) => [styles.primaryButton, pressed ? styles.pressed : null]}>
          <Ionicons color="#FFFFFF" name="chatbubble-ellipses-outline" size={17} />
          <Text style={styles.primaryButtonText}>Preguntar</Text>
        </Pressable>
      </View>
    </View>
  );
}

function MiniTag({
  icon,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}) {
  return (
    <View style={styles.miniTag}>
      <Ionicons color={musePalette.primary} name={icon} size={12} />
      <Text style={styles.miniTagText}>{label}</Text>
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
  header: {
    alignItems: "center",
    flexDirection: "row",
    minHeight: 68,
    paddingHorizontal: 22,
  },
  headerButton: {
    alignItems: "center",
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  headerTitle: {
    color: "#FFFFFF",
    flex: 1,
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
  },
  content: {
    gap: 18,
    paddingBottom: 34,
    paddingHorizontal: 22,
  },
  heroCard: {
    backgroundColor: "rgba(255,255,255,0.045)",
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: 16,
    borderWidth: 1,
    gap: 14,
    padding: 16,
  },
  heroIcon: {
    alignItems: "center",
    backgroundColor: "rgba(22,137,206,0.14)",
    borderColor: "rgba(22,137,206,0.36)",
    borderRadius: 999,
    borderWidth: 1,
    height: 54,
    justifyContent: "center",
    width: 54,
  },
  heroCopy: {
    gap: 7,
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "900",
    lineHeight: 28,
  },
  heroText: {
    color: "rgba(255,255,255,0.68)",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 21,
  },
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  statPill: {
    alignItems: "center",
    backgroundColor: "rgba(22,137,206,0.12)",
    borderColor: "rgba(22,137,206,0.36)",
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: 7,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  statPillText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
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
  roomCard: {
    backgroundColor: "rgba(255,255,255,0.045)",
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
    minHeight: 126,
    padding: 13,
    width: "48%",
  },
  roomCardActive: {
    backgroundColor: "rgba(22,137,206,0.12)",
    borderColor: musePalette.primary,
  },
  roomIcon: {
    alignItems: "center",
    backgroundColor: "rgba(22,137,206,0.12)",
    borderRadius: 999,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  roomIconActive: {
    backgroundColor: musePalette.primary,
  },
  roomName: {
    color: "#FFFFFF",
    flex: 1,
    fontSize: 15,
    fontWeight: "900",
    lineHeight: 19,
  },
  roomMeta: {
    color: "rgba(255,255,255,0.62)",
    fontSize: 12,
    fontWeight: "700",
  },
  roomDetailCard: {
    backgroundColor: "rgba(255,255,255,0.045)",
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    padding: 16,
  },
  roomDetailHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 13,
  },
  roomDetailIcon: {
    alignItems: "center",
    borderColor: musePalette.primary,
    borderRadius: 999,
    borderWidth: 1,
    height: 46,
    justifyContent: "center",
    width: 46,
  },
  roomDetailCopy: {
    flex: 1,
    gap: 4,
  },
  roomDetailTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "900",
  },
  roomDetailMeta: {
    color: musePalette.primary,
    fontSize: 12,
    fontWeight: "800",
  },
  roomDetailText: {
    color: "rgba(255,255,255,0.68)",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 21,
  },
  artworkList: {
    gap: 12,
  },
  artworkCard: {
    backgroundColor: "rgba(255,255,255,0.045)",
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
    padding: 12,
  },
  artworkCardCurrent: {
    borderColor: musePalette.primary,
  },
  artworkMain: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },
  artworkImage: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 10,
    height: 64,
    overflow: "hidden",
    width: 58,
  },
  artworkImageFallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  artworkCopy: {
    flex: 1,
    gap: 4,
  },
  artworkTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
    lineHeight: 20,
  },
  artworkMeta: {
    color: "rgba(255,255,255,0.62)",
    fontSize: 12,
    fontWeight: "700",
  },
  artworkTags: {
    flexDirection: "row",
    gap: 6,
    minHeight: 20,
  },
  miniTag: {
    alignItems: "center",
    backgroundColor: "rgba(22,137,206,0.12)",
    borderRadius: 999,
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },
  miniTagText: {
    color: musePalette.primary,
    fontSize: 11,
    fontWeight: "800",
  },
  artworkActions: {
    flexDirection: "row",
    gap: 9,
  },
  secondaryButton: {
    alignItems: "center",
    borderColor: "rgba(255,255,255,0.28)",
    borderRadius: 999,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    minHeight: 42,
  },
  secondaryButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: musePalette.primary,
    borderRadius: 999,
    flex: 1,
    flexDirection: "row",
    gap: 7,
    justifyContent: "center",
    minHeight: 42,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
  },
  pressed: {
    opacity: 0.84,
  },
});
