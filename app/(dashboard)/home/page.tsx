import { CornerAccents } from "@/components/ui/corner-accents";
import { StaggerReveal, StaggerItem } from "@/components/motion/stagger-reveal";

// Starter page — replace with your app's real home. The cards below exist only
// to demonstrate the design-system conventions (see DESIGN.md): standard card,
// stat card, and staggered entrance animation.
const STATS = [
  { label: "Stat one", value: "128" },
  { label: "Stat two", value: "42" },
  { label: "Stat three", value: "7" },
];

export default async function Page() {
  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <h2 className="font-semibold">Welcome</h2>
        <StaggerReveal className="grid grid-cols-3 gap-4">
          {STATS.map((stat) => (
            <StaggerItem key={stat.label} className="h-full">
              <div className="relative bg-card border border-border inset-highlight flex flex-col items-center justify-center py-4 gap-1">
                <CornerAccents />
                <span className="text-xl font-semibold tabular-nums text-primary">
                  {stat.value}
                </span>
                <span className="text-xs text-muted-foreground uppercase tracking-wide">
                  {stat.label}
                </span>
              </div>
            </StaggerItem>
          ))}
        </StaggerReveal>
      </section>

      <section className="space-y-4">
        <h2 className="font-semibold">Getting started</h2>
        <div className="relative bg-card border border-border p-6">
          <CornerAccents />
          <p className="text-sm text-muted-foreground leading-relaxed">
            This is your starter home page. Build new features as
            <span className="text-foreground font-semibold"> app/(dashboard)/[feature]/</span>
            with a page.tsx, service.ts, types.ts, and co-located _components and
            _hooks folders — the conventions are documented in DESIGN.md and the
            design-rules skill.
          </p>
        </div>
      </section>
    </div>
  );
}
