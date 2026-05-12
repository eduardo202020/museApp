import { musePalette } from '@/components/museiq/theme';
import { PrimaryButton, SecondaryButton } from '@/components/museiq/ui';
import { useMuseIQ } from '@/providers/museiq-provider';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const permissionItems = [
  { key: 'bluetooth', icon: 'bluetooth' },
  { key: 'physicalActivity', icon: 'walk' },
  { key: 'location', icon: 'location' },
  { key: 'microphone', icon: 'mic' },
] as const;

export default function PermissionsModal() {
  const { permissions, permissionCatalog, requestAllPermissions, declinePermissions } = useMuseIQ();
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState('');

  const handleContinue = async () => {
    if (!accepted) {
      setError('Necesitas confirmar el consentimiento antes de continuar.');
      return;
    }

    const granted = await requestAllPermissions();
    if (granted) {
      router.back();
      return;
    }

    setError('Faltan permisos por conceder. Puedes revisarlos y volver a intentar.');
  };

  const handleLater = () => {
    declinePermissions();
    router.back();
  };

  return (
    <View style={styles.backdrop}>
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <View style={styles.heroIcon}>
          <Ionicons color={musePalette.primaryStrong} name="shield-checkmark" size={38} />
        </View>
        <Text style={styles.title}>Permisos necesarios para iniciar</Text>
        <Text style={styles.subtitle}>
          MuseIQ necesita algunos accesos para ubicarte dentro del museo y responder por voz.
        </Text>

        <View style={styles.list}>
          {permissionItems.map((item) => {
            const copy = permissionCatalog[item.key];
            const status = permissions[item.key];
            const statusTone =
              status === 'granted' ? styles.statusGranted : status === 'denied' ? styles.statusDenied : styles.statusPending;

            return (
              <View key={item.key} style={styles.permissionCard}>
                <View style={styles.permissionIcon}>
                  <Ionicons color={musePalette.primary} name={item.icon} size={22} />
                </View>
                <View style={styles.permissionText}>
                  <View style={styles.permissionHeader}>
                    <Text style={styles.permissionTitle}>{copy.title}</Text>
                    <Text style={[styles.statusBadge, statusTone]}>
                      {status === 'granted' ? 'Concedido' : status === 'denied' ? 'Pendiente' : 'Pendiente'}
                    </Text>
                  </View>
                  <Text style={styles.permissionDescription}>{copy.description}</Text>
                </View>
              </View>
            );
          })}
        </View>

        <Pressable onPress={() => setAccepted((value) => !value)} style={styles.checkboxRow}>
          <View style={[styles.checkbox, accepted ? styles.checkboxActive : null]}>
            {accepted ? <Ionicons color="#fff" name="checkmark" size={16} /> : null}
          </View>
          <Text style={styles.checkboxText}>
            He leído y acepto otorgar permisos de Bluetooth, actividad física, micrófono y ubicación para usar MuseIQ.
          </Text>
        </Pressable>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={styles.actions}>
          <PrimaryButton icon="arrow-forward" label="Continuar" onPress={handleContinue} />
          <SecondaryButton icon="close" label="Ahora no" onPress={handleLater} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: musePalette.overlay,
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: musePalette.surface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    gap: 16,
    minHeight: '80%',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 34,
  },
  handle: {
    alignSelf: 'center',
    backgroundColor: musePalette.border,
    borderRadius: 999,
    height: 6,
    width: 56,
  },
  heroIcon: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: musePalette.surfaceMuted,
    borderRadius: 28,
    height: 92,
    justifyContent: 'center',
    marginTop: 8,
    width: 92,
  },
  title: {
    color: musePalette.text,
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
  },
  subtitle: {
    color: musePalette.textMuted,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  list: {
    gap: 12,
  },
  permissionCard: {
    backgroundColor: musePalette.surfaceMuted,
    borderRadius: 22,
    flexDirection: 'row',
    gap: 14,
    padding: 16,
  },
  permissionIcon: {
    alignItems: 'center',
    backgroundColor: musePalette.surface,
    borderRadius: 14,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  permissionText: {
    flex: 1,
    gap: 6,
  },
  permissionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  permissionTitle: {
    color: musePalette.text,
    fontSize: 16,
    fontWeight: '800',
  },
  permissionDescription: {
    color: musePalette.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  statusBadge: {
    borderRadius: 999,
    fontSize: 11,
    fontWeight: '800',
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusPending: {
    backgroundColor: '#FFF0CC',
    color: '#9B6500',
  },
  statusGranted: {
    backgroundColor: '#DCF7E8',
    color: musePalette.success,
  },
  statusDenied: {
    backgroundColor: '#FCE3DE',
    color: musePalette.danger,
  },
  checkboxRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  checkbox: {
    alignItems: 'center',
    borderColor: musePalette.border,
    borderRadius: 8,
    borderWidth: 1,
    height: 24,
    justifyContent: 'center',
    marginTop: 2,
    width: 24,
  },
  checkboxActive: {
    backgroundColor: musePalette.primaryStrong,
    borderColor: musePalette.primaryStrong,
  },
  checkboxText: {
    color: musePalette.textMuted,
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  errorText: {
    color: musePalette.danger,
    fontSize: 13,
    fontWeight: '600',
  },
  actions: {
    gap: 10,
    marginTop: 'auto',
  },
});
