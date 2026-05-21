import type { ArtworkTabKey } from "@/components/museiq/artwork/artwork-tabs";
import { ArtworkTabs } from "@/components/museiq/artwork/artwork-tabs";
import { ArtworkScreenHeader } from "@/components/museiq/artwork/artwork-screen-header";
import { RelatedImagesGrid } from "@/components/museiq/artwork/related-images-grid";
import { musePalette } from "@/components/museiq/theme";
import { getArtworkImageSource } from "@/lib/artwork-images";
import { useMuseIQ } from "@/providers/museiq-provider";
import { Ionicons } from "@expo/vector-icons";
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

export default function ArtworkImagesScreen() {
  const { artworkId } = useLocalSearchParams<{ artworkId?: string }>();
  const {
    currentArtwork,
    currentRoom,
    findArtworkById,
    findRoomById,
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
            <Ionicons color={musePalette.primary} name="images-outline" size={42} />
            <Text style={styles.emptyTitle}>Imagenes no disponibles</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const imageSource = getArtworkImageSource(artwork.image);
  const roomName = room?.name ?? "Sala por confirmar";
  const cultureLabel = getCultureLabel(artwork.period, artwork.author);

  const handleTabSelect = (tab: ArtworkTabKey) => {
    if (tab === "details") {
      router.replace({
        pathname: "/artwork-detail",
        params: { artworkId: artwork.id },
      } as never);
    }
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

          <ArtworkTabs activeTab="images" onSelect={handleTabSelect} />

          <View style={styles.sectionHeader}>
            <Text style={styles.title}>Imagenes relacionadas</Text>
            <Text style={styles.subtitle}>
              Explora diferentes vistas y detalles de la obra.
            </Text>
          </View>

          <RelatedImagesGrid
            imageSource={imageSource}
            primaryTag={artwork.tags[0]}
            technique={artwork.technique}
          />

          <View style={styles.footerNote}>
            <Ionicons
              color={musePalette.primary}
              name="information-circle-outline"
              size={22}
            />
            <Text style={styles.footerText}>
              Las imagenes te ayudan a observar mejor cada detalle.
            </Text>
          </View>
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
    gap: 18,
    paddingBottom: 32,
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  sectionHeader: {
    gap: 8,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 23,
    fontWeight: "900",
  },
  subtitle: {
    color: "rgba(255,255,255,0.76)",
    fontSize: 15,
    fontWeight: "500",
  },
  footerNote: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.035)",
    borderColor: "rgba(255,255,255,0.16)",
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    minHeight: 52,
    paddingHorizontal: 18,
  },
  footerText: {
    color: "rgba(255,255,255,0.78)",
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
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
});
