import { musePalette } from "@/components/museiq/theme";
import { useMuseIQ } from "@/providers/museiq-provider";
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

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.headerBlock}>
            <Text style={styles.brandText}>
              Muse<Text style={styles.brandAccent}>IQ</Text>
            </Text>
            <Text style={styles.subtitle}>
              Guia inteligente contextual para tu visita
            </Text>
          </View>

          <View style={styles.centerIconBlock}>
            <Image
              source={require("@/assets/images/splash-icon.png")}
              style={styles.brandMark}
              contentFit="contain"
            />
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
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    paddingBottom: 42,
    paddingHorizontal: 30,
    paddingTop: 40,
  },
  headerBlock: {
    alignItems: "center",
    gap: 10,
  },
  centerIconBlock: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  brandMark: {
    height: 212,
    width: 212,
  },
  brandText: {
    color: "#FFFFFF",
    fontSize: 56,
    fontWeight: "900",
    letterSpacing: 0,
    textAlign: "center",
  },
  brandAccent: {
    color: musePalette.accent,
  },
  subtitle: {
    color: "rgba(255,255,255,0.92)",
    fontSize: 20,
    fontWeight: "500",
    lineHeight: 28,
    maxWidth: 320,
    textAlign: "center",
  },
  actionBlock: {
    gap: 18,
    paddingBottom: 4,
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
  pressed: {
    opacity: 0.86,
    transform: [{ scale: 0.99 }],
  },
  disabled: {
    opacity: 0.58,
  },
});
