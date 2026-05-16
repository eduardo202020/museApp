# museApp

museApp es una app móvil Expo / React Native que convierte una visita a museo en una experiencia guiada, conversacional y contextual. Combina detección BLE, navegación por salas, voz nativa e IA para responder preguntas sobre la obra activa en tiempo real.

## Propuesta de valor

El proyecto está pensado para demostrar una solución de producto que se puede presentar en un CV o demo técnica. Su foco no es solo mostrar tecnología, sino resolver una experiencia concreta: acompañar al visitante con un guía digital que entiende dónde está, qué obra tiene delante y cómo responder según el tipo de visitante.

## Lo que hace

- guía recorridos de museo con soporte para beacons BLE
- identifica la obra o sala más cercana y mantiene el contexto de visita
- permite explorar manualmente salas y obras sin depender del sensor
- ofrece chat por texto y por voz sobre la obra activa
- consulta a MuseRAG y presenta respuestas con texto e imágenes de apoyo
- adapta el tono de respuesta del guía entre `Breve`, `Explicada` y `Para niños`
- mantiene una memoria local por obra para mejorar visitas repetidas
- incluye lectura en voz alta con seguimiento visual del texto

## Diferenciales

- experiencia hands-free pensada para sala de museo
- interacción multimodal: BLE, voz, texto, sensores y navegación visual
- flujo de conversación con una interfaz compacta y clara para el visitante
- respuesta contextual basada en obra, sala y recorrido
- modal conversacional con carrusel de fuentes e imagen ampliable

## Pila tecnológica

- Expo Router
- React Native
- TypeScript
- `react-native-ble-plx` para BLE
- `expo-speech` y `expo-speech-recognition` para voz
- `expo-sensors` para acelerómetro, brújula y pasos
- `expo-sqlite` para almacenamiento local
- MuseRAG como backend de preguntas y respuestas

## Estado actual

El MVP ya cubre el flujo principal de visita y consulta. Está listo para demostraciones funcionales en desarrollo y para iterar sobre el recorrido, la conversación y la experiencia en sala.

## Arquitectura resumida

1. La app detecta contexto de sala mediante BLE y sensores.
2. El visitante abre el chat o dicta una pregunta.
3. La app envía la consulta a MuseRAG con el contexto de museo, sala y obra.
4. La respuesta vuelve con texto y, cuando aplica, fuentes visuales.
5. El usuario puede leer, escuchar y ampliar contenido sin salir del recorrido.

## Enlaces útiles

- La configuración de desarrollo vive en [README-DEV.md](README-DEV.md)
- La URL del backend se define en [app.config.js](app.config.js)
- El cliente de MuseRAG está en [lib/muserag-api.ts](lib/muserag-api.ts)
