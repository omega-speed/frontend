import { cn } from "@/lib/utils";
import type { TwinAttribute } from "../service";

type Confidence = TwinAttribute["confidenceState"];

// Human, honest labels — a learner should instantly see whether a value is
// something they said, something a document proved, or a machine estimate.
const LABELS: Record<Confidence, { label: string; className: string }> = {
  USER_DECLARED: { label: "You said", className: "text-muted-foreground bg-muted border-border" },
  VERIFIED: { label: "Verified", className: "text-win bg-win/10 border-win/20" },
  CORROBORATED: { label: "Corroborated", className: "text-win bg-win/10 border-win/20" },
  IMPORTED: { label: "Imported", className: "text-social bg-social/10 border-social/20" },
  INFERRED: { label: "Estimate", className: "text-gold bg-gold/10 border-gold/20" },
  PREDICTED: { label: "Estimate", className: "text-gold bg-gold/10 border-gold/20" },
  DISPUTED: { label: "Disputed", className: "text-loss bg-loss/10 border-loss/20" },
  STALE: { label: "Outdated", className: "text-muted-foreground bg-muted border-border" },
  UNKNOWN: { label: "Unknown", className: "text-muted-foreground bg-muted border-border" },
};

export function ConfidenceBadge({ state }: { state: Confidence }) {
  const { label, className } = LABELS[state] ?? LABELS.UNKNOWN;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-black uppercase",
        className,
      )}
    >
      {label}
    </span>
  );
}

// A quiet marker for data the learner should know is treated as sensitive.
const SENSITIVE = new Set([
  "SENSITIVE_PERSONAL",
  "HIGHLY_RESTRICTED",
  "LEGALLY_REGULATED",
]);

export function SensitivityMarker({ sensitivity }: { sensitivity: string }) {
  if (!SENSITIVE.has(sensitivity)) return null;
  return (
    <span className="text-[10px] font-black uppercase text-muted-foreground">
      Private
    </span>
  );
}
