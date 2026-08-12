"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { getAbout } from "../service";
import { OllieMark } from "./ollie-mark";

// The twin, visible at all times: "Knows N things about you so far". The digital
// twin is the product's memory — showing it working is the proof.
export function TwinStatus({ refreshKey }: { refreshKey: number }) {
  const [count, setCount] = useState<number | null>(null);
  const [, startTransition] = useTransition();

   
  useEffect(() => {
    startTransition(async () => {
      const res = await getAbout();
      if (res.ok) setCount(res.view.completeness?.knownCount ?? res.view.using.length + res.view.noted.length);
    });
  }, [refreshKey]);

  return (
    <div className="flex items-center gap-2.5 border-b border-border bg-background/60 px-4 py-2">
      <OllieMark size={22} />
      <div className="min-w-0">
        <p className="text-sm font-semibold leading-tight text-foreground">Ollie</p>
        <p className="truncate text-[11px] leading-tight text-muted-foreground">
          {count === null ? "Getting to know you…" : count === 0 ? "Doesn't know you yet — say anything" : (
            <>
              Knows {count} thing{count === 1 ? "" : "s"} about you so far ·{" "}
              <Link href="/ollie?panel=about" className="font-medium text-primary hover:opacity-80">
                see what Ollie knows
              </Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
