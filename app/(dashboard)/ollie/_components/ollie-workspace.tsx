"use client";

import { Suspense, useCallback, useState } from "react";
import { AskOllie } from "./ask-ollie";
import { OlliePanel } from "./ollie-panel";
import { TwinStatus } from "./twin-status";
import { OllieMark } from "./ollie-mark";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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
// Below lg the panel becomes a full-screen overlay opened from a slim toggle bar —
// on a phone it would otherwise not exist at all.
export function OllieWorkspace({
  initialPanel,
  conversationPromise,
}: {
  conversationPromise: Promise<ConversationMessage[]>;
  initialPanel?: string;
}) {
  const [refreshKey, setRefreshKey] = useState(0);
  // True while the backend re-scores + rebuilds the portfolio — the slow window
  // where the panel would otherwise sit unchanged and look stuck.
  const [refreshing, setRefreshing] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const bump = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshMatches(); // re-score against the updated profile…
      setRefreshKey((k) => k + 1); // …then have the panel re-read it.
    } finally {
      setRefreshing(false);
    }
  }, []);

  return (
    <div className="flex h-[calc(100svh-3.5rem)] flex-col">
      <div className="flex items-center justify-between border-b border-border px-4 py-2 lg:hidden">
        <span className="text-[11px] uppercase text-muted-foreground">
          {refreshing ? "Updating your list…" : "Shortlist, funding & profile"}
        </span>
        <Button size="xs" variant="outline" onClick={() => setPanelOpen(true)}>
          Your list
        </Button>
      </div>
      <div className="flex min-h-0 flex-1">
        <div className="flex min-w-0 flex-1 flex-col">
          <TwinStatus refreshKey={refreshKey} />
          <div className="min-h-0 flex-1">
            <Suspense fallback={<ChatLoading />}>
              <AskOllie onActivity={bump} conversationPromise={conversationPromise} />
            </Suspense>
          </div>
        </div>
        <aside
          className={cn(
            "border-border bg-background",
            "fixed inset-x-0 top-14 bottom-0 z-40 lg:static lg:z-auto lg:w-90 lg:shrink-0 lg:border-l xl:w-100",
            panelOpen ? "block" : "hidden lg:block",
          )}
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-2 lg:hidden">
            <span className="text-[11px] uppercase text-muted-foreground">Your list</span>
            <Button size="xs" variant="ghost" onClick={() => setPanelOpen(false)}>
              Back to chat
            </Button>
          </div>
          <div className="h-[calc(100%-2.5rem)] lg:h-full">
            <OlliePanel refreshKey={refreshKey} refreshing={refreshing} initialTab={initialPanel} />
          </div>
        </aside>
      </div>
    </div>
  );
}
