import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { HomeschoolCourse } from "../types";

// Add-a-course form. Structure is validated; the CONTENT (courses, grades,
// curriculum) is the family's to state — never second-guessed (SEG-HOME-000010).
const courseSchema = z.object({
  name: z.string().trim().min(2, "Give the course a name"),
  subject: z.string().trim().min(2, "What subject area is it?"),
  gradeLevel: z.string().min(1, "Pick the year"),
  grade: z.string().min(1, "Pick the grade earned"),
  credits: z.union([z.string(), z.number()]),
  curriculumSource: z.enum(["provider", "co-op", "self-designed"]),
  provider: z.string().trim().max(120).optional(),
  rigor: z.array(z.string()).optional(),
  dualEnrollmentInstitution: z.string().trim().max(120).optional(),
});

export type CoursePayload = z.infer<typeof courseSchema>;

export function useCourseForm(onAdd: (course: HomeschoolCourse) => void) {
  const form = useForm<CoursePayload>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      name: "",
      subject: "",
      gradeLevel: "",
      grade: "",
      credits: "1",
      curriculumSource: "provider",
      provider: "",
      rigor: [],
      dualEnrollmentInstitution: "",
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    const credits = typeof data.credits === "number" ? data.credits : Number(data.credits);
    onAdd({
      name: data.name.trim(),
      subject: data.subject.trim(),
      gradeLevel: Number(data.gradeLevel),
      grade: data.grade,
      credits: Number.isFinite(credits) && credits > 0 ? credits : 1,
      curriculum: {
        source: data.curriculumSource,
        ...(data.provider?.trim() ? { provider: data.provider.trim() } : {}),
      },
      rigor: (data.rigor ?? []) as HomeschoolCourse["rigor"],
      ...(data.dualEnrollmentInstitution?.trim()
        ? { dualEnrollment: { institution: data.dualEnrollmentInstitution.trim() } }
        : {}),
    });
    form.reset();
  });

  return { form, onSubmit };
}
