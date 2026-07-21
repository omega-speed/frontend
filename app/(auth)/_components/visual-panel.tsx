import { APP_NAME } from "@/lib/config";

// Decorative left panel for the auth screens. Replace the headline, copy, and
// highlight rows with your product's own marketing content.
const HIGHLIGHTS = [
  { id: "01", label: "First product highlight", detail: "Lorem" },
  { id: "02", label: "Second product highlight", detail: "Ipsum" },
  { id: "03", label: "Third product highlight", detail: "Dolor" },
];

export function VisualPanel() {
  return (
    <div
      className="relative hidden md:flex flex-col justify-between overflow-hidden"
      style={{
        padding: 56,
        background:
          "radial-gradient(120% 90% at 15% 0%, oklch(0.22 0 0) 0%, oklch(0.145 0 0) 55%)",
      }}
    >
      {/* Blueprint grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-50"
        style={{
          backgroundImage:
            "linear-gradient(oklch(1 0 0 / 0.04) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0 / 0.04) 1px, transparent 1px)",
          backgroundSize: "52px 52px",
        }}
      />

      {/* Glow blob */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: -80,
          bottom: -120,
          width: 380,
          height: 380,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, oklch(1 0 0 / 0.10), transparent 65%)",
          filter: "blur(20px)",
        }}
      />

      {/* Logo lockup */}
      <div className="relative">
        <span
          className="text-xl font-black uppercase tracking-[0.24em] text-foreground"
          style={{ textShadow: "0 0 10px oklch(1 0 0 / 0.35)" }}
        >
          {APP_NAME}
        </span>
      </div>

      {/* Hero block */}
      <div className="relative">
        <h1
          className="m-0 text-[48px] leading-[1.04] font-black uppercase text-foreground"
          style={{ letterSpacing: "-0.01em" }}
        >
          Your headline
          <br />
          goes here.
          <br />
          <span style={{ color: "var(--primary-hi)" }}>Make it </span>
          <span className="text-primary">count.</span>
        </h1>

        <p
          className="mt-4.5 text-[14px] leading-[1.7] text-muted-foreground"
          style={{ maxWidth: 380, letterSpacing: "0.02em" }}
        >
          A sentence or two about what your product does and why people should
          sign up for it.
        </p>
      </div>

      {/* Highlight rail */}
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <span
            className="text-[11px] font-semibold text-faint"
            style={{ letterSpacing: "0.2em" }}
          >
            HIGHLIGHTS
          </span>
          <span
            className="text-[11px] font-semibold text-win"
            style={{ letterSpacing: "0.1em" }}
          >
            ▲ LIVE
          </span>
        </div>
        <div className="flex flex-col gap-1.75">
          {HIGHLIGHTS.map(({ id, label, detail }) => (
            <div
              key={id}
              className="flex items-center gap-3.5"
              style={{
                padding: "11px 16px",
                background: "oklch(0.205 0 0 / 0.55)",
                border: "1px solid oklch(1 0 0 / 0.06)",
                backdropFilter: "blur(2px)",
              }}
            >
              <span
                className="text-[13px] font-bold tabular-nums w-5.5 shrink-0"
                style={{ color: id === "01" ? "var(--gold)" : "var(--faint)" }}
              >
                {id}
              </span>
              <div
                className="size-7.5 shrink-0"
                style={{
                  background: "oklch(0.269 0 0)",
                  clipPath:
                    "polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)",
                }}
              />
              <span
                className="flex-1 text-[13px] text-muted-foreground"
                style={{ letterSpacing: "0.04em" }}
              >
                {label}
              </span>
              <span className="text-[13px] font-bold tabular-nums text-faint">
                {detail}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
