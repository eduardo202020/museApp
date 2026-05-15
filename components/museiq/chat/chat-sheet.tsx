import { SourceImageCarousel } from "@/components/museiq/chat/source-image-carousel";
import { musePalette } from "@/components/museiq/theme";
import type { SourceSnippet } from "@/lib/muserag-api";
import { Ionicons } from "@expo/vector-icons";
import Markdown from "react-native-markdown-display";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type ChatSheetProps = {
  artworkTitle: string;
  errorMessage: string;
  isQuestionReady: boolean;
  isListening: boolean;
  isLoading: boolean;
  isSpeaking: boolean;
  onCancelPendingQuestion: () => void;
  onClose: () => void;
  onOpenImage: (
    images: { id: string; uri: string; label?: string }[],
    initialIndex: number,
  ) => void;
  onQuestionTextChange: (value: string) => void;
  onSuggestedQuestionPress: (value: string) => void;
  onRetry?: () => void;
  onSpeakResponse: () => void;
  onStopListening: () => void;
  onStopSpeaking: () => void;
  onSubmit: () => void;
  onToggleListening: () => void;
  pendingQuestion: string;
  questionText: string;
  response: string;
  statusMessage: string;
  suggestedQuestions: string[];
  sources: SourceSnippet[];
  voiceMode: "idle" | "listening" | "review";
  voiceStatusMessage: string;
};

const owlThinkingFrames = [
  require("@/assets/images/logo-2.png"),
  require("@/assets/images/logo-3.png"),
  require("@/assets/images/logo-4.png"),
];

export function ChatSheet({
  artworkTitle,
  errorMessage,
  isQuestionReady,
  isListening,
  isLoading,
  isSpeaking,
  onCancelPendingQuestion,
  onClose,
  onOpenImage,
  onQuestionTextChange,
  onSuggestedQuestionPress,
  onRetry,
  onSpeakResponse,
  onStopListening,
  onStopSpeaking,
  onSubmit,
  onToggleListening,
  pendingQuestion,
  questionText,
  response,
  statusMessage,
  suggestedQuestions,
  sources,
  voiceMode,
  voiceStatusMessage,
}: ChatSheetProps) {
  const hasAnswer = response.trim().length > 0;
  const canSubmit = isQuestionReady && questionText.trim().length > 0;
  const isActionBlocked = isLoading;
  const isWaiting = isLoading;
  const fabIconName = isListening ? "stop" : canSubmit ? "send" : "mic";
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [owlFrameIndex, setOwlFrameIndex] = useState(0);
  const [thinkingDots, setThinkingDots] = useState(".");
  const markdownRules = {
    image: () => null,
  };

  useEffect(() => {
    if (!isWaiting) {
      setOwlFrameIndex(0);
      setThinkingDots(".");
      return;
    }

    const intervalId = setInterval(() => {
      setOwlFrameIndex((current) => (current + 1) % owlThinkingFrames.length);
      setThinkingDots((current) => (current.length >= 3 ? "." : `${current}.`));
    }, 260);

    return () => clearInterval(intervalId);
  }, [isWaiting]);

  return (
    <View style={styles.sheet}>
      <View style={styles.header}>
        <View style={styles.handle} />
        <View style={styles.headerMainRow}>
          <Text numberOfLines={2} style={styles.title}>{artworkTitle}</Text>
          <Pressable
            onPress={onClose}
            style={({ pressed }) => [
              styles.headerCloseButton,
              pressed ? styles.suggestionChipPressed : null,
            ]}
          >
            <Ionicons color={musePalette.primary} name="close" size={18} />
          </Pressable>
        </View>
      </View>

      <View style={styles.inputCard}>
        <Text style={styles.inputLabel}>Haz una pregunta o dicta una idea</Text>

        {voiceMode === "listening" ? (
          <View style={styles.listeningCard}>
            <View style={styles.listeningIconWrap}>
              <Ionicons color="#FFFFFF" name="mic" size={22} />
            </View>
            <Text style={styles.listeningTitle}>Te escucho</Text>
            <View style={styles.liveTranscriptCard}>
              <Text style={styles.liveTranscriptText}>
                {questionText.trim() || "Tu pregunta aparecera aqui en vivo..."}
              </Text>
            </View>
          </View>
        ) : (
          <>
            <TextInput
              value={questionText}
              onChangeText={onQuestionTextChange}
              placeholder="Ejemplo: Que revela esta obra sobre el poder moche?"
              placeholderTextColor={musePalette.textMuted}
              multiline
              style={styles.input}
            />

            {voiceStatusMessage ? (
              <Text style={styles.voiceStatusText}>{voiceStatusMessage}</Text>
            ) : null}
          </>
        )}

        {voiceMode !== "listening" && !isLoading && suggestedQuestions.length ? (
          <View style={styles.suggestionsPanel}>
            <Pressable
              onPress={() => setIsSuggestionsOpen((value) => !value)}
              style={({ pressed }) => [
                styles.suggestionsToggle,
                pressed ? styles.suggestionChipPressed : null,
              ]}
            >
              <Text style={styles.suggestionsTitle}>Ideas rapidas</Text>
              <Ionicons
                color={musePalette.primary}
                name={isSuggestionsOpen ? "chevron-up" : "chevron-down"}
                size={18}
              />
            </Pressable>

            {isSuggestionsOpen ? (
              <View style={styles.quickSuggestionList}>
                {suggestedQuestions.slice(0, 3).map((item) => (
                  <Pressable
                  key={item}
                  onPress={() => {
                      onSuggestedQuestionPress(item);
                      setIsSuggestionsOpen(false);
                    }}
                    style={({ pressed }) => [
                      styles.quickSuggestionChip,
                      pressed ? styles.suggestionChipPressed : null,
                    ]}
                  >
                    <Text style={styles.quickSuggestionText}>{item}</Text>
                  </Pressable>
                ))}
              </View>
            ) : null}
          </View>
        ) : null}
      </View>

      <View style={styles.answerContainer}>
        <ScrollView
          style={styles.answerContent}
          showsVerticalScrollIndicator
          scrollEnabled
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.answerPrimaryCard}>
            {hasAnswer ? (
              <Pressable
                onPress={isSpeaking ? onStopSpeaking : onSpeakResponse}
                style={({ pressed }) => [
                  styles.answerAudioFloatingButton,
                  pressed ? styles.suggestionChipPressed : null,
                ]}
              >
                <Ionicons
                  color="#FFFFFF"
                  name={isSpeaking ? "volume-mute-outline" : "volume-high-outline"}
                  size={18}
                />
              </Pressable>
            ) : null}
            {!isLoading ? (
              hasAnswer ? (
                <View style={styles.markdownWrap}>
                  <Markdown rules={markdownRules} style={markdownStyles}>{response}</Markdown>
                </View>
              ) : (
                <View style={styles.emptyAnswerState}>
                  <Ionicons
                    color={musePalette.textMuted}
                    name="chatbubble-ellipses-outline"
                    size={22}
                  />
                  <Text style={styles.answerText}>
                    {response || "La respuesta aparecera aqui."}
                  </Text>
                </View>
              )
            ) : null}
          </View>

          {sources.length ? (
            <View style={styles.carouselBlock}>
              <Text style={styles.carouselTitle}>Imagenes relacionadas</Text>
              <SourceImageCarousel sources={sources} onOpenImage={onOpenImage} />
            </View>
          ) : null}

          {errorMessage ? (
            <View style={styles.errorCard}>
              <Text style={styles.errorText}>{errorMessage}</Text>
              {onRetry ? (
                <Pressable onPress={onRetry} style={styles.retryButton}>
                  <Text style={styles.retryText}>Reintentar la misma pregunta</Text>
                </Pressable>
              ) : null}
            </View>
          ) : null}
        </ScrollView>

        {isWaiting ? (
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingModalCard}>
              <View style={styles.loadingGuideRow}>
                <Image
                  source={owlThinkingFrames[owlFrameIndex]}
                  style={styles.loadingGuideImage}
                  resizeMode="contain"
                />
                <View style={styles.loadingQuestionWrap}>
                  <View style={styles.loadingQuestionCard}>
                    <Text style={styles.loadingQuestionText}>
                      {`${pendingQuestion || questionText}${thinkingDots}`}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.loadingSpinnerBlock}>
                <Text style={styles.statusText}>
                  {statusMessage || "Preparando la consulta..."}
                </Text>
              </View>
              <Pressable
                onPress={onCancelPendingQuestion}
                style={({ pressed }) => [
                  styles.loadingCancelButton,
                  pressed ? styles.suggestionChipPressed : null,
                ]}
              >
                <Text style={styles.loadingCancelText}>Cancelar</Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        <Pressable
          onPress={
            isListening ? onStopListening : canSubmit ? onSubmit : onToggleListening
          }
          disabled={isActionBlocked}
          style={({ pressed }) => [
            styles.floatingSendButton,
            isListening ? styles.floatingSendButtonListening : null,
            isActionBlocked
              ? styles.floatingSendButtonDisabled
              : null,
            pressed ? styles.suggestionChipPressed : null,
          ]}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Ionicons color="#FFFFFF" name={fabIconName} size={20} />
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    backgroundColor: musePalette.surface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    flex: 1,
    flexDirection: "column",
    paddingHorizontal: 20,
    paddingBottom: 20,
    maxHeight: "95%",
  },
  header: {
    paddingTop: 14,
    paddingBottom: 12,
    gap: 8,
  },
  headerMainRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  handle: {
    alignSelf: "center",
    backgroundColor: musePalette.border,
    borderRadius: 999,
    height: 6,
    width: 56,
  },
  title: {
    color: musePalette.text,
    flex: 1,
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
  headerCloseButton: {
    alignItems: "center",
    backgroundColor: "#FFFDFC",
    borderColor: musePalette.border,
    borderRadius: 999,
    borderWidth: 1,
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  inputCard: {
    backgroundColor: "#F7F1E7",
    borderColor: "#E4D7C4",
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  inputLabel: {
    color: "#6D4D2E",
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 6,
  },
  answerContainer: {
    flex: 1,
    backgroundColor: "#FBF7F1",
    borderRadius: 18,
    borderColor: "#E7DCCA",
    borderWidth: 1,
    overflow: "hidden",
    padding: 14,
    minHeight: 0,
    position: "relative",
  },
  answerContent: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "space-between",
    paddingBottom: 68,
  },
  answerPrimaryCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#D9E6F2",
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    marginBottom: 10,
    minHeight: 220,
    padding: 12,
    position: "relative",
  },
  answerText: {
    color: musePalette.text,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
  },
  responseSections: {
    gap: 10,
    marginBottom: 8,
  },
  markdownWrap: {
    flexGrow: 1,
  },
  carouselBlock: {
    marginBottom: 10,
  },
  carouselTitle: {
    color: musePalette.primary,
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 2,
  },
  input: {
    color: musePalette.text,
    fontSize: 14,
    lineHeight: 20,
    maxHeight: 92,
    minHeight: 42,
    paddingVertical: 2,
    textAlignVertical: "top",
  },
  listeningCard: {
    alignItems: "center",
    backgroundColor: "#FFFDFC",
    borderColor: "#E4D7C4",
    borderRadius: 18,
    borderWidth: 1,
    gap: 8,
    padding: 12,
  },
  listeningIconWrap: {
    alignItems: "center",
    backgroundColor: musePalette.primary,
    borderRadius: 999,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  listeningTitle: {
    color: musePalette.text,
    fontSize: 18,
    fontWeight: "900",
  },
  liveTranscriptCard: {
    alignSelf: "stretch",
    backgroundColor: "#F7FBFF",
    borderColor: "#D8E8F8",
    borderRadius: 14,
    borderWidth: 1,
    minHeight: 88,
    padding: 12,
  },
  liveTranscriptText: {
    color: musePalette.text,
    fontSize: 14,
    lineHeight: 21,
  },
  voiceStatusText: {
    color: "#7C624B",
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 18,
    marginTop: 8,
  },
  suggestionsPanel: {
    marginTop: 10,
  },
  suggestionsToggle: {
    alignItems: "center",
    backgroundColor: "#FFFDFC",
    borderColor: "#E4D7C4",
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  suggestionsTitle: {
    color: "#6D4D2E",
    fontSize: 12,
    fontWeight: "800",
  },
  quickSuggestionList: {
    marginTop: 8,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  quickSuggestionChip: {
    backgroundColor: "#FFFDFC",
    borderColor: "#E8DCCB",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  quickSuggestionText: {
    color: "#5B4633",
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 16,
  },
  errorText: {
    color: musePalette.danger,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
  },
  errorCard: {
    backgroundColor: "#FDEEEE",
    borderColor: "#F4CBCB",
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
    marginTop: 12,
    padding: 12,
  },
  loadingBlock: {
    alignItems: "flex-start",
    gap: 8,
    justifyContent: "center",
    minHeight: 180,
  },
  loadingOverlay: {
    alignItems: "center",
    backgroundColor: "rgba(251, 247, 241, 0.82)",
    bottom: 0,
    justifyContent: "center",
    left: 0,
    paddingHorizontal: 18,
    position: "absolute",
    right: 0,
    top: 0,
  },
  loadingModalCard: {
    alignItems: "center",
    backgroundColor: "#FFFDF9",
    borderColor: "#E7DCCA",
    borderRadius: 22,
    borderWidth: 1,
    maxWidth: 420,
    minHeight: 420,
    paddingHorizontal: 18,
    paddingVertical: 20,
    position: "relative",
    width: "100%",
  },
  loadingGuideRow: {
    alignItems: "flex-start",
    alignSelf: "stretch",
    marginBottom: 18,
    minHeight: 260,
    position: "relative",
    width: "100%",
  },
  loadingGuideImage: {
    height: 208,
    left: -10,
    position: "absolute",
    bottom: -8,
    marginTop: 0,
    width: 208,
  },
  loadingQuestionWrap: {
    maxWidth: "72%",
    position: "absolute",
    right: 0,
    top: 0,
    width: "72%",
  },
  loadingQuestionCard: {
    backgroundColor: "#F7F1E7",
    borderColor: "#E4D7C4",
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    width: "100%",
  },
  loadingQuestionText: {
    color: musePalette.text,
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 22,
    textAlign: "left",
  },
  loadingSpinnerBlock: {
    alignItems: "center",
    gap: 10,
    marginBottom: 18,
    marginTop: 8,
    width: "100%",
  },
  emptyAnswerState: {
    alignItems: "center",
    flex: 1,
    gap: 10,
    justifyContent: "center",
    minHeight: 180,
    paddingHorizontal: 10,
  },
  statusText: {
    color: musePalette.textMuted,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 19,
    textAlign: "center",
  },
  loadingCancelButton: {
    backgroundColor: "#FFFFFF",
    borderColor: "#D9E6F2",
    borderRadius: 999,
    borderWidth: 1,
    marginTop: 4,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  loadingCancelText: {
    color: musePalette.primary,
    fontSize: 13,
    fontWeight: "800",
  },
  suggestionChipPressed: {
    opacity: 0.82,
  },
  answerAudioFloatingButton: {
    alignItems: "center",
    backgroundColor: musePalette.primary,
    borderRadius: 999,
    height: 36,
    justifyContent: "center",
    position: "absolute",
    right: 12,
    top: 12,
    width: 36,
    zIndex: 2,
  },
  retryButton: {
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
    borderColor: "#F4CBCB",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  retryText: {
    color: musePalette.danger,
    fontSize: 12,
    fontWeight: "800",
  },
  floatingSendButton: {
    alignItems: "center",
    backgroundColor: musePalette.primary,
    borderRadius: 999,
    bottom: 14,
    elevation: 5,
    height: 56,
    justifyContent: "center",
    position: "absolute",
    right: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 6,
    width: 56,
  },
  floatingSendButtonDisabled: {
    backgroundColor: "#9AA3AE",
  },
  floatingSendButtonListening: {
    backgroundColor: "#B13A2A",
  },
});

const markdownStyles = {
  body: {
    color: musePalette.text,
    fontSize: 14,
    lineHeight: 22,
  },
  heading2: {
    color: musePalette.primary,
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 6,
    marginTop: 8,
  },
  paragraph: {
    color: musePalette.text,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 8,
  },
  list_item: {
    color: musePalette.text,
    fontSize: 13,
    lineHeight: 20,
  },
  image: {
    borderRadius: 10,
    height: 190,
    marginTop: 8,
    marginBottom: 8,
  },
};
