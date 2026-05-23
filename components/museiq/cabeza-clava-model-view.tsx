import { DEFAULT_ARTWORK_MODEL, getArtworkModelAssetForArtwork } from "@/lib/artwork-models";
import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system/legacy";
import { GLView, type ExpoWebGLRenderingContext } from "expo-gl";
import { Buffer } from "buffer";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  PanResponder,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import * as THREE from "three";

type CabezaClavaModelViewProps = {
  autoRotate?: boolean;
  interactive?: boolean;
  modelAsset?: ModelAsset;
  modelLabel?: string;
  showStatus?: boolean;
  style?: StyleProp<ViewStyle>;
};

type ModelAsset = number;

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

const embeddedTextureFileCache = new Map<string, Promise<EmbeddedTextureAsset>>();
const preparedModelCache = new Map<ModelAsset, Promise<THREE.Object3D>>();

export const getCabezaClavaModelAssetForArtwork = getArtworkModelAssetForArtwork;

export function prepareCabezaClavaModel(
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

export function CabezaClavaModelView({
  autoRotate = true,
  interactive = false,
  modelAsset = DEFAULT_ARTWORK_MODEL.asset,
  modelLabel = DEFAULT_ARTWORK_MODEL.label,
  showStatus = true,
  style,
}: CabezaClavaModelViewProps) {
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const isMountedRef = useRef(true);
  const manualRotationYRef = useRef(0);
  const manualRotationXRef = useRef(0);
  const lastGestureDxRef = useRef(0);
  const lastGestureDyRef = useRef(0);
  const modelZoomRef = useRef(1);
  const initialPinchDistanceRef = useRef<number | null>(null);
  const initialPinchZoomRef = useRef(1);
  const autoRotateRef = useRef(autoRotate);
  const hasUserInteractedRef = useRef(false);

  useEffect(() => {
    autoRotateRef.current = autoRotate;
  }, [autoRotate]);

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
        onMoveShouldSetPanResponder: () => interactive,
        onStartShouldSetPanResponder: () => interactive,
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
          manualRotationYRef.current += delta * 0.012;
          manualRotationXRef.current = clamp(
            manualRotationXRef.current + deltaY * 0.01,
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
    [interactive],
  );

  const handleContextCreate = useCallback(async (gl: ExpoWebGLRenderingContext) => {
    let renderer: THREE.WebGLRenderer | null = null;
    let model: THREE.Object3D | null = null;
    let modelBaseScale = new THREE.Vector3(1, 1, 1);
    let cameraFit: CameraFit | null = null;

    try {
      setStatus("loading");
      setErrorMessage(null);
      patchUnsupportedPixelStore(gl);

      const width = gl.drawingBufferWidth;
      const height = gl.drawingBufferHeight;
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(44, width / height, 0.01, 100);
      camera.position.set(0, 0.08, 3.2);
      camera.lookAt(0, 0, 0);

      renderer = createRenderer(gl, width, height);

      scene.add(new THREE.HemisphereLight(0xfff2dc, 0x2b2118, 1.9));
      const keyLight = new THREE.DirectionalLight(0xfff3df, 2.4);
      keyLight.position.set(2, 3, 4);
      scene.add(keyLight);
      const rimLight = new THREE.DirectionalLight(0x87c7ff, 0.7);
      rimLight.position.set(-3, 2, -3);
      scene.add(rimLight);

      const loadStartedAt = Date.now();
      model = await loadCabezaClavaModel(modelAsset);
      normalizeModel(model, 2.55);
      modelBaseScale = model.scale.clone();
      cameraFit = fitCameraToObject(camera, model, width / height);
      applyTextureQuality(model, renderer.capabilities.getMaxAnisotropy());
      scene.add(model);
      console.log(`[MuseIQ][3D] ${modelLabel} listo en ${Date.now() - loadStartedAt}ms`);

      let spin = 0;
      let hasRenderedFirstFrame = false;
      const animate = () => {
        animationFrameRef.current = requestAnimationFrame(animate);
        if (model) {
          if (
            autoRotateRef.current &&
            !hasUserInteractedRef.current &&
            spin < INTRO_ROTATION_RADIANS
          ) {
            spin = Math.min(INTRO_ROTATION_RADIANS, spin + INTRO_ROTATION_SPEED);
          }
          model.rotation.x = manualRotationXRef.current;
          model.rotation.y = spin + manualRotationYRef.current;
          model.scale.copy(modelBaseScale);
          if (cameraFit) {
            applyCameraZoom(camera, cameraFit, modelZoomRef.current);
          }
        }
        renderer?.clear();
        renderer?.render(scene, camera);
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
  }, [modelAsset, modelLabel]);

  return (
    <View style={[styles.container, style]} {...(interactive ? panResponder.panHandlers : {})}>
      <GLView
        key={modelLabel}
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
  renderer.autoClear = true;

  return renderer;
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
  const preparedModel = preparedModelCache.get(modelAsset);
  if (preparedModel) {
    preparedModelCache.delete(modelAsset);
    return preparedModel;
  }

  return loadCabezaClavaModelSource(modelAsset);
}

async function loadCabezaClavaModelSource(
  modelAsset: ModelAsset,
  onProgress?: ModelPreparationProgress,
) {
  onProgress?.(12);
  const asset = Asset.fromModule(modelAsset);
  await asset.downloadAsync();

  onProgress?.(42);
  const uri = asset.localUri ?? asset.uri;
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: "base64",
  });
  const bytes = Buffer.from(base64, "base64");
  const arrayBuffer = bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength,
  );

  onProgress?.(76);
  const model = await parseGlbGeometry(arrayBuffer);
  onProgress?.(100);
  return model;
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
  return buildSceneFromGltf(json, arrayBuffer, binStart, resources);
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

function disposeObject(object: THREE.Object3D) {
  object.traverse((child) => {
    const mesh = child as THREE.Mesh;
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
