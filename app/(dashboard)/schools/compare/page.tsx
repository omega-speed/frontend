import Link from "next/link";
import { CornerAccents } from "@/components/ui/corner-accents";
import { getSchool } from "../service";
import { admitPct, money, pct, titleCase } from "../_lib/format";
import type { SchoolDetail } from "../types";

export const metadata = { title: "Compare schools — Qoollege" };

const ROWS: { label: string; value: (s: SchoolDetail) => string }[] = [
  { label: "Location", value: (s) => [s.city, s.state].filter(Boolean).join(", ") || "—" },
  { label: "Setting", value: (s) => titleCase(s.setting) ?? "—" },
  { label: "Size", value: (s) => titleCase(s.size) ?? "—" },
  { label: "Admit rate", value: (s) => admitPct(s.admitRate) },
  { label: "Graduation rate", value: (s) => pct(s.graduationRate) },
  { label: "Stay after year 1", value: (s) => pct(s.retentionRate) },
  { label: "Net price / yr", value: (s) => money(s.netPrice) },
  { label: "Earnings 10 yrs after", value: (s) => money(s.medianEarnings) },
  { label: "Minimum GPA", value: (s) => (s.minGpa != null ? String(s.minGpa) : "—") },
  { label: "Competitive GPA", value: (s) => (s.competitiveGpa != null ? String(s.competitiveGpa) : "—") },
  { label: "Test policy", value: (s) => (s.testPolicy ? (titleCase(s.testPolicy.replace(/_/g, " ")) ?? "—") : "—") },
  { label: "Regular deadline", value: (s) => s.deadlines?.regular ?? "—" },
  { label: "Programs", value: (s) => s.programCount.toLocaleString("en-US") },
  { label: "Clubs", value: (s) => s.clubCount.toLocaleString("en-US") },
  { label: "Varsity sports", value: (s) => String(Object.keys(s.sports).length) },
];

// Side-by-side comparison of 2–4 schools from the browse basket. Missing numbers
// stay "—" — an honest gap beats a guessed figure.
export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string }>;
}) {
  const { ids } = await searchParams;
  const wanted = [...new Set((ids ?? "").split(",").filter(Boolean))].slice(0, 4);
  const schools = (await Promise.all(wanted.map(getSchool))).filter((s): s is SchoolDetail => s != null);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 md:px-6">
      <Link href="/schools" className="text-xs text-muted-foreground hover:text-foreground">
        ← All schools
      </Link>
      <div className="mt-2 mb-1 text-[11px] font-black uppercase text-primary">Side by side</div>
      <h1 className="text-xl font-bold">Compare schools</h1>

      {schools.length < 2 ? (
        <p className="mt-6 text-sm text-muted-foreground">
          Pick at least two schools on the <Link href="/schools" className="text-primary hover:underline">browse page</Link> to compare them here.
        </p>
      ) : (
        <div className="relative mt-5 border border-border bg-card">
          <CornerAccents />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="w-44 px-4 py-3 text-left text-[11px] uppercase text-muted-foreground">Metric</th>
                  {schools.map((s) => (
                    <th key={s.id} className="px-4 py-3 text-left align-top">
                      <Link href={`/schools/${s.id}`} className="font-bold hover:text-primary">
                        {s.name}
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row) => (
                  <tr key={row.label} className="border-b border-border last:border-b-0">
                    <td className="px-4 py-2.5 text-xs text-muted-foreground">{row.label}</td>
                    {schools.map((s) => (
                      <td key={s.id} className="px-4 py-2.5 font-medium tabular-nums">
                        {row.value(s)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
