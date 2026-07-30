import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { Declaration } from "../types";

// The quick-start intake. Every field is OPTIONAL — the learner fills what they
// know and we declare only that; the rest can come out in chat. Budget arrives as
// a number (ControlledInput type="number" emits numbers) or a string, so the
// schema accepts both.
const parseBudget = (v: string | number | undefined): number | null => {
  if (v === undefined || v === "") return null;
  const n = typeof v === "number" ? v : Number(v.replace(/[,$\s]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : null;
};

const intakeSchema = z
  .object({
    field: z.string().trim().optional(),
    degree: z.string().optional(),
    budget: z.union([z.string(), z.number()]).optional(),
  })
  .refine((v) => v.budget === undefined || v.budget === "" || parseBudget(v.budget) !== null, {
    message: "Enter a valid amount",
    path: ["budget"],
  })
  .refine((v) => Boolean(v.field?.trim()) || Boolean(v.degree) || parseBudget(v.budget) !== null, {
    message: "Give me at least one of these to start",
    path: ["field"],
  });

export type IntakePayload = z.infer<typeof intakeSchema>;

export function useOllieIntake(onDone: (declarations: Declaration[]) => void) {
  const form = useForm<IntakePayload>({
    resolver: zodResolver(intakeSchema),
    defaultValues: { field: "", degree: "", budget: "" },
  });

  const onSubmit = form.handleSubmit((data) => {
    const declarations: Declaration[] = [];
    const field = data.field?.trim();
    if (field) {
      // The field is stored as the learner said it; the match layer canonicalises.
      declarations.push({
        category: "academic",
        name: "discipline",
        value: field.toLowerCase().replace(/\s+/g, "_"),
        label: `Field → ${field}`,
      });
    }
    if (data.degree) {
      declarations.push({
        category: "academic",
        name: "intended_degree_level",
        value: data.degree,
        label: `Degree → ${data.degree}`,
      });
    }
    const budget = parseBudget(data.budget);
    if (budget !== null) {
      declarations.push({
        category: "financial",
        name: "annual_budget",
        value: budget,
        label: `Budget → $${budget.toLocaleString("en-US")}/yr`,
      });
    }
    onDone(declarations);
  });

  return { form, onSubmit, isSubmitting: form.formState.isSubmitting };
}
