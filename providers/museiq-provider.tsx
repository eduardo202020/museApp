import {
  defaultPermissionStatuses,
  permissionCopy,
  type ArtworkMock,
  type FAQItem,
  type MuseumInfo,
  type RoomMock,
} from '@/datos';
import { getMuseumSnapshot } from '@/lib/museum-database';
import * as Speech from 'expo-speech';
import { router } from 'expo-router';
import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';

type PermissionKey = 'bluetooth' | 'location' | 'microphone';

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
  helpFaq: FAQItem[];
  voicePrompts: string[];
  permissionCatalog: Record<PermissionKey, { title: string; description: string }>;
  currentArtworkId: string;
  currentRoomId: string;
  currentZoneLabel: string;
  permissionsAccepted: boolean;
  permissions: Record<PermissionKey, 'pending' | 'granted' | 'denied' | 'blocked'>;
  settings: SettingsState;
  visitedArtworkIds: string[];
  currentArtwork: ArtworkMock | undefined;
  currentRoom: RoomMock | undefined;
  allPermissionsGranted: boolean;
  requestAllPermissions: () => Promise<boolean>;
  declinePermissions: () => void;
  selectArtwork: (artworkId: string) => void;
  goToNextArtwork: () => void;
  repeatArtworkNarration: () => void;
  continueVisit: () => void;
  updateSettings: (patch: Partial<SettingsState>) => void;
  setCurrentRoomById: (roomId: string) => void;
  setCurrentZoneLabel: (label: string) => void;
  findArtworkById: (artworkId?: string) => ArtworkMock | undefined;
  findRoomById: (roomId?: string) => RoomMock | undefined;
  getArtworksForRoom: (roomId: string) => ArtworkMock[];
}

type PermissionCatalog = Record<PermissionKey, { title: string; description: string }>;

const defaultSettings: SettingsState = {
  voiceRate: 0.95,
  autoPlay: true,
  subtitles: true,
  highContrast: false,
  vibrations: true,
  visualConfirmations: true,
};

const MuseIQContext = createContext<MuseIQContextValue | null>(null);

export function MuseIQProvider({ children }: PropsWithChildren) {
  const [isDatabaseReady, setIsDatabaseReady] = useState(false);
  const [museumProfile, setMuseumProfile] = useState<MuseumInfo | null>(null);
  const [rooms, setRooms] = useState<RoomMock[]>([]);
  const [artworks, setArtworks] = useState<ArtworkMock[]>([]);
  const [helpFaq, setHelpFaq] = useState<FAQItem[]>([]);
  const [voicePrompts, setVoicePrompts] = useState<string[]>([]);
  const [permissionCatalog, setPermissionCatalog] = useState<PermissionCatalog>({
    bluetooth: { ...permissionCopy.bluetooth },
    location: { ...permissionCopy.location },
    microphone: { ...permissionCopy.microphone },
  });
  const [permissionsAccepted, setPermissionsAccepted] = useState(false);
  const [permissions, setPermissions] = useState(defaultPermissionStatuses);
  const [settings, setSettings] = useState(defaultSettings);
  const [currentArtworkId, setCurrentArtworkId] = useState('');
  const [currentRoomId, setCurrentRoomId] = useState('');
  const [currentZoneLabel, setCurrentZoneLabel] = useState('cerca de la entrada');
  const [visitedArtworkIds, setVisitedArtworkIds] = useState<string[]>([]);

  const findArtworkById = (artworkId?: string) => artworks.find((artwork) => artwork.id === artworkId);
  const findRoomById = (roomId?: string) => rooms.find((room) => room.id === roomId);
  const getArtworksForRoom = (roomId: string) =>
    artworks.filter((artwork) => artwork.roomId === roomId).sort((a, b) => a.order - b.order);

  const currentArtwork = findArtworkById(currentArtworkId);
  const currentRoom = findRoomById(currentRoomId);
  const allPermissionsGranted = Object.values(permissions).every((status) => status === 'granted');

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
      setHelpFaq(snapshot.helpFaq);
      setVoicePrompts(snapshot.voicePrompts);
      setPermissionCatalog(snapshot.permissionCatalog);

      const firstRoom = snapshot.rooms[0];
      const initialRoom = snapshot.rooms.find((room) => room.id === 'SALA_2') ?? firstRoom;
      const initialArtwork =
        snapshot.artworks.find((artwork) => artwork.id === 'obra-2-1') ??
        snapshot.artworks.find((artwork) => artwork.roomId === initialRoom?.id) ??
        snapshot.artworks[0];

      if (initialArtwork) {
        setCurrentArtworkId(initialArtwork.id);
        setVisitedArtworkIds([initialArtwork.id]);
      }

      if (initialRoom) {
        setCurrentRoomId(initialRoom.id);
        setCurrentZoneLabel(initialRoom.zoneLabelDefault);
      }

      setIsDatabaseReady(true);
    };

    loadMuseum().catch((error) => {
      console.error('Error loading museum from SQLite:', error);
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

    Speech.stop();
    Speech.speak(`${artwork.title}. ${artwork.audioText || artwork.summary}`, {
      language: 'es-ES',
      rate: settings.voiceRate,
      pitch: 1,
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
  };

  const goToNextArtwork = () => {
    if (artworks.length === 0) {
      return;
    }

    const currentIndex = artworks.findIndex((artwork) => artwork.id === currentArtworkId);
    const nextArtwork = artworks[currentIndex + 1] ?? artworks[0];

    if (nextArtwork) {
      selectArtwork(nextArtwork.id);
      speakArtwork(nextArtwork.id);
    }
  };

  const requestAllPermissions = async () => {
    setPermissionsAccepted(true);

    if (Platform.OS !== 'android') {
      setPermissions({
        bluetooth: 'granted',
        location: 'granted',
        microphone: 'granted',
      });
      return true;
    }

    const granted = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    ]);

    const bluetoothGranted =
      granted['android.permission.BLUETOOTH_SCAN'] === PermissionsAndroid.RESULTS.GRANTED &&
      granted['android.permission.BLUETOOTH_CONNECT'] === PermissionsAndroid.RESULTS.GRANTED;

    const nextPermissions = {
      bluetooth: bluetoothGranted ? 'granted' : 'denied',
      location:
        granted['android.permission.ACCESS_FINE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED
          ? 'granted'
          : 'denied',
      microphone:
        granted['android.permission.RECORD_AUDIO'] === PermissionsAndroid.RESULTS.GRANTED
          ? 'granted'
          : 'denied',
    } as const;

    setPermissions(nextPermissions);

    return Object.values(nextPermissions).every((status) => status === 'granted');
  };

  const declinePermissions = () => {
    setPermissionsAccepted(false);
    setPermissions((previous) => ({
      bluetooth: previous.bluetooth === 'granted' ? 'granted' : 'denied',
      location: previous.location === 'granted' ? 'granted' : 'denied',
      microphone: previous.microphone === 'granted' ? 'granted' : 'denied',
    }));
  };

  const repeatArtworkNarration = () => {
    speakArtwork(currentArtworkId);
  };

  const continueVisit = () => {
    const lastArtworkId = visitedArtworkIds[visitedArtworkIds.length - 1] ?? currentArtworkId;
    selectArtwork(lastArtworkId);
    router.push('/(drawer)/(tabs)/recorrido' as never);
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

  const value = useMemo<MuseIQContextValue>(
    () => ({
      isDatabaseReady,
      museumProfile,
      rooms,
      artworks,
      helpFaq,
      voicePrompts,
      permissionCatalog,
      currentArtworkId,
      currentRoomId,
      currentZoneLabel,
      permissionsAccepted,
      permissions,
      settings,
      visitedArtworkIds,
      currentArtwork,
      currentRoom,
      allPermissionsGranted,
      requestAllPermissions,
      declinePermissions,
      selectArtwork,
      goToNextArtwork,
      repeatArtworkNarration,
      continueVisit,
      updateSettings,
      setCurrentRoomById,
      setCurrentZoneLabel,
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
      currentZoneLabel,
      helpFaq,
      isDatabaseReady,
      museumProfile,
      permissions,
      permissionCatalog,
      permissionsAccepted,
      rooms,
      settings,
      visitedArtworkIds,
      voicePrompts,
    ]
  );

  return <MuseIQContext.Provider value={value}>{children}</MuseIQContext.Provider>;
}

export function useMuseIQ() {
  const context = useContext(MuseIQContext);

  if (!context) {
    throw new Error('useMuseIQ must be used within MuseIQProvider');
  }

  return context;
}
