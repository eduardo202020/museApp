import { musePalette } from '@/components/museiq/theme';
import { AppScreen, SectionCard, SectionEyebrow, SettingRow, TopBar } from '@/components/museiq/ui';
import { useMuseIQ } from '@/providers/museiq-provider';
import { DrawerActions } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import { Pressable, Switch, Text } from 'react-native';

export default function AjustesScreen() {
  const navigation = useNavigation();
  const { permissions, settings, updateSettings } = useMuseIQ();

  return (
    <AppScreen>
      <TopBar
        title="MuseIQ"
        subtitle="Ajustes"
        left={
          <Pressable onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
            <Ionicons color={musePalette.primary} name="menu" size={28} />
          </Pressable>
        }
      />

      <SectionCard>
        <SectionEyebrow>Narración</SectionEyebrow>
        <SettingRow
          title="Reproducción automática"
          description="Inicia la narración al detectar una obra con suficiente confianza."
          accessory={
            <Switch value={settings.autoPlay} onValueChange={(value) => updateSettings({ autoPlay: value })} />
          }
        />
        <SettingRow
          title="Subtítulos"
          description="Muestra apoyo visual mientras se reproduce la explicación."
          accessory={
            <Switch value={settings.subtitles} onValueChange={(value) => updateSettings({ subtitles: value })} />
          }
        />
        <SettingRow
          title="Velocidad de voz"
          description={`Actual: ${settings.voiceRate.toFixed(2)}x`}
          accessory={
            <Pressable onPress={() => updateSettings({ voiceRate: settings.voiceRate >= 1.05 ? 0.8 : Number((settings.voiceRate + 0.05).toFixed(2)) })}>
              <Text style={{ color: musePalette.primary, fontWeight: '800' }}>Cambiar</Text>
            </Pressable>
          }
        />
      </SectionCard>

      <SectionCard>
        <SectionEyebrow>Visual e interacción</SectionEyebrow>
        <SettingRow
          title="Contraste alto"
          description="Refuerza separación visual en textos y tarjetas."
          accessory={
            <Switch value={settings.highContrast} onValueChange={(value) => updateSettings({ highContrast: value })} />
          }
        />
        <SettingRow
          title="Vibración al cambiar de zona"
          description="Confirma visual y táctilmente un cambio de detección."
          accessory={
            <Switch value={settings.vibrations} onValueChange={(value) => updateSettings({ vibrations: value })} />
          }
        />
        <SettingRow
          title="Confirmaciones visuales"
          description="Muestra mensajes cortos cuando cambia la obra sugerida."
          accessory={
            <Switch
              value={settings.visualConfirmations}
              onValueChange={(value) => updateSettings({ visualConfirmations: value })}
            />
          }
        />
      </SectionCard>

      <SectionCard>
        <SectionEyebrow>Permisos</SectionEyebrow>
        <SettingRow
          title="Bluetooth"
          description={`Estado: ${permissions.bluetooth}`}
          accessory={<Text style={{ color: musePalette.textMuted }}>{permissions.bluetooth}</Text>}
        />
        <SettingRow
          title="Ubicación"
          description={`Estado: ${permissions.location}`}
          accessory={<Text style={{ color: musePalette.textMuted }}>{permissions.location}</Text>}
        />
        <SettingRow
          title="Micrófono"
          description={`Estado: ${permissions.microphone}`}
          accessory={<Text style={{ color: musePalette.textMuted }}>{permissions.microphone}</Text>}
        />
      </SectionCard>
    </AppScreen>
  );
}
