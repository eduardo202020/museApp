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

export default function ErrorConexionScreen() {
  const { artworkId, message } = useLocalSearchParams<{
    artworkId?: string;
    message?: string;
  }>();
  const {
    currentArtwork,
    currentRoom,
    findArtworkById,
    findRoomById,
    museumProfile,
  } = useMuseIQ();
  const artwork = findArtworkById(artworkId) ?? currentArtwork;
  const room = findRoomById(artwork?.roomId) ?? currentRoom;
  const messageText =
    typeof message === "string" && message.trim().length > 0
      ? message
      : "No pudimos conectarnos a MuseRAG. Revisa tu conexion e intenta nuevamente.";

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
      <ArSceneBackground dim="rgba(5,8,13,0.46)" />

      <SafeAreaView style={styles.safeArea}>
        <ArTopStatusHud
          museumName={museumProfile?.name ?? "MuseIQ"}
          roomName={room?.name ?? "Sala por confirmar"}
          statusLabel="Sin conexion"
        />

        <View style={styles.content}>
          <View style={styles.iconWrap}>
            <Ionicons color="#FFFFFF" name="cloud-offline-outline" size={86} />
          </View>

          <Text style={styles.title}>Error de conexion</Text>
          <Text style={styles.subtitle}>
            No pudimos conectarnos a MuseRAG.
          </Text>

          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>Detalle</Text>
            <Text numberOfLines={5} style={styles.errorMessage}>
              {messageText}
            </Text>
          </View>

          <View style={styles.causesCard}>
            <Text style={styles.causesTitle}>Posibles causas</Text>
            <Text style={styles.causeItem}>- El backend local no esta activo.</Text>
            <Text style={styles.causeItem}>- La IP configurada no es accesible desde el celular.</Text>
            <Text style={styles.causeItem}>- La red del museo esta inestable.</Text>
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
              onPress={() =>
                router.replace({
                  pathname: "/sin-conexion",
                  params: artwork ? { artworkId: artwork.id } : {},
                } as never)
              }
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed ? styles.pressed : null,
              ]}
            >
              <Text style={styles.secondaryButtonText}>Abrir modo sin conexion</Text>
            </Pressable>
            <Pressable
              onPress={openArtworkDetail}
              style={({ pressed }) => [
                styles.tertiaryButton,
                pressed ? styles.pressed : null,
              ]}
            >
              <Text style={styles.tertiaryButtonText}>
                {artwork ? "Ver informacion offline" : "Volver al recorrido"}
              </Text>
            </Pressable>
          </View>
        </View>

        <ArBottomHud
          bottomIcon="alert-circle-outline"
          bottomText="No pudimos consultar MuseRAG. Revisa tu conexion."
          centralIcon="refresh-outline"
          centralLabel="Reintentar"
          onCentral={() => router.back()}
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
    backgroundColor: "rgba(195,61,42,0.18)",
    borderColor: "rgba(195,61,42,0.44)",
    borderRadius: 40,
    borderWidth: 1,
    height: 134,
    justifyContent: "center",
    marginBottom: 20,
    width: 134,
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
    marginTop: 10,
    textAlign: "center",
  },
  errorCard: {
    alignSelf: "stretch",
    backgroundColor: "rgba(195,61,42,0.14)",
    borderColor: "rgba(195,61,42,0.34)",
    borderRadius: 17,
    borderWidth: 1,
    gap: 7,
    marginTop: 20,
    padding: 16,
  },
  errorTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },
  errorMessage: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 19,
  },
  causesCard: {
    alignSelf: "stretch",
    backgroundColor: "rgba(8,10,14,0.72)",
    borderColor: "rgba(255,255,255,0.16)",
    borderRadius: 17,
    borderWidth: 1,
    gap: 7,
    marginTop: 12,
    padding: 16,
  },
  causesTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },
  causeItem: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 19,
  },
  actions: {
    alignSelf: "stretch",
    gap: 10,
    marginTop: 18,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: musePalette.danger,
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
    minHeight: 50,
  },
  secondaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  tertiaryButton: {
    alignItems: "center",
    minHeight: 42,
    justifyContent: "center",
  },
  tertiaryButtonText: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 13,
    fontWeight: "800",
  },
  pressed: {
    opacity: 0.84,
    transform: [{ scale: 0.99 }],
  },
});

