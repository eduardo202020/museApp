import { musePalette } from "@/components/museiq/theme";
import { Ionicons } from "@expo/vector-icons";
import { PropsWithChildren, ReactNode } from "react";
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
    type ScrollViewProps,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export function AppScreen({
  children,
  scroll = true,
  contentContainerStyle,
}: PropsWithChildren<{
  scroll?: boolean;
  contentContainerStyle?: ScrollViewProps["contentContainerStyle"];
}>) {
  if (!scroll) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.content, contentContainerStyle]}>{children}</View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={[styles.content, contentContainerStyle]}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function TopBar({
  title,
  subtitle,
  left,
  right,
}: {
  title: string;
  subtitle?: string;
  left?: ReactNode;
  right?: ReactNode;
}) {
  return (
    <View style={styles.topBar}>
      <View style={styles.topBarSide}>{left}</View>
      <View style={styles.topBarCenter}>
        <Text style={styles.brand}>{title}</Text>
        {subtitle ? (
          <Text style={styles.topBarSubtitle}>{subtitle}</Text>
        ) : null}
      </View>
      <View style={[styles.topBarSide, styles.topBarRight]}>{right}</View>
    </View>
  );
}

export function StatusPill({
  label,
  tone = "primary",
}: {
  label: string;
  tone?: "primary" | "success" | "warning";
}) {
  const backgroundColor =
    tone === "success"
      ? "#DCF7E8"
      : tone === "warning"
        ? "#FFF0CC"
        : musePalette.primarySoft;
  const color =
    tone === "success"
      ? musePalette.success
      : tone === "warning"
        ? "#9B6500"
        : musePalette.primary;

  return (
    <View style={[styles.pill, { backgroundColor }]}>
      <View style={[styles.pillDot, { backgroundColor: color }]} />
      <Text style={[styles.pillText, { color }]}>{label}</Text>
    </View>
  );
}

export function SectionEyebrow({ children }: PropsWithChildren) {
  return <Text style={styles.eyebrow}>{children}</Text>;
}

export function SectionCard({
  children,
  style,
}: PropsWithChildren<{ style?: object }>) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function PrimaryButton({
  label,
  icon,
  onPress,
  disabled,
}: {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.primaryButton,
        pressed && !disabled ? styles.pressed : null,
        disabled ? styles.buttonDisabled : null,
      ]}
    >
      {icon ? <Ionicons color="#fff" name={icon} size={20} /> : null}
      <Text style={styles.primaryButtonText}>{label}</Text>
    </Pressable>
  );
}

export function SecondaryButton({
  label,
  icon,
  onPress,
  disabled,
}: {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.secondaryButton,
        pressed && !disabled ? styles.pressed : null,
        disabled ? styles.buttonDisabled : null,
      ]}
    >
      {icon ? (
        <Ionicons color={musePalette.textMuted} name={icon} size={18} />
      ) : null}
      <Text style={styles.secondaryButtonText}>{label}</Text>
    </Pressable>
  );
}

export function FloatingVoiceButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.voiceButton,
        pressed ? styles.pressed : null,
      ]}
    >
      <Ionicons color="#fff" name="mic" size={26} />
    </Pressable>
  );
}

export function SettingRow({
  title,
  description,
  accessory,
}: {
  title: string;
  description: string;
  accessory?: ReactNode;
}) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingText}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      {accessory}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: musePalette.background,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 36,
    gap: 18,
  },
  topBar: {
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 8,
  },
  topBarSide: {
    minWidth: 52,
  },
  topBarRight: {
    alignItems: "flex-end",
  },
  topBarCenter: {
    flex: 1,
    gap: 2,
  },
  brand: {
    color: musePalette.primary,
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: -0.8,
  },
  topBarSubtitle: {
    color: musePalette.textMuted,
    fontSize: 13,
    fontWeight: "600",
  },
  pill: {
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: 999,
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  pillDot: {
    borderRadius: 999,
    height: 8,
    width: 8,
  },
  pillText: {
    fontSize: 12,
    fontWeight: "700",
  },
  eyebrow: {
    color: musePalette.primary,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.3,
    textTransform: "uppercase",
  },
  card: {
    backgroundColor: musePalette.surface,
    borderColor: musePalette.border,
    borderRadius: 28,
    borderWidth: 1,
    gap: 14,
    padding: 18,
    shadowColor: "#0E243B",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: musePalette.primaryStrong,
    borderRadius: 18,
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    minHeight: 54,
    paddingHorizontal: 18,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
  },
  secondaryButton: {
    alignItems: "center",
    backgroundColor: musePalette.surfaceMuted,
    borderRadius: 16,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    minHeight: 50,
    paddingHorizontal: 14,
  },
  secondaryButtonText: {
    color: musePalette.text,
    fontSize: 15,
    fontWeight: "700",
  },
  voiceButton: {
    alignItems: "center",
    backgroundColor: musePalette.primaryStrong,
    borderRadius: 999,
    bottom: 28,
    elevation: 6,
    height: 62,
    justifyContent: "center",
    position: "absolute",
    right: 22,
    shadowColor: musePalette.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.32,
    shadowRadius: 18,
    width: 62,
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  settingRow: {
    alignItems: "center",
    borderBottomColor: musePalette.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
    paddingVertical: 14,
  },
  settingText: {
    flex: 1,
    gap: 4,
  },
  settingTitle: {
    color: musePalette.text,
    fontSize: 15,
    fontWeight: "700",
  },
  settingDescription: {
    color: musePalette.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
});
