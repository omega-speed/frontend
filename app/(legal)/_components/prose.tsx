import type { ReactNode } from "react";
import { CornerAccents } from "@/components/ui/corner-accents";

// Shared typographic primitives for the policy pages (no typography plugin in use).

export function Title({ children }: { children: ReactNode }) {
  return (
    <h1 className="text-2xl font-black tracking-tight text-foreground">
      {children}
    </h1>
  );
}

export function Updated({ children }: { children: ReactNode }) {
  return <p className="mt-2 mb-8 text-xs text-muted-foreground">{children}</p>;
}

export function H2({ children }: { children: ReactNode }) {
  return (
    <h2 className="mt-8 mb-2 text-sm font-bold uppercase tracking-widest text-foreground">
      {children}
    </h2>
  );
}

export function H3({ children }: { children: ReactNode }) {
  return (
    <h3 className="mt-5 mb-2 text-xs font-bold uppercase tracking-wider text-foreground/90">
      {children}
    </h3>
  );
}

export function P({ children }: { children: ReactNode }) {
  return (
    <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
      {children}
    </p>
  );
}

export function UL({ children }: { children: ReactNode }) {
  return (
    <ul className="mb-3 list-disc space-y-1 pl-5 text-sm leading-relaxed text-muted-foreground">
      {children}
    </ul>
  );
}

// Emphasised warning line (e.g. "If you do not agree, you must not use…").
export function Callout({ children }: { children: ReactNode }) {
  return (
    <p className="mb-3 text-sm font-semibold leading-relaxed text-loss">
      {children}
    </p>
  );
}

// Bordered card for company / contact details.
export function InfoBox({ children }: { children: ReactNode }) {
  return (
    <div className="relative my-4 bg-card border border-border p-5 text-sm text-muted-foreground space-y-1">
      <CornerAccents />
      {children}
    </div>
  );
}

// Highlighted contact block.
export function ContactBox({ children }: { children: ReactNode }) {
  return (
    <div className="relative my-4 bg-primary/10 border border-primary/30 p-5 text-sm text-foreground space-y-1">
      <CornerAccents />
      {children}
    </div>
  );
}

export function LegalTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: ReactNode[][];
}) {
  return (
    <div className="my-4 overflow-x-auto">
      <table className="w-full min-w-[520px] border border-border text-sm text-muted-foreground">
        <thead>
          <tr className="bg-muted/40">
            {headers.map((h) => (
              <th
                key={h}
                className="border-b border-border px-3 py-2 text-left font-bold text-foreground"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-border/50">
              {row.map((cell, j) => (
                <td key={j} className="px-3 py-2 align-top">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
