# Design System

## Identity
- **Font**: Nunito — warm, humanist, highly legible. Set in `app/layout.tsx`; keep the `--font-sans` variable name.
- **Base**: light **violet-tinted paper** with soft ink text — neutrals carry a whisper of purple, never cold slate.
- **Brand color**: a confident **glossy purple**. It lives in **one** token — `--brand` in `globals.css` (with `--brand-foreground`, the ink on top of it). Change `--brand` to rebrand the whole app in one line; it feeds `--primary`, `--ring`, `--gold`, `--social`, and the sidebar primary.
- **Radius**: well-rounded, set once via `--radius` (1.05rem) in `globals.css` (feeds the whole `rounded-*` scale). **Controls (buttons, inputs, chips, tabs) are full pills** (`rounded-full`) — baked into the base components; don't hard-code radii elsewhere.
- **Composition**: a floating rounded card with depth. Showcase surfaces (auth) pair a solid **brand-color panel** (real copy + domain chips + a faint dot texture) with the form — designed and branded, never Lorem filler or a bare centered form.
- **Restraint (avoid the "vibe-coded" look)**: no decorative icons or emoji. Functional AFFORDANCE icons are sanctioned (owner decision, 2026-08-14): lucide `ChevronRight` (rotates 90° when expanded) / `ChevronDown` (flips 180°) on expanders, `ArrowUpRight` on external links, the password-reveal eye — at `size-3`, `strokeWidth 2.5`, `aria-hidden`. Never text glyphs (›, ↗, ▼) and never icons as decoration. Gloss is allowed ONLY through the sanctioned utilities — `.glossy` (top sheen on premium cards), `.glow-primary` (brand-tinted glow), `.cta-btn` (sweep sheen) — never ad-hoc gradients. Motion is smooth and soft: 200–350ms, `cubic-bezier(0.22, 1, 0.36, 1)`, fade + small translate; never bouncy.

## Form & Label Conventions

Applies to every form field, kicker, and control across the app — keep it uniform.

- **No letter-spacing on kickers or labels.** Do not add `tracking-*` to the small
  uppercase eyebrow (`text-[11px] font-black uppercase text-primary`) or to field
  labels. Type carries the hierarchy; spread-out caps read as "template."
- **Field labels are quiet.** `text-[11px] uppercase text-muted-foreground` — no
  `font-black` on the label constant; the app-wide body weight already carries it.
  Keep the label→input gap tight (`FormItem` is `gap-1`).
- **Placeholders are faint** — `placeholder:text-muted-foreground/40` (and
  `data-placeholder:text-muted-foreground/40` for selects). Baked into the base
  `Input` / `Textarea` / `Select` components; don't override per-field.
- **Required fields show a red `*`**; optional fields show `(optional)`. Handled by
  `ControlledInput` — pass `optional` only when a field truly is.
- **Tight vertical rhythm.** Prefer small gaps between stacked fields (`gap-2` to
  `gap-4`), not `gap-5+`. One kicker + headline, an optional one-line subtitle, then
  the form.

## Semantic Color Tokens
Defined in `globals.css` (`:root` + `.dark`) and registered in `@theme inline`.
Use these instead of Tailwind built-in colors for consistency.

| Token     | Tailwind class  | Meaning                                   |
|-----------|-----------------|-------------------------------------------|
| `gold`    | `text-gold`     | Highlights, rankings, premium accents     |
| `win`     | `text-win`      | Success states, positive values           |
| `loss`    | `text-loss`     | Errors, destructive states, negative values |
| `social`  | `text-social`   | Informational accents, secondary stats    |
| `primary` | `text-primary`  | Key stats, active states, CTAs            |

Use `/10` and `/20` opacity variants for badge backgrounds and borders:
```tsx
<span className="text-gold bg-gold/10 border border-gold/20 px-2 py-0.5">Featured</span>
```

## Corner Accent Brackets — `<CornerAccents />`
`components/ui/corner-accents.tsx`

White L-shaped corner brackets drawn via a single CSS background-gradient span.
Use on cards, stat boxes, panels, and any bordered container that warrants premium feel.

```tsx
import { CornerAccents } from "@/components/ui/corner-accents";

// Parent requirements:
<div className="relative border border-border ...">   {/* relative — required */}
  <CornerAccents />                                   {/* always first child */}
  {/* no overflow-hidden on this div */}
  ...
</div>
```

**Rules:**
- Parent must have `position: relative` (or the `inset-highlight` class)
- Parent must **NOT** have `overflow: hidden` — image overflow should be scoped to a child wrapper instead
- Uses 4 spans with **inline pixel styles** (`top: -2`, `bottom: -2`, etc.) — not Tailwind classes — to avoid rem scaling and the global `.border { border-width: 2px }` override

## Entrance Animations — `StaggerReveal` / `StaggerItem`
`components/motion/stagger-reveal.tsx` — client component (Framer Motion)

```tsx
import { StaggerReveal, StaggerItem } from "@/components/motion/stagger-reveal";

<StaggerReveal className="grid grid-cols-3 gap-4">
  {items.map((item) => (
    <StaggerItem key={item.id} className="h-full">
      <Card ... />
    </StaggerItem>
  ))}
</StaggerReveal>
```

Use for grids and lists that benefit from a staggered entrance (60ms per item, fade + y:12→0).

## CSS Utility Classes (`globals.css`)

| Class             | Effect                                                     |
|-------------------|------------------------------------------------------------|
| `.glow-primary`   | Brand-tinted glow — use on featured/highlighted cards      |
| `.glossy`         | Top sheen + brand-tinted depth — premium cards only        |
| `.hover-lift`     | `translateY(-2px)` + shadow on hover, 200ms ease           |
| `.inset-highlight`| Subtle top-edge inner highlight via `::before`; sets `position: relative` |
| `.corner-accent-box` | Applied by `<CornerAccents />` — do not use directly     |
| `.auth-input`     | Focus ring glow for the auth screens' inputs               |
| `.cta-btn`        | Sweep-sheen hover effect for primary CTA buttons           |

## Card Patterns

### Standard card
```tsx
<div className="relative bg-card border border-border">
  <CornerAccents />
  ...
</div>
```

### Interactive card (hover-lift)
```tsx
<div className="relative bg-card border border-border hover-lift hover:border-primary/30 transition-colors">
  <CornerAccents />
  ...
</div>
```

### Stat card
```tsx
<div className="bg-card border border-border border-t-2 border-t-gold inset-highlight flex flex-col items-center justify-center py-4 gap-1">
  <CornerAccents />
  <span className="text-xl font-semibold tabular-nums text-gold">{value}</span>
  <span className="text-xs text-muted-foreground uppercase tracking-wide">{label}</span>
</div>
```

### Image overflow fix
When a card has a hover-zoom image, do NOT put `overflow-hidden` on the card root.
Scope it to the image wrapper:
```tsx
<div className="relative bg-card border border-border">  {/* no overflow-hidden here */}
  <CornerAccents />
  <div className="overflow-hidden">                       {/* scoped to image only */}
    <img className="w-full h-auto hover:scale-[1.02] transition-transform duration-700" />
  </div>
  <div className="absolute -bottom-10 left-6">           {/* avatar — not clipped */}
    ...
  </div>
</div>
```

## Motion & Press Discipline (Emil/apple-design pass, 2026-08-14)

Baked-in rules — new components must follow them:

- **Press feedback on every pill/chip/tab**: add the `.press` utility (scale 0.96
  on `:active`, 160ms strong ease-out). Hover lifts use `.press-lift` — it is
  gated behind `@media (hover: hover) and (pointer: fine)` so touch taps never
  fake-hover. The base `Button` presses to `scale(0.97)` automatically.
- **Never `transition-all`** — name the properties (`transition-[transform,color]`).
- **Exits faster than enters**: AnimatePresence collapse/close ≈150–180ms with
  `cubic-bezier(0.23,1,0.32,1)`; enters may take 220–300ms.
- **Entrance staggers run once, at mount** (`.panel-pane` children) — never
  re-run on tab switches or rapid toggles; frequent actions get NO animation.
- **Popovers scale from their trigger** (`transform-origin` at the trigger
  corner, enter from `scale(0.96)` + fade). Modals stay centered.
- **Floating chrome is translucent**: sticky headers/input bars use
  `bg-background/70 backdrop-blur-md supports-backdrop-filter:bg-background/55`
  with soft borders (`border-border/50`) — content scrolls underneath.
- Reduced motion + calm mode already collapse all of this to instant states —
  keep any new animation inside those rules.

## CTA Register (owner decision, 2026-08-14)

CTAs are **action-first verbs** — imperative, task-shaped, no first-person
chatter: "View details", "Add to my tasks", "Mark as applied", "Record result:
Got it / Didn't get it", "Remove from my list". Status pills may use noun
states ("in my tasks", "applied", "won"). Never "I'm applying"-style CTAs.
