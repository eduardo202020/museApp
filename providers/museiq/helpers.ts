import type { ArtworkMock, RoomMock } from "@/datos";

export function parseFavoriteArtworkIds(rawPreference: string | null) {
  if (!rawPreference) {
    return [];
  }

  try {
    return JSON.parse(rawPreference) as string[];
  } catch {
    return [];
  }
}

export function getInitialMuseumSelection({
  artworks,
  route,
  rooms,
}: {
  artworks: ArtworkMock[];
  route: { artworkId: string }[];
  rooms: RoomMock[];
}) {
  const initialRoom = rooms[0];
  const initialArtwork = route.length
    ? artworks.find((artwork) => artwork.id === route[0]?.artworkId)
    : artworks.find((artwork) => artwork.roomId === initialRoom?.id) ?? artworks[0];

  return {
    initialArtwork,
    initialRoom,
  };
}

export function getRouteProgressLabel(routeProgress: number, routeTotal: number) {
  return routeTotal > 0
    ? `${Math.max(1, routeProgress)} de ${routeTotal} obras`
    : "Recorrido en preparacion";
}
