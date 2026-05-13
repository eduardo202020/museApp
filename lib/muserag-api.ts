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

export interface MuseRagResponse {
  respuesta: string;
}

const HEALTH_TIMEOUT_MS = 4000;
const QUERY_TIMEOUT_MS = 20000;

function resolveMuseRagUrl() {
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

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
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

  console.log('MuseRAG baseUrl:', baseUrl);
  console.log('MuseRAG payload:', payload);

  try {
    const healthResponse = await fetchWithTimeout(
      `${baseUrl}/health`,
      {
        method: 'GET',
      },
      HEALTH_TIMEOUT_MS
    );
    console.log('MuseRAG health status:', healthResponse.status);
  } catch (error) {
    console.log('MuseRAG health error:', error);
    throw new Error(
      `No se pudo conectar con MuseRAG en ${baseUrl}. Verifica que la API esté corriendo y que el celular pueda acceder a esa IP.`
    );
  }

  let response: Response;
  try {
    response = await fetchWithTimeout(
      `${baseUrl}/api/preguntar`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      },
      QUERY_TIMEOUT_MS
    );
  } catch (error) {
    console.log('MuseRAG query error:', error);
    throw new Error(
      `MuseRAG tardó demasiado o no respondió desde ${baseUrl}. Revisa la consola del backend y LM Studio.`
    );
  }

  const rawBody = await response.text();

  console.log('MuseRAG response status:', response.status);
  console.log('MuseRAG response body:', rawBody);

  if (!response.ok) {
    throw new Error(rawBody || `No se pudo consultar MuseRAG. HTTP ${response.status}`);
  }

  try {
    return JSON.parse(rawBody) as MuseRagResponse;
  } catch {
    throw new Error('MuseRAG devolvio una respuesta no valida en JSON.');
  }
}
