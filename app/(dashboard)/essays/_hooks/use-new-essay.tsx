import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

// New-essay form: the prompt EXACTLY as the school states it (never paraphrased
// on save — QESSAY-PROMPT-000001), an optional word limit, an optional label.
const newEssaySchema = z.object({
  promptText: z.string().trim().min(10, "Paste the full prompt — exactly as the school words it"),
  wordLimit: z.union([z.string(), z.number()]).optional(),
  context: z.string().trim().max(80, "Keep the label short").optional(),
});

export type NewEssayPayload = z.infer<typeof newEssaySchema>;

const parseLimit = (v: string | number | undefined): number | undefined => {
  if (v === undefined || v === "") return undefined;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : undefined;
};

export function useNewEssay(onCreate: (input: { promptText: string; wordLimit?: number; context?: string }) => void) {
  const form = useForm<NewEssayPayload>({
    resolver: zodResolver(newEssaySchema),
    defaultValues: { promptText: "", wordLimit: "", context: "" },
  });

  const onSubmit = form.handleSubmit((data) => {
    onCreate({
      promptText: data.promptText.trim(),
      wordLimit: parseLimit(data.wordLimit),
      context: data.context?.trim() || undefined,
    });
  });

  return { form, onSubmit };
}
