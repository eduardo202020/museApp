import { SourceImageCarousel } from "@/components/museiq/chat/source-image-carousel";
import { musePalette } from "@/components/museiq/theme";
import { PrimaryButton, SecondaryButton } from "@/components/museiq/ui";
import type { SourceSnippet } from "@/lib/muserag-api";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
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
  isListening: boolean;
  isLoading: boolean;
  isSpeaking: boolean;
  onClose: () => void;
  onOpenImage: (
    images: { id: string; uri: string; label?: string }[],
    initialIndex: number,
  ) => void;
  onQuestionTextChange: (value: string) => void;
  onRetry?: () => void;
  onSpeakResponse: () => void;
  onStopListening: () => void;
  onStopSpeaking: () => void;
  onSubmit: () => void;
  onToggleListening: () => void;
  questionText: string;
  response: string;
  responseMeta: {
    total_ms: number;
    retrieval_ms: number;
    generation_ms: number;
    source_count: number;
  } | null;
  statusMessage: string;
  suggestedQuestions: string[];
  sources: SourceSnippet[];
  voiceStatusMessage: string;
};

export function ChatSheet({
  artworkTitle,
  errorMessage,
  isListening,
  isLoading,
  isSpeaking,
  onClose,
  onOpenImage,
  onQuestionTextChange,
  onRetry,
  onSpeakResponse,
  onStopListening,
  onStopSpeaking,
  onSubmit,
  onToggleListening,
  questionText,
  response,
  responseMeta,
  statusMessage,
  suggestedQuestions,
  sources,
  voiceStatusMessage,
}: ChatSheetProps) {
  const hasAnswer = response.trim().length > 0;
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);

  return (
    <View style={styles.sheet}>
      <View style={styles.header}>
        <View style={styles.handle} />
        <Text style={styles.eyebrow}>Guia del Recorrido</Text>
        <Text style={styles.title}>Conversa con la sala</Text>
        <Text style={styles.subtitle}>{artworkTitle}</Text>
      </View>

      <View style={styles.inputCard}>
        <Text style={styles.inputLabel}>Pregunta al mediador virtual</Text>
        <TextInput
          value={questionText}
          onChangeText={onQuestionTextChange}
          placeholder="Ejemplo: Que revela esta obra sobre el poder moche?"
          placeholderTextColor={musePalette.textMuted}
          multiline
          style={styles.input}
        />

        <View style={styles.voiceControlRow}>
          <SecondaryButton
            icon={isListening ? "stop-circle-outline" : "mic-outline"}
            label={isListening ? "Detener dictado" : "Hablar"}
            onPress={isListening ? onStopListening : onToggleListening}
            style={styles.voiceControlButton}
          />
          <Text style={styles.voiceStatusText}>
            {voiceStatusMessage ||
              "Puedes dictar la pregunta y luego corregirla antes de enviarla."}
          </Text>
        </View>

        {suggestedQuestions.length ? (
          <View style={styles.suggestionsPanel}>
            <Pressable
              onPress={() => setIsSuggestionsOpen((value) => !value)}
              style={({ pressed }) => [
                styles.suggestionsToggle,
                pressed ? styles.suggestionChipPressed : null,
              ]}
            >
              <View style={styles.suggestionsToggleText}>
                <Text style={styles.suggestionsToggleTitle}>
                  Preguntas para inspirarte
                </Text>
                <Text style={styles.suggestionsToggleHint}>
                  {isSuggestionsOpen
                    ? "Ocultar sugerencias"
                    : "Ver ideas de preguntas"}
                </Text>
              </View>
              <Ionicons
                color={musePalette.primary}
                name={isSuggestionsOpen ? "chevron-up" : "chevron-down"}
                size={18}
              />
            </Pressable>

            {isSuggestionsOpen ? (
              <View style={styles.suggestionsList}>
                {suggestedQuestions.map((item, index) => (
                  <Pressable
                    key={item}
                    onPress={() => {
                      onQuestionTextChange(item);
                      setIsSuggestionsOpen(false);
                    }}
                    style={({ pressed }) => [
                      styles.suggestionRow,
                      pressed ? styles.suggestionChipPressed : null,
                    ]}
                  >
                    <Text style={styles.suggestionIndex}>{index + 1}</Text>
                    <Text style={styles.suggestionText}>{item}</Text>
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
          {isLoading ? (
            <View style={styles.loadingBlock}>
              <ActivityIndicator color={musePalette.primaryStrong} size="small" />
              <Text style={styles.loadingTitle}>Consultando MuseRAG</Text>
              <Text style={styles.statusText}>
                {statusMessage || "Preparando la consulta..."}
              </Text>
            </View>
          ) : null}

          {!isLoading ? (
            <Text style={styles.answerText}>
              {response || "La respuesta aparecera aqui."}
            </Text>
          ) : null}

          {hasAnswer && responseMeta ? (
            <View style={styles.metaCard}>
              <Text style={styles.metaTitle}>Resumen de respuesta</Text>
              <Text style={styles.metaText}>
                {`Respondio en ${(responseMeta.total_ms / 1000).toFixed(1)} s con ${responseMeta.source_count} fuente${responseMeta.source_count === 1 ? "" : "s"} recuperada${responseMeta.source_count === 1 ? "" : "s"}.`}
              </Text>
            </View>
          ) : null}

          {hasAnswer ? (
            <View style={styles.answerAudioRow}>
              <SecondaryButton
                icon={isSpeaking ? "volume-mute-outline" : "volume-high-outline"}
                label={isSpeaking ? "Detener audio" : "Escuchar respuesta"}
                onPress={isSpeaking ? onStopSpeaking : onSpeakResponse}
                style={styles.answerAudioButton}
              />
            </View>
          ) : null}

          <SourceImageCarousel sources={sources} onOpenImage={onOpenImage} />

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
      </View>

      <View style={styles.actions}>
        <SecondaryButton
          icon="close"
          label="Cerrar"
          onPress={onClose}
          style={styles.actionButton}
        />
        <PrimaryButton
          icon="send"
          label={isLoading ? "Consultando..." : "Enviar"}
          onPress={onSubmit}
          disabled={isLoading || isListening}
          style={styles.actionButton}
        />
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
    paddingBottom: 28,
    maxHeight: "95%",
  },
  header: {
    paddingTop: 14,
    paddingBottom: 12,
    alignItems: "center",
    gap: 4,
  },
  eyebrow: {
    color: "#8A5A2B",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.4,
    textTransform: "uppercase",
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
    fontSize: 24,
    fontWeight: "900",
    textAlign: "center",
  },
  subtitle: {
    color: "#7C624B",
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },
  inputCard: {
    backgroundColor: "#F7F1E7",
    borderColor: "#E4D7C4",
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
  },
  inputLabel: {
    color: "#6D4D2E",
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 10,
  },
  answerContainer: {
    flex: 1,
    backgroundColor: "#FBF7F1",
    borderRadius: 18,
    borderColor: "#E7DCCA",
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
    minHeight: 200,
  },
  answerContent: {
    flex: 1,
  },
  scrollContent: {
    minHeight: "100%",
    justifyContent: "flex-start",
  },
  answerText: {
    color: musePalette.text,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 8,
  },
  input: {
    color: musePalette.text,
    fontSize: 15,
    lineHeight: 22,
    minHeight: 72,
    textAlignVertical: "top",
  },
  voiceControlRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  voiceControlButton: {
    minHeight: 44,
    paddingHorizontal: 12,
  },
  voiceStatusText: {
    color: "#7C624B",
    flex: 1,
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 18,
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
  suggestionsToggleText: {
    flex: 1,
    gap: 2,
    paddingRight: 10,
  },
  suggestionsToggleTitle: {
    color: "#6D4D2E",
    fontSize: 12,
    fontWeight: "800",
  },
  suggestionsToggleHint: {
    color: "#927A62",
    fontSize: 11,
    fontWeight: "600",
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
    backgroundColor: musePalette.surface,
    borderColor: musePalette.border,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
    marginBottom: 12,
    padding: 14,
  },
  loadingTitle: {
    color: musePalette.text,
    fontSize: 15,
    fontWeight: "800",
  },
  statusText: {
    color: musePalette.textMuted,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 19,
  },
  suggestionsWrap: {
    gap: 8,
  },
  suggestionsList: {
    gap: 8,
    marginTop: 8,
  },
  suggestionRow: {
    alignItems: "flex-start",
    backgroundColor: "#FFFDFC",
    borderColor: "#E8DCCB",
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  suggestionChipPressed: {
    opacity: 0.82,
  },
  suggestionIndex: {
    color: "#A66A2E",
    fontSize: 12,
    fontWeight: "900",
    lineHeight: 18,
    minWidth: 12,
  },
  suggestionText: {
    color: "#5B4633",
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 16,
  },
  metaCard: {
    backgroundColor: "#F6F9FC",
    borderColor: musePalette.border,
    borderRadius: 14,
    borderWidth: 1,
    gap: 4,
    marginBottom: 10,
    padding: 12,
  },
  metaTitle: {
    color: musePalette.text,
    fontSize: 12,
    fontWeight: "800",
  },
  metaText: {
    color: musePalette.textMuted,
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 18,
  },
  answerAudioRow: {
    marginBottom: 10,
  },
  answerAudioButton: {
    alignSelf: "flex-start",
    minHeight: 44,
    paddingHorizontal: 14,
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
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  actionButton: {
    flex: 1,
  },
});
