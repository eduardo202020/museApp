import { musePalette } from '@/components/museiq/theme';
import { AppScreen, PrimaryButton, SecondaryButton, SectionCard, SectionEyebrow, TopBar } from '@/components/museiq/ui';
import { useMuseIQ } from '@/providers/museiq-provider';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { router, useNavigation } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function MiVisitaScreen() {
  const navigation = useNavigation();
  const { continueVisit, repeatArtworkNarration, selectArtwork, visitedArtworkIds, findArtworkById } = useMuseIQ();
  const recentArtworks = [...visitedArtworkIds].reverse().map((id) => findArtworkById(id)).filter(Boolean);

  return (
    <AppScreen contentContainerStyle={{ paddingBottom: 120 }}>
      <TopBar
        title="MuseIQ"
        subtitle="Mi visita"
        left={
          <Pressable onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
            <Ionicons color={musePalette.primary} name="menu" size={28} />
          </Pressable>
        }
      />

      <SectionCard>
        <SectionEyebrow>Continuar recorrido</SectionEyebrow>
        <Text style={styles.heading}>Retoma donde te quedaste</Text>
        <Text style={styles.description}>
          MuseIQ guarda las últimas obras vistas para que puedas volver a escuchar o seguir el recorrido sin perder el hilo.
        </Text>
        <PrimaryButton icon="play-forward" label="Retomar donde me quedé" onPress={continueVisit} />
      </SectionCard>

      <SectionCard>
        <SectionEyebrow>Obras vistas recientemente</SectionEyebrow>
        {recentArtworks.map((artwork) => (
          <View key={artwork?.id} style={styles.historyRow}>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={styles.historyTitle}>{artwork?.title}</Text>
              <Text style={styles.historyMeta}>
                {artwork?.author} · {artwork?.period}
              </Text>
            </View>
            <SecondaryButton
              icon="information-circle-outline"
              label="Abrir"
              onPress={() => {
                if (!artwork) {
                  return;
                }

                selectArtwork(artwork.id);
                router.push({
                  pathname: '/obra/[id]',
                  params: { id: artwork.id },
                } as never);
              }}
            />
          </View>
        ))}
      </SectionCard>

      <SectionCard>
        <SectionEyebrow>Audios repetibles</SectionEyebrow>
        <Text style={styles.description}>Puedes volver a escuchar la última explicación o repetir las respuestas generadas durante la visita.</Text>
        <PrimaryButton icon="refresh" label="Repetir explicación más reciente" onPress={repeatArtworkNarration} />
      </SectionCard>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  heading: {
    color: musePalette.text,
    fontSize: 24,
    fontWeight: '900',
  },
  description: {
    color: musePalette.textMuted,
    fontSize: 14,
    lineHeight: 21,
  },
  historyRow: {
    alignItems: 'center',
    borderBottomColor: musePalette.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 12,
  },
  historyTitle: {
    color: musePalette.text,
    fontSize: 16,
    fontWeight: '800',
  },
  historyMeta: {
    color: musePalette.textMuted,
    fontSize: 13,
  },
});
