# MuseIQ

Aplicacion Expo/React Native para guiar recorridos de museo usando beacons BLE.

El estado actual del proyecto esta enfocado en un MVP de pruebas:

- 1 sala activa en la app: `SALA_1`
- 3 mini ESP32 emitiendo como beacons de prueba
- deteccion BLE basada en RSSI para inferir la referencia mas cercana
- UI de recorrido mostrando lecturas BLE en tiempo real

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

En la pantalla `Recorrido` la app ya muestra:

- sala actual detectada
- zona estimada segun RSSI
- beacon dominante
- lista de beacons escaneados
- `roomId`, nodo beacon, RSSI, bateria, firmware y estado activo/reposo

La deteccion de sala toma el beacon con mejor RSSI y usa su `roomId` como referencia para actualizar el recorrido.

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
2. Entra a la pestaña `Recorrido`.
3. Pulsa `Buscar sala`.
4. Enciende o acerca los ESP32 `S1-M1`, `S1-M2` y `S1-M3`.
5. Verifica en la tarjeta `Beacons escaneados`:
   - cuantos beacons estan entrando
   - cual queda como dominante
   - como cambia el RSSI al moverte

## Scripts utiles

```bash
npm install
npm run dev:client
npm run dev:client:lan
npm run web
npx tsc --noEmit
```

## Estructura clave

- `app/(drawer)/(tabs)/recorrido/index.tsx`: pantalla principal del MVP y panel BLE
- `hooks/use-ble-scanner.ts`: escaneo BLE, parseo de payload y fallback por nombre
- `components/beacon-list.tsx`: lista visual de beacons detectados
- `providers/museiq-provider.tsx`: estado general del recorrido
- `datos.ts`: seed de salas, obras y textos del museo
- `README-DEV.md`: arranque en WSL2 / Development Build

## Notas de desarrollo

- El foco actual no es multi-sala; el MVP esta optimizado para una sola sala real de prueba.
- Si mas adelante el firmware envia `serviceData` consistente, el fallback por nombre puede retirarse o quedar solo para debug.
- Si Expo falla al iniciar con `ENOSPC`, revisa `README-DEV.md`.
