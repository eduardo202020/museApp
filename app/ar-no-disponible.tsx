import { ArPlainHeader, arColors } from "@/components/museiq/ar-flow";
import { musePalette } from "@/components/museiq/theme";
import { useMuseIQ } from "@/providers/museiq-provider";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ArNoDisponibleScreen() {
  const { artworkId } = useLocalSearchParams<{ artworkId?: string }>();
  const { currentArtwork, findArtworkById, selectArtwork } = useMuseIQ();
  const artwork = findArtworkById(artworkId) ?? currentArtwork;

  const view3dWithoutAr = () => {
    if (!artwork) {
      router.back();
      return;
    }

    selectArtwork(artwork.id);
    router.push({ pathname: "/visor-3d", params: { artworkId: artwork.id } } as never);
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeArea}>
        <ArPlainHeader
          onBack={() => router.back()}
          onRightPress={() => undefined}
          title="Realidad Aumentada"
        />

        <View style={styles.centerBlock}>
          <View style={styles.notAvailableIconWrap}>
            <Ionicons color="#FFFFFF" name="phone-portrait-outline" size={88} />
            <View style={styles.arBadge}>
              <Text style={styles.arBadgeText}>AR</Text>
            </View>
            <View style={styles.cubeBadge}>
              <Ionicons color="#FFFFFF" name="cube-outline" size={28} />
            </View>
            <View style={styles.diagonalSlash} />
          </View>

          <Text style={styles.title}>AR no disponible</Text>
          <Text style={styles.subtitle}>
            Tu dispositivo no es compatible con Realidad Aumentada (ARCore/ARKit) o la funcion esta deshabilitada.
          </Text>

          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Ionicons color="#F6C64E" name="bulb-outline" size={22} />
              <Text style={styles.infoTitle}>Que puedes hacer?</Text>
            </View>
            <Text style={styles.infoBullet}>- Ver la obra en 3D sin AR.</Text>
            <Text style={styles.infoBullet}>- Continuar explorando otras obras.</Text>
          </View>

          <Pressable
            onPress={view3dWithoutAr}
            style={({ pressed }) => [styles.primaryButton, pressed ? styles.pressed : null]}
          >
            <Ionicons color="#FFFFFF" name="cube-outline" size={22} />
            <Text style={styles.primaryButtonText}>Ver en 3D sin AR</Text>
          </Pressable>

          <Pressable
            onPress={() => router.push("/home" as never)}
            style={({ pressed }) => [styles.secondaryButton, pressed ? styles.pressed : null]}
          >
            <Text style={styles.secondaryButtonText}>Explorar otras obras</Text>
          </Pressable>

          <View style={styles.footerCard}>
            <Ionicons color={arColors.primary} name="information-circle-outline" size={21} />
            <Text style={styles.footerText}>
              Asegurate de tener la ultima version de la app e intenta nuevamente mas tarde.
            </Text>
          </View>
        </View>
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
  centerBlock: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingBottom: 18,
  },
  notAvailableIconWrap: {
    alignItems: "center",
    height: 168,
    justifyContent: "center",
    marginBottom: 12,
    width: 168,
  },
  arBadge: {
    alignItems: "center",
    backgroundColor: "rgba(8,10,14,0.96)",
    borderColor: "rgba(255,255,255,0.42)",
    borderRadius: 999,
    borderWidth: 1,
    bottom: 26,
    height: 54,
    justifyContent: "center",
    position: "absolute",
    right: 0,
    width: 54,
  },
  arBadgeText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "900",
  },
  cubeBadge: {
    alignItems: "center",
    backgroundColor: "rgba(8,10,14,0.96)",
    borderColor: "rgba(255,255,255,0.36)",
    borderRadius: 14,
    borderWidth: 1,
    height: 46,
    justifyContent: "center",
    left: 36,
    position: "absolute",
    top: 52,
    width: 46,
  },
  diagonalSlash: {
    backgroundColor: "rgba(255,255,255,0.9)",
    height: 2,
    position: "absolute",
    transform: [{ rotate: "38deg" }],
    width: 118,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 25,
    fontWeight: "900",
    textAlign: "center",
  },
  subtitle: {
    color: "rgba(255,255,255,0.76)",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 21,
    marginTop: 12,
    textAlign: "center",
  },
  infoCard: {
    backgroundColor: arColors.glassFill,
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 16,
    borderWidth: 1,
    gap: 7,
    marginTop: 22,
    padding: 16,
    width: "100%",
  },
  infoHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 9,
    marginBottom: 2,
  },
  infoTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  infoBullet: {
    color: "rgba(255,255,255,0.86)",
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 19,
  },
  primaryButton: {
    alignItems: "center",
    alignSelf: "stretch",
    backgroundColor: arColors.primary,
    borderRadius: 18,
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    minHeight: 54,
    marginTop: 18,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  secondaryButton: {
    alignItems: "center",
    alignSelf: "stretch",
    borderColor: "rgba(255,255,255,0.22)",
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 52,
    marginTop: 12,
  },
  secondaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  footerCard: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
    minHeight: 60,
    paddingHorizontal: 14,
  },
  footerText: {
    color: "rgba(255,255,255,0.72)",
    flex: 1,
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 18,
  },
  pressed: {
    opacity: 0.86,
    transform: [{ scale: 0.99 }],
  },
});
