import { AskOllie } from "./_components/ask-ollie";

export const dynamic = "force-dynamic";

// The whole signed-in experience is Ollie: a full-height chat that owns its own
// greeting, scroll, and composer.
export default function OlliePage() {
  return <AskOllie />;
}
