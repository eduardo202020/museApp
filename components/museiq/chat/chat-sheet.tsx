import { SourceImageCarousel } from "@/components/museiq/chat/source-image-carousel";
import { musePalette } from "@/components/museiq/theme";
import { PrimaryButton, SecondaryButton } from "@/components/museiq/ui";
import type { SourceSnippet } from "@/lib/muserag-api";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type ChatSheetProps = {
  artworkTitle: string;
  errorMessage: string;
  isLoading: boolean;
  onClose: () => void;
  onOpenImage: (uri: string, label?: string) => void;
  onQuestionTextChange: (value: string) => void;
  onSubmit: () => void;
  questionText: string;
  response: string;
  sources: SourceSnippet[];
};

export function ChatSheet({
  artworkTitle,
  errorMessage,
  isLoading,
  onClose,
  onOpenImage,
  onQuestionTextChange,
  onSubmit,
  questionText,
  response,
  sources,
}: ChatSheetProps) {
  return (
    <View style={styles.sheet}>
      <View style={styles.header}>
        <View style={styles.handle} />
        <Text style={styles.title}>Chat</Text>
        <Text style={styles.subtitle}>{artworkTitle}</Text>
      </View>

      <View style={styles.inputCard}>
        <TextInput
          value={questionText}
          onChangeText={onQuestionTextChange}
          placeholder="Escribe tu pregunta"
          placeholderTextColor={musePalette.textMuted}
          multiline
          style={styles.input}
        />
      </View>

      <View style={styles.answerContainer}>
        <ScrollView
          style={styles.answerContent}
          showsVerticalScrollIndicator
          scrollEnabled
          contentContainerStyle={styles.scrollContent}
        >
          <Text style={styles.answerText}>
            {response ||
              (isLoading
                ? "Consultando al museo..."
                : "La respuesta aparecera aqui.")}
          </Text>

          <SourceImageCarousel sources={sources} onOpenImage={onOpenImage} />

          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : null}
        </ScrollView>
      </View>

      <View style={styles.actions}>
        <PrimaryButton
          icon="send"
          label={isLoading ? "Consultando..." : "Enviar"}
          onPress={onSubmit}
          disabled={isLoading}
        />
        <SecondaryButton icon="close" label="Cerrar" onPress={onClose} />
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
    color: musePalette.textMuted,
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  inputCard: {
    backgroundColor: musePalette.surfaceMuted,
    borderColor: musePalette.border,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
  },
  answerContainer: {
    flex: 1,
    backgroundColor: musePalette.surfaceMuted,
    borderRadius: 18,
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
    color: musePalette.textMuted,
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
  errorText: {
    color: "#A12626",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
  },
  actions: {
    gap: 10,
    marginTop: 4,
  },
});
