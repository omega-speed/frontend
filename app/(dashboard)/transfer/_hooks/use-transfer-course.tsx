import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { TransferCourse } from "../types";

// Add-a-credit form: course-level, typed (gen-ed vs major matters — they
// transfer differently), with the school it was earned at.
const schema = z.object({
  courseName: z.string().trim().min(2, "Name the course"),
  subject: z.string().trim().max(80).optional(),
  credits: z.union([z.string(), z.number()]),
  type: z.enum(["gen-ed", "major", "elective"]),
  grade: z.string().min(1, "Pick the grade earned"),
  source: z.string().trim().min(2, "Which school was it earned at?"),
});

export type TransferCoursePayload = z.infer<typeof schema>;

export function useTransferCourse(onAdd: (course: TransferCourse) => void) {
  const form = useForm<TransferCoursePayload>({
    resolver: zodResolver(schema),
    defaultValues: { courseName: "", subject: "", credits: "3", type: "gen-ed", grade: "", source: "" },
  });

  const onSubmit = form.handleSubmit((data) => {
    const credits = typeof data.credits === "number" ? data.credits : Number(data.credits);
    onAdd({
      courseName: data.courseName.trim(),
      subject: data.subject?.trim() ?? "",
      credits: Number.isFinite(credits) && credits > 0 ? credits : 3,
      type: data.type,
      grade: data.grade,
      source: data.source.trim(),
    });
    form.reset();
  });

  return { form, onSubmit };
}
