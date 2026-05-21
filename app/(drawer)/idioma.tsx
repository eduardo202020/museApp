import { musePalette } from "@/components/museiq/theme";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const languages = [
  { code: "es", label: "Espanol", mark: "ES", note: "Predeterminado", tone: "#D84437" },
  { code: "en", label: "English", mark: "EN", note: "Interface available", tone: "#2F7EEA" },
  { code: "ja", label: "日本語", mark: "JA", note: "Proximamente", tone: "#F0F3F8" },
  { code: "zh", label: "中文", mark: "ZH", note: "Proximamente", tone: "#E3B13F" },
];

export default function IdiomaScreen() {
  const [selectedLanguage, setSelectedLanguage] = useState("es");

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeArea}>
        <Header title="Idioma" />

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.hero}>
            <View style={styles.globeShell}>
              <Ionicons color={musePalette.primary} name="globe-outline" size={66} />
            </View>
            <Text style={styles.heroTitle}>Selecciona tu idioma</Text>
            <Text style={styles.heroText}>
              Elige el idioma para la interfaz, audios y respuestas de IA.
            </Text>
          </View>

          <View style={styles.list}>
            {languages.map((language) => {
              const active = selectedLanguage === language.code;

              return (
                <Pressable
                  key={language.code}
                  onPress={() => setSelectedLanguage(language.code)}
                  style={({ pressed }) => [
                    styles.languageCard,
                    active ? styles.languageCardActive : null,
                    pressed ? styles.pressed : null,
                  ]}
                >
                  <View style={[styles.languageMark, { backgroundColor: language.tone }]}>
                    <Text
                      style={[
                        styles.languageMarkText,
                        language.code === "ja" ? styles.languageMarkTextDark : null,
                      ]}
                    >
                      {language.mark}
                    </Text>
                  </View>

                  <View style={styles.languageCopy}>
                    <Text style={styles.languageLabel}>{language.label}</Text>
                    <Text style={styles.languageNote}>{language.note}</Text>
                  </View>

                  <View style={[styles.radio, active ? styles.radioActive : null]}>
                    {active ? <View style={styles.radioDot} /> : null}
                  </View>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.infoCard}>
            <Ionicons color={musePalette.primary} name="information-circle-outline" size={21} />
            <Text style={styles.infoText}>
              Puedes cambiar esta preferencia en cualquier momento desde configuracion.
            </Text>
          </View>
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
  hero: {
    alignItems: "center",
    gap: 10,
    paddingBottom: 6,
    paddingTop: 18,
  },
  globeShell: {
    alignItems: "center",
    backgroundColor: "rgba(22,137,206,0.14)",
    borderColor: "rgba(22,137,206,0.36)",
    borderRadius: 999,
    borderWidth: 1,
    height: 112,
    justifyContent: "center",
    width: 112,
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900",
    marginTop: 6,
    textAlign: "center",
  },
  heroText: {
    color: "rgba(255,255,255,0.66)",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 21,
    maxWidth: 280,
    textAlign: "center",
  },
  list: {
    gap: 12,
  },
  languageCard: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.045)",
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: 14,
    minHeight: 76,
    paddingHorizontal: 16,
  },
  languageCardActive: {
    backgroundColor: "rgba(22,137,206,0.12)",
    borderColor: musePalette.primary,
  },
  languageMark: {
    alignItems: "center",
    borderColor: "rgba(255,255,255,0.20)",
    borderRadius: 999,
    borderWidth: 1,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  languageMarkText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
  },
  languageMarkTextDark: {
    color: "#17202C",
  },
  languageCopy: {
    flex: 1,
    gap: 4,
  },
  languageLabel: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "900",
  },
  languageNote: {
    color: "rgba(255,255,255,0.60)",
    fontSize: 13,
    fontWeight: "600",
  },
  radio: {
    alignItems: "center",
    borderColor: "rgba(255,255,255,0.34)",
    borderRadius: 999,
    borderWidth: 2,
    height: 25,
    justifyContent: "center",
    width: 25,
  },
  radioActive: {
    borderColor: musePalette.primary,
  },
  radioDot: {
    backgroundColor: musePalette.primary,
    borderRadius: 999,
    height: 11,
    width: 11,
  },
  infoCard: {
    alignItems: "center",
    borderColor: "rgba(22,137,206,0.42)",
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    minHeight: 58,
    paddingHorizontal: 14,
  },
  infoText: {
    color: "rgba(255,255,255,0.70)",
    flex: 1,
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 18,
  },
  pressed: {
    opacity: 0.84,
  },
});
