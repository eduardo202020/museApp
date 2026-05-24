import type { ArtworkMock } from "@/datos";
import type { SettingsState } from "@/providers/museiq/types";
import * as Speech from "expo-speech";
import { useState } from "react";

type UseArtworkNarrationParams = {
  findArtworkById: (artworkId?: string) => ArtworkMock | undefined;
  settings: SettingsState;
};

export function useArtworkNarration({
  findArtworkById,
  settings,
}: UseArtworkNarrationParams) {
  const [isArtworkNarrationPlaying, setIsArtworkNarrationPlaying] = useState(false);
  const [narratingArtworkId, setNarratingArtworkId] = useState<string | null>(null);

  const stopArtworkNarration = async () => {
    await Speech.stop();
    setIsArtworkNarrationPlaying(false);
    setNarratingArtworkId(null);
  };

  const speakArtwork = (artworkId: string) => {
    const artwork = findArtworkById(artworkId);
    if (!artwork) {
      return;
    }

    if (isArtworkNarrationPlaying && narratingArtworkId === artworkId) {
      void stopArtworkNarration();
      return;
    }

    Speech.stop();
    setNarratingArtworkId(artworkId);
    setIsArtworkNarrationPlaying(true);
    Speech.speak(`${artwork.title}. ${artwork.audioText || artwork.summary}`, {
      language: "es-ES",
      rate: settings.voiceRate,
      pitch: 1,
      onDone: () => {
        setIsArtworkNarrationPlaying(false);
        setNarratingArtworkId(null);
      },
      onStopped: () => {
        setIsArtworkNarrationPlaying(false);
        setNarratingArtworkId(null);
      },
      onError: () => {
        setIsArtworkNarrationPlaying(false);
        setNarratingArtworkId(null);
      },
    });
  };

  return {
    isArtworkNarrationPlaying,
    speakArtwork,
    stopArtworkNarration,
  };
}
