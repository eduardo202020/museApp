import { AppScreen, SectionCard, SectionEyebrow, TopBar } from '@/components/museiq/ui';
import { musePalette } from '@/components/museiq/theme';
import { useMuseIQ } from '@/providers/museiq-provider';
import { DrawerActions } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';

export default function AyudaScreen() {
  const navigation = useNavigation();
  const { helpFaq } = useMuseIQ();

  return (
    <AppScreen>
      <TopBar
        title="MuseIQ"
        subtitle="Ayuda"
        left={
          <Pressable onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
            <Ionicons color={musePalette.primary} name="menu" size={28} />
          </Pressable>
        }
      />

      <SectionCard>
        <SectionEyebrow>Cómo funciona MuseIQ</SectionEyebrow>
        <Text style={styles.text}>
          MuseIQ detecta la sala, estima tu posición dentro del espacio y te sugiere la obra más probable. Si la detección no es suficiente, la pestaña Obras te deja corregir el flujo manualmente.
        </Text>
      </SectionCard>

      <SectionCard>
        <SectionEyebrow>Qué hacer si no detecta bien</SectionEyebrow>
        <Text style={styles.text}>Abre la pestaña Obras, selecciona manualmente la pieza que tienes delante y verifica Bluetooth y ubicación en Ajustes.</Text>
      </SectionCard>

      <SectionCard>
        <SectionEyebrow>Preguntas frecuentes</SectionEyebrow>
        {helpFaq.map((item) => (
          <Text key={item.question} style={styles.faqItem}>
            {item.question}
            {'\n'}
            <Text style={styles.answer}>{item.answer}</Text>
          </Text>
        ))}
      </SectionCard>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  text: {
    color: musePalette.textMuted,
    fontSize: 14,
    lineHeight: 22,
  },
  faqItem: {
    color: musePalette.text,
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 22,
    marginBottom: 14,
  },
  answer: {
    color: musePalette.textMuted,
    fontSize: 14,
    fontWeight: '500',
  },
});
