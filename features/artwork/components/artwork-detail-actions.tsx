import { ArtworkInfoRow } from "@/components/museiq/artwork/artwork-info-row";
import { musePalette } from "@/components/museiq/theme";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

type ArtworkDetailActionsProps = {
  cultureLabel: string;
  museumName: string;
  onOpenAr: () => void;
  onOpenImages: () => void;
  onOpenQuestion: () => void;
  roomName: string;
  technique: string;
};

export function ArtworkDetailActions({
  cultureLabel,
  museumName,
  onOpenAr,
  onOpenImages,
  onOpenQuestion,
  roomName,
  technique,
}: ArtworkDetailActionsProps) {
  return (
    <>
      <View style={styles.infoStack}>
        <ArtworkInfoRow
          icon="location-outline"
          label="Ubicacion actual"
          value={`${roomName}, ${museumName}`}
        />
        <ArtworkInfoRow
          icon="resize-outline"
          label="Dimensiones"
          value="No especificadas en la ficha"
        />
        <ArtworkInfoRow icon="cube-outline" label="Material" value={technique} />
        <ArtworkInfoRow
          icon="calendar-outline"
          label="Cultura"
          value={cultureLabel}
        />
      </View>

      <View style={styles.primaryActions}>
        <Pressable
          onPress={onOpenAr}
          style={({ pressed }) => [styles.outlineButton, pressed ? styles.pressed : null]}
        >
          <Ionicons color="#FFFFFF" name="cube-outline" size={24} />
          <Text style={styles.outlineButtonText}>Ver en AR</Text>
        </Pressable>
        <Pressable
          onPress={onOpenQuestion}
          style={({ pressed }) => [styles.solidButton, pressed ? styles.pressed : null]}
        >
          <Ionicons color="#FFFFFF" name="chatbubble-ellipses-outline" size={24} />
          <Text style={styles.solidButtonText}>Preguntar sobre esta obra</Text>
        </Pressable>
      </View>

      <Pressable
        onPress={onOpenImages}
        style={({ pressed }) => [styles.relatedButton, pressed ? styles.pressed : null]}
      >
        <Ionicons color="#FFFFFF" name="images-outline" size={29} />
        <Text style={styles.relatedButtonText}>Ver imagenes relacionadas</Text>
        <Ionicons color="#FFFFFF" name="chevron-forward" size={24} />
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
  infoStack: {
    gap: 8,
  },
  primaryActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 2,
  },
  outlineButton: {
    alignItems: "center",
    borderColor: "rgba(255,255,255,0.5)",
    borderRadius: 18,
    borderWidth: 1,
    flex: 0.92,
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    minHeight: 56,
    paddingHorizontal: 12,
  },
  outlineButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  solidButton: {
    alignItems: "center",
    backgroundColor: musePalette.primary,
    borderRadius: 18,
    flex: 1.48,
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    minHeight: 56,
    paddingHorizontal: 12,
  },
  solidButtonText: {
    color: "#FFFFFF",
    flexShrink: 1,
    fontSize: 15,
    fontWeight: "800",
  },
  relatedButton: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.035)",
    borderColor: "rgba(255,255,255,0.16)",
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    gap: 18,
    minHeight: 78,
    paddingHorizontal: 22,
  },
  relatedButtonText: {
    color: "#FFFFFF",
    flex: 1,
    fontSize: 17,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.84,
    transform: [{ scale: 0.99 }],
  },
});
