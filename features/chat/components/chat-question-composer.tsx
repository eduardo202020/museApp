import { musePalette } from "@/components/museiq/theme";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

type ChatQuestionComposerProps = {
  canSubmit: boolean;
  isListening: boolean;
  onQuestionTextChange: (value: string) => void;
  onSubmit: () => void;
  onToggleListening: () => void;
  questionText: string;
};

export function ChatQuestionComposer({
  canSubmit,
  isListening,
  onQuestionTextChange,
  onSubmit,
  onToggleListening,
  questionText,
}: ChatQuestionComposerProps) {
  return (
    <View style={styles.composerCard}>
      <View style={styles.composerHeader}>
        <Text style={styles.composerTitle}>Haz tu pregunta</Text>
        <Text style={styles.composerHint}>Voz recomendada</Text>
      </View>

      <Pressable
        onPress={onToggleListening}
        style={({ pressed }) => [
          styles.voicePrimaryButton,
          isListening ? styles.voicePrimaryButtonActive : null,
          pressed ? styles.pressed : null,
        ]}
      >
        <Ionicons
          color="#FFFFFF"
          name={isListening ? "stop-circle-outline" : "mic-outline"}
          size={22}
        />
        <Text style={styles.voicePrimaryButtonText}>
          {isListening ? "Detener grabacion" : "Preguntar por voz"}
        </Text>
      </Pressable>

      <View style={styles.inputRow}>
        <TextInput
          value={questionText}
          onChangeText={onQuestionTextChange}
          placeholder="Escribe tu pregunta..."
          placeholderTextColor="rgba(255,255,255,0.55)"
          multiline
          textAlignVertical="top"
          style={styles.input}
        />

        <Pressable
          onPress={onSubmit}
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
  );
}

const styles = StyleSheet.create({
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
  pressed: {
    opacity: 0.84,
    transform: [{ scale: 0.99 }],
  },
});
