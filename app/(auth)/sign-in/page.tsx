import { SignInForm } from "@/components/login-form";

// Editorial single-column composition — a quiet masthead over a centered form.
// No split-hero, no card-on-gradient, no decorative icons.
export default function SignInPage() {
  return (
    <main className="min-h-svh flex flex-col bg-background text-foreground">
      <header className="px-6 md:px-10 pt-8">
        <div className="mx-auto w-full max-w-5xl flex items-baseline justify-between">
          <span className="text-sm font-extrabold uppercase tracking-[0.3em]">
            Qoollege
          </span>
          <span className="hidden sm:block text-[11px] uppercase tracking-[0.26em] text-muted-foreground">
            Guidance Intelligence
          </span>
        </div>
        <div className="mx-auto mt-5 w-full max-w-5xl border-t border-border" />
      </header>

      <div className="flex flex-1 items-center justify-center px-6 py-16">
        <SignInForm />
      </div>
    </main>
  );
}
