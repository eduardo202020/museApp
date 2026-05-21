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

export default function MisVisitasScreen() {
  const navigation = useNavigation();
  const { findArtworkById, findRoomById, visitedArtworkIds } = useMuseIQ();
  const visitedArtworks = [...visitedArtworkIds]
    .reverse()
    .map((id) => findArtworkById(id))
    .filter(Boolean);

  return (
    <View style={styles.screen}>
      <AppScreen contentContainerStyle={styles.content}>
        <TopBar
          title="MuseIQ"
          subtitle="Mis visitas"
          left={
            <MenuButton
              onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            />
          }
        />

        <SectionCard>
          <SectionEyebrow>Recorrido</SectionEyebrow>
          <Text style={styles.sectionTitle}>Obras vistas</Text>
          <Text style={styles.bodyText}>
            Revisa las piezas que ya abriste durante esta visita.
          </Text>
        </SectionCard>

        {visitedArtworks.length ? (
          <View style={styles.list}>
            {visitedArtworks.map((artwork) => {
              const room = findRoomById(artwork?.roomId);
              return (
                <Pressable
                  key={artwork?.id}
                  onPress={() =>
                    router.push({
                      pathname: "/artwork-detail",
                      params: { artworkId: artwork?.id },
                    } as never)
                  }
                  style={({ pressed }) => [
                    styles.artworkCard,
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
                  <Ionicons color={musePalette.textMuted} name="chevron-forward" size={20} />
                </Pressable>
              );
            })}
          </View>
        ) : (
          <SectionCard style={styles.emptyCard}>
            <Ionicons color={musePalette.primary} name="map-outline" size={38} />
            <Text style={styles.emptyTitle}>Aun no hay visitas registradas</Text>
            <Text style={styles.bodyText}>
              Abre una obra desde Home AR para verla aqui.
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
    gap: 12,
    minHeight: 82,
    padding: 12,
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

