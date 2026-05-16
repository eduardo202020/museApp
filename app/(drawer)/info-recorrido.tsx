import { musePalette } from "@/components/museiq/theme";
import {
  AppScreen,
  PrimaryButton,
  SectionCard,
  SectionEyebrow,
  StatusPill,
  TopBar,
} from "@/components/museiq/ui";
import { useMuseIQ } from "@/providers/museiq-provider";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

function MenuButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.menuButton}>
      <Ionicons color={musePalette.primary} name="menu" size={18} />
    </Pressable>
  );
}

export default function InfoRecorridoScreen() {
  const navigation = useNavigation();
  const {
    artworks,
    currentArtwork,
    currentArtworkId,
    currentRoom,
    currentRouteStep,
    getArtworksForRoom,
    museumProfile,
    rooms,
    routeProgress,
    routeTotal,
    selectArtwork,
    setCurrentRoomById,
    visitedArtworkIds,
  } = useMuseIQ();

  const visibleRoom = currentRoom ?? rooms[0];
  const roomArtworks = visibleRoom ? getArtworksForRoom(visibleRoom.id) : [];

  const openArtworkChat = (artworkId: string) => {
    router.push({
      pathname: "/pregunta-voz-modal",
      params: { artworkId },
    } as never);
  };

  return (
    <View style={styles.screen}>
      <AppScreen contentContainerStyle={styles.content}>
        <TopBar
          title="MuseIQ"
          subtitle="Explora por salas y obras"
          left={
            <MenuButton
              onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            />
          }
        />

        <SectionCard style={styles.heroCard}>
          <SectionEyebrow>Visita</SectionEyebrow>
          <Text style={styles.heroTitle}>
            {museumProfile?.routeName ?? "Recorrido curatorial"}
          </Text>
          <Text style={styles.heroText}>
            {museumProfile?.description ??
              "Esta experiencia te acompana obra por obra con una guia conversacional."}
          </Text>
          <View style={styles.heroStats}>
            <StatusPill label={`${rooms.length} salas`} />
            <StatusPill label={`${artworks.length} obras`} tone="success" />
            <StatusPill
              label={`${museumProfile?.estimatedDurationMinutes ?? 0} min`}
              tone="warning"
            />
          </View>
        </SectionCard>

        <SectionCard style={styles.currentCard}>
          <SectionEyebrow>Ahora mismo</SectionEyebrow>
          <Text style={styles.sectionTitle}>
            {currentArtwork?.title ?? "Obra actual"}
          </Text>
          <Text style={styles.currentCopy}>
            {currentArtwork?.context ??
              "Selecciona una obra para leer su contexto y abrir el chat del guía."}
          </Text>
          <View style={styles.currentMetaRow}>
            <StatusPill label={currentRoom?.name ?? "Sala"} />
            <StatusPill label={`${routeProgress} de ${routeTotal}`} tone="success" />
          </View>
          {currentRouteStep?.hint ? (
            <Text style={styles.currentHint}>{currentRouteStep.hint}</Text>
          ) : null}
        </SectionCard>

        <SectionCard style={styles.explorerCard}>
          <SectionEyebrow>Explorador</SectionEyebrow>
          <Text style={styles.sectionTitle}>Recorre el museo a tu ritmo</Text>
          <Text style={styles.sectionCopy}>
            Cambia de sala, revisa obras del recorrido y abre el chat desde cualquier pieza.
          </Text>

          <View style={styles.roomChipRow}>
            {rooms.map((room) => (
              <Pressable
                key={room.id}
                onPress={() => setCurrentRoomById(room.id)}
                style={({ pressed }) => [
                  styles.roomChip,
                  visibleRoom?.id === room.id ? styles.roomChipActive : null,
                  pressed ? styles.pressed : null,
                ]}
              >
                <Text
                  style={[
                    styles.roomChipText,
                    visibleRoom?.id === room.id ? styles.roomChipTextActive : null,
                  ]}
                >
                  {room.name}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.roomSummaryCard}>
            <Text style={styles.roomSummaryTitle}>{visibleRoom?.name ?? "Sala"}</Text>
            <Text style={styles.roomSummaryText}>
              {visibleRoom?.description ?? "Selecciona una sala para comenzar."}
            </Text>
          </View>

          <View style={styles.artworkList}>
            {roomArtworks.map((artwork) => {
              const isCurrent = artwork.id === currentArtworkId;
              const isVisited = visitedArtworkIds.includes(artwork.id);

              return (
                <View
                  key={artwork.id}
                  style={[
                    styles.artworkCard,
                    isCurrent ? styles.artworkCardActive : null,
                  ]}
                >
                  <View style={styles.artworkHeader}>
                    <View style={styles.artworkHeaderMain}>
                      <Text
                        style={[
                          styles.artworkTitle,
                          isCurrent ? styles.artworkTitleActive : null,
                        ]}
                      >
                        {artwork.title}
                      </Text>
                      <Text
                        style={[
                          styles.artworkMeta,
                          isCurrent ? styles.artworkMetaActive : null,
                        ]}
                      >
                        {`${artwork.period} · ${artwork.technique}`}
                      </Text>
                    </View>
                    {isVisited ? (
                      <Ionicons
                        color={isCurrent ? "#FFFFFF" : musePalette.success}
                        name="checkmark-circle"
                        size={18}
                      />
                    ) : null}
                  </View>

                  <Text
                    style={[
                      styles.artworkSummary,
                      isCurrent ? styles.artworkSummaryActive : null,
                    ]}
                  >
                    {artwork.summary}
                  </Text>
                  <Text
                    style={[
                      styles.artworkRelation,
                      isCurrent ? styles.artworkRelationActive : null,
                    ]}
                  >
                    {artwork.roomRelation}
                  </Text>

                  <View style={styles.artworkActions}>
                    <Pressable
                      onPress={() => selectArtwork(artwork.id)}
                      style={({ pressed }) => [
                        styles.secondaryAction,
                        isCurrent ? styles.secondaryActionActive : null,
                        pressed ? styles.pressed : null,
                      ]}
                    >
                      <Text
                        style={[
                          styles.secondaryActionText,
                          isCurrent ? styles.secondaryActionTextActive : null,
                        ]}
                      >
                        {isCurrent ? "Vista actual" : "Ir a esta obra"}
                      </Text>
                    </Pressable>

                    <PrimaryButton
                      icon="chatbubble-ellipses"
                      label="Preguntar"
                      onPress={() => openArtworkChat(artwork.id)}
                      style={styles.askButton}
                    />
                  </View>
                </View>
              );
            })}
          </View>
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
  heroCard: {
    gap: 12,
  },
  currentCard: {
    gap: 12,
  },
  explorerCard: {
    gap: 12,
  },
  heroTitle: {
    color: musePalette.text,
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  heroText: {
    color: musePalette.textMuted,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 21,
  },
  heroStats: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  sectionTitle: {
    color: musePalette.text,
    fontSize: 18,
    fontWeight: "900",
  },
  sectionCopy: {
    color: musePalette.textMuted,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 19,
  },
  currentCopy: {
    color: musePalette.text,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 21,
  },
  currentMetaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  currentHint: {
    color: musePalette.primary,
    fontSize: 12,
    fontWeight: "800",
    lineHeight: 18,
  },
  roomChipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  roomChip: {
    backgroundColor: "#FFFDFC",
    borderColor: musePalette.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  roomChipActive: {
    backgroundColor: musePalette.primary,
    borderColor: musePalette.primary,
  },
  roomChipText: {
    color: musePalette.primary,
    fontSize: 12,
    fontWeight: "800",
  },
  roomChipTextActive: {
    color: "#FFFFFF",
  },
  roomSummaryCard: {
    backgroundColor: musePalette.surfaceMuted,
    borderRadius: 16,
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  roomSummaryTitle: {
    color: musePalette.text,
    fontSize: 15,
    fontWeight: "800",
  },
  roomSummaryText: {
    color: musePalette.textMuted,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 19,
  },
  artworkList: {
    gap: 10,
  },
  artworkCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#D9E6F2",
    borderRadius: 18,
    borderWidth: 1,
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  artworkCardActive: {
    backgroundColor: musePalette.primary,
    borderColor: musePalette.primary,
  },
  artworkHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-between",
  },
  artworkHeaderMain: {
    flex: 1,
    gap: 4,
  },
  artworkTitle: {
    color: musePalette.text,
    fontSize: 15,
    fontWeight: "900",
    lineHeight: 20,
  },
  artworkTitleActive: {
    color: "#FFFFFF",
  },
  artworkMeta: {
    color: musePalette.textMuted,
    fontSize: 12,
    fontWeight: "700",
  },
  artworkMetaActive: {
    color: "rgba(255,255,255,0.82)",
  },
  artworkSummary: {
    color: musePalette.text,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 19,
  },
  artworkSummaryActive: {
    color: "#FFFFFF",
  },
  artworkRelation: {
    color: musePalette.primary,
    fontSize: 12,
    fontWeight: "800",
    lineHeight: 18,
  },
  artworkRelationActive: {
    color: "rgba(255,255,255,0.9)",
  },
  artworkActions: {
    flexDirection: "row",
    gap: 8,
  },
  secondaryAction: {
    alignItems: "center",
    backgroundColor: "#F4F8FC",
    borderColor: musePalette.border,
    borderRadius: 999,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 44,
    paddingHorizontal: 14,
  },
  secondaryActionActive: {
    backgroundColor: "rgba(255,255,255,0.14)",
    borderColor: "rgba(255,255,255,0.32)",
  },
  secondaryActionText: {
    color: musePalette.primary,
    fontSize: 12,
    fontWeight: "800",
  },
  secondaryActionTextActive: {
    color: "#FFFFFF",
  },
  askButton: {
    flex: 1,
  },
  pressed: {
    opacity: 0.86,
  },
});
