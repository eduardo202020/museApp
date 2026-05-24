import { ArtworkScreenHeader } from "@/components/museiq/artwork/artwork-screen-header";
import { ArtworkTabs } from "@/components/museiq/artwork/artwork-tabs";
import { ArtworkDetailActions } from "@/features/artwork/components/artwork-detail-actions";
import { ArtworkDetailHero } from "@/features/artwork/components/artwork-detail-hero";
import { ArtworkEmptyState } from "@/features/artwork/components/artwork-empty-state";
import { useArtworkScreenController } from "@/features/artwork/hooks/use-artwork-screen-controller";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ArtworkDetailScreen() {
  const { artworkId, tab } = useLocalSearchParams<{
    artworkId?: string;
    tab?: "details" | "images";
  }>();
  const {
    activeTab,
    artwork,
    cultureLabel,
    imageSource,
    museumName,
    roomName,
    openAr,
    openImages,
    openQuestion,
    handleDetailTabSelect,
  } = useArtworkScreenController({ artworkId, tab });

  if (!artwork) {
    return (
      <View style={styles.screen}>
        <StatusBar style="light" />
        <ArtworkEmptyState icon="cube-outline" title="Obra no disponible" />
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

          <ArtworkTabs activeTab={activeTab} onSelect={handleDetailTabSelect} />

          <ArtworkDetailHero
            imageSource={imageSource}
            summary={artwork.summary}
            title={artwork.title}
            year={artwork.year}
          />

          {activeTab === "details" ? (
            <ArtworkDetailActions
              cultureLabel={cultureLabel}
              museumName={museumName}
              onOpenAr={openAr}
              onOpenImages={openImages}
              onOpenQuestion={openQuestion}
              roomName={roomName}
              technique={artwork.technique}
            />
          ) : null}

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
});
