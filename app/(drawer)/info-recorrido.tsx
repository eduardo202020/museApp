import { musePalette } from "@/components/museiq/theme";
import {
  AppScreen,
  SectionCard,
  SectionEyebrow,
  StatusPill,
  TopBar,
} from "@/components/museiq/ui";
import { useMuseIQ } from "@/providers/museiq-provider";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
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
    currentRoom,
    museumProfile,
    rooms,
    routeProgress,
    routeTotal,
  } = useMuseIQ();

  return (
    <View style={styles.screen}>
      <AppScreen contentContainerStyle={styles.content}>
        <TopBar
          title="MuseIQ"
          subtitle="Info del recorrido"
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

        <SectionCard>
          <SectionEyebrow>Donde vas</SectionEyebrow>
          <Text style={styles.sectionTitle}>Tu punto actual del recorrido</Text>
          <View style={styles.infoList}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Sala actual</Text>
              <Text style={styles.infoValue}>{currentRoom?.name ?? "No disponible"}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Obra actual</Text>
              <Text style={styles.infoValue}>{currentArtwork?.title ?? "No disponible"}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Progreso</Text>
              <Text style={styles.infoValue}>{`${routeProgress} de ${routeTotal}`}</Text>
            </View>
          </View>
        </SectionCard>

        <SectionCard>
          <SectionEyebrow>Museo</SectionEyebrow>
          <Text style={styles.sectionTitle}>Ficha general</Text>
          <View style={styles.infoList}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Museo</Text>
              <Text style={styles.infoValue}>{museumProfile?.name ?? "MuseIQ"}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Ciudad</Text>
              <Text style={styles.infoValue}>{museumProfile?.city ?? "No disponible"}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Pais</Text>
              <Text style={styles.infoValue}>{museumProfile?.country ?? "No disponible"}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Soporte</Text>
              <Text style={styles.infoValue}>{museumProfile?.supportContact ?? "No disponible"}</Text>
            </View>
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
  infoList: {
    gap: 10,
    marginTop: 10,
  },
  infoRow: {
    alignItems: "center",
    backgroundColor: musePalette.surfaceMuted,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  infoLabel: {
    color: musePalette.textMuted,
    fontSize: 13,
    fontWeight: "700",
  },
  infoValue: {
    color: musePalette.text,
    flex: 1,
    fontSize: 13,
    fontWeight: "800",
    marginLeft: 16,
    textAlign: "right",
  },
});
