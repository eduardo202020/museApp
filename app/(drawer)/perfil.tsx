import { musePalette } from "@/components/museiq/theme";
import { useMuseIQ } from "@/providers/museiq-provider";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import type { PropsWithChildren } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PerfilScreen() {
  const {
    analyticsSummary,
    favoriteArtworkIds,
    rooms,
    visitedArtworkIds,
  } = useMuseIQ();
  const visitedCount = visitedArtworkIds.length;
  const levelLabel =
    visitedCount >= 12
      ? "Nivel 3 - Curador curioso"
      : visitedCount >= 5
        ? "Nivel 2 - Explorador"
        : "Nivel 1 - Explorador";

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safeArea}>
        <Header title="Mi perfil" rightIcon="pencil-outline" />

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.profileBlock}>
            <View style={styles.avatar}>
              <Ionicons color="#FFFFFF" name="person" size={45} />
            </View>
            <View style={styles.profileCopy}>
              <Text style={styles.name}>Visitante</Text>
              <Text style={styles.email}>visitante@museiq.app</Text>
              <View style={styles.levelBadge}>
                <Ionicons color={musePalette.primary} name="ribbon-outline" size={16} />
                <Text style={styles.levelText}>{levelLabel}</Text>
              </View>
            </View>
          </View>

          <DarkCard>
            <Text style={styles.cardTitle}>Resumen de actividad</Text>
            <View style={styles.statsRow}>
              <Stat icon="business-outline" label="Museos visitados" value={1} />
              <Stat icon="map-outline" label="Salas exploradas" value={rooms.length} />
              <Stat icon="qr-code-outline" label="Obras escaneadas" value={visitedCount} />
              <Stat icon="chatbubble-ellipses-outline" label="Preguntas realizadas" value={analyticsSummary.totalQuestions} />
            </View>
          </DarkCard>

          <DarkCard>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardTitle}>Insignias</Text>
              <Text style={styles.linkText}>Ver todas</Text>
            </View>
            <View style={styles.badgesRow}>
              <Badge icon="business-outline" label="Primera visita" points="10 pts" active />
              <Badge icon="ribbon-outline" label="Explorador" points="25 pts" active />
              <Badge icon="medal-outline" label="Curioso" points="50 pts" active={favoriteArtworkIds.length > 0} />
              <Badge icon="lock-closed-outline" label="Experto" points="100 pts" />
            </View>
          </DarkCard>

          <DarkCard style={styles.listCard}>
            <ProfileRow icon="trophy-outline" label="Logros" />
            <ProfileRow icon="bar-chart-outline" label="Estadisticas detalladas" />
            <ProfileRow icon="options-outline" label="Preferencias" />
            <ProfileRow icon="cloud-upload-outline" label="Sincronizar datos" last />
          </DarkCard>

          <Text style={styles.footerText}>
            Tus datos se almacenan localmente y se sincronizan de forma segura.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function Header({ title, rightIcon }: { title: string; rightIcon?: keyof typeof Ionicons.glyphMap }) {
  return (
    <View style={styles.header}>
      <Pressable onPress={() => router.back()} style={styles.headerButton}>
        <Ionicons color="#FFFFFF" name="arrow-back" size={28} />
      </Pressable>
      <Text style={styles.headerTitle}>{title}</Text>
      <Pressable style={styles.headerButton}>
        {rightIcon ? <Ionicons color="#FFFFFF" name={rightIcon} size={26} /> : null}
      </Pressable>
    </View>
  );
}

function DarkCard({ children, style }: PropsWithChildren<{ style?: object }>) {
  return <View style={[styles.card, style]}>{children}</View>;
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: number;
}) {
  return (
    <View style={styles.stat}>
      <View style={styles.statIcon}>
        <Ionicons color={musePalette.primary} name={icon} size={24} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function Badge({
  active,
  icon,
  label,
  points,
}: {
  active?: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  points: string;
}) {
  return (
    <View style={styles.badge}>
      <View style={[styles.badgeIcon, active ? styles.badgeIconActive : null]}>
        <Ionicons color={active ? musePalette.primary : "rgba(255,255,255,0.46)"} name={icon} size={25} />
      </View>
      <Text style={styles.badgeLabel}>{label}</Text>
      <Text style={styles.badgePoints}>{points}</Text>
    </View>
  );
}

function ProfileRow({
  icon,
  label,
  last,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  last?: boolean;
}) {
  return (
    <Pressable style={[styles.profileRowItem, last ? styles.profileRowItemLast : null]}>
      <Ionicons color="#FFFFFF" name={icon} size={24} />
      <Text style={styles.profileRowLabel}>{label}</Text>
      <Ionicons color="#FFFFFF" name="chevron-forward" size={22} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: "#02070B",
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    minHeight: 68,
    paddingHorizontal: 22,
  },
  headerButton: {
    alignItems: "center",
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  headerTitle: {
    color: "#FFFFFF",
    flex: 1,
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
  },
  content: {
    gap: 14,
    paddingBottom: 34,
    paddingHorizontal: 22,
  },
  profileBlock: {
    alignItems: "center",
    flexDirection: "row",
    gap: 16,
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  avatar: {
    alignItems: "center",
    backgroundColor: "rgba(22,137,206,0.24)",
    borderColor: "rgba(255,255,255,0.24)",
    borderRadius: 999,
    borderWidth: 1,
    height: 88,
    justifyContent: "center",
    width: 88,
  },
  profileCopy: {
    flex: 1,
    gap: 6,
  },
  name: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900",
  },
  email: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 15,
    fontWeight: "600",
  },
  levelBadge: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "rgba(22,137,206,0.13)",
    borderColor: "rgba(22,137,206,0.38)",
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  levelText: {
    color: musePalette.primary,
    fontSize: 13,
    fontWeight: "900",
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.045)",
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  cardTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  cardHeaderRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  linkText: {
    color: musePalette.primary,
    fontSize: 14,
    fontWeight: "900",
  },
  statsRow: {
    flexDirection: "row",
    marginTop: 14,
  },
  stat: {
    alignItems: "center",
    borderRightColor: "rgba(255,255,255,0.14)",
    borderRightWidth: StyleSheet.hairlineWidth,
    flex: 1,
    gap: 6,
    minHeight: 102,
    paddingHorizontal: 4,
  },
  statIcon: {
    alignItems: "center",
    backgroundColor: "rgba(22,137,206,0.16)",
    borderRadius: 999,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  statValue: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
  },
  statLabel: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 16,
    textAlign: "center",
  },
  badgesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 18,
  },
  badge: {
    alignItems: "center",
    flex: 1,
    gap: 5,
  },
  badgeIcon: {
    alignItems: "center",
    borderColor: "rgba(255,255,255,0.24)",
    borderRadius: 999,
    borderStyle: "dashed",
    borderWidth: 1,
    height: 58,
    justifyContent: "center",
    width: 58,
  },
  badgeIconActive: {
    backgroundColor: "rgba(22,137,206,0.15)",
    borderColor: musePalette.primary,
    borderStyle: "solid",
  },
  badgeLabel: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },
  badgePoints: {
    color: "rgba(255,255,255,0.66)",
    fontSize: 12,
    fontWeight: "600",
  },
  listCard: {
    paddingVertical: 4,
  },
  profileRowItem: {
    alignItems: "center",
    borderBottomColor: "rgba(255,255,255,0.10)",
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: 16,
    minHeight: 58,
  },
  profileRowItemLast: {
    borderBottomWidth: 0,
  },
  profileRowLabel: {
    color: "#FFFFFF",
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
  },
  footerText: {
    color: "rgba(255,255,255,0.64)",
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 20,
    paddingHorizontal: 22,
    textAlign: "center",
  },
});
