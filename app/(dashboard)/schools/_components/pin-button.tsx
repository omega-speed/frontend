"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PinSchool } from "../service";

// "Add to my list" straight from a school page — writes the same decision Ollie
// records when you say "add X to my list", so chat and pages stay in agreement.
export function PinButton({
  institutionId,
  name,
  initiallyOnList,
}: {
  institutionId: string;
  name: string;
  initiallyOnList: boolean;
}) {
  const [pinned, setPinned] = useState(initiallyOnList);
  const [isPending, startTransition] = useTransition();

  const trigger = () => {
    const next = !pinned;
    startTransition(async () => {
      const res = (await PinSchool(institutionId, next ? "add" : "remove")) as {
        success?: boolean;
        message?: string;
        data?: { found?: boolean; noPrograms?: boolean; program?: string };
      };
      if (!res?.success || res.data?.found === false) {
        toast.error(res?.message || "Couldn't update your list just now.");
        return;
      }
      if (next && res.data?.noPrograms) {
        toast.info(`${name} has no programs on file yet, so it can't go on your list.`);
        return;
      }
      setPinned(next);
      toast.success(
        next
          ? `${name} is on your list${res.data?.program ? ` — ${res.data.program}` : ""}.`
          : `${name} is off your list.`,
      );
    });
  };

  return (
    <Button size="sm" variant={pinned ? "secondary" : "default"} loading={isPending} onClick={trigger}>
      {pinned ? "On your list — remove" : "Add to my list"}
    </Button>
  );
}
