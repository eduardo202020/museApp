import { ChatSheet } from "@/components/museiq/chat/chat-sheet";
import { ZoomImageViewer } from "@/components/museiq/chat/zoom-image-viewer";
import type { SourceImageItem } from "@/components/museiq/chat/source-image-carousel";
import { musePalette } from "@/components/museiq/theme";
import {
    askMuseRag,
    type SourceSnippet,
} from "@/lib/muserag-api";
import { useMuseIQ } from "@/providers/museiq-provider";
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from "expo-speech-recognition";
import { router, useLocalSearchParams } from "expo-router";
import * as Speech from "expo-speech";
import { useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";

const RECOGNITION_LANGUAGE = "es-ES";
const SPEECH_LANGUAGE = "es-PE";

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
  const [response, setResponse] = useState("");
  const [sources, setSources] = useState<SourceSnippet[]>([]);
  const [responseMeta, setResponseMeta] = useState<{
    total_ms: number;
    retrieval_ms: number;
    generation_ms: number;
    source_count: number;
  } | null>(null);
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
  const [voiceStatusMessage, setVoiceStatusMessage] = useState("");
  const loadingTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const suggestedQuestions = useMemo(() => {
    const candidates = [
      ...(artwork?.suggestedQuestions ?? []),
      ...voicePrompts,
    ].map((item) => item.trim()).filter(Boolean);

    return [...new Set(candidates)].slice(0, 4);
  }, [artwork?.suggestedQuestions, voicePrompts]);

  useEffect(() => {
    if (questionText.trim().length > 0) {
      return;
    }

    setQuestionText(artwork?.suggestedQuestions[0] ?? voicePrompts[0] ?? "");
  }, [artwork?.suggestedQuestions, questionText, voicePrompts]);

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
    const trimmedText = text.trim();
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
    setVoiceStatusMessage((current) =>
      current.startsWith("Procesando")
        ? "Dictado listo. Revisa la pregunta o enviala."
        : current,
    );
  });

  useSpeechRecognitionEvent("result", (event) => {
    const transcript = event.results?.[0]?.transcript?.trim();
    if (!transcript) {
      return;
    }

    setQuestionText(transcript);
    setVoiceStatusMessage(
      event.isFinal
        ? "Dictado listo. Revisa la pregunta o enviala."
        : "Escuchando tu pregunta...",
    );
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

    setVoiceStatusMessage("");
    setErrorMessage(message);
  });

  useEffect(() => {
    return () => {
      loadingTimersRef.current.forEach((timerId) => clearTimeout(timerId));
      loadingTimersRef.current = [];
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

    setResponse("");
    setSources([]);
    setResponseMeta(null);
    setErrorMessage("");
    setLastSubmittedQuestion(trimmedQuestion);
    setVoiceStatusMessage("");
    setIsLoading(true);
    if (isListening) {
      ExpoSpeechRecognitionModule.abort();
      setIsListening(false);
    }
    await stopSpeaking();
    scheduleLoadingMessages();

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
      setSources(result.fuentes ?? []);
      setResponseMeta(result.meta ?? null);
      setStatusMessage("");
      if (settings.autoPlay && result.respuesta.trim()) {
        await speakResponse(result.respuesta);
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No pude conectar con MuseRAG. Verifica que el backend este activo.";
      setErrorMessage(message);
      setStatusMessage("");
    } finally {
      loadingTimersRef.current.forEach((timerId) => clearTimeout(timerId));
      loadingTimersRef.current = [];
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.backdrop}>
      <ChatSheet
        artworkTitle={artwork?.title ?? "Obra actual"}
        errorMessage={errorMessage}
        isLoading={isLoading}
        onClose={() => router.back()}
        onOpenImage={openZoomViewer}
        onQuestionTextChange={setQuestionText}
        onRetry={
          lastSubmittedQuestion
            ? () => askQuestion(lastSubmittedQuestion)
            : undefined
        }
        isListening={isListening}
        onSubmit={() => askQuestion(questionText)}
        onSpeakResponse={() => speakResponse()}
        onStopListening={stopListening}
        onStopSpeaking={stopSpeaking}
        onToggleListening={toggleListening}
        questionText={questionText}
        response={response}
        responseMeta={responseMeta}
        statusMessage={statusMessage}
        suggestedQuestions={suggestedQuestions}
        voiceStatusMessage={voiceStatusMessage}
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
