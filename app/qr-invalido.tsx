import { musePalette } from "@/components/museiq/theme";
import { useMuseIQ } from "@/providers/museiq-provider";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function QrInvalidoScreen() {
  const { code } = useLocalSearchParams<{ code?: string }>();
  const { currentRoom, museumProfile } = useMuseIQ();

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <Image
        source={require("@/assets/images/fondo.png")}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        contentPosition="center"
      />
      <View style={styles.backdrop} />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.iconButton,
              pressed ? styles.pressed : null,
            ]}
          >
            <Ionicons color="#FFFFFF" name="arrow-back" size={27} />
          </Pressable>
          <View style={styles.headerText}>
            <Text numberOfLines={1} style={styles.museumName}>
              {museumProfile?.name ?? "MuseIQ"}
            </Text>
            <Text numberOfLines={1} style={styles.roomName}>
              {currentRoom?.name ?? "Sala por confirmar"}
            </Text>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.scanFrame}>
            <View style={[styles.corner, styles.cornerTopLeft]} />
            <View style={[styles.corner, styles.cornerTopRight]} />
            <View style={[styles.corner, styles.cornerBottomLeft]} />
            <View style={[styles.corner, styles.cornerBottomRight]} />
            <View style={styles.errorIconWrap}>
              <Ionicons color="#FFFFFF" name="qr-code-outline" size={64} />
              <View style={styles.errorBadge}>
                <Ionicons color="#FFFFFF" name="close" size={30} />
              </View>
            </View>
          </View>

          <Text style={styles.title}>QR no valido</Text>
          <Text style={styles.subtitle}>
            El codigo escaneado no corresponde a una obra del museo o no se pudo leer completo.
          </Text>

          {code ? (
            <View style={styles.codeCard}>
              <Text style={styles.codeLabel}>Codigo leido</Text>
              <Text numberOfLines={1} style={styles.codeValue}>
                {code}
              </Text>
            </View>
          ) : null}

          <View style={styles.causesCard}>
            <Text style={styles.causesTitle}>Posibles causas</Text>
            <Text style={styles.causeItem}>- El QR esta danado o borroso.</Text>
            <Text style={styles.causeItem}>- No pertenece a este museo.</Text>
            <Text style={styles.causeItem}>- La obra ya no esta disponible.</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable
            onPress={() => router.replace("/home" as never)}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed ? styles.pressed : null,
            ]}
          >
            <Ionicons color="#FFFFFF" name="scan-outline" size={21} />
            <Text style={styles.primaryButtonText}>Intentar nuevamente</Text>
          </Pressable>
          <Pressable
            onPress={() =>
              router.replace({
                pathname: "/codigo-manual",
                params: code ? { code } : {},
              } as never)
            }
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed ? styles.pressed : null,
            ]}
          >
            <Text style={styles.secondaryButtonText}>Ingresar codigo manualmente</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const glassFill = "rgba(8,10,14,0.74)";
const glassBorder = "rgba(255,255,255,0.22)";

const styles = StyleSheet.create({
  screen: {
    backgroundColor: "#05080D",
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(5,8,13,0.76)",
  },
  safeArea: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: 14,
    paddingHorizontal: 22,
    paddingTop: 12,
  },
  iconButton: {
    alignItems: "center",
    backgroundColor: glassFill,
    borderColor: glassBorder,
    borderRadius: 16,
    borderWidth: 1,
    height: 50,
    justifyContent: "center",
    width: 50,
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  museumName: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  roomName: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 13,
    fontWeight: "600",
  },
  content: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  scanFrame: {
    alignItems: "center",
    aspectRatio: 1,
    justifyContent: "center",
    marginBottom: 22,
    maxWidth: 270,
    padding: 32,
    width: "70%",
  },
  corner: {
    borderColor: "#FFFFFF",
    height: 50,
    position: "absolute",
    width: 50,
  },
  cornerTopLeft: {
    borderLeftWidth: 4,
    borderTopWidth: 4,
    left: 0,
    top: 0,
  },
  cornerTopRight: {
    borderRightWidth: 4,
    borderTopWidth: 4,
    right: 0,
    top: 0,
  },
  cornerBottomLeft: {
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    bottom: 0,
    left: 0,
  },
  cornerBottomRight: {
    borderBottomWidth: 4,
    borderRightWidth: 4,
    bottom: 0,
    right: 0,
  },
  errorIconWrap: {
    alignItems: "center",
    backgroundColor: "rgba(195,61,42,0.22)",
    borderColor: "rgba(195,61,42,0.56)",
    borderRadius: 28,
    borderWidth: 1,
    height: 128,
    justifyContent: "center",
    width: 128,
  },
  errorBadge: {
    alignItems: "center",
    backgroundColor: musePalette.danger,
    borderRadius: 999,
    height: 52,
    justifyContent: "center",
    position: "absolute",
    right: -12,
    top: -12,
    width: 52,
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
    maxWidth: 330,
    textAlign: "center",
  },
  codeCard: {
    alignSelf: "stretch",
    backgroundColor: glassFill,
    borderColor: glassBorder,
    borderRadius: 16,
    borderWidth: 1,
    gap: 5,
    marginTop: 18,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  codeLabel: {
    color: "rgba(255,255,255,0.64)",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  codeValue: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },
  causesCard: {
    alignSelf: "stretch",
    backgroundColor: "rgba(195,61,42,0.12)",
    borderColor: "rgba(195,61,42,0.32)",
    borderRadius: 16,
    borderWidth: 1,
    gap: 7,
    marginTop: 14,
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
    gap: 12,
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: musePalette.danger,
    borderRadius: 18,
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    minHeight: 56,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "900",
  },
  secondaryButton: {
    alignItems: "center",
    borderColor: "rgba(255,255,255,0.30)",
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

