import { musePalette } from "@/components/museiq/theme";
import {
  AppScreen,
  SectionCard,
  SectionEyebrow,
  TopBar,
} from "@/components/museiq/ui";
import { useMuseIQ } from "@/providers/museiq-provider";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

function MenuButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.menuButton}>
      <Ionicons color={musePalette.primary} name="menu" size={18} />
    </Pressable>
  );
}

export default function AyudaScreen() {
  const navigation = useNavigation();
  const { helpFaq, voicePrompts } = useMuseIQ();

  return (
    <View style={styles.screen}>
      <AppScreen contentContainerStyle={styles.content}>
        <TopBar
          title="MuseIQ"
          subtitle="Ayuda y FAQ"
          left={
            <MenuButton
              onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            />
          }
        />

        <SectionCard>
          <SectionEyebrow>Empezar</SectionEyebrow>
          <Text style={styles.sectionTitle}>Como aprovechar mejor la guia</Text>
          <View style={styles.tipList}>
            <Text style={styles.tipItem}>
              Mira primero la obra unos segundos antes de preguntar.
            </Text>
            <Text style={styles.tipItem}>
              Prueba preguntas concretas sobre materiales, simbolos o poder.
            </Text>
            <Text style={styles.tipItem}>
              Si prefieres, usa el dictado por voz y revisa tu pregunta antes de enviarla.
            </Text>
          </View>
        </SectionCard>

        <SectionCard>
          <SectionEyebrow>Ideas de preguntas</SectionEyebrow>
          <Text style={styles.sectionTitle}>Prompts sugeridos</Text>
          <View style={styles.promptList}>
            {voicePrompts.map((prompt) => (
              <View key={prompt} style={styles.promptChip}>
                <Text style={styles.promptText}>{prompt}</Text>
              </View>
            ))}
          </View>
        </SectionCard>

        <SectionCard>
          <SectionEyebrow>Preguntas frecuentes</SectionEyebrow>
          <Text style={styles.sectionTitle}>Lo que suele preguntar la gente</Text>
          <View style={styles.faqList}>
            {helpFaq.map((item) => (
              <View key={item.question} style={styles.faqItem}>
                <Text style={styles.faqQuestion}>{item.question}</Text>
                <Text style={styles.faqAnswer}>{item.answer}</Text>
              </View>
            ))}
          </View>
        </SectionCard>
      </AppScreen>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: musePalette.background,
  },
  content: {
    gap: 16,
  },
  menuButton: {
    alignItems: "center",
    backgroundColor: musePalette.surfaceMuted,
    borderRadius: 999,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  sectionTitle: {
    color: musePalette.text,
    fontSize: 18,
    fontWeight: "900",
  },
  tipList: {
    gap: 10,
    marginTop: 10,
  },
  tipItem: {
    color: musePalette.textMuted,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 21,
  },
  promptList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 10,
  },
  promptChip: {
    backgroundColor: musePalette.primarySoft,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  promptText: {
    color: musePalette.primaryStrong,
    fontSize: 13,
    fontWeight: "800",
  },
  faqList: {
    gap: 10,
    marginTop: 10,
  },
  faqItem: {
    backgroundColor: musePalette.surfaceMuted,
    borderRadius: 16,
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  faqQuestion: {
    color: musePalette.text,
    fontSize: 14,
    fontWeight: "800",
  },
  faqAnswer: {
    color: musePalette.textMuted,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 19,
  },
});
