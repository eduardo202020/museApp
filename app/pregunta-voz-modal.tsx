import { ZoomImageViewer } from "@/components/museiq/chat/zoom-image-viewer";
import { musePalette } from "@/components/museiq/theme";
import { useArtworkChatController } from "@/hooks/use-artwork-chat-controller";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import Markdown from "react-native-markdown-display";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function PreguntaVozModal() {
  const params = useLocalSearchParams<{ artworkId?: string }>();
  const artworkId =
    typeof params.artworkId === "string" ? params.artworkId : undefined;
  const { artwork, chatSheetProps, closeZoomViewer, zoomImage } =
    useArtworkChatController({ artworkId });

  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const quickQuestions = chatSheetProps.suggestedQuestions.slice(0, 4);
  const hasResponse = chatSheetProps.response.trim().length > 0;
  const canSubmit = chatSheetProps.questionText.trim().length > 0;

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSubscription = Keyboard.addListener(showEvent, (event) => {
      setKeyboardHeight(event.endCoordinates.height);
    });
    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  return (
    <View style={styles.backdrop}>
      <Pressable style={StyleSheet.absoluteFill} onPress={() => router.back()} />

      <View
        style={[
          styles.keyboardAvoider,
          { paddingBottom: keyboardHeight > 0 ? keyboardHeight - 12 : 0 },
        ]}
      >
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />

        <View style={styles.sheetHeaderRow}>
          <View>
            <Text style={styles.sheetTitle}>Preguntar</Text>
            <Text numberOfLines={1} style={styles.sheetSubtitle}>
              {artwork?.title ?? "Obra actual"}
            </Text>
          </View>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.closeButton,
              pressed ? styles.pressed : null,
            ]}
          >
            <Ionicons color="#FFFFFF" name="close" size={18} />
          </Pressable>
        </View>

        <View style={styles.topicTabs}>
          <View style={[styles.topicChip, styles.topicChipActive]}>
            <Ionicons color="#D7EEFF" name="sparkles-outline" size={13} />
            <Text style={styles.topicChipTextActive}>Sugeridas</Text>
          </View>
          <Pressable
            onPress={() => chatSheetProps.onResponseModeChange("breve")}
            style={[
              styles.topicChip,
              chatSheetProps.responseMode === "breve"
                ? styles.topicChipActive
                : null,
            ]}
          >
            <Text
              style={[
                styles.topicChipText,
                chatSheetProps.responseMode === "breve"
                  ? styles.topicChipTextActive
                  : null,
              ]}
            >
              Breve
            </Text>
          </Pressable>
          <Pressable
            onPress={() => chatSheetProps.onResponseModeChange("explicada")}
            style={[
              styles.topicChip,
              chatSheetProps.responseMode === "explicada"
                ? styles.topicChipActive
                : null,
            ]}
          >
            <Text
              style={[
                styles.topicChipText,
                chatSheetProps.responseMode === "explicada"
                  ? styles.topicChipTextActive
                  : null,
              ]}
            >
              Explicada
            </Text>
          </Pressable>
        </View>

        <View style={styles.suggestionsPanel}>
          <Pressable
            onPress={() => setIsSuggestionsOpen((value) => !value)}
            style={({ pressed }) => [
              styles.suggestionsToggle,
              pressed ? styles.pressed : null,
            ]}
          >
            <View style={styles.suggestionsToggleCopy}>
              <Ionicons
                color={musePalette.primary}
                name="chatbubble-ellipses-outline"
                size={16}
              />
              <Text style={styles.suggestionsToggleText}>
                Preguntas sugeridas
              </Text>
            </View>
            <Ionicons
              color="#FFFFFF"
              name={isSuggestionsOpen ? "chevron-up" : "chevron-down"}
              size={18}
            />
          </Pressable>

          {isSuggestionsOpen ? (
            <View style={styles.questionStack}>
              {quickQuestions.map((question) => (
                <Pressable
                  key={question}
                  onPress={() => chatSheetProps.onSuggestedQuestionPress(question)}
                  style={({ pressed }) => [
                    styles.questionBubble,
                    pressed ? styles.pressed : null,
                  ]}
                >
                  <Text numberOfLines={2} style={styles.questionBubbleText}>
                    {question}
                  </Text>
                </Pressable>
              ))}
            </View>
          ) : null}
        </View>

        <View style={styles.composerCard}>
          <View style={styles.composerHeader}>
            <Text style={styles.composerTitle}>Haz tu pregunta</Text>
            <Text style={styles.composerHint}>Voz recomendada</Text>
          </View>

          <Pressable
            onPress={chatSheetProps.onToggleListening}
            style={({ pressed }) => [
              styles.voicePrimaryButton,
              chatSheetProps.isListening ? styles.voicePrimaryButtonActive : null,
              pressed ? styles.pressed : null,
            ]}
          >
            <Ionicons
              color="#FFFFFF"
              name={chatSheetProps.isListening ? "stop-circle-outline" : "mic-outline"}
              size={22}
            />
            <Text style={styles.voicePrimaryButtonText}>
              {chatSheetProps.isListening ? "Detener grabacion" : "Preguntar por voz"}
            </Text>
          </Pressable>

          <View style={styles.inputRow}>
            <TextInput
              value={chatSheetProps.questionText}
              onChangeText={chatSheetProps.onQuestionTextChange}
              placeholder="Escribe tu pregunta..."
              placeholderTextColor="rgba(255,255,255,0.55)"
              multiline
              textAlignVertical="top"
              style={styles.input}
            />

            <Pressable
              onPress={chatSheetProps.onSubmit}
              disabled={!canSubmit}
              style={({ pressed }) => [
                styles.inputAction,
                !canSubmit ? styles.inputActionDisabled : null,
                pressed && canSubmit ? styles.pressed : null,
              ]}
            >
              <Ionicons color="#FFFFFF" name="send" size={18} />
            </Pressable>
          </View>
        </View>

        {chatSheetProps.voiceStatusMessage ? (
          <Text style={styles.helperText}>
            {chatSheetProps.voiceStatusMessage}
          </Text>
        ) : null}

        <View style={styles.answerCard}>
          <View style={styles.answerHeader}>
            <Ionicons
              color={musePalette.primary}
              name="sparkles-outline"
              size={18}
            />
            <Text style={styles.answerHeaderText}>Respuesta IA</Text>
            {chatSheetProps.isLoading ? (
              <ActivityIndicator color={musePalette.primary} size="small" />
            ) : null}
          </View>

          <ScrollView
            contentContainerStyle={styles.answerScrollContent}
            style={styles.answerScroll}
            showsVerticalScrollIndicator={false}
          >
            {hasResponse ? (
              <Markdown style={markdownStyles}>
                {chatSheetProps.response}
              </Markdown>
            ) : (
              <Text style={styles.answerPlaceholderText}>
                Haz una pregunta sobre esta obra y la respuesta aparecera aqui.
              </Text>
            )}

            {chatSheetProps.errorMessage ? (
              <Text style={styles.errorText}>
                {chatSheetProps.errorMessage}
              </Text>
            ) : null}

            {chatSheetProps.sources.slice(0, 3).map((source) => (
              <Pressable
                key={source.id}
                onPress={() => {
                  const sourceImages = chatSheetProps.sources
                    .filter((item) => item.image_url)
                    .map((item, index) => ({
                      id: item.id,
                      uri: item.image_url as string,
                      label: item.source_label ?? `Fuente ${index + 1}`,
                    }));

                  const imageIndex = sourceImages.findIndex(
                    (item) => item.id === source.id,
                  );

                  if (sourceImages.length && imageIndex >= 0) {
                    chatSheetProps.onOpenImage(sourceImages, imageIndex);
                  }
                }}
                style={({ pressed }) => [
                  styles.sourceCard,
                  pressed ? styles.pressed : null,
                ]}
              >
                <Text style={styles.sourceLabel}>
                  {source.source_label ?? "Fuente"}
                </Text>
                <Text numberOfLines={2} style={styles.sourceText}>
                  {source.text}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
        </View>
      </View>

      {zoomImage ? (
        <ZoomImageViewer
          images={zoomImage.images}
          initialIndex={zoomImage.initialIndex}
          onClose={closeZoomViewer}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: "rgba(5,8,13,0.42)",
    flex: 1,
    justifyContent: "flex-end",
  },
  keyboardAvoider: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "rgba(8,10,14,0.96)",
    borderColor: "rgba(255,255,255,0.16)",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderWidth: 1,
    gap: 12,
    maxHeight: "76%",
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
    fontSize: 18,
    fontWeight: "800",
  },
  sheetSubtitle: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
    maxWidth: 240,
  },
  closeButton: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderColor: "rgba(255,255,255,0.20)",
    borderRadius: 999,
    borderWidth: 1,
    height: 32,
    justifyContent: "center",
    width: 32,
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
    paddingHorizontal: 10,
  },
  topicChipActive: {
    backgroundColor: "rgba(22,137,206,0.24)",
    borderColor: "rgba(22,137,206,0.62)",
  },
  topicChipText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  topicChipTextActive: {
    color: "#D7EEFF",
    fontSize: 12,
    fontWeight: "800",
  },
  suggestionsPanel: {
    gap: 10,
  },
  suggestionsToggle: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderColor: "rgba(255,255,255,0.14)",
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 44,
    paddingHorizontal: 12,
  },
  suggestionsToggleCopy: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  suggestionsToggleText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  questionStack: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  questionBubble: {
    backgroundColor: "rgba(22,137,206,0.18)",
    borderColor: "rgba(22,137,206,0.34)",
    borderRadius: 12,
    borderWidth: 1,
    maxWidth: "100%",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  questionBubbleText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  answerCard: {
    backgroundColor: "rgba(255,255,255,0.035)",
    borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 15,
    borderWidth: 1,
    gap: 8,
    minHeight: 230,
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
  answerScroll: {
    flex: 1,
  },
  answerScrollContent: {
    gap: 10,
    paddingBottom: 8,
  },
  answerPlaceholderText: {
    color: "rgba(255,255,255,0.86)",
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 20,
  },
  sourceCard: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
    padding: 10,
  },
  sourceLabel: {
    color: musePalette.primary,
    fontSize: 12,
    fontWeight: "800",
  },
  sourceText: {
    color: "rgba(255,255,255,0.74)",
    fontSize: 11,
    fontWeight: "600",
    lineHeight: 16,
  },
  errorText: {
    color: "#FFB2A6",
    fontSize: 12,
    fontWeight: "700",
  },
  composerCard: {
    gap: 10,
  },
  composerHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  composerTitle: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },
  composerHint: {
    color: musePalette.primary,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  voicePrimaryButton: {
    alignItems: "center",
    backgroundColor: "rgba(22,137,206,0.72)",
    borderColor: "rgba(120,190,235,0.32)",
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    minHeight: 48,
    paddingHorizontal: 14,
  },
  voicePrimaryButtonActive: {
    backgroundColor: "rgba(177,58,42,0.76)",
    borderColor: "rgba(255,178,166,0.36)",
  },
  voicePrimaryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  inputRow: {
    alignItems: "center",
    borderColor: "rgba(255,255,255,0.24)",
    borderRadius: 15,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    minHeight: 64,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  input: {
    color: "#FFFFFF",
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
    maxHeight: 96,
    minHeight: 42,
    paddingVertical: 0,
  },
  inputAction: {
    alignItems: "center",
    backgroundColor: "rgba(22,137,206,0.72)",
    borderRadius: 999,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  inputActionDisabled: {
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  helperText: {
    color: "rgba(255,255,255,0.66)",
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
  },
  pressed: {
    opacity: 0.84,
    transform: [{ scale: 0.99 }],
  },
});

const markdownStyles = {
  body: {
    color: "rgba(255,255,255,0.86)",
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 20,
  },
  paragraph: {
    color: "rgba(255,255,255,0.86)",
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 20,
    marginTop: 0,
    marginBottom: 10,
  },
  strong: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  em: {
    color: "#E7FFE4",
  },
  bullet_list: {
    marginTop: 0,
    marginBottom: 10,
  },
  ordered_list: {
    marginTop: 0,
    marginBottom: 10,
  },
  list_item: {
    color: "rgba(255,255,255,0.86)",
  },
  heading1: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
    marginTop: 0,
    marginBottom: 10,
  },
  heading2: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    marginTop: 0,
    marginBottom: 8,
  },
  code_inline: {
    backgroundColor: "rgba(255,255,255,0.08)",
    color: "#FFFFFF",
  },
  blockquote: {
    borderLeftColor: musePalette.primary,
    borderLeftWidth: 3,
    color: "rgba(255,255,255,0.76)",
    paddingLeft: 10,
  },
};
