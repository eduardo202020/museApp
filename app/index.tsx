import { musePalette } from "@/components/museiq/theme";
import { useMuseIQ } from "@/providers/museiq-provider";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function InicioScreen() {
  const { isDatabaseReady } = useMuseIQ();

  const startVisit = () => {
    if (!isDatabaseReady) {
      return;
    }

    router.push("/preparacion-visita" as never);
  };

  const openMuseumSelection = () => {
    router.push("/seleccionar-museo" as never);
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <Image
        source={require("@/assets/images/fondo.png")}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        contentPosition="center"
        transition={220}
      />
      <View style={styles.overlay} />
      <View style={styles.vignetteTop} />
      <View style={styles.vignetteBottom} />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.brandBlock}>
            <View style={styles.logoRow}>
              <Image
                source={require("@/assets/images/splash-icon.png")}
                style={styles.brandMark}
                contentFit="contain"
              />
              <Text style={styles.brandText}>
                Muse<Text style={styles.brandAccent}>IQ</Text>
              </Text>
            </View>
            <Text style={styles.subtitle}>
              Guia inteligente contextual para tu visita
            </Text>
          </View>

          <View style={styles.actionBlock}>
            <Pressable
              onPress={startVisit}
              disabled={!isDatabaseReady}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && isDatabaseReady ? styles.pressed : null,
                !isDatabaseReady ? styles.disabled : null,
              ]}
            >
              <Text style={styles.primaryButtonText}>
                {isDatabaseReady ? "Comenzar" : "Preparando..."}
              </Text>
            </Pressable>

            <Pressable
              onPress={openMuseumSelection}
              disabled={!isDatabaseReady}
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && isDatabaseReady ? styles.pressed : null,
                !isDatabaseReady ? styles.disabled : null,
              ]}
            >
              <Text style={styles.secondaryButtonText}>Seleccionar museo</Text>
            </Pressable>

            <View style={styles.offlineRow}>
              <View style={styles.offlineIconWrap}>
                <Ionicons
                  color="rgba(255,255,255,0.78)"
                  name="sync-outline"
                  size={16}
                />
              </View>
              <Text style={styles.offlineText}>Funciona sin internet</Text>
            </View>
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
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(5,8,13,0.56)",
  },
  vignetteTop: {
    backgroundColor: "rgba(5,8,13,0.76)",
    height: "30%",
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
  vignetteBottom: {
    backgroundColor: "rgba(5,8,13,0.82)",
    bottom: 0,
    height: "36%",
    left: 0,
    position: "absolute",
    right: 0,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    paddingBottom: 42,
    paddingHorizontal: 30,
    paddingTop: 84,
  },
  brandBlock: {
    alignItems: "center",
    gap: 18,
  },
  logoRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
  },
  brandMark: {
    height: 58,
    width: 58,
  },
  brandText: {
    color: "#FFFFFF",
    fontSize: 42,
    fontWeight: "900",
    letterSpacing: 0,
  },
  brandAccent: {
    color: musePalette.accent,
  },
  subtitle: {
    color: "rgba(255,255,255,0.92)",
    fontSize: 22,
    fontWeight: "500",
    lineHeight: 31,
    maxWidth: 320,
    textAlign: "center",
  },
  actionBlock: {
    gap: 18,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: musePalette.primary,
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: 999,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 58,
    paddingHorizontal: 22,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
  },
  secondaryButton: {
    alignItems: "center",
    backgroundColor: "rgba(5,8,13,0.22)",
    borderColor: "rgba(255,255,255,0.88)",
    borderRadius: 999,
    borderWidth: 1.3,
    justifyContent: "center",
    minHeight: 58,
    paddingHorizontal: 22,
  },
  secondaryButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  offlineRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 9,
    justifyContent: "center",
    marginTop: 16,
  },
  offlineIconWrap: {
    alignItems: "center",
    borderColor: "rgba(255,255,255,0.38)",
    borderRadius: 999,
    borderWidth: 1,
    height: 28,
    justifyContent: "center",
    width: 28,
  },
  offlineText: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 14,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.86,
    transform: [{ scale: 0.99 }],
  },
  disabled: {
    opacity: 0.58,
  },
});
