import { musePalette } from "@/components/museiq/theme";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ArtworkEmptyStateProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
};

export function ArtworkEmptyState({ icon, title }: ArtworkEmptyStateProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <Pressable onPress={() => router.back()} style={styles.backOnly}>
        <Ionicons color="#FFFFFF" name="arrow-back" size={28} />
      </Pressable>
      <View style={styles.emptyState}>
        <Ionicons color={musePalette.primary} name={icon} size={42} />
        <Text style={styles.emptyTitle}>{title}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  backOnly: {
    alignItems: "center",
    height: 50,
    justifyContent: "center",
    marginLeft: 14,
    marginTop: 8,
    width: 50,
  },
  emptyState: {
    alignItems: "center",
    flex: 1,
    gap: 12,
    justifyContent: "center",
  },
  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
  },
});
