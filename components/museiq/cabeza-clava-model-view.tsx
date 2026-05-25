import { DEFAULT_ARTWORK_MODEL, getArtworkModelAssetForArtwork } from "@/lib/artwork-models";
import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system/legacy";
import { GLView, type ExpoWebGLRenderingContext } from "expo-gl";
import { Buffer } from "buffer";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  PanResponder,
  Platform,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import * as THREE from "three";

type CabezaClavaModelViewProps = {
  autoRotate?: boolean;
  headTracking?: boolean;
  interactive?: boolean;
  modelAsset?: ModelAsset;
  modelLabel?: string;
  onHeadTrackingDebug?: (snapshot: HeadTrackingDebugState) => void;
  recenterSignal?: number;
  showStatus?: boolean;
  stereo?: boolean;
  style?: StyleProp<ViewStyle>;
  viewMode?: ModelViewMode;
};

type ModelAsset = number;
type ModelViewMode = "object" | "immersive";

type GltfJson = {
  accessors: GltfAccessor[];
  bufferViews: GltfBufferView[];
  images?: GltfImage[];
  materials?: GltfMaterial[];
  meshes?: GltfMesh[];
  nodes?: GltfNode[];
  samplers?: GltfSampler[];
  scene?: number;
  scenes?: { nodes?: number[] }[];
  textures?: GltfTexture[];
};

type GltfAccessor = {
  bufferView?: number;
  byteOffset?: number;
  componentType: number;
  count: number;
  normalized?: boolean;
  type: "SCALAR" | "VEC2" | "VEC3" | "VEC4" | "MAT2" | "MAT3" | "MAT4";
};

type GltfBufferView = {
  buffer?: number;
  byteLength: number;
  byteOffset?: number;
  byteStride?: number;
};

type GltfMesh = {
  primitives: GltfPrimitive[];
};

type GltfPrimitive = {
  attributes: Record<string, number>;
  indices?: number;
  material?: number;
};

type GltfNode = {
  children?: number[];
  matrix?: number[];
  mesh?: number;
  rotation?: [number, number, number, number];
  scale?: [number, number, number];
  translation?: [number, number, number];
};

type GltfMaterial = {
  emissiveTexture?: { index?: number };
  pbrMetallicRoughness?: {
    baseColorFactor?: [number, number, number, number];
    baseColorTexture?: { index?: number };
    metallicFactor?: number;
    roughnessFactor?: number;
  };
};

type GltfImage = {
  bufferView?: number;
  mimeType?: string;
  uri?: string;
};

type GltfTexture = {
  sampler?: number;
  source?: number;
};

type GltfSampler = {
  magFilter?: number;
  minFilter?: number;
  wrapS?: number;
  wrapT?: number;
};

type GltfResources = {
  textures: Map<number, THREE.Texture>;
};

type PreparedModelSource = {
  arrayBuffer: ArrayBuffer;
  binStart: number;
  json: GltfJson;
  resources: GltfResources;
};

type EmbeddedTextureAsset = {
  height: number;
  localUri: string;
  width: number;
};

type CameraFit = {
  distance: number;
  far: number;
  near: number;
  target: THREE.Vector3;
};

type ImmersiveCameraRig = {
  baseYaw: number;
  far: number;
  lookDistance: number;
  near: number;
  origin: THREE.Vector3;
};

type ImmersiveObserverPlacement = {
  baseYaw: number;
  lookDistance: number;
  minClearance: number;
  origin: THREE.Vector3;
  score: number;
};

export type HeadTrackingDebugState = {
  alpha: number | null;
  accelerometerAvailable: boolean | null;
  accelerometerEvents: number;
  accelX: number | null;
  accelY: number | null;
  accelZ: number | null;
  beta: number | null;
  deviceMotionAvailable: boolean | null;
  deviceMotionEvents: number;
  error: string | null;
  gyroX: number | null;
  gyroY: number | null;
  gyroZ: number | null;
  gyroscopeAvailable: boolean | null;
  gyroscopeEvents: number;
  headTrackingEnabled: boolean;
  magnetometerAvailable: boolean | null;
  magnetometerEvents: number;
  magX: number | null;
  magY: number | null;
  magZ: number | null;
  pitch: number;
  platform: string;
  source: "none" | "device-motion" | "gyroscope" | "compass";
  yaw: number;
};

type ModelPreparationProgress = (progress: number) => void;

const COMPONENT_BYTE_SIZE: Record<number, number> = {
  5120: 1,
  5121: 1,
  5122: 2,
  5123: 2,
  5125: 4,
  5126: 4,
};

const ITEM_SIZE: Record<GltfAccessor["type"], number> = {
  MAT2: 4,
  MAT3: 9,
  MAT4: 16,
  SCALAR: 1,
  VEC2: 2,
  VEC3: 3,
  VEC4: 4,
};

const ATTRIBUTE_MAP: Record<string, string> = {
  COLOR_0: "color",
  NORMAL: "normal",
  POSITION: "position",
  TEXCOORD_0: "uv",
};

const INTRO_ROTATION_RADIANS = Math.PI * 4;
const INTRO_ROTATION_SPEED = 0.012;
const MODEL_WIDTH_FILL_RATIO = 0.98;
const MAX_MODEL_ZOOM = 3.4;
const MIN_MODEL_ZOOM = 0.72;
const MAX_VERTICAL_ROTATION = Math.PI * 0.32;
const MAX_IMMERSIVE_PITCH = Math.PI * 0.42;
const VR_EYE_SEPARATION = 0.064;
const IMMERSIVE_HORIZONTAL_SAMPLE_FRACTIONS = [0.18, 0.5, 0.82];
const IMMERSIVE_HEIGHT_SAMPLE_FRACTIONS = [0.16, 0.26, 0.38, 0.5];

const deviceOrientationAxis = new THREE.Vector3(0, 0, 1);
const deviceOrientationEuler = new THREE.Euler();
const deviceOrientationScreenQuaternion = new THREE.Quaternion();
const deviceOrientationTransformQuaternion = new THREE.Quaternion(
  -Math.sqrt(0.5),
  0,
  0,
  Math.sqrt(0.5),
);
const identityQuaternion = new THREE.Quaternion();

const embeddedTextureFileCache = new Map<string, Promise<EmbeddedTextureAsset>>();
const preparedModelCache = new Map<ModelAsset, Promise<PreparedModelSource>>();
const preparedModelTemplateCache = new Map<ModelAsset, Promise<THREE.Object3D>>();

export const getCabezaClavaModelAssetForArtwork = getArtworkModelAssetForArtwork;

export function prepareCabezaClavaModel(
  modelAsset: ModelAsset,
  onProgress?: ModelPreparationProgress,
) {
  const sourcePreparation = getPreparedModelSource(modelAsset, onProgress);
  return getPreparedModelTemplate(modelAsset, sourcePreparation, onProgress);
}

export function CabezaClavaModelView({
  autoRotate = true,
  headTracking = false,
  interactive = false,
  modelAsset = DEFAULT_ARTWORK_MODEL.asset,
  modelLabel = DEFAULT_ARTWORK_MODEL.label,
  onHeadTrackingDebug,
  recenterSignal = 0,
  showStatus = true,
  stereo = false,
  style,
  viewMode = "object",
}: CabezaClavaModelViewProps) {
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const isMountedRef = useRef(true);
  const objectRotationYRef = useRef(0);
  const objectRotationXRef = useRef(0);
  const observerYawRef = useRef(0);
  const observerPitchRef = useRef(0);
  const lastGestureDxRef = useRef(0);
  const lastGestureDyRef = useRef(0);
  const modelZoomRef = useRef(1);
  const initialPinchDistanceRef = useRef<number | null>(null);
  const initialPinchZoomRef = useRef(1);
  const autoRotateRef = useRef(autoRotate);
  const hasUserInteractedRef = useRef(false);
  const deviceOrientationRef = useRef<THREE.Quaternion | null>(null);
  const deviceOrientationReferenceRef = useRef<THREE.Quaternion | null>(null);
  const gyroscopeOrientationRef = useRef<THREE.Quaternion | null>(null);
  const gyroscopeLastTimestampRef = useRef<number | null>(null);
  const accelerometerReadingRef = useRef<{ x: number; y: number; z: number } | null>(null);
  const magnetometerReadingRef = useRef<{ x: number; y: number; z: number } | null>(null);
  const headTrackingSourceRef = useRef<"none" | "device-motion" | "gyroscope" | "compass">("none");
  const debugAccelerometerAvailableRef = useRef<boolean | null>(null);
  const debugAccelerometerEventsRef = useRef(0);
  const debugAccelXRef = useRef<number | null>(null);
  const debugAccelYRef = useRef<number | null>(null);
  const debugAccelZRef = useRef<number | null>(null);
  const debugDeviceMotionAvailableRef = useRef<boolean | null>(null);
  const debugDeviceMotionEventsRef = useRef(0);
  const debugErrorRef = useRef<string | null>(null);
  const debugGyroscopeAvailableRef = useRef<boolean | null>(null);
  const debugGyroscopeEventsRef = useRef(0);
  const debugLastAlphaRef = useRef<number | null>(null);
  const debugLastBetaRef = useRef<number | null>(null);
  const debugLastEmitAtRef = useRef(0);
  const debugLastGyroXRef = useRef<number | null>(null);
  const debugLastGyroYRef = useRef<number | null>(null);
  const debugLastGyroZRef = useRef<number | null>(null);
  const debugMagnetometerAvailableRef = useRef<boolean | null>(null);
  const debugMagnetometerEventsRef = useRef(0);
  const debugMagXRef = useRef<number | null>(null);
  const debugMagYRef = useRef<number | null>(null);
  const debugMagZRef = useRef<number | null>(null);
  const trackedYawRef = useRef(0);
  const trackedPitchRef = useRef(0);
  const trackedRotationReferenceRef = useRef<
    { alpha: number; beta: number } | { yaw: number; pitch: number } | null
  >(null);
  const isImmersive = viewMode === "immersive";
  const usesHeadTracking = isImmersive && headTracking;
  const usesStereo = isImmersive && stereo;
  const usesAndroidHeadTracking = usesHeadTracking && Platform.OS === "android";

  useEffect(() => {
    autoRotateRef.current = autoRotate;
  }, [autoRotate]);

  const emitDebugSnapshot = useCallback(
    (force = false) => {
      if (!onHeadTrackingDebug) {
        return;
      }

      const now = Date.now();
      if (!force && now - debugLastEmitAtRef.current < 120) {
        return;
      }

      debugLastEmitAtRef.current = now;
      onHeadTrackingDebug({
        alpha: debugLastAlphaRef.current,
        accelerometerAvailable: debugAccelerometerAvailableRef.current,
        accelerometerEvents: debugAccelerometerEventsRef.current,
        accelX: debugAccelXRef.current,
        accelY: debugAccelYRef.current,
        accelZ: debugAccelZRef.current,
        beta: debugLastBetaRef.current,
        deviceMotionAvailable: debugDeviceMotionAvailableRef.current,
        deviceMotionEvents: debugDeviceMotionEventsRef.current,
        error: debugErrorRef.current,
        gyroX: debugLastGyroXRef.current,
        gyroY: debugLastGyroYRef.current,
        gyroZ: debugLastGyroZRef.current,
        gyroscopeAvailable: debugGyroscopeAvailableRef.current,
        gyroscopeEvents: debugGyroscopeEventsRef.current,
        headTrackingEnabled: usesHeadTracking,
        magnetometerAvailable: debugMagnetometerAvailableRef.current,
        magnetometerEvents: debugMagnetometerEventsRef.current,
        magX: debugMagXRef.current,
        magY: debugMagYRef.current,
        magZ: debugMagZRef.current,
        pitch: trackedPitchRef.current,
        platform: Platform.OS,
        source: headTrackingSourceRef.current,
        yaw: trackedYawRef.current,
      });
    },
    [onHeadTrackingDebug, usesHeadTracking],
  );

  useEffect(() => {
    emitDebugSnapshot(true);
  }, [emitDebugSnapshot]);

  useEffect(() => {
    if (!usesHeadTracking) {
      return;
    }

    trackedYawRef.current = 0;
    trackedPitchRef.current = 0;
    trackedRotationReferenceRef.current = null;

    if (deviceOrientationRef.current) {
      deviceOrientationReferenceRef.current = deviceOrientationRef.current.clone().invert();
    } else {
      deviceOrientationReferenceRef.current = null;
    }

    if (gyroscopeOrientationRef.current) {
      gyroscopeOrientationRef.current = new THREE.Quaternion();
    }
    gyroscopeLastTimestampRef.current = null;
    emitDebugSnapshot(true);
  }, [emitDebugSnapshot, recenterSignal, usesHeadTracking]);

  useEffect(() => {
    let isMounted = true;
    let accelerometerSubscription: { remove: () => void } | null = null;
    let deviceMotionSubscription: { remove: () => void } | null = null;
    let gyroscopeSubscription: { remove: () => void } | null = null;
    let gyroscopeFallbackTimeout: ReturnType<typeof setTimeout> | null = null;
    let magnetometerSubscription: { remove: () => void } | null = null;

    accelerometerReadingRef.current = null;
    deviceOrientationRef.current = null;
    deviceOrientationReferenceRef.current = null;
    gyroscopeOrientationRef.current = null;
    gyroscopeLastTimestampRef.current = null;
    headTrackingSourceRef.current = "none";
    magnetometerReadingRef.current = null;
    debugAccelerometerAvailableRef.current = null;
    debugAccelerometerEventsRef.current = 0;
    debugAccelXRef.current = null;
    debugAccelYRef.current = null;
    debugAccelZRef.current = null;
    debugDeviceMotionAvailableRef.current = null;
    debugDeviceMotionEventsRef.current = 0;
    debugErrorRef.current = null;
    debugGyroscopeAvailableRef.current = null;
    debugGyroscopeEventsRef.current = 0;
    debugLastAlphaRef.current = null;
    debugLastBetaRef.current = null;
    debugLastGyroXRef.current = null;
    debugLastGyroYRef.current = null;
    debugLastGyroZRef.current = null;
    debugMagnetometerAvailableRef.current = null;
    debugMagnetometerEventsRef.current = 0;
    debugMagXRef.current = null;
    debugMagYRef.current = null;
    debugMagZRef.current = null;
    trackedYawRef.current = 0;
    trackedPitchRef.current = 0;
    trackedRotationReferenceRef.current = null;
    emitDebugSnapshot(true);

    if (!usesHeadTracking) {
      return;
    }

    const startHeadTracking = async () => {
      try {
        const sensorsModule = await import("expo-sensors");
        const Accelerometer = sensorsModule.Accelerometer;
        const DeviceMotion = sensorsModule.DeviceMotion;
        const Gyroscope = sensorsModule.Gyroscope;
        const Magnetometer = sensorsModule.Magnetometer;
        const accelerometerAvailable = usesAndroidHeadTracking
          ? await Accelerometer.isAvailableAsync().catch(() => false)
          : false;
        const sensorAvailable = await DeviceMotion.isAvailableAsync().catch(() => false);
        const gyroscopeAvailable = usesAndroidHeadTracking
          ? await Gyroscope.isAvailableAsync().catch(() => false)
          : false;
        const magnetometerAvailable = usesAndroidHeadTracking
          ? await Magnetometer.isAvailableAsync().catch(() => false)
          : false;
        debugAccelerometerAvailableRef.current = accelerometerAvailable;
        debugDeviceMotionAvailableRef.current = sensorAvailable;
        debugGyroscopeAvailableRef.current = gyroscopeAvailable;
        debugMagnetometerAvailableRef.current = magnetometerAvailable;
        emitDebugSnapshot(true);

        const updateCompassTracking = () => {
          if (!accelerometerReadingRef.current || !magnetometerReadingRef.current) {
            return;
          }

          const orientation = getCompassOrientation(
            accelerometerReadingRef.current,
            magnetometerReadingRef.current,
          );
          if (!orientation) {
            return;
          }

          headTrackingSourceRef.current = "compass";
          if (
            !trackedRotationReferenceRef.current ||
            !("yaw" in trackedRotationReferenceRef.current)
          ) {
            trackedRotationReferenceRef.current = {
              yaw: orientation.yaw,
              pitch: orientation.pitch,
            };
          }

          const reference = trackedRotationReferenceRef.current;
          if (!reference || !("yaw" in reference)) {
            return;
          }

          trackedYawRef.current = normalizeAngle(orientation.yaw - reference.yaw);
          trackedPitchRef.current = clamp(
            orientation.pitch - reference.pitch,
            -MAX_IMMERSIVE_PITCH,
            MAX_IMMERSIVE_PITCH,
          );
          emitDebugSnapshot();
        };

        const startCompassFallback = () => {
          if (
            !accelerometerAvailable ||
            !magnetometerAvailable ||
            accelerometerSubscription ||
            magnetometerSubscription
          ) {
            return;
          }

          Accelerometer.setUpdateInterval(40);
          Magnetometer.setUpdateInterval(40);

          accelerometerSubscription = Accelerometer.addListener((reading) => {
            debugAccelerometerEventsRef.current += 1;
            debugAccelXRef.current = reading.x ?? null;
            debugAccelYRef.current = reading.y ?? null;
            debugAccelZRef.current = reading.z ?? null;
            debugErrorRef.current = null;
            accelerometerReadingRef.current = {
              x: reading.x ?? 0,
              y: reading.y ?? 0,
              z: reading.z ?? 0,
            };
            updateCompassTracking();
          });

          magnetometerSubscription = Magnetometer.addListener((reading) => {
            debugMagnetometerEventsRef.current += 1;
            debugMagXRef.current = reading.x ?? null;
            debugMagYRef.current = reading.y ?? null;
            debugMagZRef.current = reading.z ?? null;
            debugErrorRef.current = null;
            magnetometerReadingRef.current = {
              x: reading.x ?? 0,
              y: reading.y ?? 0,
              z: reading.z ?? 0,
            };
            updateCompassTracking();
          });

          emitDebugSnapshot(true);
        };

        const startGyroscopeFallback = () => {
          if (!gyroscopeAvailable || gyroscopeSubscription) {
            return;
          }

          headTrackingSourceRef.current = "gyroscope";
          gyroscopeOrientationRef.current = new THREE.Quaternion();
          gyroscopeLastTimestampRef.current = null;
          Gyroscope.setUpdateInterval(24);
          gyroscopeSubscription = Gyroscope.addListener((reading) => {
            if (!gyroscopeOrientationRef.current) {
              gyroscopeOrientationRef.current = new THREE.Quaternion();
            }
            debugGyroscopeEventsRef.current += 1;
            debugLastGyroXRef.current = reading.x ?? null;
            debugLastGyroYRef.current = reading.y ?? null;
            debugLastGyroZRef.current = reading.z ?? null;
            debugErrorRef.current = null;

            const lastTimestamp = gyroscopeLastTimestampRef.current;
            gyroscopeLastTimestampRef.current = reading.timestamp;
            if (lastTimestamp === null) {
              emitDebugSnapshot();
              return;
            }

            const deltaTime = clamp(reading.timestamp - lastTimestamp, 0, 0.05);
            const angularSpeed = Math.hypot(reading.x ?? 0, reading.y ?? 0, reading.z ?? 0);
            if (angularSpeed <= 0.0001) {
              return;
            }

            const rotationAxis = new THREE.Vector3(
              reading.x ?? 0,
              reading.y ?? 0,
              reading.z ?? 0,
            ).normalize();
            const deltaQuaternion = new THREE.Quaternion().setFromAxisAngle(
              rotationAxis,
              angularSpeed * deltaTime,
            );

            gyroscopeOrientationRef.current.multiply(deltaQuaternion);
            emitDebugSnapshot();
          });
          emitDebugSnapshot(true);
        };

        if (!isMounted) {
          return;
        }

        if (usesAndroidHeadTracking && !sensorAvailable && gyroscopeAvailable) {
          startGyroscopeFallback();
          return;
        }

        if (
          usesAndroidHeadTracking &&
          !sensorAvailable &&
          !gyroscopeAvailable &&
          accelerometerAvailable &&
          magnetometerAvailable
        ) {
          startCompassFallback();
          return;
        }

        if (!sensorAvailable) {
          return;
        }

        if (Platform.OS !== "android") {
          const permissions = await DeviceMotion.getPermissionsAsync();
          const permissionResponse = permissions.granted
            ? permissions
            : permissions.canAskAgain
              ? await DeviceMotion.requestPermissionsAsync()
              : permissions;

          if (!isMounted || !permissionResponse.granted) {
            return;
          }
        }

        DeviceMotion.setUpdateInterval(24);
        deviceMotionSubscription = DeviceMotion.addListener((motion) => {
          headTrackingSourceRef.current = "device-motion";
          debugDeviceMotionEventsRef.current += 1;
          debugLastAlphaRef.current = motion.rotation?.alpha ?? null;
          debugLastBetaRef.current = motion.rotation?.beta ?? null;
          debugErrorRef.current = null;
          if (usesAndroidHeadTracking) {
            const alpha = motion.rotation?.alpha ?? 0;
            const beta = motion.rotation?.beta ?? 0;

            if (!trackedRotationReferenceRef.current) {
              trackedRotationReferenceRef.current = { alpha, beta };
            }

            const reference = trackedRotationReferenceRef.current;
            if (!reference || !("alpha" in reference)) {
              return;
            }
            trackedYawRef.current = normalizeAngle(alpha - reference.alpha);
            trackedPitchRef.current = clamp(
              beta - reference.beta,
              -MAX_IMMERSIVE_PITCH,
              MAX_IMMERSIVE_PITCH,
            );
            emitDebugSnapshot();
            return;
          }

          const nextOrientation = getDeviceMotionQuaternion(
            motion.rotation,
            motion.orientation,
          );

          deviceOrientationRef.current = nextOrientation;
          if (!deviceOrientationReferenceRef.current) {
            deviceOrientationReferenceRef.current = nextOrientation.clone().invert();
          }
          emitDebugSnapshot();
        });

        if (usesAndroidHeadTracking && gyroscopeAvailable) {
          gyroscopeFallbackTimeout = setTimeout(() => {
            if (headTrackingSourceRef.current === "none") {
              startGyroscopeFallback();
            }
          }, 700);
        } else if (usesAndroidHeadTracking && accelerometerAvailable && magnetometerAvailable) {
          gyroscopeFallbackTimeout = setTimeout(() => {
            if (headTrackingSourceRef.current === "none") {
              startCompassFallback();
            }
          }, 700);
        }
      } catch {
        deviceOrientationRef.current = null;
        deviceOrientationReferenceRef.current = null;
        debugErrorRef.current = "device-motion-error";
        emitDebugSnapshot(true);
        if (usesAndroidHeadTracking) {
          try {
            const sensorsModule = await import("expo-sensors");
            const Accelerometer = sensorsModule.Accelerometer;
            const Gyroscope = sensorsModule.Gyroscope;
            const Magnetometer = sensorsModule.Magnetometer;
            const accelerometerAvailable = await Accelerometer.isAvailableAsync().catch(() => false);
            const gyroscopeAvailable = await Gyroscope.isAvailableAsync().catch(() => false);
            const magnetometerAvailable = await Magnetometer.isAvailableAsync().catch(() => false);
            debugAccelerometerAvailableRef.current = accelerometerAvailable;
            debugGyroscopeAvailableRef.current = gyroscopeAvailable;
            debugMagnetometerAvailableRef.current = magnetometerAvailable;

            if (gyroscopeAvailable) {
              headTrackingSourceRef.current = "gyroscope";
              gyroscopeOrientationRef.current = new THREE.Quaternion();
              gyroscopeLastTimestampRef.current = null;
              Gyroscope.setUpdateInterval(24);
              gyroscopeSubscription = Gyroscope.addListener((reading) => {
                if (!gyroscopeOrientationRef.current) {
                  gyroscopeOrientationRef.current = new THREE.Quaternion();
                }
                debugGyroscopeEventsRef.current += 1;
                debugLastGyroXRef.current = reading.x ?? null;
                debugLastGyroYRef.current = reading.y ?? null;
                debugLastGyroZRef.current = reading.z ?? null;
                debugErrorRef.current = null;

                const lastTimestamp = gyroscopeLastTimestampRef.current;
                gyroscopeLastTimestampRef.current = reading.timestamp;
                if (lastTimestamp === null) {
                  emitDebugSnapshot();
                  return;
                }

                const deltaTime = clamp(reading.timestamp - lastTimestamp, 0, 0.05);
                const angularSpeed = Math.hypot(reading.x ?? 0, reading.y ?? 0, reading.z ?? 0);
                if (angularSpeed <= 0.0001) {
                  return;
                }

                const rotationAxis = new THREE.Vector3(
                  reading.x ?? 0,
                  reading.y ?? 0,
                  reading.z ?? 0,
                ).normalize();
                const deltaQuaternion = new THREE.Quaternion().setFromAxisAngle(
                  rotationAxis,
                  angularSpeed * deltaTime,
                );

                gyroscopeOrientationRef.current.multiply(deltaQuaternion);
                emitDebugSnapshot();
              });
              emitDebugSnapshot(true);
            } else if (accelerometerAvailable && magnetometerAvailable) {
              const updateCompassTracking = () => {
                if (!accelerometerReadingRef.current || !magnetometerReadingRef.current) {
                  return;
                }

                const orientation = getCompassOrientation(
                  accelerometerReadingRef.current,
                  magnetometerReadingRef.current,
                );
                if (!orientation) {
                  return;
                }

                headTrackingSourceRef.current = "compass";
                if (
                  !trackedRotationReferenceRef.current ||
                  !("yaw" in trackedRotationReferenceRef.current)
                ) {
                  trackedRotationReferenceRef.current = {
                    yaw: orientation.yaw,
                    pitch: orientation.pitch,
                  };
                }

                const reference = trackedRotationReferenceRef.current;
                if (!reference || !("yaw" in reference)) {
                  return;
                }

                trackedYawRef.current = normalizeAngle(orientation.yaw - reference.yaw);
                trackedPitchRef.current = clamp(
                  orientation.pitch - reference.pitch,
                  -MAX_IMMERSIVE_PITCH,
                  MAX_IMMERSIVE_PITCH,
                );
                emitDebugSnapshot();
              };

              Accelerometer.setUpdateInterval(40);
              Magnetometer.setUpdateInterval(40);

              accelerometerSubscription = Accelerometer.addListener((reading) => {
                debugAccelerometerEventsRef.current += 1;
                debugAccelXRef.current = reading.x ?? null;
                debugAccelYRef.current = reading.y ?? null;
                debugAccelZRef.current = reading.z ?? null;
                debugErrorRef.current = null;
                accelerometerReadingRef.current = {
                  x: reading.x ?? 0,
                  y: reading.y ?? 0,
                  z: reading.z ?? 0,
                };
                updateCompassTracking();
              });

              magnetometerSubscription = Magnetometer.addListener((reading) => {
                debugMagnetometerEventsRef.current += 1;
                debugMagXRef.current = reading.x ?? null;
                debugMagYRef.current = reading.y ?? null;
                debugMagZRef.current = reading.z ?? null;
                debugErrorRef.current = null;
                magnetometerReadingRef.current = {
                  x: reading.x ?? 0,
                  y: reading.y ?? 0,
                  z: reading.z ?? 0,
                };
                updateCompassTracking();
              });

              emitDebugSnapshot(true);
            }
          } catch {
            headTrackingSourceRef.current = "none";
            debugErrorRef.current = "gyroscope-error";
            emitDebugSnapshot(true);
          }
        }
      }
    };

    startHeadTracking().catch(() => {
      deviceOrientationRef.current = null;
      deviceOrientationReferenceRef.current = null;
    });

    return () => {
      isMounted = false;
      accelerometerSubscription?.remove();
      deviceMotionSubscription?.remove();
      gyroscopeSubscription?.remove();
      if (gyroscopeFallbackTimeout) {
        clearTimeout(gyroscopeFallbackTimeout);
      }
      magnetometerSubscription?.remove();
      accelerometerReadingRef.current = null;
      deviceOrientationRef.current = null;
      deviceOrientationReferenceRef.current = null;
      gyroscopeOrientationRef.current = null;
      gyroscopeLastTimestampRef.current = null;
      headTrackingSourceRef.current = "none";
      magnetometerReadingRef.current = null;
      trackedRotationReferenceRef.current = null;
      emitDebugSnapshot(true);
    };
  }, [emitDebugSnapshot, usesAndroidHeadTracking, usesHeadTracking]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      cleanupRef.current?.();
    };
  }, []);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: () => interactive && !usesHeadTracking,
        onStartShouldSetPanResponder: () => interactive && !usesHeadTracking,
        onPanResponderGrant: (event) => {
          hasUserInteractedRef.current = true;
          lastGestureDxRef.current = 0;
          lastGestureDyRef.current = 0;
          const pinchDistance = getTouchDistance(event.nativeEvent.touches);
          initialPinchDistanceRef.current = pinchDistance;
          initialPinchZoomRef.current = modelZoomRef.current;
        },
        onPanResponderMove: (event, gesture) => {
          if (!interactive) {
            return;
          }

          const pinchDistance = getTouchDistance(event.nativeEvent.touches);
          if (pinchDistance) {
            if (isImmersive) {
              lastGestureDxRef.current = gesture.dx;
              lastGestureDyRef.current = gesture.dy;
              return;
            }

            if (!initialPinchDistanceRef.current) {
              initialPinchDistanceRef.current = pinchDistance;
              initialPinchZoomRef.current = modelZoomRef.current;
            }

            const nextZoom =
              initialPinchZoomRef.current * (pinchDistance / initialPinchDistanceRef.current);
            modelZoomRef.current = clamp(nextZoom, MIN_MODEL_ZOOM, MAX_MODEL_ZOOM);
            lastGestureDxRef.current = gesture.dx;
            lastGestureDyRef.current = gesture.dy;
            return;
          }

          initialPinchDistanceRef.current = null;
          initialPinchZoomRef.current = modelZoomRef.current;

          const delta = gesture.dx - lastGestureDxRef.current;
          const deltaY = gesture.dy - lastGestureDyRef.current;
          lastGestureDxRef.current = gesture.dx;
          lastGestureDyRef.current = gesture.dy;

          if (isImmersive) {
            observerYawRef.current += delta * 0.012;
            observerPitchRef.current = clamp(
              observerPitchRef.current - deltaY * 0.008,
              -MAX_IMMERSIVE_PITCH,
              MAX_IMMERSIVE_PITCH,
            );
            return;
          }

          objectRotationYRef.current += delta * 0.012;
          objectRotationXRef.current = clamp(
            objectRotationXRef.current + deltaY * 0.01,
            -MAX_VERTICAL_ROTATION,
            MAX_VERTICAL_ROTATION,
          );
        },
        onPanResponderRelease: () => {
          lastGestureDxRef.current = 0;
          lastGestureDyRef.current = 0;
          initialPinchDistanceRef.current = null;
          initialPinchZoomRef.current = modelZoomRef.current;
        },
        onPanResponderTerminate: () => {
          lastGestureDxRef.current = 0;
          lastGestureDyRef.current = 0;
          initialPinchDistanceRef.current = null;
          initialPinchZoomRef.current = modelZoomRef.current;
        },
      }),
    [interactive, isImmersive, usesHeadTracking],
  );

  const handleContextCreate = useCallback(async (gl: ExpoWebGLRenderingContext) => {
    let renderer: THREE.WebGLRenderer | null = null;
    let model: THREE.Object3D | null = null;
    let modelBaseScale = new THREE.Vector3(1, 1, 1);
    let cameraFit: CameraFit | null = null;
    let immersiveRig: ImmersiveCameraRig | null = null;
    let stereoCamera: THREE.StereoCamera | null = null;

    try {
      setStatus("loading");
      setErrorMessage(null);
      patchUnsupportedPixelStore(gl);

      const width = gl.drawingBufferWidth;
      const height = gl.drawingBufferHeight;
      const scene = new THREE.Scene();
      const eyeAspectRatio = usesStereo ? width / 2 / height : width / height;
      const camera = new THREE.PerspectiveCamera(44, eyeAspectRatio, 0.01, 100);
      camera.position.set(0, 0.08, 3.2);
      camera.lookAt(0, 0, 0);

      renderer = createRenderer(gl, width, height);
      if (usesStereo) {
        stereoCamera = new THREE.StereoCamera();
        stereoCamera.eyeSep = VR_EYE_SEPARATION;
      }

      scene.add(new THREE.HemisphereLight(0xfff2dc, 0x2b2118, 1.9));
      const keyLight = new THREE.DirectionalLight(0xfff3df, 2.4);
      keyLight.position.set(2, 3, 4);
      scene.add(keyLight);
      const rimLight = new THREE.DirectionalLight(0x87c7ff, 0.7);
      rimLight.position.set(-3, 2, -3);
      scene.add(rimLight);

      const loadStartedAt = Date.now();
      model = await loadCabezaClavaModel(modelAsset);
      if (isImmersive) {
        enableDoubleSidedMaterials(model);
        modelBaseScale = model.scale.clone();
        immersiveRig = fitCameraInsideObject(camera, model);
      } else {
        normalizeModel(model, 2.55);
        modelBaseScale = model.scale.clone();
        cameraFit = fitCameraToObject(camera, model, width / height);
      }
      applyTextureQuality(model, renderer.capabilities.getMaxAnisotropy());
      scene.add(model);
      console.log(`[MuseIQ][3D] ${modelLabel} listo en ${Date.now() - loadStartedAt}ms`);

      let spin = 0;
      let hasRenderedFirstFrame = false;
      const animate = () => {
        animationFrameRef.current = requestAnimationFrame(animate);
        if (model) {
          model.scale.copy(modelBaseScale);

          if (isImmersive) {
            if (immersiveRig) {
              if (
                usesAndroidHeadTracking &&
                headTrackingSourceRef.current === "gyroscope" &&
                gyroscopeOrientationRef.current
              ) {
                applyTrackedImmersiveCameraPose(
                  camera,
                  immersiveRig,
                  identityQuaternion,
                  gyroscopeOrientationRef.current,
                );
              } else if (
                usesAndroidHeadTracking &&
                immersiveRig
              ) {
                applyImmersiveCameraPose(
                  camera,
                  immersiveRig,
                  trackedYawRef.current,
                  trackedPitchRef.current,
                );
              } else if (
                usesHeadTracking &&
                deviceOrientationRef.current &&
                deviceOrientationReferenceRef.current
              ) {
                applyTrackedImmersiveCameraPose(
                  camera,
                  immersiveRig,
                  deviceOrientationReferenceRef.current,
                  deviceOrientationRef.current,
                );
              } else {
                applyImmersiveCameraPose(
                  camera,
                  immersiveRig,
                  observerYawRef.current,
                  observerPitchRef.current,
                );
              }
            }
          } else {
            if (
              autoRotateRef.current &&
              !hasUserInteractedRef.current &&
              spin < INTRO_ROTATION_RADIANS
            ) {
              spin = Math.min(INTRO_ROTATION_RADIANS, spin + INTRO_ROTATION_SPEED);
            }

            model.rotation.x = objectRotationXRef.current;
            model.rotation.y = spin + objectRotationYRef.current;
          }

          if (cameraFit) {
            applyCameraZoom(camera, cameraFit, modelZoomRef.current);
          }
        }
        if (renderer) {
          if (usesStereo && stereoCamera) {
            renderStereoScene(renderer, scene, camera, stereoCamera, width, height);
          } else {
            renderMonoScene(renderer, scene, camera, width, height);
          }
        }
        gl.endFrameEXP();

        if (!hasRenderedFirstFrame && isMountedRef.current) {
          hasRenderedFirstFrame = true;
          setStatus("ready");
        }
      };

      animate();

      cleanupRef.current = () => {
        if (animationFrameRef.current !== null) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
        disposeObject(scene);
        renderer?.dispose();
      };
    } catch (error) {
      console.warn("No se pudo cargar cabeza_clava.glb", error);
      if (isMountedRef.current) {
        setErrorMessage(error instanceof Error ? error.message : "Error desconocido");
        setStatus("error");
      }
      renderer?.dispose();
    }
  }, [
    isImmersive,
    modelAsset,
    modelLabel,
    usesAndroidHeadTracking,
    usesHeadTracking,
    usesStereo,
  ]);

  return (
    <View
      style={[styles.container, style]}
      {...(interactive && !usesHeadTracking ? panResponder.panHandlers : {})}
    >
      <GLView
        key={`${modelLabel}-${viewMode}-${usesStereo ? "stereo" : "mono"}-${
          usesHeadTracking ? "tracked" : "manual"
        }`}
        onContextCreate={handleContextCreate}
        style={StyleSheet.absoluteFill}
      />
      {showStatus && status !== "ready" ? (
        <View style={styles.statusOverlay}>
          {status === "loading" ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : null}
          <Text style={styles.statusText}>
            {status === "loading" ? `Cargando ${modelLabel}` : "Modelo 3D no disponible"}
          </Text>
          {status === "error" && errorMessage ? (
            <Text numberOfLines={2} style={styles.errorText}>
              {errorMessage}
            </Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

function createRenderer(
  gl: ExpoWebGLRenderingContext,
  width: number,
  height: number,
) {
  const canvas = {
    addEventListener: () => undefined,
    clientHeight: height,
    clientWidth: width,
    getContext: () => gl,
    height,
    removeEventListener: () => undefined,
    style: {},
    width,
  };
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    canvas: canvas as unknown as HTMLCanvasElement,
    context: gl as unknown as WebGLRenderingContext,
  });

  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(1);
  renderer.setSize(width, height, false);
  renderer.autoClear = false;

  return renderer;
}

function renderMonoScene(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
  width: number,
  height: number,
) {
  const aspectRatio = width / height;
  if (Math.abs(camera.aspect - aspectRatio) > 0.0001) {
    camera.aspect = aspectRatio;
    camera.updateProjectionMatrix();
  }

  renderer.setScissorTest(false);
  renderer.setViewport(0, 0, width, height);
  renderer.clear();
  renderer.render(scene, camera);
}

function renderStereoScene(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
  stereoCamera: THREE.StereoCamera,
  width: number,
  height: number,
) {
  const leftWidth = Math.floor(width / 2);
  const rightWidth = width - leftWidth;
  const eyeAspectRatio = leftWidth / height;

  if (Math.abs(camera.aspect - eyeAspectRatio) > 0.0001) {
    camera.aspect = eyeAspectRatio;
    camera.updateProjectionMatrix();
  }

  stereoCamera.update(camera);

  renderer.setScissorTest(true);
  renderer.clear();

  renderer.setViewport(0, 0, leftWidth, height);
  renderer.setScissor(0, 0, leftWidth, height);
  renderer.render(scene, stereoCamera.cameraL);

  renderer.clearDepth();
  renderer.setViewport(leftWidth, 0, rightWidth, height);
  renderer.setScissor(leftWidth, 0, rightWidth, height);
  renderer.render(scene, stereoCamera.cameraR);

  renderer.setScissorTest(false);
}

function patchUnsupportedPixelStore(gl: ExpoWebGLRenderingContext) {
  const expoGl = gl as ExpoWebGLRenderingContext & {
    __museiqPixelStorePatched?: boolean;
    pixelStorei: (pname: number, param: number | boolean) => void;
  };

  if (expoGl.__museiqPixelStorePatched) {
    return;
  }

  const unsupportedPixelStoreParams = new Set([
    gl.UNPACK_FLIP_Y_WEBGL,
    gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,
    0x9243,
  ]);
  const originalPixelStorei = expoGl.pixelStorei.bind(gl);

  expoGl.pixelStorei = (pname, param) => {
    if (unsupportedPixelStoreParams.has(pname)) {
      return;
    }

    originalPixelStorei(pname, param);
  };
  expoGl.__museiqPixelStorePatched = true;
}

async function loadCabezaClavaModel(modelAsset: ModelAsset) {
  const preparedTemplate = await getPreparedModelTemplate(modelAsset);
  return clonePreparedModelTemplate(preparedTemplate);
}

function getPreparedModelSource(
  modelAsset: ModelAsset,
  onProgress?: ModelPreparationProgress,
) {
  const cachedPreparation = preparedModelCache.get(modelAsset);
  if (cachedPreparation) {
    return cachedPreparation;
  }

  const preparation = loadCabezaClavaModelSource(modelAsset, onProgress);
  preparedModelCache.set(modelAsset, preparation);
  return preparation;
}

function getPreparedModelTemplate(
  modelAsset: ModelAsset,
  sourcePreparation = getPreparedModelSource(modelAsset),
  onProgress?: ModelPreparationProgress,
) {
  const cachedTemplate = preparedModelTemplateCache.get(modelAsset);
  if (cachedTemplate) {
    return cachedTemplate;
  }

  const templatePreparation = sourcePreparation.then((preparedSource) => {
    onProgress?.(88);
    const template = buildSceneFromPreparedModel(preparedSource);
    markObjectAsSharedTemplate(template);
    onProgress?.(100);
    return template;
  });
  preparedModelTemplateCache.set(modelAsset, templatePreparation);
  return templatePreparation;
}

async function loadCabezaClavaModelSource(
  modelAsset: ModelAsset,
  onProgress?: ModelPreparationProgress,
) {
  onProgress?.(12);
  const asset = Asset.fromModule(modelAsset);
  await asset.downloadAsync();

  const uri = asset.localUri ?? asset.uri;
  onProgress?.(36);
  const arrayBuffer = await readAssetArrayBuffer(uri);

  onProgress?.(62);
  const modelSource = await parseGlbGeometry(arrayBuffer);
  onProgress?.(80);
  return modelSource;
}

async function parseGlbGeometry(arrayBuffer: ArrayBuffer) {
  const dataView = new DataView(arrayBuffer);
  const magic = readFourCc(dataView, 0);
  const version = dataView.getUint32(4, true);

  if (magic !== "glTF" || version !== 2) {
    throw new Error("Formato GLB no compatible");
  }

  let offset = 12;
  let json: GltfJson | null = null;
  let binStart = 0;

  while (offset < dataView.byteLength) {
    const chunkLength = dataView.getUint32(offset, true);
    const chunkType = readFourCc(dataView, offset + 4);
    const chunkStart = offset + 8;

    if (chunkType === "JSON") {
      const jsonText = Buffer.from(arrayBuffer, chunkStart, chunkLength)
        .toString("utf8")
        .replace(/\0+$/g, "");
      json = JSON.parse(jsonText) as GltfJson;
    }

    if (chunkType === "BIN\0") {
      binStart = chunkStart;
    }

    offset = chunkStart + chunkLength;
  }

  if (!json || !binStart) {
    throw new Error("GLB incompleto");
  }

  const resources = await loadGltfResources(json, arrayBuffer, binStart);
  return {
    arrayBuffer,
    binStart,
    json,
    resources,
  };
}

function buildSceneFromPreparedModel(preparedSource: PreparedModelSource) {
  return buildSceneFromGltf(
    preparedSource.json,
    preparedSource.arrayBuffer,
    preparedSource.binStart,
    preparedSource.resources,
  );
}

function clonePreparedModelTemplate(template: THREE.Object3D) {
  const clone = template.clone(true);
  markObjectAsSharedTemplate(clone);
  return clone;
}

function buildSceneFromGltf(
  json: GltfJson,
  arrayBuffer: ArrayBuffer,
  binStart: number,
  resources: GltfResources,
) {
  const group = new THREE.Group();
  const sceneIndex = json.scene ?? 0;
  const sceneNodes = json.scenes?.[sceneIndex]?.nodes ?? json.nodes?.map((_, index) => index) ?? [];

  if (sceneNodes.length && json.nodes) {
    sceneNodes.forEach((nodeIndex) => {
      const nodeObject = buildNode(json, arrayBuffer, binStart, nodeIndex, resources);
      if (nodeObject) {
        group.add(nodeObject);
      }
    });
    return group;
  }

  json.meshes?.forEach((_, meshIndex) => {
    group.add(buildMesh(json, arrayBuffer, binStart, meshIndex, resources));
  });

  return group;
}

function buildNode(
  json: GltfJson,
  arrayBuffer: ArrayBuffer,
  binStart: number,
  nodeIndex: number,
  resources: GltfResources,
): THREE.Object3D | null {
  const node = json.nodes?.[nodeIndex];
  if (!node) {
    return null;
  }

  const object = new THREE.Group();

  if (typeof node.mesh === "number") {
    object.add(buildMesh(json, arrayBuffer, binStart, node.mesh, resources));
  }

  node.children?.forEach((childIndex) => {
    const child = buildNode(json, arrayBuffer, binStart, childIndex, resources);
    if (child) {
      object.add(child);
    }
  });

  applyNodeTransform(object, node);

  return object;
}

function buildMesh(
  json: GltfJson,
  arrayBuffer: ArrayBuffer,
  binStart: number,
  meshIndex: number,
  resources: GltfResources,
) {
  const mesh = json.meshes?.[meshIndex];
  const meshGroup = new THREE.Group();

  mesh?.primitives.forEach((primitive) => {
    const geometry = new THREE.BufferGeometry();

    Object.entries(primitive.attributes).forEach(([attributeName, accessorIndex]) => {
      const threeAttributeName = ATTRIBUTE_MAP[attributeName];
      if (!threeAttributeName) {
        return;
      }

      geometry.setAttribute(
        threeAttributeName,
        createBufferAttribute(json, arrayBuffer, binStart, accessorIndex),
      );
    });

    if (typeof primitive.indices === "number") {
      geometry.setIndex(
        createIndexAttribute(json, arrayBuffer, binStart, primitive.indices),
      );
    }

    if (!geometry.getAttribute("normal")) {
      geometry.computeVertexNormals();
    }

    const material = createMaterial(
      json,
      primitive,
      resources,
      Boolean(geometry.getAttribute("color")),
    );
    geometry.computeBoundingSphere();
    meshGroup.add(new THREE.Mesh(geometry, material));
  });

  return meshGroup;
}

async function loadGltfResources(
  json: GltfJson,
  arrayBuffer: ArrayBuffer,
  binStart: number,
): Promise<GltfResources> {
  const textures = new Map<number, THREE.Texture>();
  const textureIndices = new Set<number>();

  json.materials?.forEach((material) => {
    const baseColorTextureIndex = material.pbrMetallicRoughness?.baseColorTexture?.index;
    const emissiveTextureIndex = material.emissiveTexture?.index;
    if (typeof baseColorTextureIndex === "number") {
      textureIndices.add(baseColorTextureIndex);
    }
    if (typeof emissiveTextureIndex === "number") {
      textureIndices.add(emissiveTextureIndex);
    }
  });

  await Promise.all(
    Array.from(textureIndices).map(async (textureIndex) => {
      try {
        const texture = json.textures?.[textureIndex];
        const imageIndex = texture?.source;

        if (typeof imageIndex !== "number") {
          return;
        }

        const image = json.images?.[imageIndex];
        if (typeof image?.bufferView !== "number") {
          return;
        }

        const asset = await writeEmbeddedTextureFile(
          json,
          arrayBuffer,
          binStart,
          image,
          imageIndex,
        );
        textures.set(textureIndex, createTextureFromEmbeddedAsset(asset));
      } catch (error) {
        console.warn("No se pudo aplicar la textura del GLB", error);
      }
    }),
  );

  return { textures };
}

function createMaterial(
  json: GltfJson,
  primitive: GltfPrimitive,
  resources: GltfResources,
  hasVertexColors = false,
) {
  const materialSource =
    typeof primitive.material === "number" ? json.materials?.[primitive.material] : undefined;
  const pbr = materialSource?.pbrMetallicRoughness;
  const baseColorFactor = pbr?.baseColorFactor ?? [1, 1, 1, 1];
  const baseTextureIndex = pbr?.baseColorTexture?.index;
  const emissiveTextureIndex = materialSource?.emissiveTexture?.index;
  const baseTexture =
    typeof baseTextureIndex === "number" ? resources.textures.get(baseTextureIndex) : undefined;
  const emissiveTexture =
    typeof emissiveTextureIndex === "number"
      ? resources.textures.get(emissiveTextureIndex)
      : undefined;
  const resolvedColorTexture = baseTexture ?? emissiveTexture;
  const materialParams: ConstructorParameters<typeof THREE.MeshStandardMaterial>[0] = {
    color: new THREE.Color(baseColorFactor[0], baseColorFactor[1], baseColorFactor[2]),
    metalness: pbr?.metallicFactor ?? 0,
    opacity: baseColorFactor[3] ?? 1,
    roughness: pbr?.roughnessFactor ?? 0.9,
    side: THREE.DoubleSide,
    transparent: (baseColorFactor[3] ?? 1) < 1,
    vertexColors: hasVertexColors,
  };

  if (resolvedColorTexture) {
    materialParams.map = resolvedColorTexture;
  }

  if (emissiveTexture) {
    materialParams.emissiveMap = emissiveTexture;
  }

  const material = new THREE.MeshStandardMaterial(materialParams);

  if (resolvedColorTexture) {
    material.emissive.set(0x050302);
    material.emissiveIntensity = emissiveTexture ? 0.18 : 0.08;
  } else if (!hasVertexColors) {
    material.color.set(0xc19464);
    material.emissive.set(0x352111);
    material.emissiveIntensity = 0.5;
    material.roughness = 0.82;
  }

  return material;
}

async function readAssetArrayBuffer(uri: string) {
  try {
    const response = await fetch(uri);
    if (!response.ok) {
      throw new Error(`No se pudo leer el asset (${response.status})`);
    }

    return await response.arrayBuffer();
  } catch (error) {
    console.warn("[MuseIQ][3D] Fallback a lectura base64 para asset GLB", error);
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: "base64",
    });
    const bytes = Buffer.from(base64, "base64");

    return bytes.buffer.slice(
      bytes.byteOffset,
      bytes.byteOffset + bytes.byteLength,
    );
  }
}

function markObjectAsSharedTemplate(object: THREE.Object3D) {
  object.traverse((child) => {
    const mesh = child as THREE.Mesh & {
      userData: { museiqSharedTemplate?: boolean };
    };

    if (!("geometry" in mesh)) {
      return;
    }

    mesh.userData = {
      ...mesh.userData,
      museiqSharedTemplate: true,
    };
  });
}

async function writeEmbeddedTextureFile(
  json: GltfJson,
  arrayBuffer: ArrayBuffer,
  binStart: number,
  image: GltfImage,
  imageIndex: number,
) {
  const bufferViewIndex = image.bufferView;
  if (typeof bufferViewIndex !== "number") {
    throw new Error("Textura GLB sin bufferView");
  }

  const bufferView = json.bufferViews[bufferViewIndex];
  const byteOffset = binStart + (bufferView.byteOffset ?? 0);
  const imageBytes = Buffer.from(arrayBuffer, byteOffset, bufferView.byteLength);
  const dimensions = getEmbeddedImageDimensions(imageBytes, image.mimeType);
  const extension = image.mimeType === "image/png" ? "png" : "jpg";
  const cacheRoot = FileSystem.cacheDirectory ?? FileSystem.documentDirectory;

  if (!cacheRoot) {
    throw new Error("Cache local no disponible para textura GLB");
  }

  const uri = `${cacheRoot}museiq-cabeza-clava-texture-${imageIndex}-${bufferView.byteLength}.${extension}`;
  const cacheKey = uri;
  const cached = embeddedTextureFileCache.get(cacheKey);

  if (cached) {
    return cached;
  }

  const writePromise = (async () => {
    const info = await FileSystem.getInfoAsync(uri);

    if (!info.exists) {
      await FileSystem.writeAsStringAsync(uri, imageBytes.toString("base64"), {
        encoding: "base64",
      });
    }

    return {
      height: dimensions.height,
      localUri: uri,
      width: dimensions.width,
    };
  })();

  embeddedTextureFileCache.set(cacheKey, writePromise);
  return writePromise;
}

function createTextureFromEmbeddedAsset(asset: EmbeddedTextureAsset) {
  const texture = new THREE.Texture();

  texture.image = {
    data: asset,
    height: asset.height,
    width: asset.width,
  } as never;
  texture.flipY = false;
  texture.generateMipmaps = true;
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  (texture as unknown as { isDataTexture: boolean }).isDataTexture = true;

  return texture;
}

function createBufferAttribute(
  json: GltfJson,
  arrayBuffer: ArrayBuffer,
  binStart: number,
  accessorIndex: number,
) {
  const accessor = json.accessors[accessorIndex];
  const itemSize = ITEM_SIZE[accessor.type];
  const data = readAccessorData(json, arrayBuffer, binStart, accessor);
  return new THREE.BufferAttribute(data, itemSize, accessor.normalized ?? false);
}

function createIndexAttribute(
  json: GltfJson,
  arrayBuffer: ArrayBuffer,
  binStart: number,
  accessorIndex: number,
) {
  const accessor = json.accessors[accessorIndex];
  const data = readAccessorData(json, arrayBuffer, binStart, accessor);

  if (accessor.componentType === 5125) {
    let maxIndex = 0;
    for (let index = 0; index < data.length; index += 1) {
      maxIndex = Math.max(maxIndex, data[index]);
    }

    if (maxIndex <= 65535) {
      return new THREE.BufferAttribute(Uint16Array.from(data), 1);
    }
  }

  return new THREE.BufferAttribute(data, 1, accessor.normalized ?? false);
}

function readAccessorData(
  json: GltfJson,
  arrayBuffer: ArrayBuffer,
  binStart: number,
  accessor: GltfAccessor,
) {
  if (typeof accessor.bufferView !== "number") {
    throw new Error("Accessor sin bufferView");
  }

  const bufferView = json.bufferViews[accessor.bufferView];
  const itemSize = ITEM_SIZE[accessor.type];
  const componentBytes = COMPONENT_BYTE_SIZE[accessor.componentType];
  const TypedArray = getComponentArray(accessor.componentType);
  const byteOffset =
    binStart + (bufferView.byteOffset ?? 0) + (accessor.byteOffset ?? 0);
  const elementCount = accessor.count * itemSize;
  const packedByteStride = itemSize * componentBytes;

  if (!bufferView.byteStride || bufferView.byteStride === packedByteStride) {
    return new TypedArray(arrayBuffer, byteOffset, elementCount);
  }

  const packed = new TypedArray(elementCount);
  const sourceView = new DataView(arrayBuffer);
  const readComponent = getComponentReader(accessor.componentType);

  for (let accessorItem = 0; accessorItem < accessor.count; accessorItem += 1) {
    const itemOffset = byteOffset + accessorItem * bufferView.byteStride;
    for (let component = 0; component < itemSize; component += 1) {
      packed[accessorItem * itemSize + component] = readComponent(
        sourceView,
        itemOffset + component * componentBytes,
      );
    }
  }

  return packed;
}

function getComponentArray(componentType: number) {
  switch (componentType) {
    case 5120:
      return Int8Array;
    case 5121:
      return Uint8Array;
    case 5122:
      return Int16Array;
    case 5123:
      return Uint16Array;
    case 5125:
      return Uint32Array;
    case 5126:
      return Float32Array;
    default:
      throw new Error(`Componente GLB no soportado: ${componentType}`);
  }
}

function getComponentReader(componentType: number) {
  switch (componentType) {
    case 5120:
      return (view: DataView, offset: number) => view.getInt8(offset);
    case 5121:
      return (view: DataView, offset: number) => view.getUint8(offset);
    case 5122:
      return (view: DataView, offset: number) => view.getInt16(offset, true);
    case 5123:
      return (view: DataView, offset: number) => view.getUint16(offset, true);
    case 5125:
      return (view: DataView, offset: number) => view.getUint32(offset, true);
    case 5126:
      return (view: DataView, offset: number) => view.getFloat32(offset, true);
    default:
      throw new Error(`Componente GLB no soportado: ${componentType}`);
  }
}

function applyNodeTransform(object: THREE.Object3D, node: GltfNode) {
  if (node.matrix?.length === 16) {
    object.matrix.fromArray(node.matrix);
    object.matrix.decompose(object.position, object.quaternion, object.scale);
    return;
  }

  if (node.translation) {
    object.position.fromArray(node.translation);
  }
  if (node.rotation) {
    object.quaternion.fromArray(node.rotation);
  }
  if (node.scale) {
    object.scale.fromArray(node.scale);
  }
}

function normalizeModel(model: THREE.Object3D, targetSize: number) {
  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const maxDimension = Math.max(size.x, size.y, size.z) || 1;

  model.position.sub(center);
  model.scale.setScalar(targetSize / maxDimension);
}

function fitCameraToObject(
  camera: THREE.PerspectiveCamera,
  model: THREE.Object3D,
  aspectRatio: number,
) {
  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const halfHeight = size.y / 2;
  const halfWidth = size.x / 2;
  const verticalFov = THREE.MathUtils.degToRad(camera.fov / 2);
  const safeAspectRatio = Math.max(aspectRatio, 0.35);
  const distanceForHeight = (halfHeight * 1.1) / Math.tan(verticalFov);
  const distanceForWidth =
    halfWidth / (Math.tan(verticalFov) * safeAspectRatio * MODEL_WIDTH_FILL_RATIO);
  const distance = Math.max(distanceForHeight, distanceForWidth);
  const target = center.clone();
  const near = Math.max(distance / 100, 0.01);
  const far = Math.max(distance * 100, 100);
  const cameraFit = {
    distance,
    far,
    near,
    target,
  };

  applyCameraZoom(camera, cameraFit, 1);
  return cameraFit;
}

function applyCameraZoom(
  camera: THREE.PerspectiveCamera,
  fit: CameraFit,
  zoom: number,
) {
  const safeZoom = clamp(zoom, MIN_MODEL_ZOOM, MAX_MODEL_ZOOM);
  const distance = fit.distance / safeZoom;

  camera.position.set(fit.target.x, fit.target.y + 0.06, fit.target.z + distance);
  camera.near = Math.max(fit.near / safeZoom, 0.01);
  camera.far = Math.max(fit.far, distance * 100);
  camera.lookAt(fit.target);
  camera.updateProjectionMatrix();
}

function fitCameraInsideObject(camera: THREE.PerspectiveCamera, model: THREE.Object3D) {
  model.updateWorldMatrix(true, true);
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  const maxDimension = Math.max(size.x, size.y, size.z) || 1;
  const placement = findImmersiveObserverPlacement(model, box);
  const rig = {
    baseYaw: placement.baseYaw,
    far: Math.max(maxDimension * 12, 60),
    lookDistance: Math.max(placement.lookDistance, Math.max(maxDimension * 0.18, 1.2)),
    near: Math.max(maxDimension * 0.0025, 0.02),
    origin: placement.origin.clone(),
  };

  console.log("[MuseIQ][VR] rig", {
    baseYaw: Number(placement.baseYaw.toFixed(2)),
    lookDistance: Number(rig.lookDistance.toFixed(2)),
    minClearance: Number(placement.minClearance.toFixed(2)),
    origin: [
      Number(rig.origin.x.toFixed(2)),
      Number(rig.origin.y.toFixed(2)),
      Number(rig.origin.z.toFixed(2)),
    ],
    score: Number(placement.score.toFixed(2)),
  });
  applyImmersiveCameraPose(camera, rig, 0, 0);
  return rig;
}

function findImmersiveObserverPlacement(
  model: THREE.Object3D,
  box: THREE.Box3,
): ImmersiveObserverPlacement {
  const size = box.getSize(new THREE.Vector3());
  const diagonal = Math.max(size.length(), 2);
  const candidateDirections = getImmersiveSampleDirections();
  const raycaster = new THREE.Raycaster();
  const preferredEyeHeight = box.min.y + size.y * 0.3;
  const minimumHeadroom = Math.max(diagonal * 0.04, 0.14);
  let bestPlacement: ImmersiveObserverPlacement | null = null;

  IMMERSIVE_HEIGHT_SAMPLE_FRACTIONS.forEach((heightFraction) => {
    const y = THREE.MathUtils.lerp(box.min.y, box.max.y, heightFraction);

    IMMERSIVE_HORIZONTAL_SAMPLE_FRACTIONS.forEach((xFraction) => {
      const x = THREE.MathUtils.lerp(box.min.x, box.max.x, xFraction);

      IMMERSIVE_HORIZONTAL_SAMPLE_FRACTIONS.forEach((zFraction) => {
        const z = THREE.MathUtils.lerp(box.min.z, box.max.z, zFraction);
        const origin = new THREE.Vector3(x, y, z);
        const horizontalDistances = candidateDirections.map(({ direction }) =>
          measureClearance(raycaster, model, origin, direction, diagonal),
        );
        const upClearance = measureClearance(
          raycaster,
          model,
          origin,
          new THREE.Vector3(0, 1, 0),
          diagonal,
        );
        const downClearance = measureClearance(
          raycaster,
          model,
          origin,
          new THREE.Vector3(0, -1, 0),
          diagonal,
        );
        const minClearance = Math.min(...horizontalDistances);
        const averageClearance =
          horizontalDistances.reduce((total, distance) => total + distance, 0) /
          horizontalDistances.length;
        const bestDirectionIndex = horizontalDistances.reduce(
          (bestIndex, distance, index, distances) =>
            distance > distances[bestIndex] ? index : bestIndex,
          0,
        );
        const bestDirection = candidateDirections[bestDirectionIndex];
        const bestDirectionClearance = horizontalDistances[bestDirectionIndex];
        const normalizedHeightOffset =
          Math.abs(y - preferredEyeHeight) / Math.max(size.y, 0.001);
        const headroomPenalty =
          upClearance < minimumHeadroom ? (minimumHeadroom - upClearance) * 6 : 0;
        const floorPenalty =
          downClearance < minimumHeadroom * 0.28 ? (minimumHeadroom * 0.28 - downClearance) * 3 : 0;
        const score =
          minClearance * 2.2 +
          averageClearance * 0.65 +
          bestDirectionClearance * 0.35 +
          Math.min(upClearance, diagonal) * 0.18 -
          normalizedHeightOffset * diagonal * 0.55 -
          headroomPenalty -
          floorPenalty;
        const lookDistance = clamp(
          bestDirectionClearance * 0.78,
          Math.max(diagonal * 0.16, 1.2),
          Math.max(diagonal * 0.55, 2.4),
        );
        const placement = {
          baseYaw: bestDirection.yaw,
          lookDistance,
          minClearance,
          origin,
          score,
        };

        if (!bestPlacement || placement.score > bestPlacement.score) {
          bestPlacement = placement;
        }
      });
    });
  });

  if (bestPlacement) {
    return bestPlacement;
  }

  const center = box.getCenter(new THREE.Vector3());
  return {
    baseYaw: 0,
    lookDistance: Math.max(diagonal * 0.36, 1.5),
    minClearance: 0,
    origin: center,
    score: 0,
  };
}

function applyImmersiveCameraPose(
  camera: THREE.PerspectiveCamera,
  rig: ImmersiveCameraRig,
  yaw: number,
  pitch: number,
) {
  const resolvedYaw = rig.baseYaw + yaw;
  const lookDirection = new THREE.Vector3(
    Math.sin(resolvedYaw) * Math.cos(pitch),
    Math.sin(pitch),
    -Math.cos(resolvedYaw) * Math.cos(pitch),
  ).normalize();
  const lookTarget = rig.origin.clone().add(lookDirection.multiplyScalar(rig.lookDistance));

  camera.position.copy(rig.origin);
  camera.near = rig.near;
  camera.far = rig.far;
  camera.lookAt(lookTarget);
  camera.updateProjectionMatrix();
}

function applyTrackedImmersiveCameraPose(
  camera: THREE.PerspectiveCamera,
  rig: ImmersiveCameraRig,
  referenceOrientation: THREE.Quaternion,
  currentOrientation: THREE.Quaternion,
) {
  const baseOrientation = new THREE.Quaternion().setFromAxisAngle(
    new THREE.Vector3(0, 1, 0),
    rig.baseYaw,
  );
  const viewerOrientation = baseOrientation.multiply(
    referenceOrientation.clone().multiply(currentOrientation),
  );

  camera.position.copy(rig.origin);
  camera.near = rig.near;
  camera.far = rig.far;
  camera.quaternion.copy(viewerOrientation);
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld(true);
}

function getDeviceMotionQuaternion(
  rotation: { alpha: number; beta: number; gamma: number },
  orientation: number,
) {
  const alpha = rotation.alpha ?? 0;
  const beta = rotation.beta ?? 0;
  const gamma = rotation.gamma ?? 0;
  const screenOrientation = THREE.MathUtils.degToRad(orientation ?? 0);

  deviceOrientationEuler.set(beta, alpha, -gamma, "YXZ");

  return new THREE.Quaternion()
    .setFromEuler(deviceOrientationEuler)
    .multiply(deviceOrientationTransformQuaternion)
    .multiply(
      deviceOrientationScreenQuaternion.setFromAxisAngle(
        deviceOrientationAxis,
        -screenOrientation,
      ),
    );
}

function getCompassOrientation(
  accelerometer: { x: number; y: number; z: number },
  magnetometer: { x: number; y: number; z: number },
) {
  const ax = accelerometer.x;
  const ay = accelerometer.y;
  const az = accelerometer.z;
  const accelNorm = Math.hypot(ax, ay, az);
  if (accelNorm <= 0.0001) {
    return null;
  }

  const pitch = Math.atan2(-ax, Math.sqrt(ay * ay + az * az));
  const roll = Math.atan2(ay, az || 0.0001);

  const mx = magnetometer.x;
  const my = magnetometer.y;
  const mz = magnetometer.z;
  const magNorm = Math.hypot(mx, my, mz);
  if (magNorm <= 0.0001) {
    return null;
  }

  const compensatedX = mx * Math.cos(pitch) + mz * Math.sin(pitch);
  const compensatedY =
    mx * Math.sin(roll) * Math.sin(pitch) +
    my * Math.cos(roll) -
    mz * Math.sin(roll) * Math.cos(pitch);
  const yaw = Math.atan2(-compensatedY, compensatedX);

  return { pitch, yaw };
}

function getImmersiveSampleDirections() {
  return [
    new THREE.Vector3(0, 0, -1),
    new THREE.Vector3(1, 0, -1).normalize(),
    new THREE.Vector3(1, 0, 0),
    new THREE.Vector3(1, 0, 1).normalize(),
    new THREE.Vector3(0, 0, 1),
    new THREE.Vector3(-1, 0, 1).normalize(),
    new THREE.Vector3(-1, 0, 0),
    new THREE.Vector3(-1, 0, -1).normalize(),
  ].map((direction) => ({
    direction,
    yaw: Math.atan2(direction.x, -direction.z),
  }));
}

function measureClearance(
  raycaster: THREE.Raycaster,
  model: THREE.Object3D,
  origin: THREE.Vector3,
  direction: THREE.Vector3,
  far: number,
) {
  raycaster.near = 0;
  raycaster.far = far;
  raycaster.set(origin, direction);
  const hit = raycaster
    .intersectObject(model, true)
    .find((intersection) => intersection.distance > 0.001);

  return hit?.distance ?? far;
}

function applyTextureQuality(object: THREE.Object3D, maxAnisotropy: number) {
  const anisotropy = Math.max(1, Math.min(maxAnisotropy, 8));

  object.traverse((child) => {
    const material = (child as THREE.Mesh).material;
    const materials = Array.isArray(material) ? material : material ? [material] : [];

    materials.forEach((item) => {
      const texturedMaterial = item as THREE.MeshStandardMaterial;
      if (texturedMaterial.map) {
        texturedMaterial.map.anisotropy = anisotropy;
        texturedMaterial.map.needsUpdate = true;
      }
    });
  });
}

function enableDoubleSidedMaterials(object: THREE.Object3D) {
  object.traverse((child) => {
    const material = (child as THREE.Mesh).material;
    const materials = Array.isArray(material) ? material : material ? [material] : [];

    materials.forEach((item) => {
      item.side = THREE.DoubleSide;
      item.needsUpdate = true;
    });
  });
}

function disposeObject(object: THREE.Object3D) {
  object.traverse((child) => {
    const mesh = child as THREE.Mesh & {
      userData?: { museiqSharedTemplate?: boolean };
    };
    if (mesh.userData?.museiqSharedTemplate) {
      return;
    }

    mesh.geometry?.dispose();

    const material = mesh.material;
    if (Array.isArray(material)) {
      material.forEach((item) => item.dispose());
    } else {
      material?.dispose();
    }
  });
}

function readFourCc(dataView: DataView, offset: number) {
  return String.fromCharCode(
    dataView.getUint8(offset),
    dataView.getUint8(offset + 1),
    dataView.getUint8(offset + 2),
    dataView.getUint8(offset + 3),
  );
}

function getTouchDistance(touches: readonly { pageX: number; pageY: number }[]) {
  if (touches.length < 2) {
    return null;
  }

  const [firstTouch, secondTouch] = touches;
  return Math.hypot(
    firstTouch.pageX - secondTouch.pageX,
    firstTouch.pageY - secondTouch.pageY,
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function normalizeAngle(value: number) {
  const fullTurn = Math.PI * 2;
  const wrappedValue = (value + Math.PI) % fullTurn;
  return (wrappedValue < 0 ? wrappedValue + fullTurn : wrappedValue) - Math.PI;
}

function getEmbeddedImageDimensions(bytes: Buffer, mimeType?: string) {
  if (mimeType === "image/png") {
    return {
      height: bytes.readUInt32BE(20),
      width: bytes.readUInt32BE(16),
    };
  }

  if (mimeType === "image/jpeg") {
    return getJpegDimensions(bytes);
  }

  throw new Error(`Textura GLB no soportada: ${mimeType ?? "sin mimeType"}`);
}

function getJpegDimensions(bytes: Buffer) {
  let offset = 2;

  while (offset < bytes.length) {
    if (bytes[offset] !== 0xff) {
      offset += 1;
      continue;
    }

    const marker = bytes[offset + 1];
    const length = bytes.readUInt16BE(offset + 2);
    const isStartOfFrame =
      marker >= 0xc0 &&
      marker <= 0xcf &&
      marker !== 0xc4 &&
      marker !== 0xc8 &&
      marker !== 0xcc;

    if (isStartOfFrame) {
      return {
        height: bytes.readUInt16BE(offset + 5),
        width: bytes.readUInt16BE(offset + 7),
      };
    }

    offset += 2 + length;
  }

  throw new Error("Dimensiones JPEG no encontradas");
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "transparent",
    flex: 1,
    minHeight: 0,
    overflow: "visible",
    width: "100%",
  },
  statusOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    gap: 8,
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  statusText: {
    color: "rgba(255,255,255,0.86)",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },
  errorText: {
    color: "rgba(255,255,255,0.62)",
    fontSize: 10,
    fontWeight: "600",
    lineHeight: 14,
    textAlign: "center",
  },
});
