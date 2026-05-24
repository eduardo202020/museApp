import {
  ArArtifactModel,
  ArPlainHeader,
  arColors,
} from "@/components/museiq/ar-flow";
import { musePalette } from "@/components/museiq/theme";
import { useMuseIQ } from "@/providers/museiq-provider";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Visor3dScreen() {
  const { artworkId } = useLocalSearchParams<{ artworkId?: string }>();
  const { currentArtwork, currentRoom, findArtworkById, findRoomById } = useMuseIQ();
  const artwork = findArtworkById(artworkId) ?? currentArtwork;
  const room = findRoomById(artwork?.roomId) ?? currentRoom;

  if (!artwork) {
    return (
      <View style={styles.screen}>
        <StatusBar style="light" />
        <SafeAreaView style={styles.safeArea}>
          <ArPlainHeader onBack={() => router.back()} rightIcon="share-social-outline" title="Visor 3D" />
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Modelo no disponible</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeArea}>
        <ArPlainHeader
          onBack={() => router.back()}
          onRightPress={() => undefined}
          rightIcon="share-social-outline"
          title="Visor 3D"
        />

        <View style={styles.metaBlock}>
          <Text numberOfLines={1} style={styles.title}>
            {artwork.title}
          </Text>
          <Text numberOfLines={1} style={styles.subtitle}>
            {artwork.year}  -  {room?.name ?? "Sala por confirmar"}
          </Text>
        </View>

        <View style={styles.viewerStage}>
          <ArArtifactModel artworkId={artwork.id} interactive style={styles.model} />

          <View style={styles.toolRail}>
            <ToolButton icon="refresh-outline" label="Rotar" />
            <ToolButton icon="search-outline" label="Acercar" />
            <ToolButton icon="remove-outline" label="Alejar" />
            <ToolButton icon="expand-outline" label="Pantalla completa" />
          </View>
        </View>

        <Text style={styles.dragHint}>Arrastra para rotar. Pellizca para acercar.</Text>

        <View style={styles.footerCard}>
          <Ionicons color={arColors.primary} name="information-circle-outline" size={21} />
          <Text style={styles.footerText}>
            Este es el modelo 3D de la obra. El modo AR no esta disponible en este dispositivo.
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

type ToolButtonProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
};

function ToolButton({ icon, label }: ToolButtonProps) {
  return (
    <Pressable style={({ pressed }) => [styles.toolButton, pressed ? styles.pressed : null]}>
      <Ionicons color="#FFFFFF" name={icon} size={20} />
      <Text numberOfLines={2} style={styles.toolLabel}>
        {label}
      </Text>
    </Pressable>
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
  metaBlock: {
    gap: 4,
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },
  subtitle: {
    color: "rgba(255,255,255,0.76)",
    fontSize: 12,
    fontWeight: "600",
  },
  viewerStage: {
    alignItems: "center",
    backgroundColor: "transparent",
    borderRadius: 0,
    flex: 1,
    justifyContent: "center",
    marginTop: 8,
    overflow: "visible",
    width: "100%",
  },
  model: {
    alignSelf: "stretch",
    flex: 1,
    width: "100%",
  },
  toolRail: {
    gap: 10,
    position: "absolute",
    right: 20,
    top: 24,
  },
  toolButton: {
    alignItems: "center",
    backgroundColor: arColors.glassFill,
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
    height: 56,
    justifyContent: "center",
    width: 56,
  },
  toolLabel: {
    color: "#FFFFFF",
    fontSize: 8,
    fontWeight: "700",
    lineHeight: 10,
    textAlign: "center",
  },
  dragHint: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 12,
    textAlign: "center",
  },
  footerCard: {
    alignItems: "center",
    backgroundColor: arColors.glassFill,
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    marginHorizontal: 24,
    marginTop: 14,
    minHeight: 58,
    paddingHorizontal: 14,
    marginBottom: 18,
  },
  footerText: {
    color: "rgba(255,255,255,0.76)",
    flex: 1,
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 17,
  },
  emptyState: {
    alignItems: "center",
    flex: 1,
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
