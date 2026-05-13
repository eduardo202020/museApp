import Constants from 'expo-constants';

export interface MuseRagArtworkContext {
  id?: string;
  title?: string;
  author?: string;
  year?: string;
  period?: string;
  technique?: string;
  summary?: string;
  context?: string;
  room_relation?: string;
  location_hint?: string;
  suggested_questions?: string[];
}

export interface MuseRagQueryParams {
  question: string;
  roomId?: string;
  artworkName?: string;
  museumSlug?: string;
  artworkId?: string;
  artworkContext?: MuseRagArtworkContext;
}

export interface SourceSnippet {
  id: string;
  source: string;
  kind: string;
  score: number;
  text: string;
  image_url?: string;
  metadata?: Record<string, unknown>;
}

export interface MuseRagResponseMeta {
  total_ms: number;
  retrieval_ms: number;
  generation_ms: number;
  source_count: number;
}

export interface MuseRagResponse {
  respuesta: string;
  fuentes?: SourceSnippet[];
  meta?: MuseRagResponseMeta;
}

const MUSERAG_TIMEOUT_MS = 45000;

export function resolveMuseRagUrl() {
  const envUrl = process.env.EXPO_PUBLIC_MUSERAG_URL;
  if (envUrl) {
    return envUrl.replace(/\/$/, '');
  }

  const constantsWithExtras = Constants as typeof Constants & {
    manifest2?: {
      extra?: {
        expoClient?: {
          hostUri?: string;
        };
      };
    };
  };

  const hostUri =
    Constants.expoConfig?.hostUri ??
    Constants.expoGoConfig?.debuggerHost ??
    constantsWithExtras.manifest2?.extra?.expoClient?.hostUri ??
    '';
  const host = hostUri.split(':')[0];
  if (host) {
    return `http://${host}:8000`;
  }

  return 'http://127.0.0.1:8000';
}

export async function askMuseRag(params: MuseRagQueryParams): Promise<MuseRagResponse> {
  const baseUrl = resolveMuseRagUrl();
  const payload = {
    pregunta: params.question,
    museo: params.museumSlug ?? 'tumbas-reales-de-sipan',
    sala: params.roomId,
    obra: params.artworkName ?? params.artworkId,
    artwork_context: params.artworkContext,
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), MUSERAG_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(`${baseUrl}/api/preguntar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(
        'La consulta supero el tiempo de espera. Puedes intentarlo de nuevo o hacer una pregunta mas puntual.'
      );
    }

    throw new Error(
      `No pude completar la consulta con MuseRAG en ${baseUrl}. Verifica que la API este corriendo y que el celular pueda acceder a esa IP.`
    );
  } finally {
    clearTimeout(timeoutId);
  }

  const rawBody = await response.text();

  if (!response.ok) {
    throw new Error(rawBody || `No se pudo consultar MuseRAG. HTTP ${response.status}`);
  }

  try {
    return JSON.parse(rawBody) as MuseRagResponse;
  } catch {
    throw new Error('MuseRAG devolvio una respuesta no valida en JSON.');
  }
}
