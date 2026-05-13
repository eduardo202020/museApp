# MuseIQ

Aplicacion Expo/React Native para guiar recorridos de museo usando beacons BLE y consultas a MuseRAG.

## Estado actual

El proyecto esta enfocado en un MVP de pruebas con estas capacidades:

- deteccion BLE para inferir la referencia mas cercana en sala
- obra actual y navegacion entre piezas del recorrido
- chat por texto sobre la obra activa
- consumo de respuestas de MuseRAG con texto e imagenes de apoyo
- visor de imagen ampliable con pinch-to-zoom y arrastre
- panel de sensores con acelerometro, brujula, pasos y BLE

## Chat con MuseRAG

La pantalla de chat envia preguntas por `POST` a:

```text
${EXPO_PUBLIC_MUSERAG_URL}/api/preguntar
```

Payload actual:

```json
{
  "pregunta": "Que representa esta obra?",
  "museo": "tumbas-reales-de-sipan",
  "sala": "SALA_1",
  "obra": "Senor de Sipan"
}
```

La app espera una respuesta JSON con `respuesta` y, si existen, `fuentes` con imagenes asociadas para mostrarlas en el carrusel del modal.

## Variables de entorno

Crea un archivo `.env` en la raiz del proyecto con:

```env
EXPO_PUBLIC_MUSERAG_URL=http://192.168.1.10:8000
```

Notas:

- la URL debe ser accesible desde el telefono o emulador
- si cambias el `.env`, reinicia Expo para que tome la nueva variable

## BLE y pruebas en sala

La app ya soporta dos formas de identificar beacons:

1. Formato BLE completo por `serviceData`
2. Fallback por nombre BLE para pruebas rapidas

### Fallback de prueba habilitado

Para simplificar las pruebas en sala, el scanner reconoce estos nombres BLE:

- `S1-M1`
- `S1-M2`
- `S1-M3`

Y los mapea internamente a:

- `S1-M1` -> `SALA_1-B01`
- `S1-M2` -> `SALA_1-B02`
- `S1-M3` -> `SALA_1-B03`

## Que muestra hoy la app

En la pantalla principal `app/index.tsx` la app muestra:

- obra actual y navegacion entre piezas
- boton `Chat` para consultar por texto sobre la obra activa
- panel de sensores con acelerometro, brujula, pasos y BLE
- beacon dominante en formato `SALA_x · M1/M2/M3`

En el modal `app/pregunta-voz-modal.tsx` la app muestra:

- caja de texto para escribir la pregunta
- respuesta textual del backend
- carrusel de imagenes devueltas por las fuentes
- visor ampliado de imagen con zoom y arrastre

## Sensores y pasos

La home integra varias fuentes de contexto fisico:

- `Accelerometer`: estado de movimiento (`quieto` o `en movimiento`)
- `Magnetometer`: orientacion aproximada en grados
- `Pedometer`: pasos nativos cuando el dispositivo y el build los entregan
- fallback por acelerometro para estimar pasos si el pedometro nativo no emite eventos

Notas importantes sobre pasos:

- en `iOS`, la app intenta leer el acumulado del dia y luego escuchar pasos nuevos
- en `Android`, `expo-sensors` es mas confiable para pasos en vivo que para historial
- si el pedometro nativo no responde en algunos dispositivos Android, MuseIQ usa una estimacion por movimiento

## Formato BLE esperado

El scanner sigue soportando `serviceData` con el UUID:

```text
0000A00A-0000-1000-8000-00805F9B34FB
```

Payload esperado:

```text
Room ID (UTF-8) + Beacon Node (1 byte) + FW Major (1 byte) + FW Minor (1 byte) + TX Power (1 byte signed) + Battery mV (2 bytes little-endian)
```

Ejemplo:

```text
SALA_1 + 0x01 + 0x01 + 0x00 + 0xF4 + 0x740E
```

Tambien se normaliza `S1` a `SALA_1` para el contexto actual de pruebas.

## Flujo de prueba recomendado

1. Arranca la app en un dispositivo Android con Development Build.
2. Asegura que el backend MuseRAG este levantado en la IP del `.env`.
3. Abre la pantalla principal.
4. Expande el panel `Sensores`.
5. Enciende o acerca los ESP32 `S1-M1`, `S1-M2` y `S1-M3`.
6. Verifica que el campo `BLE` muestre algo como `SALA_1 · M1`.
7. Abre `Chat`, escribe una pregunta y confirma la respuesta.
8. Si el backend devuelve imagenes, toca una para ampliarla.

## Scripts utiles

```bash
npm install
npm run dev:client
npm run dev:client:lan
npm run web
npx tsc --noEmit
```

## Estructura clave

- `app/index.tsx`: home principal, obra actual y panel de sensores
- `app/pregunta-voz-modal.tsx`: chat por texto, respuesta y visor de imagenes
- `hooks/use-ble-scanner.ts`: escaneo BLE, parseo de payload y fallback por nombre
- `providers/museiq-provider.tsx`: estado general del recorrido
- `lib/muserag-api.ts`: cliente HTTP hacia MuseRAG
- `lib/artwork-images.ts`: registro de assets locales de obras
- `datos.ts`: seed de salas, obras y textos del museo
- `README-DEV.md`: arranque en WSL2 / Development Build

## Notas de desarrollo

- el flujo actual de preguntas es por texto; no hay captura de voz activa en el chat
- el backend debe devolver una estructura compatible con `respuesta` y opcionalmente `fuentes`
- si Expo falla al iniciar con `ENOSPC`, revisa `README-DEV.md`
