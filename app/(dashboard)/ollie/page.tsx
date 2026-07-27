import { OllieWorkspace } from "./_components/ollie-workspace";
import { getConversation } from "./service";

export const dynamic = "force-dynamic";

// The signed-in experience: Ollie's chat on the left, the live shortlist on the
// right. The saved transcript is fetched server-side (no client useEffect) so the
// conversation is already on screen when the page renders.
export default async function OlliePage() {
  const initialMessages = await getConversation();
  return <OllieWorkspace initialMessages={initialMessages} />;
}
