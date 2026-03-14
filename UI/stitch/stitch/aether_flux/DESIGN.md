# Design System Specification: The Kinetic Lens

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Intelligent Aperture."** 

Moving beyond the static, boxy layouts of traditional SaaS, this system treats the interface as a high-precision optical instrument. It is designed to feel fast, reactive, and "AI-forward." We achieve a premium, editorial feel by rejecting standard container-and-border patterns in favor of **Intentional Asymmetry** and **Tonal Depth**. The goal is to provide founders and investors with a "heads-up display" (HUD) experience that feels sophisticated, airy, and hyper-professional.

### Breaking the Template
*   **Asymmetric Breathing Room:** Use the Spacing Scale to create unbalanced margins (e.g., a `24` unit top margin with a `12` unit bottom margin) to guide the eye toward primary data points.
*   **Overlapping Elements:** Allow high-priority cards or "Glass" modules to slightly overlap section transitions to create a sense of three-dimensional space.
*   **Editorial Scale:** Use extreme contrast between `display-lg` and `label-sm` to create an authoritative, news-room hierarchy.

---

## 2. Colors & Surface Architecture

The palette is anchored in deep oceanic navies and energized by high-frequency electric blues.

### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders to define sections. 
Boundaries are created exclusively through background shifts. A `surface-container-low` section sitting on a `surface` background provides all the separation required. If you feel the urge to draw a line, use a 48px vertical gap from the Spacing Scale instead.

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of materials.
1.  **Base Layer:** `surface` (#0c1324) - The canvas.
2.  **Sectional Layer:** `surface-container-low` (#151b2d) - For large grouped content.
3.  **Active Layer:** `surface-container` (#191f31) - For standard interactive cards.
4.  **Prominence Layer:** `surface-container-highest` (#2e3447) - For hovered states or prioritized data modules.

### The "Glass & Gradient" Rule
To evoke an AI-forward intelligence, floating elements (Modals, Popovers, Command Palettes) must utilize **Glassmorphism**:
*   **Background:** `surface-variant` (#2e3447) at 60% opacity.
*   **Effect:** `backdrop-blur` at 12px to 20px.
*   **Signature Texture:** Primary actions should use a linear gradient: `primary-container` (#0062ff) to `primary` (#b4c5ff) at a 135-degree angle. This "vibrant pulse" signifies AI activity and high-value interaction.

---

## 3. Typography: The Narrative Voice

We utilize **Inter** (or Geist) for its mathematical precision and neutral "tech-authoritative" tone.

*   **Display (lg/md/sm):** Reserved for data milestones (e.g., "Total Funding") and hero headlines. Use `on-surface` color.
*   **Headline & Title:** Use for section headers. To achieve the "Editorial" look, keep `headline-lg` tight (letter-spacing: -0.02em).
*   **Body (lg/md/sm):** Use `on-surface-variant` (#c2c6d9) for body text to reduce eye strain against the deep navy background.
*   **Labels:** Use `label-md` in `primary` (#b4c5ff) for technical metadata or categories. All labels should be Uppercase with +0.05em tracking for a "HUD" aesthetic.

---

## 4. Elevation & Depth: Tonal Layering

Traditional shadows are too heavy for a "clean and fast" system. We define depth through light, not darkness.

### The Layering Principle
Instead of a shadow, place a `surface-container-lowest` card inside a `surface-container-low` parent. This creates a "recessed" look that feels more integrated into the software.

### Ambient Shadows
For floating navigation or "AI Insights" panels:
*   **Color:** Use `on-secondary-fixed` (#111c2d) at 10% opacity.
*   **Blur:** 40px to 60px spread.
*   **Offset:** 0px Y-offset. The goal is an "ambient glow" rather than a directional shadow.

### The "Ghost Border" Fallback
If accessibility demands a border (e.g., in high-contrast modes), use a **Ghost Border**: `outline-variant` (#424656) at **15% opacity**. It should be felt, not seen.

---

## 5. Components & Interaction Patterns

### Buttons: The Kinetic Triggers
*   **Primary:** Gradient fill (`primary-container` to `primary`). `0.5rem` (DEFAULT) corner radius. On hover, increase the gradient intensity.
*   **Secondary:** `surface-container-highest` background with `on-surface` text. No border.
*   **Tertiary:** Ghost style. `on-surface` text that gains a `surface-bright` background on hover.

### Cards: The Data Vessel
*   **Rules:** Forbid divider lines. Separate header and body using a `4` (1rem) spacing gap.
*   **Corner Radius:** Use `lg` (1rem) for outer cards and `md` (0.75rem) for nested elements.
*   **State:** On hover, a card should shift from `surface-container` to `surface-container-high`.

### Input Fields: The Precision Entry
*   **Background:** `surface-container-lowest`.
*   **Focus State:** No thick rings. Use a 1px `primary` Ghost Border and a subtle `primary` outer glow (4px blur).

### Specialized Components
*   **The Intelligence Badge:** A small `chip` using `tertiary-container` (#0078a2) with a 2px pulse animation to indicate AI-generated content.
*   **Trend Sparklines:** Use `tertiary` (#7bd0ff) for positive growth and `error` (#ffb4ab) for decline, rendered with a 2px stroke width and no fill.

---

## 6. Do's and Don'ts

### Do
*   **DO** use whitespace as a functional separator. If two items feel cluttered, increase the spacing scale rather than adding a line.
*   **DO** use `surface-bright` for subtle highlights on top-level navigation to simulate a "top-down" light source.
*   **DO** lean into the `primary-fixed-dim` (#b4c5ff) for icon colors to keep the "Electric Blue" vibe consistent without being overwhelming.

### Don't
*   **DON'T** use 100% black (#000000). Always use `surface` (#0c1324) to maintain the "Deep Navy" sophisticated tone.
*   **DON'T** use standard 4px rounded corners. Stick to the `DEFAULT` (8px/0.5rem) or `lg` (16px/1rem) to maintain the "Shadcn-plus" premium feel.
*   **DON'T** use heavy drop shadows. If a component doesn't pop via color shift, reconsider its hierarchy.