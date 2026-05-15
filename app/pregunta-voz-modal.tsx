import { ChatSheet } from "@/components/museiq/chat/chat-sheet";
import { ZoomImageViewer } from "@/components/museiq/chat/zoom-image-viewer";
import type { SourceImageItem } from "@/components/museiq/chat/source-image-carousel";
import { musePalette } from "@/components/museiq/theme";
import * as Haptics from "expo-haptics";
import {
    askMuseRag,
    type SourceSnippet,
} from "@/lib/muserag-api";
import {
  getPersistedChatHistory,
  persistChatTurn,
} from "@/lib/museum-database";
import { useMuseIQ } from "@/providers/museiq-provider";
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from "expo-speech-recognition";
import { router, useLocalSearchParams } from "expo-router";
import * as Speech from "expo-speech";
import { useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";

const RECOGNITION_LANGUAGE = "es-ES";
const SPEECH_LANGUAGE = "es-PE";
const MAX_CHAT_HISTORY_TURNS = 3;

type ChatHistoryTurn = {
  id: string;
  question: string;
  response: string;
  sourceCount: number;
};

type QuestionInputMode = "suggested" | "manual" | "voice";

function createChatSessionId(artworkId?: string) {
  const seed = artworkId?.trim() || "chat";
  return `${seed}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function markdownToSpeechText(markdown: string) {
  return markdown
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[*_`~]/g, "")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

export default function PreguntaVozModal() {
  const params = useLocalSearchParams<{ artworkId?: string }>();
  const { currentArtwork, findArtworkById, settings, voicePrompts } = useMuseIQ();
  const artwork = useMemo(
    () =>
      findArtworkById(
        typeof params.artworkId === "string" ? params.artworkId : undefined,
      ) ?? currentArtwork,
    [currentArtwork, findArtworkById, params.artworkId],
  );
  const [questionText, setQuestionText] = useState(
    artwork?.suggestedQuestions[0] ?? voicePrompts[0] ?? "",
  );
  const [questionInputMode, setQuestionInputMode] =
    useState<QuestionInputMode>("suggested");
  const [response, setResponse] = useState("");
  const [sources, setSources] = useState<SourceSnippet[]>([]);
  const [responseMeta, setResponseMeta] = useState<{
    total_ms: number;
    retrieval_ms: number;
    generation_ms: number;
    source_count: number;
    support_level?: string;
    applied_filters?: string[];
  } | null>(null);
  const [historyTurns, setHistoryTurns] = useState<ChatHistoryTurn[]>([]);
  const [zoomImage, setZoomImage] = useState<{
    images: SourceImageItem[];
    initialIndex: number;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastSubmittedQuestion, setLastSubmittedQuestion] = useState("");
  const [pendingQuestion, setPendingQuestion] = useState("");
  const [voiceStatusMessage, setVoiceStatusMessage] = useState("");
  const loadingTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const activeRequestAbortRef = useRef<AbortController | null>(null);
  const sessionIdRef = useRef<string>(
    createChatSessionId(
      typeof params.artworkId === "string" ? params.artworkId : currentArtwork?.id,
    ),
  );
  const suggestedQuestionFallback =
    artwork?.suggestedQuestions[0] ?? voicePrompts[0] ?? "";

  const resetQuestionComposer = () => {
    setQuestionText(suggestedQuestionFallback);
    setQuestionInputMode("suggested");
    setVoiceStatusMessage("");
  };

  const cancelPendingQuestion = () => {
    activeRequestAbortRef.current?.abort();
    activeRequestAbortRef.current = null;
    setPendingQuestion("");
    setStatusMessage("");
    setIsLoading(false);
    resetQuestionComposer();
    loadingTimersRef.current.forEach((timerId) => clearTimeout(timerId));
    loadingTimersRef.current = [];
  };

  const suggestedQuestions = useMemo(() => {
    const candidates = [
      ...(artwork?.suggestedQuestions ?? []),
      ...voicePrompts,
    ].map((item) => item.trim()).filter(Boolean);

    return [...new Set(candidates)].slice(0, 4);
  }, [artwork?.suggestedQuestions, voicePrompts]);

  const voiceMode = isListening
    ? "listening"
    : voiceStatusMessage.startsWith("Dictado listo")
      ? "review"
      : "idle";
  const isQuestionReady =
    questionInputMode !== "suggested" && questionText.trim().length > 0;

  const setSuggestedQuestion = (value: string) => {
    setQuestionText(value);
    setQuestionInputMode("manual");
  };

  const updateQuestionText = (value: string) => {
    setQuestionText(value);
    setQuestionInputMode(value.trim().length > 0 ? "manual" : "suggested");
  };

  useEffect(() => {
    if (questionText.trim().length > 0) {
      return;
    }

    setQuestionText(suggestedQuestionFallback);
    setQuestionInputMode("suggested");
  }, [questionText, suggestedQuestionFallback]);

  useEffect(() => {
    let isMounted = true;

    const hydrateHistory = async () => {
      if (!artwork?.id) {
        if (isMounted) {
          setHistoryTurns([]);
        }
        return;
      }

      const persistedTurns = await getPersistedChatHistory(artwork.id);
      if (!isMounted) {
        return;
      }

      setHistoryTurns(
        persistedTurns.map((turn) => ({
          id: turn.id,
          question: turn.question,
          response: turn.response,
          sourceCount: turn.sourceCount,
        })),
      );

      const latestTurn = persistedTurns[0];
      sessionIdRef.current =
        latestTurn?.sessionId ?? createChatSessionId(artwork.id);

      if (latestTurn) {
        setResponse(latestTurn.response);
        setLastSubmittedQuestion(latestTurn.question);
      } else {
        setResponse("");
        setLastSubmittedQuestion("");
      }
    };

    hydrateHistory().catch(() => undefined);

    return () => {
      isMounted = false;
    };
  }, [artwork?.id]);

  const openZoomViewer = (images: SourceImageItem[], initialIndex: number) => {
    setZoomImage({ images, initialIndex });
  };

  const closeZoomViewer = () => {
    setZoomImage(null);
  };

  const stopSpeaking = async () => {
    try {
      await Speech.stop();
    } finally {
      setIsSpeaking(false);
    }
  };

  const speakResponse = async (text = response) => {
    const trimmedText = markdownToSpeechText(text);
    if (!trimmedText) {
      return;
    }

    setErrorMessage("");
    await stopSpeaking();
    setIsSpeaking(true);
    Speech.speak(trimmedText, {
      language: SPEECH_LANGUAGE,
      rate: settings.voiceRate,
      pitch: 1,
      onDone: () => setIsSpeaking(false),
      onStopped: () => setIsSpeaking(false),
      onError: () => {
        setIsSpeaking(false);
        setErrorMessage("No pude reproducir la respuesta en voz alta.");
      },
    });
  };

  const stopListening = () => {
    setVoiceStatusMessage("Procesando lo que acabas de decir...");
    ExpoSpeechRecognitionModule.stop();
  };

  const startListening = async () => {
    if (!ExpoSpeechRecognitionModule.isRecognitionAvailable()) {
      setErrorMessage(
        "El dictado por voz no esta disponible en este dispositivo o servicio de reconocimiento.",
      );
      return;
    }

    const permissions = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!permissions.granted) {
      setErrorMessage(
        "Necesito permiso de microfono y reconocimiento de voz para dictar preguntas.",
      );
      return;
    }

    await stopSpeaking();
    setErrorMessage("");
    setVoiceStatusMessage("Activando el microfono del guia...");
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    ExpoSpeechRecognitionModule.start({
      lang: RECOGNITION_LANGUAGE,
      interimResults: true,
      continuous: false,
      requiresOnDeviceRecognition: false,
      addsPunctuation: true,
      iosTaskHint: "dictation",
      iosCategory: {
        category: "playAndRecord",
        categoryOptions: ["defaultToSpeaker", "allowBluetooth"],
        mode: "measurement",
      },
      iosVoiceProcessingEnabled: true,
      contextualStrings: [
        artwork?.title ?? "",
        ...(artwork?.suggestedQuestions ?? []),
        ...voicePrompts,
      ].filter(Boolean),
    });
  };

  const toggleListening = async () => {
    if (isListening) {
      stopListening();
      return;
    }

    await startListening();
  };

  useSpeechRecognitionEvent("start", () => {
    setIsListening(true);
    setVoiceStatusMessage("Te escucho. Habla con naturalidad.");
  });

  useSpeechRecognitionEvent("end", () => {
    setIsListening(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
      () => undefined,
    );
    setVoiceStatusMessage((current) =>
      current.startsWith("Dictado listo. Enviando")
        ? current
        : current.startsWith("Procesando")
          ? "Analizando tu dictado..."
        : current,
    );
  });

  useSpeechRecognitionEvent("result", (event) => {
    const transcript = event.results?.[0]?.transcript?.trim();
    if (!transcript) {
      return;
    }

    setQuestionText(transcript);
    setQuestionInputMode("voice");

    if (event.isFinal) {
      setVoiceStatusMessage("Enviando tu pregunta...");
      askQuestion(transcript).catch(() => undefined);
      return;
    }

    setVoiceStatusMessage("Escuchando tu pregunta...");
  });

  useSpeechRecognitionEvent("error", (event) => {
    setIsListening(false);

    if (event.error === "aborted") {
      setVoiceStatusMessage("");
      return;
    }

    const message =
      event.error === "no-speech"
        ? "No detecte voz con claridad. Intenta hablar un poco mas cerca del microfono."
        : event.message ||
          "No pude transcribir tu voz en este momento. Intenta de nuevo.";

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(
      () => undefined,
    );
    setVoiceStatusMessage("");
    setErrorMessage(message);
  });

  useEffect(() => {
    return () => {
      loadingTimersRef.current.forEach((timerId) => clearTimeout(timerId));
      loadingTimersRef.current = [];
      activeRequestAbortRef.current?.abort();
      ExpoSpeechRecognitionModule.abort();
      Speech.stop();
    };
  }, []);

  const scheduleLoadingMessages = () => {
    loadingTimersRef.current.forEach((timerId) => clearTimeout(timerId));
    loadingTimersRef.current = [];

    const steps = [
      { delay: 0, message: "Buscando contexto de la obra..." },
      { delay: 3500, message: "Relacionando tu pregunta con las fuentes del museo..." },
      { delay: 9000, message: "Redactando una respuesta clara para ti..." },
      { delay: 16000, message: "La respuesta esta tardando un poco mas, pero seguimos esperando..." },
    ];

    loadingTimersRef.current = steps.map(({ delay, message }) =>
      setTimeout(() => {
        setStatusMessage(message);
      }, delay),
    );
  };

  const askQuestion = async (question: string) => {
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion) {
      setErrorMessage("Escribe una pregunta para continuar.");
      return;
    }

    if (response.trim() && lastSubmittedQuestion.trim()) {
      setHistoryTurns((previous) => [
        ...previous,
        {
          id: `${Date.now()}-${previous.length}`,
          question: lastSubmittedQuestion,
          response,
          sourceCount: responseMeta?.source_count ?? sources.length,
        },
      ].slice(-MAX_CHAT_HISTORY_TURNS));
    }

    setResponse("");
    setSources([]);
    setResponseMeta(null);
    setErrorMessage("");
    setLastSubmittedQuestion(trimmedQuestion);
    setPendingQuestion(trimmedQuestion);
    setVoiceStatusMessage("");
    setIsLoading(true);
    if (isListening) {
      ExpoSpeechRecognitionModule.abort();
      setIsListening(false);
    }
    await stopSpeaking();
    scheduleLoadingMessages();
    const requestAbortController = new AbortController();
    activeRequestAbortRef.current = requestAbortController;

    try {
      const result = await askMuseRag({
        question: trimmedQuestion,
        roomId: artwork?.roomId,
        artworkName: artwork?.title,
        artworkId: artwork?.id,
        sessionId: sessionIdRef.current,
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
        signal: requestAbortController.signal,
      });

      const markdownResponse = (result.markdown ?? result.respuesta).trim();

      setResponse(markdownResponse);
      setSources(result.fuentes ?? []);
      setResponseMeta(result.meta ?? null);
      setStatusMessage("");
      resetQuestionComposer();
      if (artwork?.id) {
        const nextTurn = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          sessionId: sessionIdRef.current,
          artworkId: artwork.id,
          question: trimmedQuestion,
          response: markdownResponse,
          sourceCount: result.meta?.source_count ?? result.fuentes?.length ?? 0,
          createdAt: Date.now(),
        };
        setHistoryTurns((previous) =>
          [nextTurn, ...previous].slice(0, MAX_CHAT_HISTORY_TURNS).map((turn) => ({
            id: turn.id,
            question: turn.question,
            response: turn.response,
            sourceCount: turn.sourceCount,
          })),
        );
        persistChatTurn(nextTurn).catch(() => undefined);
      }
      if (settings.autoPlay && markdownResponse) {
        await speakResponse(markdownResponse);
      }
    } catch (error) {
      if (
        requestAbortController.signal.aborted ||
        (error instanceof Error && error.message === "Consulta cancelada.")
      ) {
        resetQuestionComposer();
        return;
      }

      const message =
        error instanceof Error
          ? error.message
          : "No pude conectar con MuseRAG. Verifica que el backend este activo.";
      setErrorMessage(message);
      setStatusMessage("");
    } finally {
      if (activeRequestAbortRef.current === requestAbortController) {
        activeRequestAbortRef.current = null;
      }
      loadingTimersRef.current.forEach((timerId) => clearTimeout(timerId));
      loadingTimersRef.current = [];
      setPendingQuestion("");
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.backdrop}>
      <ChatSheet
        artworkTitle={artwork?.title ?? "Obra actual"}
        errorMessage={errorMessage}
        isQuestionReady={isQuestionReady}
        isLoading={isLoading}
        onCancelPendingQuestion={cancelPendingQuestion}
        onClose={() => router.back()}
        onOpenImage={openZoomViewer}
        pendingQuestion={pendingQuestion}
        onQuestionTextChange={updateQuestionText}
        onSuggestedQuestionPress={setSuggestedQuestion}
        onRetry={
          lastSubmittedQuestion
            ? () => askQuestion(lastSubmittedQuestion)
            : undefined
        }
        isListening={isListening}
        onSubmit={() => {
          if (isQuestionReady) {
            askQuestion(questionText);
            return;
          }

          toggleListening().catch(() => undefined);
        }}
        onSpeakResponse={() => speakResponse()}
        onStopListening={stopListening}
        onStopSpeaking={stopSpeaking}
        onToggleListening={toggleListening}
        questionText={questionText}
        response={response}
        statusMessage={statusMessage}
        suggestedQuestions={suggestedQuestions}
        voiceStatusMessage={voiceStatusMessage}
        voiceMode={voiceMode}
        isSpeaking={isSpeaking}
        sources={sources}
      />

      {zoomImage ? (
        <ZoomImageViewer
          images={zoomImage.images}
          initialIndex={zoomImage.initialIndex}
          onClose={closeZoomViewer}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: musePalette.overlay,
    flex: 1,
    justifyContent: "flex-end",
  },
});
