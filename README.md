# MuseIQ

Aplicacion Expo/React Native para guiar recorridos de museo usando beacons BLE y consultas a MuseRAG.

## Estado actual

El proyecto esta enfocado en un MVP de pruebas con estas capacidades:

- deteccion BLE para inferir la referencia mas cercana en sala
- obra actual y navegacion entre piezas del recorrido
- exploracion manual por salas y obras sin depender del BLE
- chat por texto sobre la obra activa
- captura de voz nativa para dictar preguntas
- consumo de respuestas de MuseRAG con texto e imagenes de apoyo
- modos de respuesta del guia: `Breve`, `Explicada` y `Para niños`
- modal conversacional optimizado para voz con un unico FAB inteligente
- espera conversacional con el buho animado mientras MuseRAG prepara la respuesta
- seguimiento visual del texto mientras la respuesta se reproduce en voz alta
- visor de imagen ampliable con pinch-to-zoom y arrastre
- memoria conversacional local por obra
- analitica basica local del MVP
- panel de sensores con acelerometro, brujula, pasos y BLE

## Chat con MuseRAG

La pantalla de chat envia preguntas por `POST` a:

```text
${museRagUrl}/api/preguntar
```

La URL final se resuelve asi:

1. `EXPO_PUBLIC_MUSERAG_URL` se lee en [app.config.js](./app.config.js)
2. se expone en `expo.extra.museRagUrl`
3. la app la consume desde `Constants.expoConfig.extra`

Si la variable apunta a `localhost`, `127.0.0.1` o `0.0.0.0`, la app intenta reemplazarla por el host actual de Expo cuando es posible.

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

En el flujo actual de chat:

- el boton flotante principal cambia entre `mic`, `stop` y `send`
- el visitante puede elegir el modo de respuesta del guia antes de preguntar
- la voz tiene prioridad cuando solo hay una sugerencia precargada
- al terminar un dictado, la consulta se envia directamente sin countdown artificial
- durante la espera aparece un modal con la pregunta enviada y el buho de MuseIQ animado
- el usuario puede cancelar una consulta en curso y la app aborta la peticion HTTP real
- la respuesta puede leerse en voz alta con seguimiento visual del texto en curso
- el chat conserva memoria local por obra para retomar mejor visitas repetidas
- al terminar una respuesta, el flujo vuelve a priorizar voz para la siguiente pregunta

## Variables de entorno

Crea un archivo `.env` en la raiz del proyecto con:

```env
EXPO_PUBLIC_MUSERAG_URL=http://192.168.1.10:8000
```

Notas:

- la URL debe ser accesible desde el telefono o emulador
- para telefono fisico, usa la IP LAN real de tu PC, no `localhost`
- si cambias el `.env`, reinicia Expo para que tome la nueva variable
- si ya existe un Development Build instalado, no hace falta rebuild por este cambio solo si modificaste la URL; si cambias plugins nativos o permisos, si hace falta reconstruir el build

## Conexion en telefono fisico

Para trabajar con `museRAG` local y un celular Android en la misma Wi-Fi, la configuracion recomendada es:

1. levantar `museRAG` con `--host 0.0.0.0 --port 8000`
2. apuntar `EXPO_PUBLIC_MUSERAG_URL` a la IP real de la PC
3. arrancar Expo en modo LAN con Development Build

Ejemplo:

```env
EXPO_PUBLIC_MUSERAG_URL=http://192.168.18.84:8000
```

```powershell
cd C:\ruta\al\repo\iot
$env:REACT_NATIVE_PACKAGER_HOSTNAME="192.168.18.84"
npx expo start --dev-client --lan --port 8081
```

Checklist rapido:

- PC y celular en la misma red Wi-Fi
- `museRAG` respondiendo en `http://<IP_DE_TU_PC>:8000/health`
- Development Build instalado en el telefono
- reiniciar Expo si cambiaste `.env`

Importante:

- `npm run dev:client` usa `--tunnel` y puede servir como fallback
- `npm run dev:client:lan` usa el script `scripts/start-devclient-lan.sh`
- si la app intenta hablar con `*.exp.direct:8000`, la URL de `museRAG` quedo mal resuelta

## Problemas comunes de conectividad

### Expo LAN no conecta

En Windows ya vimos dos causas frecuentes:

1. reglas viejas de `portproxy` ocupando `8081`, `19000` o `19001`
2. la red Wi-Fi marcada como `Public` en lugar de `Private`

Ver reglas activas:

```powershell
netsh interface portproxy show all
```

Si ves reglas viejas para `8081`, `19000` o `19001`, abre PowerShell como administrador y borralas:

```powershell
netsh interface portproxy delete v4tov4 listenaddress=0.0.0.0 listenport=8081
netsh interface portproxy delete v4tov4 listenaddress=0.0.0.0 listenport=19000
netsh interface portproxy delete v4tov4 listenaddress=0.0.0.0 listenport=19001
```

Si despues de eso sigue fallando, cambia el perfil de la red Wi-Fi a `Private` y vuelve a iniciar Expo en LAN.

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
- selector manual de salas y salto directo a obras del recorrido
- panel de sensores con acelerometro, brujula, pasos y BLE
- beacon dominante en formato `SALA_x · M1/M2/M3`

En el modal `app/pregunta-voz-modal.tsx` la app muestra:

- selector de modo de respuesta del guia
- caja de texto compacta para escribir o editar la pregunta
- un unico FAB contextual para grabar, detener o enviar
- preguntas rapidas plegables
- modal de espera con pregunta visible, cancelacion y personaje animado
- respuesta textual del backend en una tarjeta principal expandida
- boton flotante interno para volver a escuchar la respuesta
- seguimiento visual del texto durante la lectura en voz
- carrusel de imagenes devueltas por las fuentes con tarjetas a ancho completo
- visor ampliado de imagen con zoom y arrastre

Durante consultas lentas la app mantiene una espera amigable antes de mostrar un error. Si MuseRAG tarda mas de lo normal, el usuario ve un mensaje de espera extendida en lugar de cortar la consulta inmediatamente.

Detalles recientes de UX del modal:

- la tarjeta de respuesta ocupa practicamente todo el alto util del sheet
- el FAB de preguntar flota sobre la tarjeta de respuesta, no fuera de ella
- la respuesta ya no muestra el boton `Siguiente obra`
- el control de audio de la respuesta flota dentro del card en la esquina superior derecha
- el seguimiento visual de lectura cambia el color del texto en curso para no perder el hilo
- el carrusel de fuentes elimino textos auxiliares como `Libro del museo` y `Toca para ampliar`
- las imagenes relacionadas se muestran mas grandes para priorizar lectura visual

## Memoria local y modo tecnico

La app ya guarda memoria local del visitante para pruebas del MVP:

- historial reciente por obra
- memoria conversacional resumida por `artwork_id`
- analitica basica local de uso

En `Modo técnico` ahora existe una accion para:

- borrar memoria conversacional
- borrar progreso y preferencias del visitante
- reiniciar la experiencia como si fuera un usuario nuevo

## Development Build

El proyecto usa `expo-dev-client` con `launchMode: "launcher"`.

Esto evita que el celular reabra automaticamente una sesion vieja de Metro y ayuda a recuperar la conexion visible con la terminal cuando se reinstala el dev build o se cambia de sesion.

Si haces cambios nativos como:

- agregar o quitar plugins Expo
- agregar librerias nativas
- cambiar permisos nativos
- cambiar el comportamiento del dev client

debes reconstruir e instalar un nuevo Development Build.

Build remoto recomendado:

```bash
npx eas build --platform android --profile development
```

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
8. Prueba tambien el flujo por voz usando el mismo FAB flotante.
9. Si el backend devuelve imagenes, toca una para ampliarla.

## Scripts utiles

```bash
npm install
npm run dev:client
npm run dev:client:lan
npx eas build --platform android --profile development
npm run web
npx tsc --noEmit
```

## Estructura clave

- `app/index.tsx`: home principal, obra actual y panel de sensores
- `app/pregunta-voz-modal.tsx`: chat por texto, respuesta y visor de imagenes
- `components/museiq/chat/chat-sheet.tsx`: layout del modal conversacional y UX de espera
- `components/museiq/chat/source-image-carousel.tsx`: carrusel de fuentes visuales
- `hooks/use-ble-scanner.ts`: escaneo BLE, parseo de payload y fallback por nombre
- `providers/museiq-provider.tsx`: estado general del recorrido
- `lib/muserag-api.ts`: cliente HTTP hacia MuseRAG
- `lib/artwork-images.ts`: registro de assets locales de obras
- `app.config.js`: expone `museRagUrl` a `expo.extra`
- `datos.ts`: seed de salas, obras y textos del museo
- `README-DEV.md`: arranque en WSL2 / Development Build

## Notas de desarrollo

- el chat ya incluye captura de voz nativa para dictado de preguntas
- el cliente MuseRAG soporta cancelacion real de consultas usando `AbortController`
- el backend debe devolver una estructura compatible con `respuesta` y opcionalmente `fuentes`
- si Expo falla al iniciar con `ENOSPC`, revisa `README-DEV.md`
