import { musePalette } from "@/components/museiq/theme";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const topics = [
  {
    icon: "qr-code-outline",
    title: "Como escanear un codigo QR?",
    text: "Aprende a escanear obras y acceder a experiencias AR e informacion.",
  },
  {
    icon: "bluetooth-outline",
    title: "Como funciona la deteccion de salas?",
    text: "Conoce como el Bluetooth nos ayuda a saber donde te encuentras.",
  },
  {
    icon: "cube-outline",
    title: "Como ver una obra en AR?",
    text: "Pasos para visualizar modelos 3D en tu entorno con realidad aumentada.",
  },
  {
    icon: "chatbubble-ellipses-outline",
    title: "Como hacer preguntas a MuseIQ IA?",
    text: "Consulta sobre las obras, su contexto y referencias con nuestra IA.",
  },
  {
    icon: "phone-portrait-outline",
    title: "Requisitos del dispositivo",
    text: "Conoce los requisitos recomendados para una mejor experiencia.",
  },
  {
    icon: "headset-outline",
    title: "Contacto y soporte",
    text: "Escribenos y te responderemos.",
  },
] as const;

export default function AyudaScreen() {
  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeArea}>
        <Header title="Ayuda" />

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.searchBox}>
            <TextInput
              editable={false}
              placeholder="Buscar temas de ayuda"
              placeholderTextColor="rgba(255,255,255,0.56)"
              style={styles.searchInput}
            />
            <Ionicons color="#FFFFFF" name="search-outline" size={28} />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Temas frecuentes</Text>
            <View style={styles.topicCard}>
              {topics.map((topic, index) => (
                <TopicRow
                  key={topic.title}
                  icon={topic.icon}
                  last={index === topics.length - 1}
                  text={topic.text}
                  title={topic.title}
                />
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Guias rapidas</Text>
            <View style={styles.quickGuides}>
              <QuickGuide icon="map-outline" label="Explorar salas" />
              <QuickGuide icon="cube-outline" label="Ver obras en AR" />
              <QuickGuide icon="chatbubble-ellipses-outline" label="Preguntar a IA" />
            </View>
          </View>

          <Pressable style={styles.reportRow}>
            <Ionicons color="#FFFFFF" name="mail-outline" size={27} />
            <View style={styles.reportCopy}>
              <Text style={styles.reportTitle}>Enviar reporte o sugerencia</Text>
              <Text style={styles.reportText}>Ayudanos a mejorar MuseIQ</Text>
            </View>
            <Ionicons color="#FFFFFF" name="chevron-forward" size={22} />
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function Header({ title }: { title: string }) {
  return (
    <View style={styles.header}>
      <Pressable onPress={() => router.back()} style={styles.headerButton}>
        <Ionicons color="#FFFFFF" name="arrow-back" size={28} />
      </Pressable>
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={styles.headerButton} />
    </View>
  );
}

function TopicRow({
  icon,
  last,
  text,
  title,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  last?: boolean;
  text: string;
  title: string;
}) {
  return (
    <Pressable style={[styles.topicRow, last ? styles.topicRowLast : null]}>
      <View style={styles.topicIcon}>
        <Ionicons color="#FFFFFF" name={icon} size={29} />
      </View>
      <View style={styles.topicCopy}>
        <Text style={styles.topicTitle}>{title}</Text>
        <Text style={styles.topicText}>{text}</Text>
      </View>
      <Ionicons color="#FFFFFF" name="chevron-forward" size={22} />
    </Pressable>
  );
}

function QuickGuide({
  icon,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}) {
  return (
    <Pressable style={styles.quickGuide}>
      <View style={styles.quickIcon}>
        <Ionicons color="#FFFFFF" name={icon} size={32} />
      </View>
      <Text style={styles.quickLabel}>{label}</Text>
      <Text style={styles.quickText}>Guia rapida</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: "#02070B",
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    minHeight: 68,
    paddingHorizontal: 22,
  },
  headerButton: {
    alignItems: "center",
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  headerTitle: {
    color: "#FFFFFF",
    flex: 1,
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
  },
  content: {
    gap: 18,
    paddingBottom: 34,
    paddingHorizontal: 22,
  },
  searchBox: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.045)",
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 56,
    paddingHorizontal: 16,
  },
  searchInput: {
    color: "#FFFFFF",
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    color: musePalette.primary,
    fontSize: 13,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  topicCard: {
    backgroundColor: "rgba(255,255,255,0.045)",
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  topicRow: {
    alignItems: "center",
    borderBottomColor: "rgba(255,255,255,0.10)",
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: 14,
    minHeight: 74,
    paddingHorizontal: 14,
  },
  topicRowLast: {
    borderBottomWidth: 0,
  },
  topicIcon: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.035)",
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 999,
    borderWidth: 1,
    height: 52,
    justifyContent: "center",
    width: 52,
  },
  topicCopy: {
    flex: 1,
    gap: 3,
  },
  topicTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  topicText: {
    color: "rgba(255,255,255,0.64)",
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
  },
  quickGuides: {
    flexDirection: "row",
    gap: 12,
  },
  quickGuide: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.045)",
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    gap: 7,
    minHeight: 112,
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  quickIcon: {
    alignItems: "center",
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: 999,
    borderWidth: 1,
    height: 54,
    justifyContent: "center",
    width: 54,
  },
  quickLabel: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
    textAlign: "center",
  },
  quickText: {
    color: "rgba(255,255,255,0.58)",
    fontSize: 12,
    fontWeight: "600",
  },
  reportRow: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.045)",
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: 15,
    minHeight: 70,
    paddingHorizontal: 16,
  },
  reportCopy: {
    flex: 1,
    gap: 4,
  },
  reportTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  reportText: {
    color: "rgba(255,255,255,0.62)",
    fontSize: 13,
    fontWeight: "600",
  },
});
