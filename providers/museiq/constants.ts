import { permissionCopy } from "@/datos";
import type { AnalyticsSummary } from "@/lib/museum-database";
import type { PermissionCatalog, SettingsState } from "@/providers/museiq/types";

export const defaultSettings: SettingsState = {
  voiceRate: 0.95,
  autoPlay: true,
  subtitles: true,
  highContrast: false,
  vibrations: true,
  visualConfirmations: true,
};

export const defaultPermissionCatalog: PermissionCatalog = {
  bluetooth: { ...permissionCopy.bluetooth },
  physicalActivity: { ...permissionCopy.physicalActivity },
  location: { ...permissionCopy.location },
  microphone: { ...permissionCopy.microphone },
};

export const defaultAnalyticsSummary: AnalyticsSummary = {
  totalEvents: 0,
  totalQuestions: 0,
  totalArtworkSelections: 0,
  totalVoiceStarts: 0,
  totalResets: 0,
  mostConsultedArtworkId: null,
  mostVisitedArtworkId: null,
};
