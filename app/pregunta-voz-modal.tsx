import { musePalette } from '@/components/museiq/theme';
import { PrimaryButton, SecondaryButton } from '@/components/museiq/ui';
import { askMuseRag } from '@/lib/muserag-api';
import { useMuseIQ } from '@/providers/museiq-provider';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

export default function PreguntaVozModal() {
  const params = useLocalSearchParams<{ artworkId?: string }>();
  const { currentArtwork, findArtworkById, voicePrompts } = useMuseIQ();
  const artwork = useMemo(
    () => findArtworkById(typeof params.artworkId === 'string' ? params.artworkId : undefined) ?? currentArtwork,
    [currentArtwork, findArtworkById, params.artworkId]
  );
  const [questionText, setQuestionText] = useState(artwork?.suggestedQuestions[0] ?? voicePrompts[0] ?? '');
  const [response, setResponse] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (questionText.trim().length > 0) {
      return;
    }

    setQuestionText(artwork?.suggestedQuestions[0] ?? voicePrompts[0] ?? '');
  }, [artwork?.suggestedQuestions, questionText, voicePrompts]);

  const askQuestion = async (question: string) => {
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion) {
      setErrorMessage('Escribe una pregunta para continuar.');
      return;
    }

    setResponse('');
    setErrorMessage('');
    setIsLoading(true);

    try {
      const result = await askMuseRag({
        question: trimmedQuestion,
        roomId: artwork?.roomId,
        artworkName: artwork?.title,
        artworkId: artwork?.id,
        artworkContext: artwork
          ? {
              id: artwork.id,
              title: artwork.title,
              author: artwork.author,
              year: artwork.year,
              period: artwork.period,
              technique: artwork.technique,
              summary: artwork.summary,
              context: artwork.context,
              room_relation: artwork.roomRelation,
              location_hint: artwork.locationHint,
              suggested_questions: artwork.suggestedQuestions,
            }
          : undefined,
      });

      setResponse(result.respuesta);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'No pude conectar con MuseRAG. Verifica que el backend esté activo.';
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.backdrop}>
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <Text style={styles.title}>Chat</Text>
        <Text style={styles.subtitle}>{artwork?.title ?? 'Obra actual'}</Text>

        <View style={styles.inputCard}>
          <TextInput
            value={questionText}
            onChangeText={setQuestionText}
            placeholder="Escribe tu pregunta"
            placeholderTextColor={musePalette.textMuted}
            multiline
            style={styles.input}
          />
        </View>

        <View style={styles.answerCard}>
          <Text style={styles.answerText}>
            {response || (isLoading ? 'Consultando al museo...' : 'La respuesta aparecerá aquí en texto.')}
          </Text>
          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
        </View>

        <View style={styles.actions}>
          <PrimaryButton
            icon="send"
            label={isLoading ? 'Consultando...' : 'Enviar pregunta'}
            onPress={() => askQuestion(questionText)}
            disabled={isLoading}
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
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 28,
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
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
  },
  subtitle: {
    color: musePalette.textMuted,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  inputCard: {
    backgroundColor: musePalette.surfaceMuted,
    borderColor: musePalette.border,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  answerCard: {
    backgroundColor: musePalette.surfaceMuted,
    borderRadius: 18,
    gap: 8,
    minHeight: 120,
    padding: 14,
  },
  answerText: {
    color: musePalette.textMuted,
    fontSize: 14,
    lineHeight: 21,
  },
  input: {
    color: musePalette.text,
    fontSize: 15,
    lineHeight: 22,
    minHeight: 72,
    textAlignVertical: 'top',
  },
  errorText: {
    color: '#A12626',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  actions: {
    gap: 10,
    marginTop: 4,
  },
});
