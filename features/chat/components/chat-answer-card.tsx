import { musePalette } from "@/components/museiq/theme";
import type { SourceSnippet } from "@/lib/muserag-api";
import { Ionicons } from "@expo/vector-icons";
import Markdown from "react-native-markdown-display";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

type ChatAnswerCardProps = {
  errorMessage: string;
  hasResponse: boolean;
  isLoading: boolean;
  onOpenImage: (
    images: { id: string; label: string; uri: string }[],
    initialIndex: number,
  ) => void;
  response: string;
  sources: SourceSnippet[];
};

export function ChatAnswerCard({
  errorMessage,
  hasResponse,
  isLoading,
  onOpenImage,
  response,
  sources,
}: ChatAnswerCardProps) {
  return (
    <View style={styles.answerCard}>
      <View style={styles.answerHeader}>
        <Ionicons color={musePalette.primary} name="sparkles-outline" size={18} />
        <Text style={styles.answerHeaderText}>Respuesta IA</Text>
        {isLoading ? <ActivityIndicator color={musePalette.primary} size="small" /> : null}
      </View>

      <ScrollView
        contentContainerStyle={styles.answerScrollContent}
        style={styles.answerScroll}
        showsVerticalScrollIndicator={false}
      >
        {hasResponse ? (
          <Markdown style={markdownStyles}>{response}</Markdown>
        ) : (
          <Text style={styles.answerPlaceholderText}>
            Haz una pregunta sobre esta obra y la respuesta aparecera aqui.
          </Text>
        )}

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

        {sources.slice(0, 3).map((source) => (
          <Pressable
            key={source.id}
            onPress={() => {
              const sourceImages = sources
                .filter((item) => item.image_url)
                .map((item, index) => ({
                  id: item.id,
                  uri: item.image_url as string,
                  label: item.source_label ?? `Fuente ${index + 1}`,
                }));

              const imageIndex = sourceImages.findIndex((item) => item.id === source.id);

              if (sourceImages.length && imageIndex >= 0) {
                onOpenImage(sourceImages, imageIndex);
              }
            }}
            style={({ pressed }) => [styles.sourceCard, pressed ? styles.pressed : null]}
          >
            <Text style={styles.sourceLabel}>{source.source_label ?? "Fuente"}</Text>
            <Text numberOfLines={2} style={styles.sourceText}>
              {source.text}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
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
  pressed: {
    opacity: 0.84,
    transform: [{ scale: 0.99 }],
  },
});

const markdownStyles = StyleSheet.create({
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
});
