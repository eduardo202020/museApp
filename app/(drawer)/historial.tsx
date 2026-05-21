import { musePalette } from "@/components/museiq/theme";
import {
  AppScreen,
  SectionCard,
  SectionEyebrow,
  TopBar,
} from "@/components/museiq/ui";
import { useMuseIQ } from "@/providers/museiq-provider";
import { Ionicons } from "@expo/vector-icons";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

function MenuButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.menuButton}>
      <Ionicons color={musePalette.primary} name="menu" size={18} />
    </Pressable>
  );
}

export default function HistorialScreen() {
  const navigation = useNavigation();
  const {
    analyticsSummary,
    favoriteArtworkIds,
    findArtworkById,
    visitedArtworkIds,
  } = useMuseIQ();
  const recentArtworks = [...visitedArtworkIds]
    .reverse()
    .slice(0, 6)
    .map((id) => findArtworkById(id))
    .filter(Boolean);

  return (
    <View style={styles.screen}>
      <AppScreen contentContainerStyle={styles.content}>
        <TopBar
          title="MuseIQ"
          subtitle="Historial"
          left={
            <MenuButton
              onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            />
          }
        />

        <SectionCard>
          <SectionEyebrow>Actividad</SectionEyebrow>
          <Text style={styles.sectionTitle}>Resumen de la visita</Text>
          <View style={styles.metricsGrid}>
            <Metric label="Eventos" value={analyticsSummary.totalEvents} />
            <Metric label="Preguntas" value={analyticsSummary.totalQuestions} />
            <Metric label="Voz" value={analyticsSummary.totalVoiceStarts} />
            <Metric label="Favoritos" value={favoriteArtworkIds.length} />
          </View>
        </SectionCard>

        <SectionCard>
          <SectionEyebrow>Recientes</SectionEyebrow>
          <Text style={styles.sectionTitle}>Ultimas obras abiertas</Text>
          {recentArtworks.length ? (
            <View style={styles.timeline}>
              {recentArtworks.map((artwork, index) => (
                <Pressable
                  key={`${artwork?.id}-${index}`}
                  onPress={() =>
                    router.push({
                      pathname: "/artwork-detail",
                      params: { artworkId: artwork?.id },
                    } as never)
                  }
                  style={({ pressed }) => [
                    styles.timelineItem,
                    pressed ? styles.pressed : null,
                  ]}
                >
                  <View style={styles.timelineDot} />
                  <View style={styles.timelineCopy}>
                    <Text numberOfLines={1} style={styles.timelineTitle}>
                      {artwork?.title}
                    </Text>
                    <Text numberOfLines={1} style={styles.timelineMeta}>
                      {artwork?.period} · {artwork?.technique}
                    </Text>
                  </View>
                  <Ionicons color={musePalette.textMuted} name="chevron-forward" size={18} />
                </Pressable>
              ))}
            </View>
          ) : (
            <Text style={styles.bodyText}>Aun no hay actividad reciente.</Text>
          )}
        </SectionCard>
      </AppScreen>
    </View>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
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
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  metric: {
    backgroundColor: musePalette.surfaceMuted,
    borderRadius: 16,
    flexBasis: "47%",
    flexGrow: 1,
    gap: 4,
    padding: 14,
  },
  metricValue: {
    color: musePalette.primary,
    fontSize: 23,
    fontWeight: "900",
  },
  metricLabel: {
    color: musePalette.textMuted,
    fontSize: 12,
    fontWeight: "800",
  },
  timeline: {
    gap: 10,
  },
  timelineItem: {
    alignItems: "center",
    backgroundColor: musePalette.surfaceMuted,
    borderRadius: 16,
    flexDirection: "row",
    gap: 12,
    minHeight: 62,
    paddingHorizontal: 14,
  },
  timelineDot: {
    backgroundColor: musePalette.primary,
    borderRadius: 999,
    height: 10,
    width: 10,
  },
  timelineCopy: {
    flex: 1,
    gap: 4,
  },
  timelineTitle: {
    color: musePalette.text,
    fontSize: 14,
    fontWeight: "900",
  },
  timelineMeta: {
    color: musePalette.textMuted,
    fontSize: 12,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.86,
  },
});

