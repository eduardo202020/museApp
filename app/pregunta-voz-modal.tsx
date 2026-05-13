import { ChatSheet } from "@/components/museiq/chat/chat-sheet";
import { ZoomImageViewer } from "@/components/museiq/chat/zoom-image-viewer";
import { musePalette } from "@/components/museiq/theme";
import {
    askMuseRag,
    type SourceSnippet,
} from "@/lib/muserag-api";
import { useMuseIQ } from "@/providers/museiq-provider";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
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
  const [zoomImage, setZoomImage] = useState<{
    uri: string;
    label?: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (questionText.trim().length > 0) {
      return;
    }

    setQuestionText(artwork?.suggestedQuestions[0] ?? voicePrompts[0] ?? "");
  }, [artwork?.suggestedQuestions, questionText, voicePrompts]);

  const openZoomViewer = (uri: string, label?: string) => {
    setZoomImage({ uri, label });
  };

  const closeZoomViewer = () => {
    setZoomImage(null);
  };

  const askQuestion = async (question: string) => {
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion) {
      setErrorMessage("Escribe una pregunta para continuar.");
      return;
    }

    setResponse("");
    setSources([]);
    setErrorMessage("");
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
      setSources(result.fuentes ?? []);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No pude conectar con MuseRAG. Verifica que el backend esté activo.";
      setErrorMessage(message);
    } finally {
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
        onSubmit={() => askQuestion(questionText)}
        questionText={questionText}
        response={response}
        sources={sources}
      />

      {zoomImage ? (
        <ZoomImageViewer
          label={zoomImage.label}
          onClose={closeZoomViewer}
          uri={zoomImage.uri}
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
