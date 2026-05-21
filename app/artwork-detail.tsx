import { ArtworkInfoRow } from "@/components/museiq/artwork/artwork-info-row";
import { ArtworkScreenHeader } from "@/components/museiq/artwork/artwork-screen-header";
import { musePalette } from "@/components/museiq/theme";
import { getArtworkImageSource } from "@/lib/artwork-images";
import { useMuseIQ } from "@/providers/museiq-provider";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function getCultureLabel(period?: string, author?: string) {
  const source = `${period ?? ""} ${author ?? ""}`.toLowerCase();
  if (source.includes("moche") || source.includes("sipan")) {
    return "Cultura Moche";
  }
  if (source.includes("lambayeque")) {
    return "Cultura Lambayeque";
  }
  return author || "Cultura por confirmar";
}

export default function ArtworkDetailScreen() {
  const { artworkId } = useLocalSearchParams<{ artworkId?: string }>();
  const {
    currentArtwork,
    currentRoom,
    findArtworkById,
    findRoomById,
    museumProfile,
    selectArtwork,
  } = useMuseIQ();
  const artwork = findArtworkById(artworkId) ?? currentArtwork;
  const room = findRoomById(artwork?.roomId) ?? currentRoom;

  if (!artwork) {
    return (
      <View style={styles.screen}>
        <StatusBar style="light" />
        <SafeAreaView style={styles.safeArea}>
          <Pressable onPress={() => router.back()} style={styles.backOnly}>
            <Ionicons color="#FFFFFF" name="arrow-back" size={28} />
          </Pressable>
          <View style={styles.emptyState}>
            <Ionicons color={musePalette.primary} name="cube-outline" size={42} />
            <Text style={styles.emptyTitle}>Obra no disponible</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const imageSource = getArtworkImageSource(artwork.image);
  const roomName = room?.name ?? "Sala por confirmar";
  const cultureLabel = getCultureLabel(artwork.period, artwork.author);
  const museumName = museumProfile?.name ?? "MuseIQ";

  const openAr = () => {
    selectArtwork(artwork.id);
    router.push({
      pathname: "/cargando-ar",
      params: { artworkId: artwork.id },
    } as never);
  };

  const openQuestion = () => {
    selectArtwork(artwork.id);
    router.push({
      pathname: "/ar-chat-ia",
      params: { artworkId: artwork.id },
    } as never);
  };

  const openImages = () => {
    router.push({
      pathname: "/artwork-images",
      params: { artworkId: artwork.id },
    } as never);
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <ArtworkScreenHeader
            cultureLabel={cultureLabel}
            onBack={() => router.back()}
            roomName={roomName}
            title={artwork.title}
          />

          <View style={styles.hero}>
            {imageSource ? (
              <Image
                source={imageSource}
                style={styles.heroImage}
                contentFit="cover"
                contentPosition="center"
                transition={180}
              />
            ) : (
              <View style={[styles.heroImage, styles.heroFallback]}>
                <Ionicons
                  color={musePalette.primary}
                  name="image-outline"
                  size={40}
                />
              </View>
            )}

            <View style={styles.heroCopy}>
              <Text numberOfLines={3} style={styles.artworkTitle}>
                {artwork.title}
              </Text>
              <Text style={styles.year}>{artwork.year}</Text>
              <Text numberOfLines={5} style={styles.summary}>
                {artwork.summary}
              </Text>
            </View>
          </View>

          <View style={styles.infoStack}>
            <ArtworkInfoRow
              icon="location-outline"
              label="Ubicacion actual"
              value={`${roomName}, ${museumName}`}
            />
            <ArtworkInfoRow
              icon="resize-outline"
              label="Dimensiones"
              value="No especificadas en la ficha"
            />
            <ArtworkInfoRow
              icon="cube-outline"
              label="Material"
              value={artwork.technique}
            />
            <ArtworkInfoRow
              icon="calendar-outline"
              label="Cultura"
              value={cultureLabel}
            />
          </View>

          <View style={styles.primaryActions}>
            <Pressable
              onPress={openAr}
              style={({ pressed }) => [
                styles.outlineButton,
                pressed ? styles.pressed : null,
              ]}
            >
              <Ionicons color="#FFFFFF" name="cube-outline" size={24} />
              <Text style={styles.outlineButtonText}>Ver en AR</Text>
            </Pressable>
            <Pressable
              onPress={openQuestion}
              style={({ pressed }) => [
                styles.solidButton,
                pressed ? styles.pressed : null,
              ]}
            >
              <Ionicons
                color="#FFFFFF"
                name="chatbubble-ellipses-outline"
                size={24}
              />
              <Text style={styles.solidButtonText}>
                Preguntar sobre esta obra
              </Text>
            </Pressable>
          </View>

          <Pressable
            onPress={openImages}
            style={({ pressed }) => [
              styles.relatedButton,
              pressed ? styles.pressed : null,
            ]}
          >
            <Ionicons color="#FFFFFF" name="images-outline" size={29} />
            <Text style={styles.relatedButtonText}>
              Ver imagenes relacionadas
            </Text>
            <Ionicons color="#FFFFFF" name="chevron-forward" size={24} />
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: "#05080D",
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    gap: 15,
    paddingBottom: 32,
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  hero: {
    flexDirection: "row",
    gap: 20,
  },
  heroImage: {
    backgroundColor: "rgba(255,255,255,0.07)",
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: 13,
    borderWidth: 1,
    height: 258,
    overflow: "hidden",
    width: "42%",
  },
  heroFallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  heroCopy: {
    flex: 1,
    gap: 14,
    justifyContent: "center",
    minWidth: 0,
  },
  artworkTitle: {
    color: "#FFFFFF",
    fontSize: 29,
    fontWeight: "900",
    lineHeight: 37,
  },
  year: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "500",
  },
  summary: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 17,
    fontWeight: "500",
    lineHeight: 26,
  },
  infoStack: {
    gap: 8,
  },
  primaryActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 2,
  },
  outlineButton: {
    alignItems: "center",
    borderColor: "rgba(255,255,255,0.5)",
    borderRadius: 18,
    borderWidth: 1,
    flex: 0.92,
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    minHeight: 56,
    paddingHorizontal: 12,
  },
  outlineButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  solidButton: {
    alignItems: "center",
    backgroundColor: musePalette.primary,
    borderRadius: 18,
    flex: 1.48,
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    minHeight: 56,
    paddingHorizontal: 12,
  },
  solidButtonText: {
    color: "#FFFFFF",
    flexShrink: 1,
    fontSize: 15,
    fontWeight: "800",
  },
  relatedButton: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.035)",
    borderColor: "rgba(255,255,255,0.16)",
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    gap: 18,
    minHeight: 78,
    paddingHorizontal: 22,
  },
  relatedButtonText: {
    color: "#FFFFFF",
    flex: 1,
    fontSize: 17,
    fontWeight: "700",
  },
  backOnly: {
    alignItems: "center",
    height: 50,
    justifyContent: "center",
    marginLeft: 14,
    marginTop: 8,
    width: 50,
  },
  emptyState: {
    alignItems: "center",
    flex: 1,
    gap: 12,
    justifyContent: "center",
  },
  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
  },
  pressed: {
    opacity: 0.84,
    transform: [{ scale: 0.99 }],
  },
});
