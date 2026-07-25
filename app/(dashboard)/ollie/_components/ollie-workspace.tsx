"use client";

import { useCallback, useState } from "react";
import { AskOllie } from "./ask-ollie";
import { OllieShortlist } from "./ollie-shortlist";

// Two panes: the conversation on the left, the live shortlist on the right. Each
// chat turn bumps `refreshKey` so the panel refetches and tracks the conversation.
export function OllieWorkspace() {
  const [refreshKey, setRefreshKey] = useState(0);
  const bump = useCallback(() => setRefreshKey((k) => k + 1), []);

  return (
    <div className="flex h-[calc(100svh-3.5rem)]">
      <div className="min-w-0 flex-1">
        <AskOllie onActivity={bump} />
      </div>
      <aside className="hidden w-[360px] shrink-0 border-l border-border lg:block xl:w-[400px]">
        <OllieShortlist refreshKey={refreshKey} />
      </aside>
    </div>
  );
}
