import { SignInForm } from "@/components/login-form";

const DOMAINS = [
  "Funding",
  "Match",
  "Admissions",
  "Essays",
  "Global",
  "Career",
];

// A floating two-panel card: a cobalt brand side (real message + domain chips)
// beside the form. Rounded, with depth — deliberately not a bare centered form.
export default function SignInPage() {
  return (
    <main className="w-screen h-screen">
      <div className="flex h-full w-full">
        {/* Brand panel */}
        <aside className="relative hidden flex-col justify-between bg-primary p-10 text-primary-foreground md:flex">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.13]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "22px 22px",
            }}
          />
          <span className="relative text-sm font-black uppercase tracking-[0.28em]">
            Qoollege
          </span>

          <div className="relative">
            <h2 className="text-[32px] font-black leading-[1.1] tracking-[-0.02em]">
              From uncertainty to a clear plan.
            </h2>
            <p className="mt-4 max-w-sm text-[13px] font-black leading-relaxed text-primary-foreground/80">
              Guidance intelligence for funding, matching, admissions and essays
              — one relationship, every step of the journey.
            </p>
            <div className="mt-7 flex flex-wrap gap-2">
              {DOMAINS.map((d) => (
                <span
                  key={d}
                  className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[12px] font-black"
                >
                  {d}
                </span>
              ))}
            </div>
          </div>

          <span className="relative text-[12px] text-primary-foreground/70">
            Built around the learner.
          </span>
        </aside>

        {/* Form panel */}
        <div className="flex items-center p-8 sm:p-10 md:p-12 w-full">
          <SignInForm />
        </div>
      </div>
    </main>
  );
}
