# Roadmap MuseIQ AR-first

Actualizado: 2026-05-21

Este roadmap sigue el flujo visual de `pantallas/flujo.png` y las pantallas de referencia incluidas en `pantallas/`. El objetivo es convertir MuseIQ en una guía inmersiva, sobria y museográfica, sin perder las funciones ya existentes de BLE, MuseRAG, voz, imágenes y modo técnico.

## Principios de producto

- La experiencia principal es Home AR, no un set de tabs.
- BLE detecta sala/zona; no debe afirmar obra exacta sin QR o selección explícita.
- QR identifica una obra exacta.
- Info y fuentes no son acciones permanentes del Home.
- Chat y Audio sí pueden estar visibles como acciones laterales.
- La interfaz usa azul MuseIQ como color primario, con botones de borde en el HUD.
- El modo técnico queda separado del visitante común.

## Avance por flujo

### 01. Entrada a la visita

- [x] `01-Inicio.png`: pantalla inicial con fondo inmersivo y logo.
- [x] `01-seleccion-museo.png`: selección de museo.
- [x] `01-Preparacion-visita.png`: preparación de visita y permisos.

### 02. Home AR

- [x] `02-Home-AR-Sin-Sala.png`: estado sin sala detectada.
- [x] `02-Home-AR-con-Sala.png`: estado con sala detectada.
- [x] `02-03.png`: sugerencia BLE futura con lenguaje probabilístico.

### 03. Acciones dentro de Home AR

- [x] `03-01.png`: explorar sala como bottom sheet.
- [x] `03-02.png`: escanear QR como overlay de cámara.
- [ ] QR real con cámara y parsing de códigos de obra.
- [ ] Estado de QR inválido y entrada manual de código.
- [x] `03-03.png`: obra identificada tras QR.
- [x] `08-03.png`: cargando AR.

### 05. Paneles secundarios de obra

- [x] `05-02.png`: detalle de obra.
- [x] `05-03.png`: imágenes relacionadas.
- [ ] Contexto curatorial como tab interno.
- [ ] Fuentes y sustento como tab sobrio/académico.
- [ ] Favoritos y compartir conectados a estado real.

## Fases técnicas

### Fase 1. Base visual y modularización

- [x] Paleta azul MuseIQ.
- [x] Separación de controladores de chat/RAG/voz.
- [x] Hook de estado BLE resumido para Home.
- [x] Componentes base para Home y paneles de obra.

### Fase 2. Navegación AR-first

- [x] Pantallas iniciales fuera de tabs.
- [x] Home AR como pantalla principal.
- [x] Explorar y QR como acciones internas.
- [x] Drawer separado del HUD principal.
- [ ] Revisar drawer final: Perfil, Cambiar museo, Configuración, Ayuda, Modo técnico, Idioma y Accesibilidad.

### Fase 3. Estados visuales del Home

- [x] Sin sala detectada.
- [x] Sala detectada.
- [x] Sugerencia BLE futura.
- [x] Explorar sala.
- [x] Escaneo QR simulado.
- [ ] Obra identificada después de QR.
- [ ] AR activo / obra 3D.
- [ ] Hotspot seleccionado.
- [ ] Chat IA como bottom sheet.
- [ ] Audio activo con progreso.
- [ ] Estados de error, carga y sin conexión.

<!-- Actualizado según pantallas presentes en `app/` -->

- [x] Obra identificada después de QR (`obra-identificada.tsx`, `artwork-detail.tsx`).
- [x] AR activo / obra 3D (`ar-activo.tsx`, `visor-3d.tsx`, `cargando-ar.tsx`).
- [x] Hotspot seleccionado (`ar-hotspot-seleccionado.tsx`).
- [x] Chat IA como componente/estado (`ar-chat-ia.tsx`).
- [x] Audio activo con control básico (`ar-audio-activo.tsx`).
- [ ] Estados de error, carga y sin conexión (mejoras y manejos por robustecer).

### Fase 4. Recursos AR/3D

- [ ] Tipos de datos para `model_3d` y `hotspots`.
- [ ] Endpoint o payload MuseRAG con recursos AR.
- [ ] Descarga/carga de GLB por obra.
- [ ] Estado "modelo 3D no disponible".
- [ ] Visor 3D sin AR.
- [ ] Fallback si ARCore/ARKit no está disponible.

### Fase 5. AR real

- [ ] Evaluar e integrar ReactVision/ViroReact o alternativa compatible.
- [ ] Renderizar modelo 3D sobre la escena.
- [ ] Hotspots tocables.
- [ ] Pruebas en dispositivo físico.
- [ ] Optimización de peso, carga y degradación offline.

## Próximos pasos recomendados

1. Implementar el estado de obra identificada tras QR.
2. Convertir el chat actual en bottom sheet del Home AR.
3. Agregar el estado de audio activo con barra de progreso.
4. Completar tabs de Contexto y Fuentes en detalle de obra.
5. Definir contrato de datos `model_3d` y `hotspots` con MuseRAG.

## Validación esperada

- `npx tsc --noEmit`
- `npm run lint`
- Revisión visual en dispositivo o emulador para Home AR, Explorar, QR, Detalle e Imágenes.
- Prueba BLE con beacons reales o fallback por nombre.
- Prueba MuseRAG con backend local accesible desde el móvil.
