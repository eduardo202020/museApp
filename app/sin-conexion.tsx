import {
  ArBottomHud,
  ArSceneBackground,
  ArTopStatusHud,
} from "@/components/museiq/ar-flow";
import { musePalette } from "@/components/museiq/theme";
import { useMuseIQ } from "@/providers/museiq-provider";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SinConexionScreen() {
  const { artworkId } = useLocalSearchParams<{ artworkId?: string }>();
  const {
    currentArtwork,
    currentRoom,
    findArtworkById,
    findRoomById,
    museumProfile,
  } = useMuseIQ();
  const artwork = findArtworkById(artworkId) ?? currentArtwork;
  const room = findRoomById(artwork?.roomId) ?? currentRoom;

  const openArtworkDetail = () => {
    if (!artwork) {
      router.replace("/home" as never);
      return;
    }

    router.replace({
      pathname: "/artwork-detail",
      params: { artworkId: artwork.id },
    } as never);
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <ArSceneBackground dim="rgba(5,8,13,0.42)" />

      <SafeAreaView style={styles.safeArea}>
        <ArTopStatusHud
          museumName={museumProfile?.name ?? "MuseIQ"}
          roomName={room?.name ?? "Sala por confirmar"}
          statusLabel="Sin conexion"
        />

        <View style={styles.content}>
          <View style={styles.iconWrap}>
            <Ionicons color="#FFFFFF" name="wifi-outline" size={82} />
            <View style={styles.slash} />
          </View>

          <Text style={styles.title}>Sin conexion a internet</Text>
          <Text style={styles.subtitle}>
            No pudimos verificar la conexion. Algunas funciones de IA y sincronizacion estan limitadas.
          </Text>

          <View style={styles.offlineCard}>
            <View style={styles.offlineHeader}>
              <Ionicons color={musePalette.primary} name="information-circle-outline" size={22} />
              <Text style={styles.offlineTitle}>Mientras tanto</Text>
            </View>
            <Text style={styles.offlineItem}>- Puedes explorar el recorrido y las obras guardadas.</Text>
            <Text style={styles.offlineItem}>- El chat IA y fuentes pueden no responder.</Text>
            <Text style={styles.offlineItem}>- La sincronizacion se reintentara cuando vuelvas a conectarte.</Text>
          </View>

          <View style={styles.actions}>
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed ? styles.pressed : null,
              ]}
            >
              <Ionicons color="#FFFFFF" name="refresh-outline" size={21} />
              <Text style={styles.primaryButtonText}>Reintentar</Text>
            </Pressable>
            <Pressable
              onPress={openArtworkDetail}
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed ? styles.pressed : null,
              ]}
            >
              <Text style={styles.secondaryButtonText}>
                {artwork ? "Ver informacion de la obra" : "Continuar explorando"}
              </Text>
            </Pressable>
          </View>
        </View>

        <ArBottomHud
          bottomIcon="information-circle-outline"
          bottomText="Estas sin conexion. Algunas funciones estan limitadas."
          centralIcon="sparkles-outline"
          centralLabel="Ver sugerencias"
          onCentral={() => router.replace("/home" as never)}
          onExplore={() => router.replace("/home" as never)}
          onQr={() => router.replace("/codigo-manual" as never)}
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
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  iconWrap: {
    alignItems: "center",
    height: 150,
    justifyContent: "center",
    marginBottom: 14,
    width: 150,
  },
  slash: {
    backgroundColor: "#FFFFFF",
    height: 3,
    position: "absolute",
    transform: [{ rotate: "38deg" }],
    width: 122,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "900",
    textAlign: "center",
  },
  subtitle: {
    color: "rgba(255,255,255,0.76)",
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 22,
    marginTop: 12,
    maxWidth: 340,
    textAlign: "center",
  },
  offlineCard: {
    alignSelf: "stretch",
    backgroundColor: "rgba(8,10,14,0.72)",
    borderColor: "rgba(255,255,255,0.16)",
    borderRadius: 17,
    borderWidth: 1,
    gap: 8,
    marginTop: 24,
    padding: 16,
  },
  offlineHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 9,
    marginBottom: 2,
  },
  offlineTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },
  offlineItem: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 19,
  },
  actions: {
    alignSelf: "stretch",
    gap: 12,
    marginTop: 22,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: musePalette.primary,
    borderRadius: 18,
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    minHeight: 54,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },
  secondaryButton: {
    alignItems: "center",
    borderColor: "rgba(255,255,255,0.24)",
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 52,
  },
  secondaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  pressed: {
    opacity: 0.84,
    transform: [{ scale: 0.99 }],
  },
});

