# MuseIQ

Aplicacion Expo/React Native para guiar recorridos de museo usando beacons BLE.

El estado actual del proyecto esta enfocado en un MVP de pruebas:

- 1 sala activa en la app: `SALA_1`
- 3 mini ESP32 emitiendo como beacons de prueba
- deteccion BLE basada en RSSI para inferir la referencia mas cercana
- home principal con panel de sensores y lecturas BLE en tiempo real

## Estado actual del MVP

La app ya soporta dos formas de identificar beacons:

1. Formato BLE completo por `serviceData`
2. Fallback por nombre BLE para pruebas rapidas

### Fallback de prueba habilitado

Para simplificar las pruebas en sala, el scanner reconoce directamente estos nombres BLE:

- `S1-M1`
- `S1-M2`
- `S1-M3`

Y los mapea internamente a:

- `S1-M1` -> `SALA_1-B01`
- `S1-M2` -> `SALA_1-B02`
- `S1-M3` -> `SALA_1-B03`

Esto permite validar el flujo del MVP aunque los ESP32 todavia no esten enviando el payload BLE final completo.

## Que muestra hoy la app

En la pantalla principal `app/index.tsx` la app ya muestra:

- obra actual y navegacion entre piezas de la sala
- chat por voz para consultar sobre la obra activa
- panel de sensores con acelerometro, brujula, pasos y BLE
- beacon dominante en formato `SALA_x · M1/M2/M3`

Cuando el scanner BLE detecta varios beacons, la app toma el de mejor RSSI como referencia dominante y lo muestra en el panel de sensores.

## Sensores y pasos

La home integra varias fuentes de contexto fisico:

- `Accelerometer`: estado de movimiento (`quieto` o `en movimiento`)
- `Magnetometer`: orientacion aproximada en grados
- `Pedometer`: pasos nativos cuando el dispositivo y el build los entregan
- fallback por acelerometro para estimar pasos si el pedometro nativo no emite eventos

Notas importantes sobre pasos:

- En `iOS`, la app intenta leer el acumulado del dia y luego escuchar pasos nuevos.
- En `Android`, `expo-sensors` es mas confiable para pasos en vivo que para historial; por eso la UI puede arrancar en espera y comenzar a subir al caminar.
- Si el pedometro nativo no responde en algunos dispositivos Android, MuseIQ usa una estimacion por movimiento para no dejar el contador bloqueado en `0`.

## Formato BLE esperado

El scanner sigue soportando el formato completo de `serviceData` con el UUID:

`0000A00A-0000-1000-8000-00805F9B34FB`

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
2. Abre la pantalla principal.
3. Expande el panel `Sensores`.
4. Enciende o acerca los ESP32 `S1-M1`, `S1-M2` y `S1-M3`.
5. Verifica que el campo `BLE` muestre algo como `SALA_1 · M1`.
6. Camina algunos pasos con el telefono en mano y revisa que el contador de pasos cambie.

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
- `hooks/use-ble-scanner.ts`: escaneo BLE, parseo de payload y fallback por nombre
- `components/beacon-list.tsx`: lista visual de beacons detectados para vistas de diagnostico
- `providers/museiq-provider.tsx`: estado general del recorrido
- `lib/artwork-images.ts`: registro de assets de obras para Expo
- `datos.ts`: seed de salas, obras y textos del museo
- `README-DEV.md`: arranque en WSL2 / Development Build

## Notas de desarrollo

- El foco actual no es multi-sala; el MVP esta optimizado para una sola sala real de prueba.
- Si mas adelante el firmware envia `serviceData` consistente, el fallback por nombre puede retirarse o quedar solo para debug.
- La lectura de pasos depende bastante del dispositivo Android y del soporte del build nativo; por eso existe un fallback por acelerometro.
- Si Expo falla al iniciar con `ENOSPC`, revisa `README-DEV.md`.
