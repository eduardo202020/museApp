# README-DEV

Guia rapida para levantar MuseIQ en desarrollo, tanto en Windows nativo como en WSL2, y validar el MVP BLE actual.

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

- Windows 10/11
- Node.js 20 LTS recomendado
- npm instalado
- Python 3.12+ para `museRAG`
- LM Studio para el backend local
- Windows + WSL2
- mismo Wi-Fi para PC y celular
- Android con Development Build instalado
- dependencias instaladas con `npm install`
- si cambias plugins nativos o permisos, necesitas reinstalar un nuevo Development Build

## Arranque desde cero en Windows

Si quieres continuar el proyecto en una PC Windows nueva y aun no tienes LM Studio ni modelos descargados, esta es la ruta mas directa.

### Paso 1. Preparar MuseRAG en Windows

1. Instala Python `3.12+`.
2. Instala LM Studio.
3. Abre LM Studio y descarga estos modelos, que son los que hoy usa el proyecto:
   - chat: `qwen2.5-7b-instruct`
   - embeddings: `text-embedding-nomic-embed-text-v1.5`
4. En LM Studio:
   - carga el modelo de chat
   - carga el modelo de embeddings
   - activa el servidor local OpenAI-compatible en `http://127.0.0.1:1234`
5. Instala Poppler para Windows y agrega su carpeta `bin` al `PATH`.
   `pdf2image` lo necesita para extraer imagenes del PDF durante la ingesta.

### Paso 2. Configurar el backend

En PowerShell:

```powershell
cd C:\ruta\al\repo\museRAG
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
```

Verifica que `.env` mantenga estos valores base:

```env
LM_STUDIO_BASE_URL=http://127.0.0.1:1234/v1
LM_STUDIO_CHAT_MODEL=qwen2.5-7b-instruct
LM_STUDIO_EMBED_MODEL=text-embedding-nomic-embed-text-v1.5
MUSERAG_HOST=0.0.0.0
MUSERAG_PORT=8000
```

### Paso 3. Construir el indice

Con LM Studio ya corriendo:

```powershell
cd C:\ruta\al\repo\museRAG
.\.venv\Scripts\Activate.ps1
python extract_images.py --rebuild
python ingest.py --rebuild
```

### Paso 4. Levantar la API

```powershell
cd C:\ruta\al\repo\museRAG
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Prueba salud:

```powershell
curl http://127.0.0.1:8000/health
```

### Paso 5. Configurar la app Expo

En `museiqApp/.env` define la IP de tu PC Windows, no `localhost`, porque el telefono debe alcanzar el backend por Wi-Fi:

```env
EXPO_PUBLIC_MUSERAG_URL=http://192.168.1.10:8000
```

Luego:

```powershell
cd C:\ruta\al\repo\museiqApp
npm install
npx tsc --noEmit
```

### Paso 6. Levantar la app

La opcion mas simple en Windows suele ser tunnel:

```powershell
cd C:\ruta\al\repo\museiqApp
npm run dev:client
```

Si ya tienes un Development Build instalado en Android:

1. abre el launcher del dev client
2. entra al proyecto expuesto por Expo
3. abre el modal de chat
4. prueba una pregunta por texto o por voz

## Checklist de arranque rapido

- LM Studio instalado
- modelo de chat descargado y cargado
- modelo de embeddings descargado y cargado
- servidor local de LM Studio activo en `127.0.0.1:1234`
- Poppler instalado en Windows
- `python extract_images.py --rebuild` ejecutado
- `python ingest.py --rebuild` ejecutado
- `uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload` corriendo
- `EXPO_PUBLIC_MUSERAG_URL` apuntando a la IP real de la PC
- Expo corriendo con `npm run dev:client`

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
