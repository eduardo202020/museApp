import {
  ArSceneBackground,
  ArSideRail,
  ArTopStatusHud,
  arColors,
} from "@/components/museiq/ar-flow";
import { musePalette } from "@/components/museiq/theme";
import { useMuseIQ } from "@/providers/museiq-provider";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ArChatIaScreen() {
  const { artworkId } = useLocalSearchParams<{ artworkId?: string }>();
  const {
    currentArtwork,
    currentRoom,
    findArtworkById,
    findRoomById,
    museumProfile,
    selectArtwork,
  } = useMuseIQ();
  const artwork = findArtworkById(artworkId) ?? currentArtwork;
  const room = findRoomById(artwork?.roomId) ?? currentRoom;

  if (!artwork) {
    return (
      <View style={styles.screen}>
        <StatusBar style="light" />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Chat no disponible</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const museumName = museumProfile?.name ?? "MuseIQ";
  const roomName = room?.name ?? "Sala por confirmar";
  const statusLabel = room?.statusLabel ?? "Senal estable";
  const suggestions = artwork.suggestedQuestions.length
    ? artwork.suggestedQuestions.slice(0, 3)
    : [
        `Que representa ${artwork.title}?`,
        "Por que es importante?",
        "Que otros elementos se observan?",
      ];

  const openAudioActive = () => {
    selectArtwork(artwork.id);
    router.push({ pathname: "/ar-audio-activo", params: { artworkId: artwork.id } } as never);
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <ArSceneBackground dim="rgba(5,8,13,0.24)" />

      <SafeAreaView style={styles.safeArea}>
        <ArTopStatusHud museumName={museumName} roomName={roomName} statusLabel={statusLabel} />

        <ArSideRail
          active="chat"
          onAudio={openAudioActive}
          onChat={() => undefined}
          style={styles.sideRail}
        />

        <View style={styles.spacer} />

        <View style={styles.chatSheet}>
          <View style={styles.sheetHandle} />

          <View style={styles.sheetHeaderRow}>
            <Text style={styles.sheetTitle}>MuseIQ IA</Text>
            <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.closeButton, pressed ? styles.pressed : null]}>
              <Ionicons color="#FFFFFF" name="close" size={17} />
            </Pressable>
          </View>

          <View style={styles.topicTabs}>
            <View style={[styles.topicChip, styles.topicChipActive]}>
              <Ionicons color="#D7F7D3" name="sparkles-outline" size={13} />
              <Text style={styles.topicChipTextActive}>Sugeridas</Text>
            </View>
            <View style={styles.topicChip}>
              <Text style={styles.topicChipText}>Obra</Text>
            </View>
            <View style={styles.topicChip}>
              <Text style={styles.topicChipText}>Sala</Text>
            </View>
          </View>

          <View style={styles.questionStack}>
            {suggestions.map((question) => (
              <Text key={question} numberOfLines={1} style={styles.questionBubble}>
                {question}
              </Text>
            ))}
          </View>

          <View style={styles.answerCard}>
            <View style={styles.answerHeader}>
              <Ionicons color={musePalette.success} name="sparkles-outline" size={18} />
              <Text style={styles.answerHeaderText}>Respuesta IA</Text>
            </View>
            <Text numberOfLines={5} style={styles.answerText}>
              {artwork.title} sintetiza poder, identidad y memoria cultural. Sus formas y simbolos conectan ritual, autoridad y cosmovision.
            </Text>
            <Pressable style={({ pressed }) => [styles.sourcesButton, pressed ? styles.pressed : null]}>
              <Text style={styles.sourcesButtonText}>Ver fuentes y sustento</Text>
              <Ionicons color={musePalette.success} name="document-text-outline" size={15} />
            </Pressable>
          </View>

          <View style={styles.inputRow}>
            <Text style={styles.inputPlaceholder}>Escribe tu pregunta...</Text>
            <Ionicons color="#FFFFFF" name="mic-outline" size={21} />
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
  spacer: {
    flex: 1,
  },
  sideRail: {
    top: "34%",
  },
  chatSheet: {
    backgroundColor: arColors.glassFillStrong,
    borderColor: "rgba(255,255,255,0.16)",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderWidth: 1,
    gap: 11,
    paddingBottom: 16,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  sheetHandle: {
    alignSelf: "center",
    backgroundColor: "rgba(255,255,255,0.28)",
    borderRadius: 999,
    height: 4,
    width: 54,
  },
  sheetHeaderRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sheetTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
  },
  closeButton: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderColor: "rgba(255,255,255,0.20)",
    borderRadius: 999,
    borderWidth: 1,
    height: 30,
    justifyContent: "center",
    width: 30,
  },
  topicTabs: {
    flexDirection: "row",
    gap: 8,
  },
  topicChip: {
    alignItems: "center",
    borderColor: "rgba(255,255,255,0.22)",
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    flexDirection: "row",
    gap: 5,
    justifyContent: "center",
    minHeight: 34,
  },
  topicChipActive: {
    backgroundColor: "rgba(67,147,57,0.58)",
    borderColor: "rgba(97,188,73,0.76)",
  },
  topicChipText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  topicChipTextActive: {
    color: "#E7FFE4",
    fontSize: 12,
    fontWeight: "800",
  },
  questionStack: {
    gap: 7,
  },
  questionBubble: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(70,130,60,0.35)",
    borderColor: "rgba(97,188,73,0.4)",
    borderRadius: 12,
    borderWidth: 1,
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    maxWidth: "92%",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  answerCard: {
    backgroundColor: "rgba(255,255,255,0.035)",
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 15,
    borderWidth: 1,
    gap: 8,
    padding: 12,
  },
  answerHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  answerHeaderText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  answerText: {
    color: "rgba(255,255,255,0.86)",
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 18,
  },
  sourcesButton: {
    alignItems: "center",
    alignSelf: "flex-start",
    borderColor: "rgba(97,188,73,0.58)",
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: "row",
    gap: 7,
    minHeight: 34,
    paddingHorizontal: 10,
  },
  sourcesButtonText: {
    color: "#9EE087",
    fontSize: 12,
    fontWeight: "700",
  },
  inputRow: {
    alignItems: "center",
    borderColor: "rgba(255,255,255,0.24)",
    borderRadius: 15,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 48,
    paddingHorizontal: 14,
  },
  inputPlaceholder: {
    color: "rgba(255,255,255,0.70)",
    fontSize: 13,
    fontWeight: "600",
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
