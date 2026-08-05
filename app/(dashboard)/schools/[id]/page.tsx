import Link from "next/link";
import { notFound } from "next/navigation";
import { CornerAccents } from "@/components/ui/corner-accents";
import { getSchool } from "../service";
import { getShortlist } from "../../ollie/service";
import { admitPct, money, pct, titleCase } from "../_lib/format";
import { PinButton } from "../_components/pin-button";

export const metadata = { title: "School — Qoollege" };

const LEVEL_WORD: Record<string, string> = {
  BACHELOR: "Bachelor's",
  MASTER: "Master's",
  DOCTORATE: "Doctorate",
  ASSOCIATE: "Associate",
  CERTIFICATE: "Certificate",
  DIPLOMA: "Diploma",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="relative border border-border bg-card p-4">
      <CornerAccents />
      <h2 className="text-[11px] font-black uppercase text-primary">{title}</h2>
      <div className="mt-2">{children}</div>
    </section>
  );
}

// One school's full page, server-rendered from the validated catalog. Numbers we
// don't have show as "—", never invented (FP-001/FP-003).
export default async function SchoolPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [school, shortlist] = await Promise.all([getSchool(id), getShortlist()]);
  if (!school) notFound();
  const onList = shortlist.ok && shortlist.view.options.some((o) => o.institutionId === id);

  const stats = [
    { label: "Admit rate", value: admitPct(school.admitRate) },
    { label: "Graduation", value: pct(school.graduationRate) },
    { label: "Stay after yr 1", value: pct(school.retentionRate) },
    { label: "Net price / yr", value: money(school.netPrice) },
    { label: "Earnings 10 yrs", value: money(school.medianEarnings) },
  ];
  const deadlines = [
    { label: "Early action", value: school.deadlines?.earlyAction },
    { label: "Regular", value: school.deadlines?.regular },
    { label: "Transfer", value: school.deadlines?.transfer },
  ].filter((d) => d.value);
  const sports = Object.entries(school.sports);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 md:px-6">
      <Link href="/schools" className="text-xs text-muted-foreground hover:text-foreground">
        ← All schools
      </Link>

      <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold">{school.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {[school.city, school.state].filter(Boolean).join(", ") || "Location not listed"}
            {school.setting ? ` · ${titleCase(school.setting)}` : ""}
            {school.size ? ` · ${titleCase(school.size)} campus` : ""}
            {school.ownership ? ` · ${titleCase(school.ownership)}` : ""}
          </p>
          {school.website && (
            <a
              href={school.website.startsWith("http") ? school.website : `https://${school.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block text-xs text-primary hover:underline"
            >
              Official site
            </a>
          )}
        </div>
        <PinButton institutionId={school.id} name={school.name} initiallyOnList={onList} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className="inset-highlight relative flex flex-col items-center gap-1 border border-border border-t-2 border-t-gold bg-card py-3">
            <CornerAccents />
            <span className="text-lg font-semibold tabular-nums">{s.value}</span>
            <span className="px-1 text-center text-[10px] uppercase text-muted-foreground">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Section title="Admissions">
          <ul className="space-y-1.5 text-sm">
            <li>
              <span className="text-muted-foreground">Minimum GPA:</span>{" "}
              <span className="font-semibold tabular-nums">{school.minGpa ?? "Not published"}</span>
            </li>
            <li>
              <span className="text-muted-foreground">Competitive GPA:</span>{" "}
              <span className="font-semibold tabular-nums">{school.competitiveGpa ?? "Not published"}</span>
            </li>
            <li>
              <span className="text-muted-foreground">Test policy:</span>{" "}
              <span className="font-semibold">{school.testPolicy ? titleCase(school.testPolicy.replace(/_/g, " ")) : "Not published"}</span>
            </li>
          </ul>
        </Section>

        <Section title="Deadlines">
          {deadlines.length === 0 ? (
            <p className="text-sm text-muted-foreground">No application deadlines on file — check the official site.</p>
          ) : (
            <ul className="space-y-1.5 text-sm">
              {deadlines.map((d) => (
                <li key={d.label}>
                  <span className="text-muted-foreground">{d.label}:</span>{" "}
                  <span className="font-semibold">{d.value}</span>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>

      <div className="mt-3">
        <Section title={`Programs (${school.programCount.toLocaleString("en-US")} total)`}>
          {school.programs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active programs on file.</p>
          ) : (
            <ul className="grid grid-cols-1 gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
              {school.programs.map((p) => (
                <li key={`${p.name}-${p.level}`} className="flex items-baseline justify-between gap-2">
                  <span className="min-w-0 truncate">
                    {p.name} <span className="text-xs text-muted-foreground">· {LEVEL_WORD[p.level] ?? titleCase(p.level)}</span>
                  </span>
                  <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                    {p.tuition != null ? `${money(p.tuition)}/yr` : ""}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
        <Section title="Athletics">
          {sports.length === 0 ? (
            <p className="text-sm text-muted-foreground">No varsity teams on file.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {sports.map(([sport, divisions]) => (
                <span key={sport} className="border border-social/20 bg-social/10 px-2 py-0.5 text-xs text-social">
                  {sport}
                  {divisions.length > 0 ? ` · ${divisions.join(", ")}` : ""}
                </span>
              ))}
            </div>
          )}
        </Section>

        <Section title={`Campus life (${school.clubCount.toLocaleString("en-US")} clubs)`}>
          {school.clubsSample.length === 0 ? (
            <p className="text-sm text-muted-foreground">No clubs on file.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {school.clubsSample.map((c) => (
                <span key={c} className="border border-border bg-background px-2 py-0.5 text-xs text-muted-foreground">
                  {c}
                </span>
              ))}
            </div>
          )}
        </Section>
      </div>

      {school.schoolAid.length > 0 && (
        <div className="mt-3">
          <Section title="Aid tied to this school">
            <ul className="space-y-1.5 text-sm">
              {school.schoolAid.map((a) => (
                <li key={a.name} className="flex items-baseline justify-between gap-2">
                  <span className="min-w-0 truncate">{a.name}</span>
                  <span className="shrink-0 font-semibold tabular-nums text-win">
                    {a.amountMax != null ? `up to ${money(a.amountMax)}` : "amount varies"}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Awards are possibilities, never guarantees — eligibility is checked on your funding tab.
            </p>
          </Section>
        </div>
      )}
    </div>
  );
}
