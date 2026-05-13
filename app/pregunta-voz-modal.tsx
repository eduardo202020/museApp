import { ChatSheet } from "@/components/museiq/chat/chat-sheet";
import { ZoomImageViewer } from "@/components/museiq/chat/zoom-image-viewer";
import type { SourceImageItem } from "@/components/museiq/chat/source-image-carousel";
import { musePalette } from "@/components/museiq/theme";
import {
    askMuseRag,
    type SourceSnippet,
} from "@/lib/muserag-api";
import { useMuseIQ } from "@/providers/museiq-provider";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";

export default function PreguntaVozModal() {
  const params = useLocalSearchParams<{ artworkId?: string }>();
  const { currentArtwork, findArtworkById, voicePrompts } = useMuseIQ();
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
  const [lastSubmittedQuestion, setLastSubmittedQuestion] = useState("");
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

  useEffect(() => {
    return () => {
      loadingTimersRef.current.forEach((timerId) => clearTimeout(timerId));
      loadingTimersRef.current = [];
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
    setIsLoading(true);
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
        onSubmit={() => askQuestion(questionText)}
        questionText={questionText}
        response={response}
        responseMeta={responseMeta}
        statusMessage={statusMessage}
        suggestedQuestions={suggestedQuestions}
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
