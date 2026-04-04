# Design System Document: The Curated Intelligence

## 1. Overview & Creative North Star
**Creative North Star: The Digital Curator**

This design system is built to bridge the gap between ancient cultural artifacts and cutting-edge ambient intelligence. It is not a generic educational tool; it is a high-end, editorial experience that feels both authoritative and ethereal. 

To break the "template" look common in tech apps, we lean into **The Digital Curator** aesthetic: a philosophy of intentional asymmetry, layered translucency, and "breathable" layouts. By utilizing high-contrast typography scales and overlapping elements, we create a sense of discovery and intellectual depth. The UI should never feel like a static grid—it should feel like an evolving exhibition where connectivity (BLE/IoT) is visualized through soft glows and fluid transitions rather than rigid lines.

---

## 2. Colors
Our palette is a sophisticated evolution of the primary brand marks, utilizing tonal depth to guide the user’s eye without the need for structural clutter.

### Tonal Foundation
- **Primary (`#005DA7`) & Primary Container (`#0076D1`):** The vibrant pulse of the system. Used for critical actions and brand-led moments.
- **Secondary (`#396474`):** A deep, scholarly navy that anchors the experience and provides a professional, tech-forward contrast.
- **Surface & Background (`#F6FAFE`):** A slightly tinted, "cool" off-white that prevents eye fatigue and provides a premium, paper-like quality for cultural content.

### The "No-Line" Rule
**Explicit Instruction:** Use of 1px solid borders for sectioning is strictly prohibited. Boundaries must be defined solely through background color shifts. Use a `surface-container-low` section sitting against a `surface` background to define scope. This creates a "sculpted" look rather than a "boxed" one.

### The Glass & Gradient Rule
To move beyond a standard digital feel, floating elements (like TTS/STT controls) should utilize **Glassmorphism**. Apply semi-transparent surface colors with a `backdrop-blur` effect. 
- **Signature Texture:** Use a subtle linear gradient transitioning from `primary` to `primary-container` at a 135-degree angle for Hero CTAs. This adds a "visual soul" and three-dimensional polish that flat colors cannot achieve.

---

## 3. Typography
We use a dual-typeface system to balance modern technology with editorial authority.

### Typographic Scale
- **Display & Headlines (Manrope):** A geometric sans-serif that suggests modern intelligence. Use `display-lg` (3.5rem) for high-impact educational headers. The wide apertures of Manrope convey openness and clarity.
- **Title & Body (Inter):** The workhorse of the system. Inter’s tall x-height ensures maximum legibility for dense cultural descriptions and technical data.
- **Labels:** Use `label-md` (0.75rem) in all-caps with a +5% letter-spacing for metadata (e.g., "BLE SIGNAL STRENGTH"), creating a professional, "instrument-panel" aesthetic.

---

## 4. Elevation & Depth
In this design system, depth is a functional tool used to represent the "connectivity" of the IoT environment.

### The Layering Principle
Depth is achieved through **Tonal Layering** rather than traditional shadows.
- **Level 0 (Base):** `surface`
- **Level 1 (Sections):** `surface-container-low`
- **Level 2 (Cards/Prompts):** `surface-container-lowest` (pure white) to create a soft, natural "pop" against the tinted background.

### Ambient Shadows & "Ghost Borders"
When a floating effect is required (e.g., a voice interaction module):
- **Shadows:** Use extra-diffused blur (20px-40px) at 6% opacity. The shadow color should be a tinted blue-grey (derived from `on-surface`) rather than black.
- **Ghost Borders:** If accessibility requires a container boundary, use `outline-variant` at **15% opacity**. Never use 100% opaque borders.

---

## 5. Components

### Audio & Voice (TTS/STT)
These are the most critical components for connectivity.
- **Voice Interaction Hub:** A glassmorphic bottom sheet using `surface-variant` with a 20px backdrop-blur. 
- **Iconography:** Use "Pulse" animations around voice icons to suggest active listening. Icons should be "Dual-Tone," using `primary` for the core and `primary-fixed-dim` for the accent.

### Buttons
- **Primary:** Rounded-xl (1.5rem) with the Signature Gradient. No shadow.
- **Secondary:** Surface-tinted background with `on-secondary-container` text.
- **Tertiary:** Text-only with a subtle `primary` underline on hover to maintain an editorial feel.

### Cards & Lists
- **The Gap Rule:** Forbid the use of divider lines. Separate items using `1.5rem` (xl) vertical white space or by alternating between `surface-container-low` and `surface-container-high`.
- **Connectivity Chips:** Small, `full-rounded` chips indicating BLE status. Use `tertiary` (#7B5500) for "searching" and `primary` for "connected."

### Input Fields
- **Modern Tech-Forward State:** Fields should not have a background fill. Use a bottom-only "Ghost Border" that transitions to a `2px primary` line only when focused. 

---

## 6. Do's and Don'ts

### Do
- **Do** use intentional asymmetry. Place an image slightly off-center to overlap a background container.
- **Do** leverage "Negative Space" as a luxury. If a screen feels crowded, remove a container rather than shrinking text.
- **Do** use high-quality imagery of artifacts, treated with a very subtle `surface-tint` overlay to unify them with the UI.

### Don't
- **Don't** use pure black (#000000) for text. Always use `on-surface` (#171C1F) for a softer, premium contrast.
- **Don't** use standard 4px or 8px corners. Our system relies on `lg` (1rem) and `xl` (1.5rem) radii to feel approachable and organic.
- **Don't** use "Drop Shadows" on flat buttons. Rely on color and scale to indicate interactivity.