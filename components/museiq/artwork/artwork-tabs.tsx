import { musePalette } from "@/components/museiq/theme";
import { Pressable, StyleSheet, Text, View } from "react-native";

type ArtworkTabKey = "details" | "images";

type ArtworkTabsProps = {
  activeTab: ArtworkTabKey;
  onSelect: (tab: ArtworkTabKey) => void;
};

const tabs: { key: ArtworkTabKey; label: string }[] = [
  { key: "details", label: "Detalles" },
  { key: "images", label: "Imagenes" },
];

export function ArtworkTabs({ activeTab, onSelect }: ArtworkTabsProps) {
  return (
    <View style={styles.tabs}>
      {tabs.map((tab, index) => {
        const isActive = tab.key === activeTab;

        return (
          <Pressable
            key={tab.key}
            onPress={() => onSelect(tab.key)}
            style={({ pressed }) => [
              styles.tab,
              isActive ? styles.tabActive : null,
              index > 0 ? styles.tabDivider : null,
              pressed ? styles.pressed : null,
            ]}
          >
            <Text style={[styles.tabText, isActive ? styles.tabTextActive : null]}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export type { ArtworkTabKey };

const styles = StyleSheet.create({
  tabs: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.035)",
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 40,
    overflow: "hidden",
  },
  tab: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    minHeight: 39,
    paddingHorizontal: 6,
  },
  tabActive: {
    backgroundColor: musePalette.primary,
  },
  tabDivider: {
    borderLeftColor: "rgba(255,255,255,0.08)",
    borderLeftWidth: 1,
  },
  tabText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  tabTextActive: {
    color: "#FFFFFF",
    fontWeight: "900",
  },
  pressed: {
    opacity: 0.82,
  },
});
