import { AskOllie } from "./_components/ask-ollie";

export const dynamic = "force-dynamic";

export default function OlliePage() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <section className="space-y-1">
        <span className="text-[11px] font-black uppercase text-primary">Ollie</span>
        <h1 className="text-lg font-semibold">Ask Ollie</h1>
        <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
          Tell Ollie what you&apos;re weighing — where to apply, what you can
          afford, your chances — and it pulls the answer together for you. It
          shows its reasoning and is honest about what it doesn&apos;t know.
        </p>
      </section>

      <AskOllie />
    </div>
  );
}
