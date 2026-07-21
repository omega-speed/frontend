# Design System

## Identity
- **Font**: Nunito — warm, humanist, highly legible. Set in `app/layout.tsx`; keep the `--font-sans` variable name.
- **Border radius**: `0rem` everywhere — all corners are sharp, never add `rounded-*`. (Nunito's warmth + crisp geometry is intentional; do not "soften" with radius.)
- **Base**: light **warm ivory paper** with warm ink text — neutrals are warm-tinted, never cold slate.
- **Brand color**: a confident **cobalt blue**. It lives in **one** token — `--brand` in `globals.css` (with `--brand-foreground`, the ink on top of it). Change `--brand` to rebrand the whole app (e.g. to pink) in one line; it feeds `--primary`, `--ring`, `--gold`, `--social`, and the sidebar primary.
- **Composition**: editorial, not SaaS — a quiet masthead + hairline rules, generous whitespace, big confident headings, a single accent used sparingly. No split-hero, no card-on-gradient.
- **Restraint (avoid the "vibe-coded" look)**: no decorative icons or emoji (the password-reveal eye is the one justified, universal exception); no gradients or glows; lean on type hierarchy and space.

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
| `.glow-primary`   | Soft box-shadow glow — use on featured/highlighted cards   |
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
