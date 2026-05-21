import {
    defaultPermissionStatuses,
    permissionCopy,
    type ArtworkMock,
    type FAQItem,
    type MuseumInfo,
    type RouteStepMock,
    type RoomMock,
} from "@/datos";
import {
  getAnalyticsSummary,
  getMuseumSnapshot,
  getVisitorPreference,
  recordAnalyticsEvent,
  resetVisitorSessionData,
  setVisitorPreference,
  type AnalyticsSummary,
} from "@/lib/museum-database";
import { router } from "expo-router";
import * as Speech from "expo-speech";
import {
    createContext,
    PropsWithChildren,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import { PermissionsAndroid, Platform } from "react-native";

type PermissionKey =
  | "bluetooth"
  | "physicalActivity"
  | "location"
  | "microphone";

interface SettingsState {
  voiceRate: number;
  autoPlay: boolean;
  subtitles: boolean;
  highContrast: boolean;
  vibrations: boolean;
  visualConfirmations: boolean;
}

interface MuseIQContextValue {
  isDatabaseReady: boolean;
  museumProfile: MuseumInfo | null;
  rooms: RoomMock[];
  artworks: ArtworkMock[];
  route: RouteStepMock[];
  helpFaq: FAQItem[];
  voicePrompts: string[];
  permissionCatalog: Record<
    PermissionKey,
    { title: string; description: string }
  >;
  currentArtworkId: string;
  currentRoomId: string;
  currentZoneLabel: string;
  currentRouteStep: RouteStepMock | undefined;
  routeProgress: number;
  routeTotal: number;
  routeProgressLabel: string;
  hasCompletedWelcome: boolean;
  debugModeEnabled: boolean;
  permissionsAccepted: boolean;
  permissions: Record<
    PermissionKey,
    "pending" | "granted" | "denied" | "blocked"
  >;
  settings: SettingsState;
  visitedArtworkIds: string[];
  favoriteArtworkIds: string[];
  currentArtwork: ArtworkMock | undefined;
  currentRoom: RoomMock | undefined;
  isArtworkNarrationPlaying: boolean;
  analyticsSummary: AnalyticsSummary;
  allPermissionsGranted: boolean;
  requestAllPermissions: () => Promise<boolean>;
  declinePermissions: () => void;
  selectArtwork: (artworkId: string) => void;
  goToNextArtwork: () => void;
  goToPreviousArtwork: () => void;
  repeatArtworkNarration: () => void;
  continueVisit: () => void;
  completeWelcome: () => void;
  setDebugModeEnabled: (enabled: boolean) => void;
  toggleFavoriteArtwork: (artworkId: string) => void;
  updateSettings: (patch: Partial<SettingsState>) => void;
  setCurrentRoomById: (roomId: string) => void;
  setCurrentZoneLabel: (label: string) => void;
  refreshAnalyticsSummary: () => Promise<void>;
  resetVisitorExperience: () => Promise<void>;
  findArtworkById: (artworkId?: string) => ArtworkMock | undefined;
  findRoomById: (roomId?: string) => RoomMock | undefined;
  getArtworksForRoom: (roomId: string) => ArtworkMock[];
}

type PermissionCatalog = Record<
  PermissionKey,
  { title: string; description: string }
>;

const defaultSettings: SettingsState = {
  voiceRate: 0.95,
  autoPlay: true,
  subtitles: true,
  highContrast: false,
  vibrations: true,
  visualConfirmations: true,
};

const MuseIQContext = createContext<MuseIQContextValue | null>(null);

const defaultAnalyticsSummary: AnalyticsSummary = {
  totalEvents: 0,
  totalQuestions: 0,
  totalArtworkSelections: 0,
  totalVoiceStarts: 0,
  totalResets: 0,
  mostConsultedArtworkId: null,
  mostVisitedArtworkId: null,
};

export function MuseIQProvider({ children }: PropsWithChildren) {
  const [isDatabaseReady, setIsDatabaseReady] = useState(false);
  const [museumProfile, setMuseumProfile] = useState<MuseumInfo | null>(null);
  const [rooms, setRooms] = useState<RoomMock[]>([]);
  const [artworks, setArtworks] = useState<ArtworkMock[]>([]);
  const [route, setRoute] = useState<RouteStepMock[]>([]);
  const [helpFaq, setHelpFaq] = useState<FAQItem[]>([]);
  const [voicePrompts, setVoicePrompts] = useState<string[]>([]);
  const [permissionCatalog, setPermissionCatalog] = useState<PermissionCatalog>(
    {
      bluetooth: { ...permissionCopy.bluetooth },
      physicalActivity: { ...permissionCopy.physicalActivity },
      location: { ...permissionCopy.location },
      microphone: { ...permissionCopy.microphone },
    },
  );
  const [permissionsAccepted, setPermissionsAccepted] = useState(false);
  const [permissions, setPermissions] = useState(defaultPermissionStatuses);
  const [settings, setSettings] = useState(defaultSettings);
  const [currentArtworkId, setCurrentArtworkId] = useState("");
  const [currentRoomId, setCurrentRoomId] = useState("");
  const [currentZoneLabel, setCurrentZoneLabel] = useState(
    "cerca de la entrada",
  );
  const [visitedArtworkIds, setVisitedArtworkIds] = useState<string[]>([]);
  const [favoriteArtworkIds, setFavoriteArtworkIds] = useState<string[]>([]);
  const [hasCompletedWelcome, setHasCompletedWelcome] = useState(false);
  const [debugModeEnabled, setDebugModeEnabledState] = useState(false);
  const [isArtworkNarrationPlaying, setIsArtworkNarrationPlaying] = useState(false);
  const [narratingArtworkId, setNarratingArtworkId] = useState<string | null>(null);
  const [analyticsSummary, setAnalyticsSummary] = useState<AnalyticsSummary>(
    defaultAnalyticsSummary
  );

  const findArtworkById = (artworkId?: string) =>
    artworks.find((artwork) => artwork.id === artworkId);
  const findRoomById = (roomId?: string) =>
    rooms.find((room) => room.id === roomId);
  const getArtworksForRoom = (roomId: string) =>
    artworks
      .filter((artwork) => artwork.roomId === roomId)
      .sort((a, b) => a.order - b.order);

  const currentArtwork = findArtworkById(currentArtworkId);
  const currentRoom = findRoomById(currentRoomId);
  const currentRouteStep = useMemo(
    () => route.find((step) => step.artworkId === currentArtworkId),
    [currentArtworkId, route],
  );
  const routeProgress = currentRouteStep?.sequence ?? 0;
  const routeTotal = route.length;
  const routeProgressLabel =
    routeTotal > 0
      ? `${Math.max(1, routeProgress)} de ${routeTotal} obras`
      : "Recorrido en preparacion";
  const allPermissionsGranted = Object.values(permissions).every(
    (status) => status === "granted",
  );

  useEffect(() => {
    let isMounted = true;

    const loadMuseum = async () => {
      const snapshot = await getMuseumSnapshot();
      if (!isMounted) {
        return;
      }

      setMuseumProfile(snapshot.museumProfile);
      setRooms(snapshot.rooms);
      setArtworks(snapshot.artworks);
      setRoute(snapshot.route);
      setHelpFaq(snapshot.helpFaq);
      setVoicePrompts(snapshot.voicePrompts);
      setPermissionCatalog(snapshot.permissionCatalog);

      const [welcomePreference, debugPreference, favoritePreference] = await Promise.all([
        getVisitorPreference("welcome_completed"),
        getVisitorPreference("debug_mode_enabled"),
        getVisitorPreference("favorite_artwork_ids"),
      ]);
      setHasCompletedWelcome(welcomePreference === "true");
      setDebugModeEnabledState(debugPreference === "true");
      if (favoritePreference) {
        try {
          setFavoriteArtworkIds(JSON.parse(favoritePreference) as string[]);
        } catch {
          setFavoriteArtworkIds([]);
        }
      }

      const firstRoom = snapshot.rooms[0];
      const initialRoom = firstRoom;
      const initialArtwork = snapshot.route.length
        ? snapshot.artworks.find(
            (artwork) => artwork.id === snapshot.route[0]?.artworkId,
          )
        : snapshot.artworks.find(
            (artwork) => artwork.roomId === initialRoom?.id,
          ) ?? snapshot.artworks[0];

      if (initialArtwork) {
        setCurrentArtworkId(initialArtwork.id);
        setVisitedArtworkIds([initialArtwork.id]);
      }

      if (initialRoom) {
        setCurrentRoomId(initialRoom.id);
        setCurrentZoneLabel(initialRoom.zoneLabelDefault);
      }

      const analytics = await getAnalyticsSummary();
      if (isMounted) {
        setAnalyticsSummary(analytics);
      }

      setIsDatabaseReady(true);
    };

    loadMuseum().catch((error) => {
      console.error("Error loading museum from SQLite:", error);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const markVisited = (artworkId: string) => {
    setVisitedArtworkIds((previous) => {
      const deduped = previous.filter((value) => value !== artworkId);
      return [...deduped, artworkId];
    });
  };

  const speakArtwork = (artworkId: string) => {
    const artwork = findArtworkById(artworkId);
    if (!artwork) {
      return;
    }

    if (isArtworkNarrationPlaying && narratingArtworkId === artworkId) {
      Speech.stop();
      setIsArtworkNarrationPlaying(false);
      setNarratingArtworkId(null);
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

  const selectArtwork = (artworkId: string) => {
    const artwork = findArtworkById(artworkId);
    if (!artwork) {
      return;
    }

    setCurrentArtworkId(artworkId);
    setCurrentRoomId(artwork.roomId);
    markVisited(artworkId);
    recordAnalyticsEvent({
      eventType: "artwork_selected",
      artworkId: artwork.id,
      roomId: artwork.roomId,
      metadata: { title: artwork.title },
    })
      .then(() => getAnalyticsSummary())
      .then(setAnalyticsSummary)
      .catch(() => undefined);
  };

  const goToRelativeArtwork = (direction: -1 | 1) => {
    if (artworks.length === 0) {
      return;
    }

    const routeIndex = route.findIndex((step) => step.artworkId === currentArtworkId);
    const nextRouteStep =
      routeIndex >= 0
        ? route[routeIndex + direction]
        : undefined;

    if (nextRouteStep) {
      selectArtwork(nextRouteStep.artworkId);
      speakArtwork(nextRouteStep.artworkId);
      return;
    }

    const currentIndex = artworks.findIndex(
      (artwork) => artwork.id === currentArtworkId,
    );
    const fallbackArtwork =
      direction === 1
        ? artworks[currentIndex + 1] ?? artworks[0]
        : artworks[currentIndex - 1] ?? artworks[artworks.length - 1];

    if (fallbackArtwork) {
      selectArtwork(fallbackArtwork.id);
      speakArtwork(fallbackArtwork.id);
    }
  };

  const goToNextArtwork = () => {
    goToRelativeArtwork(1);
  };

  const goToPreviousArtwork = () => {
    goToRelativeArtwork(-1);
  };

  const requestAllPermissions = async () => {
    setPermissionsAccepted(true);

    if (Platform.OS !== "android") {
      setPermissions({
        bluetooth: "granted",
        physicalActivity: "granted",
        location: "granted",
        microphone: "granted",
      });
      return true;
    }

    const granted = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      PermissionsAndroid.PERMISSIONS.ACTIVITY_RECOGNITION,
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    ]);

    const bluetoothGranted =
      granted["android.permission.BLUETOOTH_SCAN"] ===
        PermissionsAndroid.RESULTS.GRANTED &&
      granted["android.permission.BLUETOOTH_CONNECT"] ===
        PermissionsAndroid.RESULTS.GRANTED;

    const nextPermissions = {
      bluetooth: bluetoothGranted ? "granted" : "denied",
      physicalActivity:
        granted["android.permission.ACTIVITY_RECOGNITION"] ===
        PermissionsAndroid.RESULTS.GRANTED
          ? "granted"
          : "denied",
      location:
        granted["android.permission.ACCESS_FINE_LOCATION"] ===
        PermissionsAndroid.RESULTS.GRANTED
          ? "granted"
          : "denied",
      microphone:
        granted["android.permission.RECORD_AUDIO"] ===
        PermissionsAndroid.RESULTS.GRANTED
          ? "granted"
          : "denied",
    } as const;

    setPermissions(nextPermissions);

    return Object.values(nextPermissions).every(
      (status) => status === "granted",
    );
  };

  const declinePermissions = () => {
    setPermissionsAccepted(false);
    setPermissions((previous) => ({
      bluetooth: previous.bluetooth === "granted" ? "granted" : "denied",
      physicalActivity:
        previous.physicalActivity === "granted" ? "granted" : "denied",
      location: previous.location === "granted" ? "granted" : "denied",
      microphone: previous.microphone === "granted" ? "granted" : "denied",
    }));
  };

  const repeatArtworkNarration = () => {
    speakArtwork(currentArtworkId);
  };

  const continueVisit = () => {
    const lastArtworkId =
      visitedArtworkIds[visitedArtworkIds.length - 1] ?? currentArtworkId;
    selectArtwork(lastArtworkId);
    router.push("/" as never);
  };

  const completeWelcome = () => {
    setHasCompletedWelcome(true);
    setVisitorPreference("welcome_completed", "true").catch(() => undefined);
    recordAnalyticsEvent({
      eventType: "welcome_completed",
      artworkId: currentArtworkId || null,
      roomId: currentRoomId || null,
    })
      .then(() => getAnalyticsSummary())
      .then(setAnalyticsSummary)
      .catch(() => undefined);
  };

  const setDebugModeEnabled = (enabled: boolean) => {
    setDebugModeEnabledState(enabled);
    setVisitorPreference("debug_mode_enabled", enabled ? "true" : "false").catch(
      () => undefined,
    );
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

  const updateSettings = (patch: Partial<SettingsState>) => {
    setSettings((previous) => ({ ...previous, ...patch }));
  };

  const setCurrentRoomById = (roomId: string) => {
    const room = findRoomById(roomId);
    if (!room) {
      return;
    }

    setCurrentRoomId(roomId);
    setCurrentZoneLabel(room.zoneLabelDefault);
    const firstArtwork = getArtworksForRoom(roomId)[0];
    if (firstArtwork) {
      setCurrentArtworkId(firstArtwork.id);
    }
  };

  const refreshAnalyticsSummary = async () => {
    const analytics = await getAnalyticsSummary();
    setAnalyticsSummary(analytics);
  };

  const resetVisitorExperience = async () => {
    await Speech.stop();
    setIsArtworkNarrationPlaying(false);
    setNarratingArtworkId(null);
    await resetVisitorSessionData();

    const snapshot = await getMuseumSnapshot();
    const initialRoom = snapshot.rooms[0];
    const initialArtwork = snapshot.route.length
      ? snapshot.artworks.find(
          (artwork) => artwork.id === snapshot.route[0]?.artworkId,
        )
      : snapshot.artworks.find(
          (artwork) => artwork.roomId === initialRoom?.id,
        ) ?? snapshot.artworks[0];

    setHasCompletedWelcome(false);
    setDebugModeEnabledState(false);
    setPermissionsAccepted(false);
    setPermissions(defaultPermissionStatuses);
    setSettings(defaultSettings);
    setFavoriteArtworkIds([]);
    setVisitedArtworkIds(initialArtwork ? [initialArtwork.id] : []);
    setCurrentArtworkId(initialArtwork?.id ?? "");
    setCurrentRoomId(initialRoom?.id ?? "");
    setCurrentZoneLabel(initialRoom?.zoneLabelDefault ?? "cerca de la entrada");
    setAnalyticsSummary(await getAnalyticsSummary());
  };

  const value = useMemo<MuseIQContextValue>(
    () => ({
      isDatabaseReady,
      museumProfile,
      rooms,
      artworks,
      route,
      helpFaq,
      voicePrompts,
      permissionCatalog,
      currentArtworkId,
      currentRoomId,
      currentZoneLabel,
      currentRouteStep,
      routeProgress,
      routeTotal,
      routeProgressLabel,
      hasCompletedWelcome,
      debugModeEnabled,
      permissionsAccepted,
      permissions,
      settings,
      visitedArtworkIds,
      favoriteArtworkIds,
      currentArtwork,
      currentRoom,
      isArtworkNarrationPlaying,
      analyticsSummary,
      allPermissionsGranted,
      requestAllPermissions,
      declinePermissions,
      selectArtwork,
      goToNextArtwork,
      goToPreviousArtwork,
      repeatArtworkNarration,
      continueVisit,
      completeWelcome,
      setDebugModeEnabled,
      toggleFavoriteArtwork,
      updateSettings,
      setCurrentRoomById,
      setCurrentZoneLabel,
      refreshAnalyticsSummary,
      resetVisitorExperience,
      findArtworkById,
      findRoomById,
      getArtworksForRoom,
    }),
    [
      artworks,
      allPermissionsGranted,
      currentArtwork,
      currentArtworkId,
      currentRoom,
      currentRoomId,
      currentRouteStep,
      currentZoneLabel,
      debugModeEnabled,
      favoriteArtworkIds,
      hasCompletedWelcome,
      helpFaq,
      isArtworkNarrationPlaying,
      isDatabaseReady,
      museumProfile,
      analyticsSummary,
      permissions,
      permissionCatalog,
      permissionsAccepted,
      route,
      routeProgress,
      routeProgressLabel,
      routeTotal,
      rooms,
      settings,
      visitedArtworkIds,
      voicePrompts,
    ],
  );

  return (
    <MuseIQContext.Provider value={value}>{children}</MuseIQContext.Provider>
  );
}

export function useMuseIQ() {
  const context = useContext(MuseIQContext);

  if (!context) {
    throw new Error("useMuseIQ must be used within MuseIQProvider");
  }

  return context;
}
