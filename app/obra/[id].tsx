import { musePalette } from '@/components/museiq/theme';
import { AppScreen, FloatingVoiceButton, PrimaryButton, SecondaryButton, SectionCard } from '@/components/museiq/ui';
import { useMuseIQ } from '@/providers/museiq-provider';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function ObraDetalleScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const { findArtworkById, goToNextArtwork, repeatArtworkNarration, selectArtwork } = useMuseIQ();
  const artwork = findArtworkById(params.id);

  if (!artwork) {
    return (
      <AppScreen scroll={false}>
        <Text style={{ color: musePalette.text, fontSize: 22, fontWeight: '800' }}>No encontramos esta obra.</Text>
      </AppScreen>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: musePalette.background }}>
      <AppScreen contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons color={musePalette.primary} name="arrow-back" size={24} />
          </Pressable>
          <Text numberOfLines={1} style={styles.headerTitle}>
            {artwork.title}
          </Text>
        </View>

        <Image contentFit="cover" source={{ uri: artwork.image }} style={styles.image} />

        <SectionCard>
          <Text style={styles.title}>{artwork.title}</Text>
          <Text style={styles.meta}>
            {artwork.author} · {artwork.technique}
          </Text>
          <Text style={styles.meta}>
            {artwork.year} · {artwork.roomId.replace('_', ' ')}
          </Text>
          <Text style={styles.body}>{artwork.summary}</Text>
        </SectionCard>

        <SectionCard>
          <Text style={styles.sectionTitle}>Contexto ampliado</Text>
          <Text style={styles.body}>{artwork.context}</Text>
          <Text style={styles.sectionTitle}>Relación con la sala</Text>
          <Text style={styles.body}>{artwork.roomRelation}</Text>
        </SectionCard>

        <SectionCard>
          <PrimaryButton icon="play" label="Escuchar explicación" onPress={() => {
            selectArtwork(artwork.id);
            repeatArtworkNarration();
          }} />
          <SecondaryButton icon="pause" label="Pausar" onPress={() => {}} />
          <SecondaryButton icon="refresh" label="Repetir" onPress={repeatArtworkNarration} />
          <SecondaryButton
            icon="help-circle-outline"
            label="Preguntar sobre esta obra"
            onPress={() =>
              router.push({
                pathname: '/pregunta-voz-modal',
                params: { artworkId: artwork.id },
              } as never)
            }
          />
          <PrimaryButton icon="arrow-forward" label="Siguiente obra" onPress={goToNextArtwork} />
        </SectionCard>
      </AppScreen>

      <FloatingVoiceButton
        onPress={() =>
          router.push({
            pathname: '/pregunta-voz-modal',
            params: { artworkId: artwork.id },
          } as never)
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: musePalette.surface,
    borderRadius: 999,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  headerTitle: {
    color: musePalette.text,
    flex: 1,
    fontSize: 20,
    fontWeight: '900',
  },
  image: {
    borderRadius: 28,
    height: 360,
    width: '100%',
  },
  title: {
    color: musePalette.text,
    fontSize: 28,
    fontWeight: '900',
  },
  meta: {
    color: musePalette.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  sectionTitle: {
    color: musePalette.text,
    fontSize: 16,
    fontWeight: '800',
  },
  body: {
    color: musePalette.textMuted,
    fontSize: 14,
    lineHeight: 22,
  },
});
