import { musePalette } from '@/components/museiq/theme';
import { PrimaryButton, SecondaryButton } from '@/components/museiq/ui';
import { useMuseIQ } from '@/providers/museiq-provider';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type VoiceState = 'idle' | 'listening' | 'processing' | 'responding';

export default function PreguntaVozModal() {
  const params = useLocalSearchParams<{ artworkId?: string }>();
  const { currentArtwork, findArtworkById, voicePrompts } = useMuseIQ();
  const artwork = useMemo(
    () => findArtworkById(typeof params.artworkId === 'string' ? params.artworkId : undefined) ?? currentArtwork,
    [currentArtwork, findArtworkById, params.artworkId]
  );
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');

  const simulateQuestion = (question: string) => {
    setVoiceState('listening');
    setTranscript(question);

    setTimeout(() => {
      setVoiceState('processing');
    }, 500);

    setTimeout(() => {
      const answer = `${artwork?.title ?? 'La obra'} pertenece a ${artwork?.period ?? 'un periodo destacado'}. ${artwork?.summary ?? ''}`;
      setResponse(answer);
      setVoiceState('responding');
      Speech.stop();
      Speech.speak(answer, { language: 'es-ES', rate: 0.95 });
    }, 1300);
  };

  const statusText =
    voiceState === 'idle'
      ? 'Habla cuando estés listo'
      : voiceState === 'listening'
        ? 'Escuchando'
        : voiceState === 'processing'
          ? 'Procesando'
          : 'Respondiendo';

  return (
    <View style={styles.backdrop}>
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <Text style={styles.title}>Pregunta sobre esta obra</Text>
        <Text style={styles.subtitle}>{artwork?.title ?? 'Obra actual'}</Text>

        <View style={styles.micBlock}>
          <Pressable onPress={() => simulateQuestion(voicePrompts[0] ?? '¿Quién hizo esta obra?')} style={styles.micButton}>
            <Ionicons color="#fff" name="mic" size={34} />
          </Pressable>
          <Text style={styles.voiceState}>{statusText}</Text>
        </View>

        <View style={styles.transcriptCard}>
          <Text style={styles.sectionTitle}>Transcripción</Text>
          <Text style={styles.bodyText}>{transcript || 'Todavía no hay una pregunta capturada.'}</Text>
        </View>

        <View style={styles.promptList}>
          {voicePrompts.map((prompt) => (
            <Pressable key={prompt} onPress={() => simulateQuestion(prompt)} style={styles.promptChip}>
              <Text style={styles.promptText}>{prompt}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.answerCard}>
          <Text style={styles.sectionTitle}>Respuesta</Text>
          <Text style={styles.bodyText}>{response || 'La respuesta aparecerá aquí en texto y se reproducirá por audio.'}</Text>
        </View>

        <View style={styles.actions}>
          <PrimaryButton
            icon="refresh"
            label="Hacer otra pregunta"
            onPress={() => simulateQuestion(voicePrompts[1] ?? voicePrompts[0] ?? '¿Qué representa?')}
          />
          <SecondaryButton icon="close" label="Cerrar" onPress={() => router.back()} />
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
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 32,
  },
  handle: {
    alignSelf: 'center',
    backgroundColor: musePalette.border,
    borderRadius: 999,
    height: 6,
    width: 56,
  },
  title: {
    color: musePalette.text,
    fontSize: 26,
    fontWeight: '900',
    textAlign: 'center',
  },
  subtitle: {
    color: musePalette.textMuted,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  micBlock: {
    alignItems: 'center',
    gap: 12,
  },
  micButton: {
    alignItems: 'center',
    backgroundColor: musePalette.primaryStrong,
    borderRadius: 999,
    height: 92,
    justifyContent: 'center',
    width: 92,
  },
  voiceState: {
    color: musePalette.primary,
    fontSize: 15,
    fontWeight: '800',
  },
  transcriptCard: {
    backgroundColor: musePalette.surfaceMuted,
    borderRadius: 24,
    gap: 8,
    padding: 16,
  },
  answerCard: {
    backgroundColor: musePalette.primarySoft,
    borderRadius: 24,
    gap: 8,
    padding: 16,
  },
  sectionTitle: {
    color: musePalette.text,
    fontSize: 15,
    fontWeight: '800',
  },
  bodyText: {
    color: musePalette.textMuted,
    fontSize: 14,
    lineHeight: 21,
  },
  promptList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  promptChip: {
    backgroundColor: musePalette.surfaceMuted,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  promptText: {
    color: musePalette.text,
    fontSize: 13,
    fontWeight: '700',
  },
  actions: {
    gap: 10,
    marginTop: 4,
  },
});
