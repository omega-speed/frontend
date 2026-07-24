import { AskOllie } from "./_components/ask-ollie";

export const dynamic = "force-dynamic";

export default function OlliePage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8 md:py-10">
      <section className="space-y-1.5">
        <span className="text-[11px] font-black uppercase text-primary">Ollie</span>
        <h1 className="text-2xl font-semibold leading-tight">
          Where should we start?
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Tell Ollie what you&apos;re weighing — where to apply, what you can
          afford, your chances — and it pulls the answer together for you. It
          shows its reasoning and is honest about what it doesn&apos;t know.
        </p>
      </section>

      <AskOllie />
    </div>
  );
}
