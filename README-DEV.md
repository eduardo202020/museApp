# README-DEV

Guia rapida para levantar MuseIQ en desarrollo con WSL2 y validar el MVP BLE actual.

## Contexto actual

El proyecto esta siendo probado con este alcance:

- una sola sala operativa en la app: `SALA_1`
- tres mini ESP32 de prueba:
  - `S1-M1`
  - `S1-M2`
  - `S1-M3`
- deteccion visible directamente en la pantalla `Recorrido`

La app puede detectar los beacons de prueba aunque solo publiquen nombre BLE, porque existe un fallback temporal:

- `S1-M1` -> `SALA_1-B01`
- `S1-M2` -> `SALA_1-B02`
- `S1-M3` -> `SALA_1-B03`

## Requisitos

- Windows + WSL2
- mismo Wi-Fi para PC y celular
- Android con Development Build instalado
- dependencias instaladas con `npm install`
- si cambias plugins nativos o permisos, necesitas reinstalar un nuevo Development Build

## Arranque recomendado

### Opcion 1. Tunnel

Es la opcion mas simple para salir del paso:

```bash
cd /home/eduardo/proyectos/iot/museiq/museiqApp
npm run dev:client
```

Usa tunnel y normalmente evita parte de la configuracion LAN manual.
Con la configuracion actual, el Development Build abre el `launcher` del dev client en vez de reconectarse automaticamente a la ultima sesion.

### Opcion 2. LAN en WSL2

Si quieres trabajar sin tunnel, usa el bridge WSL -> Windows.

1. En PowerShell como administrador:

```powershell
powershell -ExecutionPolicy Bypass -File "\\wsl.localhost\Ubuntu\home\eduardo\proyectos\iot\museiq\museiqApp\scripts\expo-wsl-portproxy.ps1"
```

2. En WSL:

```bash
cd /home/eduardo/proyectos/iot/museiq/museiqApp
npm run dev:client:lan
```

## MuseRAG y `.env`

La URL del backend se define en `.env`:

```env
EXPO_PUBLIC_MUSERAG_URL=http://192.168.18.84:8000
```

La app no lee esta variable directamente desde `process.env` en runtime del telefono. En su lugar:

1. `app.config.js` la copia a `expo.extra.museRagUrl`
2. `lib/muserag-api.ts` la lee desde `Constants.expoConfig.extra`

Si cambias `.env`, reinicia Expo.
Si ademas cambias plugins o configuracion nativa, reconstruye el Development Build.

## Rebuild del Development Build

Si agregas dependencias nativas, como reconocimiento de voz, o cambias `launchMode` del dev client, reconstruye el APK con EAS:

```bash
npx eas build --platform android --profile development
```

Ese perfil genera un APK de Development Build con:

- `developmentClient: true`
- `distribution: internal`
- `android.buildType: apk`

## Flujo de prueba BLE

1. Abre la app en el telefono.
2. Entra a `Recorrido`.
3. Pulsa `Buscar sala`.
4. Revisa la tarjeta `Beacons escaneados`.
5. Acerca o aleja los ESP32 para ver cambios en:
   - beacon dominante
   - RSSI
   - estado activo/reposo
   - orden relativo entre `M1`, `M2` y `M3`

## Error comun: ENOSPC

Si Expo arranca y luego falla con algo como:

```text
Error: ENOSPC: System limit for number of file watchers reached
```

sube temporalmente los limites de `inotify`:

```bash
sudo sysctl -w fs.inotify.max_user_watches=524288
sudo sysctl -w fs.inotify.max_user_instances=1024
```

Si quieres dejarlo persistente:

```bash
echo "fs.inotify.max_user_watches=524288" | sudo tee /etc/sysctl.d/99-museiq-inotify.conf
echo "fs.inotify.max_user_instances=1024" | sudo tee -a /etc/sysctl.d/99-museiq-inotify.conf
sudo sysctl --system
```

Verifica los valores:

```bash
cat /proc/sys/fs/inotify/max_user_watches
cat /proc/sys/fs/inotify/max_user_instances
```

## Comandos utiles

```bash
# Dev client con tunnel
npm run dev:client

# Dev client LAN
npm run dev:client:lan

# Script de portproxy desde WSL
npm run wsl:portproxy

# Rebuild del dev build en EAS
npx eas build --platform android --profile development

# Web
npm run web

# Verificacion TypeScript
npx tsc --noEmit
```

## Lo importante del MVP

- La app ya no depende solo de `serviceData`; tambien acepta los nombres BLE `S1-M1`, `S1-M2`, `S1-M3`.
- La pantalla `Recorrido` ya muestra los datos escaneados para validar el comportamiento real en sala.
- El enfoque actual es validar estabilidad de deteccion antes de endurecer el protocolo BLE definitivo.
