import {
  ArBottomHud,
  ArSceneBackground,
  ArSideRail,
  ArTopStatusHud,
  arColors,
  arSceneImage,
} from "@/components/museiq/ar-flow";
import { musePalette } from "@/components/museiq/theme";
import { getArtworkImageSource } from "@/lib/artwork-images";
import { useMuseIQ } from "@/providers/museiq-provider";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, StyleSheet, Text, View } from "react-native";
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

export default function ObraIdentificadaScreen() {
  const { artworkId } = useLocalSearchParams<{ artworkId?: string }>();
  const {
    currentArtwork,
    currentRoom,
    findArtworkById,
    findRoomById,
    museumProfile,
    repeatArtworkNarration,
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
            <Ionicons color={musePalette.primary} name="scan-outline" size={42} />
            <Text style={styles.emptyTitle}>Obra no disponible</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const imageSource = getArtworkImageSource(artwork.image);
  const roomName = room?.name ?? "Sala por confirmar";
  const statusLabel = room?.statusLabel ?? "Senal estable";
  const cultureLabel = getCultureLabel(artwork.period, artwork.author);
  const museumName = museumProfile?.name ?? "MuseIQ";

  const openArLoading = () => {
    selectArtwork(artwork.id);
    router.push({ pathname: "/cargando-ar", params: { artworkId: artwork.id } } as never);
  };

  const openQuestion = () => {
    selectArtwork(artwork.id);
    router.push({ pathname: "/pregunta-voz-modal", params: { artworkId: artwork.id } } as never);
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <ArSceneBackground dim="rgba(5,8,13,0.28)" />

      <SafeAreaView style={styles.safeArea}>
        <ArTopStatusHud museumName={museumName} roomName={roomName} statusLabel={statusLabel} />

        <View style={styles.content}>
          <View style={styles.identificationCard}>
            <Image
              contentFit="cover"
              contentPosition="center"
              source={imageSource ?? arSceneImage}
              style={styles.artworkThumb}
            />
            <View style={styles.identificationCopy}>
              <Text numberOfLines={2} style={styles.artworkTitle}>
                {artwork.title}
              </Text>
              <Text numberOfLines={1} style={styles.meta}>
                {cultureLabel}
              </Text>
              <Text numberOfLines={1} style={styles.meta}>
                {artwork.year}
              </Text>
              <Text numberOfLines={3} style={styles.summary}>
                {artwork.summary}
              </Text>
            </View>
          </View>

          <View style={styles.actionRow}>
            <Pressable
              onPress={openArLoading}
              style={({ pressed }) => [styles.primaryButton, pressed ? styles.pressed : null]}
            >
              <Text style={styles.primaryButtonText}>Ver en AR</Text>
            </Pressable>
            <Pressable
              onPress={openQuestion}
              style={({ pressed }) => [styles.secondaryButton, pressed ? styles.pressed : null]}
            >
              <Text style={styles.secondaryButtonText}>Preguntar</Text>
            </Pressable>
          </View>
        </View>

        <ArSideRail
          onAudio={repeatArtworkNarration}
          onChat={openQuestion}
          style={styles.sideRail}
        />

        <ArBottomHud
          bottomIcon="information-circle-outline"
          bottomText="Consejo: puedes escuchar una explicacion de esta obra."
          centralActive
          centralLabel="Ver en AR"
          onCentral={openArLoading}
          onExplore={() => router.push("/home" as never)}
          onQr={() => router.push("/home" as never)}
        />
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
    flex: 1,
    justifyContent: "flex-end",
    paddingBottom: 20,
    paddingHorizontal: 34,
  },
  identificationCard: {
    backgroundColor: arColors.glassFillStrong,
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    gap: 14,
    padding: 12,
  },
  artworkThumb: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 12,
    height: 132,
    width: 92,
  },
  identificationCopy: {
    flex: 1,
    gap: 4,
    justifyContent: "center",
    minWidth: 0,
  },
  artworkTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
    lineHeight: 25,
  },
  meta: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 12,
    fontWeight: "600",
  },
  summary: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 17,
    marginTop: 4,
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: arColors.primary,
    borderRadius: 12,
    flex: 1,
    justifyContent: "center",
    minHeight: 42,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
  secondaryButton: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderColor: "rgba(255,255,255,0.24)",
    borderRadius: 12,
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
  sideRail: {
    top: "36%",
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
