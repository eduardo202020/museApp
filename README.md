# museApp

> Guía interactiva para museos que combina BLE, voz e IA para acompañar al visitante en tiempo real.

museApp es una app móvil creada con Expo y React Native para transformar una visita a museo en una experiencia conversacional, contextual y visual. La app detecta la sala, entiende la obra activa y responde preguntas con texto, voz e imágenes de apoyo.

## Por qué destaca

- Está pensada para demostrar una solución de producto real, no solo una prueba técnica.
- Une navegación por salas, sensores, voz y beacons BLE en un mismo flujo.
- Permite mostrar en una demo cómo la app cambia según el contexto físico del visitante.
- Es una base sólida para enseñar arquitectura móvil, experiencia de usuario e integración con IA.

## Lo más visible del proyecto

- guía recorridos de museo con soporte para beacons BLE
- identifica la obra o sala más cercana y mantiene el contexto de visita
- permite explorar manualmente salas y obras sin depender del sensor
- ofrece chat por texto y por voz sobre la obra activa
- consulta a MuseRAG y presenta respuestas con texto e imágenes de apoyo
- adapta el tono de respuesta entre `Breve`, `Explicada` y `Para niños`
- mantiene una memoria local por obra para mejorar visitas repetidas
- incluye lectura en voz alta con seguimiento visual del texto

## Demo rápida

1. Abre la app y entra al recorrido.
2. Acerca un beacon o navega manualmente por una sala.
3. Pregunta por texto o por voz sobre la obra activa.
4. Revisa la respuesta, escucha la narración y abre las imágenes de apoyo.
5. Cambia el modo de respuesta para ver cómo se adapta el tono del guía.

## Lo que aporta al CV

- interacción multimodal con foco en experiencia de visitante
- integración de hardware cercano y contexto espacial real
- consumo de IA con respuesta conversacional y visual
- manejo de memoria local y estado por obra
- uso de voz nativa para entrada y salida de información

## Stack tecnológico

| Capa         | Tecnología                               |
| ------------ | ---------------------------------------- |
| UI móvil     | Expo Router, React Native, TypeScript    |
| Conectividad | `react-native-ble-plx`, `expo-sensors`   |
| Voz          | `expo-speech`, `expo-speech-recognition` |
| Persistencia | `expo-sqlite`                            |
| IA           | MuseRAG                                  |

## Cómo funciona

1. La app detecta contexto de sala mediante BLE y sensores.
2. El visitante abre el chat o dicta una pregunta.
3. La app envía la consulta a MuseRAG con museo, sala, obra y modo de respuesta.
4. La respuesta vuelve con texto y, cuando aplica, fuentes visuales.
5. El usuario puede leer, escuchar y ampliar contenido sin salir del recorrido.

## Estado actual

El MVP ya cubre el flujo principal de visita y consulta. Está listo para demostraciones funcionales y para seguir evolucionando el recorrido, la conversación y la experiencia en sala.

## Documentación relacionada

- La configuración técnica vive en [README-DEV.md](README-DEV.md)
- La URL del backend se define en [app.config.js](app.config.js)
- El cliente de MuseRAG está en [lib/muserag-api.ts](lib/muserag-api.ts)
