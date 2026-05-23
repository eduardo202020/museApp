import { musePalette } from "@/components/museiq/theme";
import { useMuseIQ } from "@/providers/museiq-provider";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type SetupItem = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  status: string;
};

export default function PreparacionVisitaScreen() {
  const {
    allPermissionsGranted,
    currentRoom,
    isDatabaseReady,
    requestAllPermissions,
  } = useMuseIQ();

  const setupItems: SetupItem[] = [
    {
      icon: "bluetooth",
      label: "Bluetooth (BLE)",
      status: allPermissionsGranted ? "Listo" : "Pendiente",
    },
    {
      icon: "location-outline",
      label: "Detectando sala...",
      status: currentRoom ? `${currentRoom.name} detectada` : "Buscando sala",
    },
    {
      icon: "camera-outline",
      label: "Camara",
      status: "Lista",
    },
    {
      icon: "mic-outline",
      label: "Microfono",
      status: allPermissionsGranted ? "Listo" : "Opcional para voz",
    },
    {
      icon: "wifi-outline",
      label: "Conexion",
      status: "Internet disponible",
    },
  ];

  const startVisit = () => {
    if (!isDatabaseReady) {
      return;
    }

    router.push("/home" as never);
  };

  const openPermissions = async () => {
    const granted = await requestAllPermissions();
    if (!granted) {
      Alert.alert(
        "Permisos pendientes",
        "Falta conceder algunos permisos para usar todas las funciones de MuseIQ.",
      );
    }
  };

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <Image
        source={require("@/assets/images/fondo.png")}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        contentPosition="center"
      />
      <View style={styles.backdrop} />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.backButton,
              pressed ? styles.pressed : null,
            ]}
          >
            <Ionicons color="#FFFFFF" name="arrow-back" size={27} />
          </Pressable>
          <Text style={styles.title}>Preparando tu visita</Text>
          <View style={styles.headerSpacer} />
        </View>

        <Text style={styles.subtitle}>
          Configuramos tu experiencia para que disfrutes al maximo
        </Text>

        <View style={styles.content}>
          <View style={styles.statusCard}>
            {setupItems.map((item, index) => (
              <View key={item.label}>
                <View style={styles.statusRow}>
                  <View style={styles.statusIconWrap}>
                    <Ionicons
                      color={musePalette.primary}
                      name={item.icon}
                      size={28}
                    />
                  </View>
                  <View style={styles.statusTextBlock}>
                    <Text style={styles.statusLabel}>{item.label}</Text>
                    <Text style={styles.statusValue}>{item.status}</Text>
                  </View>
                  <View style={styles.checkIcon}>
                    <Ionicons
                      color={musePalette.primary}
                      name="checkmark"
                      size={22}
                    />
                  </View>
                </View>
                {index < setupItems.length - 1 ? (
                  <View style={styles.separator} />
                ) : null}
              </View>
            ))}
          </View>

          <View style={styles.actions}>
            {!allPermissionsGranted ? (
              <Pressable
                onPress={openPermissions}
                style={({ pressed }) => [
                  styles.permissionsButton,
                  pressed ? styles.pressed : null,
                ]}
              >
                <Ionicons color="#FFFFFF" name="shield-checkmark-outline" size={21} />
                <Text style={styles.permissionsButtonText}>Conceder permisos</Text>
              </Pressable>
            ) : null}

            <Pressable
              onPress={startVisit}
              disabled={!isDatabaseReady}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && isDatabaseReady ? styles.pressed : null,
                !isDatabaseReady ? styles.disabled : null,
              ]}
            >
              <Text style={styles.primaryButtonText}>Iniciar visita AR</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: "#05080D",
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(5,8,13,0.86)",
  },
  safeArea: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: 14,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  backButton: {
    alignItems: "center",
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  headerSpacer: {
    width: 44,
  },
  title: {
    color: "#FFFFFF",
    flex: 1,
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 0,
    textAlign: "center",
  },
  subtitle: {
    alignSelf: "center",
    color: "rgba(255,255,255,0.74)",
    fontSize: 16,
    fontWeight: "500",
    lineHeight: 24,
    marginTop: 20,
    maxWidth: 300,
    textAlign: "center",
  },
  content: {
    flex: 1,
    justifyContent: "flex-end",
    paddingBottom: 38,
    paddingHorizontal: 24,
    paddingTop: 18,
  },
  statusCard: {
    backgroundColor: "rgba(8,14,20,0.72)",
    borderColor: "rgba(255,255,255,0.24)",
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  statusRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 14,
    minHeight: 66,
  },
  statusIconWrap: {
    alignItems: "center",
    backgroundColor: "rgba(22,137,206,0.16)",
    borderRadius: 999,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  statusTextBlock: {
    flex: 1,
    gap: 4,
  },
  statusLabel: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },
  statusValue: {
    color: musePalette.primary,
    fontSize: 14,
    fontWeight: "700",
  },
  checkIcon: {
    alignItems: "center",
    borderColor: musePalette.primary,
    borderRadius: 999,
    borderWidth: 1.6,
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  separator: {
    backgroundColor: "rgba(255,255,255,0.16)",
    height: StyleSheet.hairlineWidth,
    marginLeft: 62,
  },
  actions: {
    gap: 16,
    marginTop: 18,
  },
  permissionsButton: {
    alignItems: "center",
    backgroundColor: "rgba(22,137,206,0.20)",
    borderColor: "rgba(22,137,206,0.54)",
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    minHeight: 54,
    paddingHorizontal: 22,
  },
  permissionsButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: musePalette.primary,
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: 999,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 58,
    paddingHorizontal: 22,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
  },
  pressed: {
    opacity: 0.84,
  },
  disabled: {
    opacity: 0.58,
  },
});
