import type { ArtworkMock } from "@/datos";
import {
  getAnalyticsSummary,
  recordAnalyticsEvent,
  setVisitorPreference,
  type AnalyticsSummary,
} from "@/lib/museum-database";
import { Dispatch, SetStateAction } from "react";

type UseMuseIQAnalyticsFavoritesParams = {
  findArtworkById: (artworkId?: string) => ArtworkMock | undefined;
  setAnalyticsSummary: Dispatch<SetStateAction<AnalyticsSummary>>;
  setFavoriteArtworkIds: Dispatch<SetStateAction<string[]>>;
};

export function useMuseIQAnalyticsFavorites({
  findArtworkById,
  setAnalyticsSummary,
  setFavoriteArtworkIds,
}: UseMuseIQAnalyticsFavoritesParams) {
  const refreshAnalyticsSummary = async () => {
    const analytics = await getAnalyticsSummary();
    setAnalyticsSummary(analytics);
  };

  const toggleFavoriteArtwork = (artworkId: string) => {
    const artwork = findArtworkById(artworkId);
    if (!artwork) {
      return;
    }

    setFavoriteArtworkIds((previous) => {
      const next = previous.includes(artworkId)
        ? previous.filter((value) => value !== artworkId)
        : [...previous, artworkId];

      setVisitorPreference("favorite_artwork_ids", JSON.stringify(next)).catch(
        () => undefined,
      );
      recordAnalyticsEvent({
        eventType: previous.includes(artworkId)
          ? "artwork_unfavorited"
          : "artwork_favorited",
        artworkId,
        roomId: artwork.roomId,
        metadata: { title: artwork.title },
      }).catch(() => undefined);

      return next;
    });
  };

  return {
    refreshAnalyticsSummary,
    toggleFavoriteArtwork,
  };
}
