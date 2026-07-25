import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { Declaration } from "../types";

// The quick-start intake: just enough to open a shortlist. Kept as strings (like
// the app's other forms) and turned into twin declarations on submit.
const intakeSchema = z.object({
  field: z.string().trim().min(2, "Tell me your field of study"),
  degree: z.string().min(1, "Pick a degree level"),
  budget: z
    .string()
    .min(1, "Enter a yearly budget")
    .refine((v) => Number(v.replace(/[,$\s]/g, "")) > 0, "Enter a valid amount"),
});

export type IntakePayload = z.infer<typeof intakeSchema>;

export function useOllieIntake(onDone: (declarations: Declaration[]) => void) {
  const form = useForm<IntakePayload>({
    resolver: zodResolver(intakeSchema),
    defaultValues: { field: "", degree: "", budget: "" },
  });

  const onSubmit = form.handleSubmit((data) => {
    const field = data.field.trim();
    const budget = Number(data.budget.replace(/[,$\s]/g, ""));
    const declarations: Declaration[] = [
      // The field is stored as the learner said it; the match layer canonicalises.
      { category: "academic", name: "discipline", value: field.toLowerCase().replace(/\s+/g, "_"), label: `Field → ${field}` },
      { category: "academic", name: "intended_degree_level", value: data.degree, label: `Degree → ${data.degree}` },
      { category: "financial", name: "annual_budget", value: budget, label: `Budget → $${budget.toLocaleString("en-US")}/yr` },
    ];
    onDone(declarations);
  });

  return { form, onSubmit, isSubmitting: form.formState.isSubmitting };
}
