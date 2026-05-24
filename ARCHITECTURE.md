# Arquitectura MuseIQ

Documento breve de referencia para la estructura modular actual de `museiqApp`.

## Principios

- `app/` solo define rutas de Expo Router y reexporta pantallas.
- `features/` contiene la implementación por dominio.
- cada feature intenta seguir el patrón:
  - `screens/`: pantalla orquestadora
  - `hooks/`: flujo y estado de la feature
  - `components/`: UI local reutilizable dentro de la feature
  - `utils/`: helpers o mappers específicos
- `providers/museiq/` concentra slices internos del estado global compartido.
- `components/museiq/` conserva componentes transversales y reutilizables entre features.

## Mapa actual

### Routing

- `app/`: capa delgada de rutas
- las rutas grandes ya delegan a `features/*/screens/*`

### Features

- `features/home/`: HUD principal, escena Home AR, QR y explorar sala
- `features/explore/`: navegación por salas y listado de obras
- `features/artwork/`: detalle de obra e imágenes relacionadas
- `features/chat/`: modal de preguntas, composer, sugerencias y respuesta IA

### Estado global

- `providers/museiq-provider.tsx`: composición del contexto `useMuseIQ`
- `providers/museiq/`: módulos internos del provider
  - `use-museiq-bootstrap.ts`
  - `use-museiq-permissions.ts`
  - `use-museiq-navigation.ts`
  - `use-museiq-analytics-favorites.ts`
  - `use-artwork-narration.ts`
  - `types.ts`, `constants.ts`, `helpers.ts`

## Convenciones de refactor

- si una screen supera el rol de orquestación, mover lógica a `hooks/` y UI a `components/`
- si varios estados viven juntos y pertenecen a un mismo dominio, crear un hook de feature antes de tocar el provider global
- si el estado debe ser transversal a varias features, extraerlo dentro de `providers/museiq/`
- si una ruta de `app/` crece, convertirla en reexport hacia `features/.../screens/...`

## Flujo recomendado para nuevas pantallas

1. Crear la pantalla real en `features/<dominio>/screens/`
2. Crear hook de orquestación si la pantalla mezcla navegación, selección y efectos
3. Mover bloques visuales grandes a `components/`
4. Dejar `app/<ruta>.tsx` como reexport fino
5. Validar con `npx tsc --noEmit`
