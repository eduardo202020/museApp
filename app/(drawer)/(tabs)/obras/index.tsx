import { musePalette } from '@/components/museiq/theme';
import { AppScreen, PrimaryButton, SectionCard, SectionEyebrow, TopBar } from '@/components/museiq/ui';
import { useMuseIQ } from '@/providers/museiq-provider';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { Image } from 'expo-image';
import { router, useNavigation } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function ObrasPorSalaScreen() {
  const navigation = useNavigation();
  const { currentArtworkId, currentRoom, getArtworksForRoom, selectArtwork, visitedArtworkIds } = useMuseIQ();
  const artworks = getArtworksForRoom(currentRoom?.id ?? '');

  return (
    <AppScreen contentContainerStyle={{ paddingBottom: 120 }}>
      <TopBar
        title="MuseIQ"
        subtitle="Obras por sala"
        left={
          <Pressable onPress={() => navigation.dispatch(DrawerActions.openDrawer())}>
            <Ionicons color={musePalette.primary} name="menu" size={28} />
          </Pressable>
        }
      />

      <SectionCard>
        <SectionEyebrow>Fallback manual</SectionEyebrow>
        <Text style={styles.title}>Sala detectada: {currentRoom?.name ?? 'Sin detectar'}</Text>
        <Text style={styles.description}>
          Si la app no está segura de la obra actual, puedes elegirla manualmente y recalibrar el recorrido.
        </Text>
      </SectionCard>

      {artworks.map((artwork) => {
        const isCurrent = artwork.id === currentArtworkId;
        const hasVisited = visitedArtworkIds.includes(artwork.id);
        const status = isCurrent ? 'actual' : hasVisited ? 'vista' : 'pendiente';

        return (
          <Pressable
            key={artwork.id}
            onPress={() => {
              selectArtwork(artwork.id);
              router.push({
                pathname: '/obra/[id]',
                params: { id: artwork.id },
              } as never);
            }}
            style={({ pressed }) => [styles.itemCard, pressed ? { opacity: 0.92 } : null]}>
            <Image contentFit="cover" source={{ uri: artwork.image }} style={styles.thumbnail} />
            <View style={styles.itemBody}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemOrder}>{artwork.order.toString().padStart(2, '0')}</Text>
                <Text style={[styles.statusBadge, isCurrent ? styles.statusCurrent : hasVisited ? styles.statusVisited : styles.statusPending]}>
                  {status}
                </Text>
              </View>
              <Text style={styles.itemTitle}>{artwork.title}</Text>
              <Text style={styles.itemMeta}>
                {artwork.author} · {artwork.durationMinutes} min
              </Text>
              <Text numberOfLines={2} style={styles.itemDescription}>
                {artwork.summary}
              </Text>
              <PrimaryButton
                icon="checkmark-circle"
                label="Estoy viendo esta obra"
                onPress={() => {
                  selectArtwork(artwork.id);
                  router.push({
                    pathname: '/obra/[id]',
                    params: { id: artwork.id },
                  } as never);
                }}
              />
            </View>
          </Pressable>
        );
      })}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: musePalette.text,
    fontSize: 24,
    fontWeight: '900',
  },
  description: {
    color: musePalette.textMuted,
    fontSize: 14,
    lineHeight: 21,
  },
  itemCard: {
    backgroundColor: musePalette.surface,
    borderColor: musePalette.border,
    borderRadius: 28,
    borderWidth: 1,
    gap: 14,
    overflow: 'hidden',
    padding: 14,
  },
  thumbnail: {
    borderRadius: 22,
    height: 180,
    width: '100%',
  },
  itemBody: {
    gap: 10,
  },
  itemHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemOrder: {
    color: musePalette.primary,
    fontSize: 16,
    fontWeight: '900',
  },
  itemTitle: {
    color: musePalette.text,
    fontSize: 22,
    fontWeight: '800',
  },
  itemMeta: {
    color: musePalette.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  itemDescription: {
    color: musePalette.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  statusBadge: {
    borderRadius: 999,
    fontSize: 11,
    fontWeight: '900',
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 5,
    textTransform: 'uppercase',
  },
  statusCurrent: {
    backgroundColor: musePalette.primarySoft,
    color: musePalette.primary,
  },
  statusVisited: {
    backgroundColor: '#DCF7E8',
    color: musePalette.success,
  },
  statusPending: {
    backgroundColor: musePalette.surfaceMuted,
    color: musePalette.textMuted,
  },
});
