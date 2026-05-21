import { musePalette } from "@/components/museiq/theme";
import { useMuseIQ } from "@/providers/museiq-provider";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import type { PropsWithChildren } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AjustesScreen() {
  const { settings } = useMuseIQ();

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeArea}>
        <Header title="Configuracion" />

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Section title="Experiencia">
            <SettingsRow
              icon="globe-outline"
              label="Idioma de la aplicacion"
              onPress={() => router.push("/idioma" as never)}
              value="Espanol"
            />
            <SettingsRow
              icon="pulse-outline"
              label="Ajustes de audio"
              value={`Narracion ${settings.autoPlay ? "automatica" : "manual"}, velocidad y voces`}
            />
            <SettingsRow
              icon="cube-outline"
              label="Calidad de modelos 3D"
              value="Equilibrado recomendado"
            />
            <SettingsRow
              icon="download-outline"
              label="Descargar contenido"
              value="Gestiona modelos 3D y recursos"
              last
            />
          </Section>

          <Section title="Conectividad">
            <SettingsRow
              icon="bluetooth-outline"
              label="Bluetooth"
              value="Conectado  -  Senal estable"
              valueTone="primary"
            />
            <SettingsRow icon="wifi-outline" label="Red e Internet" value="MuseIQ-App_5G" />
            <SettingsRow
              icon="sync-outline"
              label="Sincronizar datos"
              value="Ultima sincronizacion: Hoy"
              last
            />
          </Section>

          <Section title="Preferencias">
            <SettingsRow
              icon="notifications-outline"
              label="Notificaciones"
              value={settings.visualConfirmations ? "Activadas" : "Desactivadas"}
            />
            <SettingsRow
              icon="shield-checkmark-outline"
              label="Privacidad"
              value="Gestionar datos y permisos"
              last
            />
          </Section>

          <Section title="Soporte">
            <SettingsRow icon="trash-outline" label="Borrar cache" value="0.98 GB" last />
          </Section>

          <Text style={styles.versionText}>Version 1.0.0 (100)  -  MuseIQ</Text>
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

function Section({ children, title }: PropsWithChildren<{ title: string }>) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

function SettingsRow({
  icon,
  label,
  last,
  onPress,
  value,
  valueTone,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  last?: boolean;
  onPress?: () => void;
  value: string;
  valueTone?: "primary";
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        last ? styles.rowLast : null,
        pressed ? styles.pressed : null,
      ]}
    >
      <Ionicons color="#FFFFFF" name={icon} size={27} />
      <View style={styles.rowCopy}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={[styles.rowValue, valueTone === "primary" ? styles.rowValuePrimary : null]}>
          {value}
        </Text>
      </View>
      <Ionicons color="#FFFFFF" name="chevron-forward" size={22} />
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
    gap: 17,
    paddingBottom: 34,
    paddingHorizontal: 22,
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
  card: {
    backgroundColor: "rgba(255,255,255,0.045)",
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  row: {
    alignItems: "center",
    borderBottomColor: "rgba(255,255,255,0.10)",
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: 16,
    minHeight: 70,
    paddingHorizontal: 16,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  rowCopy: {
    flex: 1,
    gap: 4,
  },
  rowLabel: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  rowValue: {
    color: "rgba(255,255,255,0.62)",
    fontSize: 13,
    fontWeight: "600",
  },
  rowValuePrimary: {
    color: musePalette.primary,
  },
  versionText: {
    color: "rgba(255,255,255,0.58)",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 6,
    textAlign: "center",
  },
  pressed: {
    opacity: 0.84,
  },
});
