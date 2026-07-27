import { OllieWorkspace } from "./_components/ollie-workspace";
import { getConversation } from "./service";

export const dynamic = "force-dynamic";

// The signed-in experience: Ollie's chat on the left, the live shortlist on the
// right. The saved transcript is fetched here but NOT awaited — the promise is
// handed to the client and streamed via Suspense, so the page shell renders
// immediately instead of blocking the whole route on a database round-trip.
export default function OlliePage() {
  const conversationPromise = getConversation();
  return <OllieWorkspace conversationPromise={conversationPromise} />;
}
