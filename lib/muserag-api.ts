import Constants from 'expo-constants';

type ArtworkPayload = {
  id?: string;
  title?: string;
  author?: string;
  year?: string;
  period?: string;
  technique?: string;
  summary?: string;
  context?: string;
  roomRelation?: string;
  locationHint?: string;
  suggestedQuestions?: string[];
};

export interface MuseRagQueryParams {
  question: string;
  roomId?: string;
  artworkId?: string;
  artwork?: ArtworkPayload;
}

export interface MuseRagSource {
  id: string;
  source: string;
  kind: string;
  score: number;
  text: string;
  metadata: Record<string, unknown>;
}

export interface MuseRagResponse {
  answer: string;
  sources: MuseRagSource[];
  used_artwork_context: boolean;
}

function resolveMuseRagUrl() {
  const envUrl = process.env.EXPO_PUBLIC_MUSERAG_URL;
  if (envUrl) {
    return envUrl.replace(/\/$/, '');
  }

  const hostUri = Constants.expoConfig?.hostUri ?? '';
  const host = hostUri.split(':')[0];
  if (host) {
    return `http://${host}:8000`;
  }

  return 'http://127.0.0.1:8000';
}

export async function askMuseRag(params: MuseRagQueryParams): Promise<MuseRagResponse> {
  const baseUrl = resolveMuseRagUrl();
  const response = await fetch(`${baseUrl}/chat/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      question: params.question,
      room_id: params.roomId,
      artwork_id: params.artworkId,
      artwork_context: params.artwork
        ? {
            id: params.artwork.id,
            title: params.artwork.title,
            author: params.artwork.author,
            year: params.artwork.year,
            period: params.artwork.period,
            technique: params.artwork.technique,
            summary: params.artwork.summary,
            context: params.artwork.context,
            room_relation: params.artwork.roomRelation,
            location_hint: params.artwork.locationHint,
            suggested_questions: params.artwork.suggestedQuestions ?? [],
          }
        : null,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'No se pudo consultar MuseRAG.');
  }

  return (await response.json()) as MuseRagResponse;
}
