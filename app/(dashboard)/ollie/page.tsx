import { OllieWorkspace } from "./_components/ollie-workspace";
import { getConversation } from "./service";

export const dynamic = "force-dynamic";

// The signed-in experience: Ollie's chat plus the live panel. The transcript is
// streamed (not awaited) so the shell renders immediately. ?panel= deep-links a
// panel tab straight from the sidebar (Shortlist / Applications / Funding).
export default async function OlliePage({
  searchParams,
}: {
  searchParams: Promise<{ panel?: string }>;
}) {
  const { panel } = await searchParams;
  const conversationPromise = getConversation();
  return <OllieWorkspace conversationPromise={conversationPromise} initialPanel={panel} />;
}
