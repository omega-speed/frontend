import { CornerAccents } from "@/components/ui/corner-accents";
import { StaggerReveal, StaggerItem } from "@/components/motion/stagger-reveal";
import { getCatalog } from "./service";

export const dynamic = "force-dynamic";

export default async function ProgramsPage() {
  const { institutions, programs } = await getCatalog();

  return (
    <div className="space-y-8">
      <section className="space-y-1">
        <span className="text-[11px] font-black uppercase text-primary">Catalog</span>
        <h2 className="text-lg font-semibold">Universities &amp; programs</h2>
        <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
          The canonical university data — {institutions.length}{" "}
          institution{institutions.length === 1 ? "" : "s"} and {programs.length}{" "}
          program{programs.length === 1 ? "" : "s"} acquired and normalized by the
          knowledge pipeline.
        </p>
      </section>

      {programs.length === 0 ? (
        <div className="relative bg-card border border-border p-6">
          <CornerAccents />
          <p className="text-sm text-muted-foreground leading-relaxed">
            No programs loaded yet. Run{" "}
            <span className="text-foreground font-semibold">npm run seed:demo</span>{" "}
            on the backend, or acquire a source through the pipeline.
          </p>
        </div>
      ) : (
        <StaggerReveal className="grid gap-3 sm:grid-cols-2">
          {programs.map((p) => (
            <StaggerItem key={p.id}>
              <div className="relative bg-card border border-border inset-highlight p-4 h-full">
                <CornerAccents />
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <h3 className="font-semibold leading-tight">{p.officialName}</h3>
                    <p className="text-xs text-muted-foreground">{p.institutionName}</p>
                  </div>
                  <span className="text-[10px] uppercase px-2 py-0.5 border text-primary bg-primary/10 border-primary/20 shrink-0">
                    {p.degreeLevel.toLowerCase()}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <span className="text-[10px] uppercase text-muted-foreground border border-border px-2 py-0.5">
                    {p.modality.toLowerCase().replace("_", " ")}
                  </span>
                  {p.disciplineCodes.map((d) => (
                    <span key={d} className="text-[10px] uppercase text-muted-foreground border border-border px-2 py-0.5">
                      {d.replace("_", " ")}
                    </span>
                  ))}
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerReveal>
      )}
    </div>
  );
}
