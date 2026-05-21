import { musePalette } from "@/components/museiq/theme";
import {
  AppScreen,
  SectionCard,
  SectionEyebrow,
  TopBar,
} from "@/components/museiq/ui";
import { getArtworkImageSource } from "@/lib/artwork-images";
import { useMuseIQ } from "@/providers/museiq-provider";
import { Ionicons } from "@expo/vector-icons";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

function MenuButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.menuButton}>
      <Ionicons color={musePalette.primary} name="menu" size={18} />
    </Pressable>
  );
}

export default function FavoritosScreen() {
  const navigation = useNavigation();
  const {
    favoriteArtworkIds,
    findArtworkById,
    findRoomById,
    toggleFavoriteArtwork,
  } = useMuseIQ();
  const favoriteArtworks = favoriteArtworkIds
    .map((id) => findArtworkById(id))
    .filter(Boolean);

  return (
    <View style={styles.screen}>
      <AppScreen contentContainerStyle={styles.content}>
        <TopBar
          title="MuseIQ"
          subtitle="Favoritos"
          left={
            <MenuButton
              onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            />
          }
        />

        <SectionCard>
          <SectionEyebrow>Coleccion personal</SectionEyebrow>
          <Text style={styles.sectionTitle}>Obras guardadas</Text>
          <Text style={styles.bodyText}>
            Marca obras desde la ficha para volver a ellas rapidamente.
          </Text>
        </SectionCard>

        {favoriteArtworks.length ? (
          <View style={styles.list}>
            {favoriteArtworks.map((artwork) => {
              const room = findRoomById(artwork?.roomId);
              return (
                <View key={artwork?.id} style={styles.artworkCard}>
                  <Pressable
                    onPress={() =>
                      router.push({
                        pathname: "/artwork-detail",
                        params: { artworkId: artwork?.id },
                      } as never)
                    }
                    style={({ pressed }) => [
                      styles.artworkMain,
                      pressed ? styles.pressed : null,
                    ]}
                  >
                    <ArtworkThumb image={artwork?.image} />
                    <View style={styles.artworkCopy}>
                      <Text numberOfLines={1} style={styles.artworkTitle}>
                        {artwork?.title}
                      </Text>
                      <Text numberOfLines={1} style={styles.artworkMeta}>
                        {room?.name ?? "Sala"} · {artwork?.period}
                      </Text>
                    </View>
                  </Pressable>
                  <Pressable
                    onPress={() => artwork?.id && toggleFavoriteArtwork(artwork.id)}
                    style={({ pressed }) => [
                      styles.favoriteButton,
                      pressed ? styles.pressed : null,
                    ]}
                  >
                    <Ionicons color="#FFFFFF" name="heart" size={20} />
                  </Pressable>
                </View>
              );
            })}
          </View>
        ) : (
          <SectionCard style={styles.emptyCard}>
            <Ionicons color={musePalette.primary} name="heart-outline" size={38} />
            <Text style={styles.emptyTitle}>No tienes favoritos todavia</Text>
            <Text style={styles.bodyText}>
              Abre una ficha de obra y toca el corazon para guardarla.
            </Text>
          </SectionCard>
        )}
      </AppScreen>
    </View>
  );
}

function ArtworkThumb({ image }: { image?: string }) {
  const source = getArtworkImageSource(image);
  return source ? (
    <Image source={source} style={styles.thumb} contentFit="cover" />
  ) : (
    <View style={[styles.thumb, styles.thumbFallback]}>
      <Ionicons color={musePalette.primary} name="image-outline" size={22} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: musePalette.background,
    flex: 1,
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
  bodyText: {
    color: musePalette.textMuted,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 21,
  },
  list: {
    gap: 10,
  },
  artworkCard: {
    alignItems: "center",
    backgroundColor: musePalette.surface,
    borderColor: musePalette.border,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    minHeight: 82,
    padding: 12,
  },
  artworkMain: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: 12,
  },
  thumb: {
    backgroundColor: musePalette.surfaceMuted,
    borderRadius: 12,
    height: 58,
    overflow: "hidden",
    width: 58,
  },
  thumbFallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  artworkCopy: {
    flex: 1,
    gap: 5,
  },
  artworkTitle: {
    color: musePalette.text,
    fontSize: 15,
    fontWeight: "900",
  },
  artworkMeta: {
    color: musePalette.textMuted,
    fontSize: 12,
    fontWeight: "700",
  },
  favoriteButton: {
    alignItems: "center",
    backgroundColor: musePalette.primary,
    borderRadius: 999,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  emptyCard: {
    alignItems: "center",
  },
  emptyTitle: {
    color: musePalette.text,
    fontSize: 17,
    fontWeight: "900",
    textAlign: "center",
  },
  pressed: {
    opacity: 0.86,
  },
});

