import { musePalette } from "@/components/museiq/theme";
import { PrimaryButton } from "@/components/museiq/ui";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

type WelcomeOverlayProps = {
  durationMinutes: number;
  museumName: string;
  onStart: () => void;
  routeName: string;
};

export function WelcomeOverlay({
  durationMinutes,
  museumName,
  onStart,
  routeName,
}: WelcomeOverlayProps) {
  return (
    <View style={styles.welcomeOverlay}>
      <View style={styles.welcomeCard}>
        <Text style={styles.welcomeEyebrow}>Bienvenida</Text>
        <Text style={styles.welcomeTitle}>{museumName}</Text>
        <Text style={styles.welcomeSubtitle}>{routeName}</Text>

        <View style={styles.welcomeHighlights}>
          <View style={styles.welcomeHighlight}>
            <Ionicons
              color={musePalette.primaryStrong}
              name="time-outline"
              size={18}
            />
            <Text
              style={styles.welcomeHighlightText}
            >{`${durationMinutes} minutos sugeridos`}</Text>
          </View>
          <View style={styles.welcomeHighlight}>
            <Ionicons
              color={musePalette.primaryStrong}
              name="chatbubble-ellipses-outline"
              size={18}
            />
            <Text style={styles.welcomeHighlightText}>
              Haz preguntas y sigue la narrativa obra por obra
            </Text>
          </View>
          <View style={styles.welcomeHighlight}>
            <Ionicons
              color={musePalette.primaryStrong}
              name="ear-outline"
              size={18}
            />
            <Text style={styles.welcomeHighlightText}>
              Escucha cada obra si prefieres una visita mas guiada
            </Text>
          </View>
        </View>

        <PrimaryButton
          icon="arrow-forward"
          label="Comenzar recorrido"
          onPress={onStart}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  welcomeOverlay: {
    alignItems: "center",
    backgroundColor: "rgba(20,33,45,0.42)",
    bottom: 0,
    justifyContent: "center",
    left: 0,
    padding: 20,
    position: "absolute",
    right: 0,
    top: 0,
  },
  welcomeCard: {
    backgroundColor: musePalette.surface,
    borderRadius: 32,
    gap: 18,
    maxWidth: 430,
    paddingHorizontal: 22,
    paddingVertical: 26,
    width: "100%",
  },
  welcomeEyebrow: {
    color: musePalette.primary,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  welcomeTitle: {
    color: musePalette.text,
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: -0.7,
  },
  welcomeSubtitle: {
    color: musePalette.textMuted,
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 23,
  },
  welcomeHighlights: {
    gap: 12,
  },
  welcomeHighlight: {
    alignItems: "flex-start",
    backgroundColor: musePalette.surfaceMuted,
    borderRadius: 18,
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  welcomeHighlightText: {
    color: musePalette.text,
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
  },
});
