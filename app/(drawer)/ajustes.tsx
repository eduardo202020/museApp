import { musePalette } from "@/components/museiq/theme";
import {
  AppScreen,
  PrimaryButton,
  SectionCard,
  SectionEyebrow,
  SettingRow,
  TopBar,
} from "@/components/museiq/ui";
import { useMuseIQ } from "@/providers/museiq-provider";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";

function MenuButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.menuButton}>
      <Ionicons color={musePalette.primary} name="menu" size={18} />
    </Pressable>
  );
}

export default function AjustesScreen() {
  const navigation = useNavigation();
  const { settings, updateSettings } = useMuseIQ();

  return (
    <View style={styles.screen}>
      <AppScreen contentContainerStyle={styles.content}>
        <TopBar
          title="MuseIQ"
          subtitle="Ajustes"
          left={
            <MenuButton
              onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            />
          }
        />

        <SectionCard>
          <SectionEyebrow>Experiencia</SectionEyebrow>
          <Text style={styles.sectionTitle}>Personaliza la visita</Text>

          <SettingRow
            title="Reproducir respuestas automaticamente"
            description="La guia lee en voz alta la respuesta apenas llega."
            accessory={
              <Switch
                value={settings.autoPlay}
                onValueChange={(value) => updateSettings({ autoPlay: value })}
              />
            }
          />
          <SettingRow
            title="Subtitulos y texto visible"
            description="Mantiene la informacion textual presente mientras escuchas."
            accessory={
              <Switch
                value={settings.subtitles}
                onValueChange={(value) => updateSettings({ subtitles: value })}
              />
            }
          />
          <SettingRow
            title="Confirmaciones visuales"
            description="Refuerza cambios de estado y acciones dentro de la visita."
            accessory={
              <Switch
                value={settings.visualConfirmations}
                onValueChange={(value) =>
                  updateSettings({ visualConfirmations: value })
                }
              />
            }
          />
          <SettingRow
            title="Vibraciones sutiles"
            description="Usa vibracion ligera al empezar o terminar acciones importantes."
            accessory={
              <Switch
                value={settings.vibrations}
                onValueChange={(value) => updateSettings({ vibrations: value })}
              />
            }
          />
        </SectionCard>

        <SectionCard>
          <SectionEyebrow>Lectura</SectionEyebrow>
          <Text style={styles.sectionTitle}>Ritmo de narracion</Text>
          <View style={styles.rateRow}>
            {[
              { label: "Pausado", value: 0.8 },
              { label: "Natural", value: 0.95 },
              { label: "Ligero", value: 1.05 },
            ].map((option) => {
              const active = settings.voiceRate === option.value;
              return (
                <Pressable
                  key={option.label}
                  onPress={() => updateSettings({ voiceRate: option.value })}
                  style={[
                    styles.rateChip,
                    active ? styles.rateChipActive : null,
                  ]}
                >
                  <Text
                    style={[
                      styles.rateChipText,
                      active ? styles.rateChipTextActive : null,
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </SectionCard>

        <SectionCard>
          <SectionEyebrow>Permisos</SectionEyebrow>
          <Text style={styles.sectionTitle}>Revisar accesos del dispositivo</Text>
          <Text style={styles.helperText}>
            Si mas adelante quieres activar voz, Bluetooth o sensores, puedes revisar los permisos desde aqui.
          </Text>
          <PrimaryButton
            icon="shield-checkmark-outline"
            label="Revisar permisos"
            onPress={() => router.push("/permissions-modal" as never)}
          />
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
    marginBottom: 10,
  },
  rateRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  rateChip: {
    backgroundColor: musePalette.surfaceMuted,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  rateChipActive: {
    backgroundColor: musePalette.primaryStrong,
  },
  rateChipText: {
    color: musePalette.text,
    fontSize: 13,
    fontWeight: "800",
  },
  rateChipTextActive: {
    color: "#fff",
  },
  helperText: {
    color: musePalette.textMuted,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
    marginBottom: 14,
  },
});
