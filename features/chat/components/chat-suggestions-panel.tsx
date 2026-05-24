import { musePalette } from "@/components/museiq/theme";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

type ChatSuggestionsPanelProps = {
  isOpen: boolean;
  onResponseModeChange: (mode: "breve" | "explicada") => void;
  onToggle: () => void;
  onSuggestedQuestionPress: (question: string) => void;
  questions: string[];
  responseMode: "breve" | "explicada" | "infantil";
};

export function ChatSuggestionsPanel({
  isOpen,
  onResponseModeChange,
  onSuggestedQuestionPress,
  onToggle,
  questions,
  responseMode,
}: ChatSuggestionsPanelProps) {
  return (
    <>
      <View style={styles.topicTabs}>
        <View style={[styles.topicChip, styles.topicChipActive]}>
          <Ionicons color="#D7EEFF" name="sparkles-outline" size={13} />
          <Text style={styles.topicChipTextActive}>Sugeridas</Text>
        </View>
        <Pressable
          onPress={() => onResponseModeChange("breve")}
          style={[styles.topicChip, responseMode === "breve" ? styles.topicChipActive : null]}
        >
          <Text
            style={[
              styles.topicChipText,
              responseMode === "breve" ? styles.topicChipTextActive : null,
            ]}
          >
            Breve
          </Text>
        </Pressable>
        <Pressable
          onPress={() => onResponseModeChange("explicada")}
          style={[
            styles.topicChip,
            responseMode === "explicada" ? styles.topicChipActive : null,
          ]}
        >
          <Text
            style={[
              styles.topicChipText,
              responseMode === "explicada" ? styles.topicChipTextActive : null,
            ]}
          >
            Explicada
          </Text>
        </Pressable>
      </View>

      <View style={styles.suggestionsPanel}>
        <Pressable
          onPress={onToggle}
          style={({ pressed }) => [styles.suggestionsToggle, pressed ? styles.pressed : null]}
        >
          <View style={styles.suggestionsToggleCopy}>
            <Ionicons
              color={musePalette.primary}
              name="chatbubble-ellipses-outline"
              size={16}
            />
            <Text style={styles.suggestionsToggleText}>Preguntas sugeridas</Text>
          </View>
          <Ionicons color="#FFFFFF" name={isOpen ? "chevron-up" : "chevron-down"} size={18} />
        </Pressable>

        {isOpen ? (
          <View style={styles.questionStack}>
            {questions.map((question) => (
              <Pressable
                key={question}
                onPress={() => onSuggestedQuestionPress(question)}
                style={({ pressed }) => [styles.questionBubble, pressed ? styles.pressed : null]}
              >
                <Text numberOfLines={2} style={styles.questionBubbleText}>
                  {question}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : null}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
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
  pressed: {
    opacity: 0.84,
    transform: [{ scale: 0.99 }],
  },
});
