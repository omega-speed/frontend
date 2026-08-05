// Shared number formatting for the schools pages — honest, compact figures.

export const money = (n: number | null | undefined) =>
  n == null ? "—" : `$${Math.round(n).toLocaleString("en-US")}`;

export const pct = (n: number | null | undefined) => (n == null ? "—" : `${Math.round(n)}%`);

// Admit rate arrives as 0–1.
export const admitPct = (n: number | null | undefined) =>
  n == null ? "—" : `${Math.round(n * 100)}%`;

export const titleCase = (s: string | null | undefined) =>
  s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : null;
