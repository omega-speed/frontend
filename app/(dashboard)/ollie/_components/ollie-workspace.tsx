"use client";

import { Suspense, useCallback, useState } from "react";
import { AskOllie } from "./ask-ollie";
import { OlliePanel } from "./ollie-panel";
import { OllieMark } from "./ollie-mark";
import { refreshMatches } from "../service";
import type { ConversationMessage } from "../types";

// The left pane while the saved transcript streams in — the shell (and the right
// panel) are already interactive; only the message history is still arriving.
function ChatLoading() {
  return (
    <div className="flex h-full items-center justify-center">
      <OllieMark size={40} thinking />
    </div>
  );
}

// Two panes: the conversation on the left, the live shortlist on the right. A chat
// turn that changes the profile bumps the panel: it re-scores matches, then nudges
// `refreshKey` so the panel re-reads the fresh (now cheap) shortlist. The saved
// transcript is passed as a PROMISE and streamed, so the shell never blocks on it.
export function OllieWorkspace({ conversationPromise }: { conversationPromise: Promise<ConversationMessage[]> }) {
  const [refreshKey, setRefreshKey] = useState(0);
  const bump = useCallback(async () => {
    await refreshMatches(); // re-score against the updated profile…
    setRefreshKey((k) => k + 1); // …then have the panel re-read it.
  }, []);

  return (
    <div className="flex h-[calc(100svh-3.5rem)]">
      <div className="min-w-0 flex-1">
        <Suspense fallback={<ChatLoading />}>
          <AskOllie onActivity={bump} conversationPromise={conversationPromise} />
        </Suspense>
      </div>
      <aside className="hidden w-90 shrink-0 border-l border-border lg:block xl:w-100">
        <OlliePanel refreshKey={refreshKey} />
      </aside>
    </div>
  );
}
