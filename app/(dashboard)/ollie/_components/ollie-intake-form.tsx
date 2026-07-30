"use client";

import { motion } from "framer-motion";
import { Form } from "@/components/ui/form";
import ControlledInput from "@/components/molecules/controlled-input";
import ControlledSelect from "@/components/molecules/controlled-select";
import { Button } from "@/components/ui/button";
import { useOllieIntake } from "../_hooks/use-ollie-intake";
import type { Declaration } from "../types";
import { OllieMark } from "./ollie-mark";

const DEGREES = [
  { name: "Bachelor's", value: "bachelor" },
  { name: "Master's", value: "master" },
  { name: "Doctorate", value: "doctorate" },
  { name: "Certificate", value: "certificate" },
];

// A quick, inline intake card — field, degree, budget — so Ollie can collect the
// essentials at once instead of a long back-and-forth. Submitting auto-saves them.
export function OllieIntakeForm({
  onSubmit,
  onSkip,
  pending,
}: {
  onSubmit: (declarations: Declaration[]) => void;
  onSkip?: () => void;
  pending?: boolean;
}) {
  const { form, onSubmit: submit } = useOllieIntake(onSubmit);

  return (
    <div className="flex items-start gap-3">
      <OllieMark />
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="min-w-0 flex-1 rounded-2xl border border-border bg-card p-4 shadow-sm"
      >
        <p className="text-[11px] font-black uppercase text-primary">A few quick things to start your list</p>
        <p className="mt-0.5 text-xs text-muted-foreground">Fill in what you know — any one of these is enough to get going.</p>
        <Form {...form}>
          <form onSubmit={submit} className="mt-3 space-y-3">
            <ControlledInput name="field" label="Field of study" placeholder="e.g. Software engineering" optional />
            <ControlledSelect name="degree" label="Degree level" placeholder="Choose one" values={DEGREES} optional />
            <ControlledInput name="budget" label="Yearly budget (USD)" type="number" placeholder="e.g. 30000" optional />
            <div className="flex items-center gap-2 pt-1">
              <Button type="submit" disabled={pending}>
                {pending ? "Saving…" : "Start my shortlist"}
              </Button>
              {onSkip && (
                <Button type="button" variant="ghost" onClick={onSkip} disabled={pending}>
                  I&apos;ll just chat
                </Button>
              )}
            </div>
          </form>
        </Form>
      </motion.div>
    </div>
  );
}
