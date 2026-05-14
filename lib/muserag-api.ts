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
  sessionId?: string;
  artworkContext?: MuseRagArtworkContext;
}

export interface SourceSnippet {
  id: string;
  source: string;
  kind: string;
  score: number;
  text: string;
  image_url?: string;
  source_label?: string;
  metadata?: Record<string, unknown>;
}

export interface MuseRagResponseMeta {
  total_ms: number;
  retrieval_ms: number;
  generation_ms: number;
  source_count: number;
  support_level?: string;
  applied_filters?: string[];
}

export interface MuseRagResponse {
  respuesta: string;
  fuentes?: SourceSnippet[];
  meta?: MuseRagResponseMeta;
}

const MUSERAG_TIMEOUT_MS = 45000;

function normalizeMuseRagUrl(url: string, fallbackHost?: string) {
  const trimmedUrl = url.trim().replace(/\/$/, '');

  if (!fallbackHost) {
    return trimmedUrl;
  }

  try {
    const parsedUrl = new URL(trimmedUrl);
    if (
      parsedUrl.hostname === 'localhost' ||
      parsedUrl.hostname === '127.0.0.1' ||
      parsedUrl.hostname === '0.0.0.0'
    ) {
      parsedUrl.hostname = fallbackHost;
      return parsedUrl.toString().replace(/\/$/, '');
    }
  } catch {
    return trimmedUrl;
  }

  return trimmedUrl;
}

export function resolveMuseRagUrl() {
  const constantsWithExtras = Constants as typeof Constants & {
    expoConfig?: {
      extra?: {
        museRagUrl?: string;
      };
    };
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

  const configExtraUrl = constantsWithExtras.expoConfig?.extra?.museRagUrl;
  if (configExtraUrl) {
    return normalizeMuseRagUrl(configExtraUrl, host || undefined);
  }

  const envUrl = process.env.EXPO_PUBLIC_MUSERAG_URL;
  if (envUrl) {
    return normalizeMuseRagUrl(envUrl, host || undefined);
  }

  if (host) {
    return `http://${host}:8000`;
  }

  return '';
}

export async function askMuseRag(params: MuseRagQueryParams): Promise<MuseRagResponse> {
  const baseUrl = resolveMuseRagUrl();
  if (!baseUrl) {
    throw new Error(
      'No encontre la URL de MuseRAG. Reinicia Expo para que lea el archivo .env o define EXPO_PUBLIC_MUSERAG_URL con una IP accesible desde tu celular.'
    );
  }

  const payload = {
    pregunta: params.question,
    museo: params.museumSlug ?? 'tumbas-reales-de-sipan',
    sala: params.roomId,
    obra: params.artworkName ?? params.artworkId,
    session_id: params.sessionId,
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
      `No pude completar la consulta con MuseRAG en ${baseUrl}. Verifica que Expo haya recargado el .env, que la API este corriendo y que esa IP sea accesible desde tu celular.`
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
