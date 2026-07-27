"use client";

import { useCallback, useState } from "react";
import { AskOllie } from "./ask-ollie";
import { OlliePanel } from "./ollie-panel";
import type { ConversationMessage } from "../types";

// Two panes: the conversation on the left, the live shortlist on the right. Each
// chat turn bumps `refreshKey` so the panel refetches and tracks the conversation.
// `initialMessages` is the saved transcript, fetched server-side by the page.
export function OllieWorkspace({ initialMessages = [] }: { initialMessages?: ConversationMessage[] }) {
  const [refreshKey, setRefreshKey] = useState(0);
  const bump = useCallback(() => setRefreshKey((k) => k + 1), []);

  return (
    <div className="flex h-[calc(100svh-3.5rem)]">
      <div className="min-w-0 flex-1">
        <AskOllie onActivity={bump} initialMessages={initialMessages} />
      </div>
      <aside className="hidden w-90 shrink-0 border-l border-border lg:block xl:w-100">
        <OlliePanel refreshKey={refreshKey} />
      </aside>
    </div>
  );
}
