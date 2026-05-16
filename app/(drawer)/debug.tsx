import { musePalette } from "@/components/museiq/theme";
import {
  AppScreen,
  SectionCard,
  SectionEyebrow,
  SettingRow,
  TopBar,
} from "@/components/museiq/ui";
import { useBleScanner } from "@/hooks/use-ble-scanner";
import { useHomeSensors } from "@/hooks/use-home-sensors";
import { useMuseIQ } from "@/providers/museiq-provider";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";

function MenuButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.menuButton}>
      <Ionicons color={musePalette.primary} name="menu" size={18} />
    </Pressable>
  );
}

export default function DebugScreen() {
  const navigation = useNavigation();
  const {
    analyticsSummary,
    currentArtwork,
    currentRoom,
    debugModeEnabled,
    refreshAnalyticsSummary,
    resetVisitorExperience,
    setDebugModeEnabled,
  } = useMuseIQ();
  const { beacons, error, isScanning, startScanning, stopScanning } =
    useBleScanner();
  const {
    accelerometerStatus,
    compassStatus,
    headingState,
    movementState,
    stepCount,
    stepCountStatus,
  } = useHomeSensors();

  useEffect(() => {
    startScanning().catch(() => undefined);
    refreshAnalyticsSummary().catch(() => undefined);
    return () => {
      stopScanning();
    };
  }, [refreshAnalyticsSummary, startScanning, stopScanning]);

  const confirmReset = () => {
    Alert.alert(
      "Reiniciar experiencia",
      "Se borrara la memoria conversacional, el progreso y las preferencias del visitante para empezar como usuario nuevo.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Borrar todo",
          style: "destructive",
          onPress: () => {
            resetVisitorExperience().catch(() => undefined);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.screen}>
      <AppScreen contentContainerStyle={styles.content}>
        <TopBar
          title="MuseIQ"
          subtitle="Modo tecnico"
          left={
            <MenuButton
              onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            />
          }
        />

        <SectionCard>
          <SectionEyebrow>Estado</SectionEyebrow>
          <Text style={styles.sectionTitle}>Contexto tecnico actual</Text>
          <SettingRow
            title="Modo tecnico"
            description="Mantiene visible el acceso rapido a diagnostico en la home."
            accessory={
              <Pressable
                onPress={() => setDebugModeEnabled(!debugModeEnabled)}
                style={[
                  styles.toggleChip,
                  debugModeEnabled ? styles.toggleChipActive : null,
                ]}
              >
                <Text
                  style={[
                    styles.toggleChipText,
                    debugModeEnabled ? styles.toggleChipTextActive : null,
                  ]}
                >
                  {debugModeEnabled ? "Activo" : "Inactivo"}
                </Text>
              </Pressable>
            }
          />
          <SettingRow
            title="Sala"
            description={currentRoom?.name ?? "Sin sala seleccionada"}
          />
          <SettingRow
            title="Obra"
            description={currentArtwork?.title ?? "Sin obra seleccionada"}
          />
        </SectionCard>

        <SectionCard>
          <SectionEyebrow>Sensores</SectionEyebrow>
          <Text style={styles.sectionTitle}>Lecturas del dispositivo</Text>
          <View style={styles.metricsList}>
            <Text style={styles.metricItem}>{`Acelerometro: ${accelerometerStatus}`}</Text>
            <Text style={styles.metricItem}>{`Movimiento: ${movementState}`}</Text>
            <Text style={styles.metricItem}>{`Brujula: ${compassStatus}${headingState ? ` · ${headingState}` : ""}`}</Text>
            <Text style={styles.metricItem}>{`Pasos: ${stepCountStatus}${stepCount !== null ? ` · ${stepCount}` : ""}`}</Text>
          </View>
        </SectionCard>

        <SectionCard>
          <SectionEyebrow>Analitica</SectionEyebrow>
          <Text style={styles.sectionTitle}>Uso basico del MVP</Text>
          <View style={styles.metricsList}>
            <Text style={styles.metricItem}>{`Eventos totales: ${analyticsSummary.totalEvents}`}</Text>
            <Text style={styles.metricItem}>{`Preguntas hechas: ${analyticsSummary.totalQuestions}`}</Text>
            <Text style={styles.metricItem}>{`Cambios de obra: ${analyticsSummary.totalArtworkSelections}`}</Text>
            <Text style={styles.metricItem}>{`Inicios de voz: ${analyticsSummary.totalVoiceStarts}`}</Text>
            <Text style={styles.metricItem}>
              {`Obra mas consultada: ${analyticsSummary.mostConsultedArtworkId ?? "Sin datos"}`}
            </Text>
            <Text style={styles.metricItem}>
              {`Obra mas visitada: ${analyticsSummary.mostVisitedArtworkId ?? "Sin datos"}`}
            </Text>
          </View>
        </SectionCard>

        <SectionCard>
          <SectionEyebrow>BLE</SectionEyebrow>
          <Text style={styles.sectionTitle}>Beacons y escaneo</Text>
          <Text style={styles.helperText}>
            {error
              ? `Error: ${error}`
              : isScanning
                ? "Escaneando dispositivos cercanos."
                : "El escaneo no esta activo en este momento."}
          </Text>
          <View style={styles.beaconList}>
            {beacons.length ? (
              beacons.slice(0, 5).map((beacon) => (
                <View key={beacon.id} style={styles.beaconItem}>
                  <Text style={styles.beaconName}>{beacon.id}</Text>
                  <Text style={styles.beaconMeta}>
                    {`${beacon.roomId} · nodo ${beacon.beaconNode} · RSSI ${beacon.rssi}`}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.helperText}>Aun no hay beacons detectados.</Text>
            )}
          </View>
        </SectionCard>

        <SectionCard>
          <SectionEyebrow>Pruebas</SectionEyebrow>
          <Text style={styles.sectionTitle}>Reiniciar como usuario nuevo</Text>
          <Text style={styles.helperText}>
            Borra memoria conversacional, progreso y preferencias para probar la app desde cero.
          </Text>
          <Pressable onPress={confirmReset} style={styles.resetButton}>
            <Text style={styles.resetButtonText}>Borrar memoria e iniciar de nuevo</Text>
          </Pressable>
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
  sectionTitle: {
    color: musePalette.text,
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 10,
  },
  toggleChip: {
    backgroundColor: musePalette.surfaceMuted,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  toggleChipActive: {
    backgroundColor: musePalette.primaryStrong,
  },
  toggleChipText: {
    color: musePalette.text,
    fontSize: 12,
    fontWeight: "800",
  },
  toggleChipTextActive: {
    color: "#fff",
  },
  metricsList: {
    gap: 10,
  },
  metricItem: {
    color: musePalette.textMuted,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },
  helperText: {
    color: musePalette.textMuted,
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },
  beaconList: {
    gap: 10,
    marginTop: 12,
  },
  beaconItem: {
    backgroundColor: musePalette.surfaceMuted,
    borderRadius: 16,
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  beaconName: {
    color: musePalette.text,
    fontSize: 13,
    fontWeight: "800",
  },
  beaconMeta: {
    color: musePalette.textMuted,
    fontSize: 12,
    fontWeight: "600",
  },
  resetButton: {
    alignItems: "center",
    backgroundColor: musePalette.danger,
    borderRadius: 14,
    justifyContent: "center",
    marginTop: 14,
    minHeight: 48,
    paddingHorizontal: 14,
  },
  resetButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
    textAlign: "center",
  },
});
