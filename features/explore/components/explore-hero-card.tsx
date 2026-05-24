import { musePalette } from "@/components/museiq/theme";
import type { MuseumInfo } from "@/datos";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

type ExploreHeroCardProps = {
  artworksCount: number;
  museumProfile: MuseumInfo | null;
  roomsCount: number;
};

export function ExploreHeroCard({
  artworksCount,
  museumProfile,
  roomsCount,
}: ExploreHeroCardProps) {
  return (
    <View style={styles.heroCard}>
      <View style={styles.heroIcon}>
        <Ionicons color={musePalette.primary} name="map-outline" size={30} />
      </View>
      <View style={styles.heroCopy}>
        <Text style={styles.heroTitle}>
          {museumProfile?.routeName ?? "Recorrido curatorial"}
        </Text>
        <Text style={styles.heroText}>
          {museumProfile?.description ??
            "Explora las salas, revisa obras y abre el guia de IA desde cada pieza."}
        </Text>
      </View>
      <View style={styles.statsRow}>
        <StatPill icon="business-outline" label={`${roomsCount} salas`} />
        <StatPill icon="cube-outline" label={`${artworksCount} obras`} />
        <StatPill
          icon="time-outline"
          label={`${museumProfile?.estimatedDurationMinutes ?? 0} min`}
        />
      </View>
    </View>
  );
}

function StatPill({
  icon,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}) {
  return (
    <View style={styles.statPill}>
      <Ionicons color={musePalette.primary} name={icon} size={16} />
      <Text style={styles.statPillText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: "rgba(255,255,255,0.045)",
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: 16,
    borderWidth: 1,
    gap: 14,
    padding: 16,
  },
  heroIcon: {
    alignItems: "center",
    backgroundColor: "rgba(22,137,206,0.14)",
    borderColor: "rgba(22,137,206,0.36)",
    borderRadius: 999,
    borderWidth: 1,
    height: 54,
    justifyContent: "center",
    width: 54,
  },
  heroCopy: {
    gap: 7,
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "900",
    lineHeight: 28,
  },
  heroText: {
    color: "rgba(255,255,255,0.68)",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 21,
  },
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  statPill: {
    alignItems: "center",
    backgroundColor: "rgba(22,137,206,0.12)",
    borderColor: "rgba(22,137,206,0.36)",
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: 7,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  statPillText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
});
