import type { ArtworkTabKey } from "@/components/museiq/artwork/artwork-tabs";
import { ArtworkTabs } from "@/components/museiq/artwork/artwork-tabs";
import { ArtworkScreenHeader } from "@/components/museiq/artwork/artwork-screen-header";
import { RelatedImagesGrid } from "@/components/museiq/artwork/related-images-grid";
import { musePalette } from "@/components/museiq/theme";
import { ArtworkEmptyState } from "@/features/artwork/components/artwork-empty-state";
import { useArtworkScreenController } from "@/features/artwork/hooks/use-artwork-screen-controller";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ArtworkImagesScreen() {
  const { artworkId } = useLocalSearchParams<{ artworkId?: string }>();
  const {
    artwork,
    cultureLabel,
    imageSource,
    roomName,
    handleImagesTabSelect,
  } = useArtworkScreenController({ artworkId });

  if (!artwork) {
    return (
      <View style={styles.screen}>
        <StatusBar style="light" />
        <ArtworkEmptyState icon="images-outline" title="Imagenes no disponibles" />
      </View>
    );
  }

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

          <ArtworkTabs activeTab="images" onSelect={handleImagesTabSelect as (tab: ArtworkTabKey) => void} />

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
});
