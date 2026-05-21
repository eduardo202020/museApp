# MuseIQ

> Guía móvil contextual e inmersiva para museos, con experiencia AR-first apoyada por BLE, QR, voz, MuseRAG e imágenes.

MuseIQ está evolucionando desde una guía conversacional tradicional hacia una experiencia de mediación cultural centrada en la cámara o vista AR. La pantalla principal ya no se organiza como una app de tabs, sino como una visita inmersiva con controles flotantes, bottom sheets y paneles secundarios cuando el visitante necesita más detalle.

## Enfoque actual

- La cámara o fondo AR es el centro de la visita.
- BLE detecta sala o zona y resume el estado en el HUD.
- Explorar sala y Escanear QR son acciones flotantes, no tabs.
- Chat y Audio viven como acciones laterales.
- Info, fuentes e imágenes aparecen dentro del detalle, chat o paneles secundarios.
- El color principal es el azul MuseIQ `#1689CE`.

## Flujo implementado

1. Inicio con fondo inmersivo y logo MuseIQ.
2. Selección de museo.
3. Preparación de visita con permisos y requisitos.
4. Home AR sin sala detectada.
5. Home AR con sala detectada.
6. Sugerencia BLE futura, expresada como hipótesis y con confirmación por QR.
7. Explorar sala como bottom sheet con obras, imágenes y badges de recurso.
8. Escanear QR como overlay de cámara con marco de lectura, cancelar y linterna.
9. Detalle de obra con ficha, acciones AR/chat e imágenes relacionadas.
10. Galería de imágenes relacionadas.

## Pantallas implementadas (carpeta `app/`)

Listado de pantallas detectadas en `app/` y su correspondencia con el flujo:

- `splash.tsx`: Pantalla inicial (logo / carga)
- `seleccionar-museo.tsx`: Selección de museo
- `preparacion-visita.tsx`: Preparación de visita y permisos
- `index.tsx` / `_layout.tsx`: Orquestación del Home AR y rutas
- `ar-no-disponible.tsx`: Home AR - sin sala detectada
- `ar-activo.tsx`: Home AR - AR activo
- `ar-audio-activo.tsx`: Estado de audio activo
- `ar-chat-ia.tsx`: Chat IA integrado (estado / bottom sheet)
- `obra-identificada.tsx`: Pantalla que muestra obra identificada
- `artwork-detail.tsx`: Detalle de obra (ficha, metadatos)
- `artwork-images.tsx`: Galería / imágenes relacionadas
- `cargando-ar.tsx`: Indicador de carga de AR
- `visor-3d.tsx`: Visor 3D (sin integrar AR completo)
- `ar-hotspot-seleccionado.tsx`: Hotspot seleccionado (estado)
- `permissions-modal.tsx`: Modal de permisos
- `pregunta-voz-modal.tsx`: Interfaz para preguntas por voz

## Pantallas o funcionalidades pendientes

- Integración de QR real con parsing y mapping a obra (QR en cámara)
- Manejo de QR inválido y entrada manual de códigos
- Tabs internos de Contexto curatorial y Fuentes en detalle de obra
- Favoritos, compartir y sincronización con backend
- Descarga y renderizado final de modelos 3D por obra en AR


## Capacidades conservadas

- Detección BLE de sala o zona.
- Exploración manual de salas y obras.
- Chat con MuseRAG por texto.
- Preguntas por voz y narración con TTS/STT.
- Contexto de museo, sala, obra y modo de respuesta.
- Imágenes relacionadas y fuentes visuales.
- Progreso local y analítica básica.
- Modo técnico con BLE, sensores y depuración.

## Arquitectura visual reciente

- `app/(drawer)/home.tsx`: Home AR y orquestación de estados.
- `components/museiq/home/`: HUD, sugerencia BLE, explorar sala, QR y componentes de home.
- `components/museiq/artwork/`: encabezado, tabs, filas de ficha y galería reutilizable.
- `hooks/use-home-ble-status.ts`: estado BLE resumido para Home AR.
- `hooks/use-artwork-chat-controller.ts`: controlador compartido para chat, RAG y voz.

## Stack tecnológico

| Capa | Tecnología |
| --- | --- |
| UI móvil | Expo Router, React Native, TypeScript |
| Navegación | Stack, Drawer, rutas modales |
| Conectividad | `react-native-ble-plx`, `expo-sensors` |
| Voz | `expo-speech`, `expo-speech-recognition` |
| Persistencia | `expo-sqlite` |
| IA | MuseRAG |

## Comandos útiles

```bash
npm install
npx tsc --noEmit
npm run lint
npm run dev:client
```

## Estado actual

La base AR-first ya está montada para las primeras pantallas del flujo. El reconocimiento automático de obra por BLE queda deliberadamente para el final; por ahora BLE detecta sala y prepara sugerencias futuras. El QR real, AR real y carga de modelos 3D son las próximas integraciones fuertes.

## Documentación relacionada

- Configuración técnica: [README-DEV.md](README-DEV.md)
- Roadmap de producto y flujo: [ROADMAP.md](ROADMAP.md)
- URL de backend: [app.config.js](app.config.js)
- Cliente de MuseRAG: [lib/muserag-api.ts](lib/muserag-api.ts)
