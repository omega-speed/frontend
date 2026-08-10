import { getEssays } from "./service";
import { EssayWorkspace } from "./_components/essay-workspace";

export const metadata = { title: "Essays — Qoollege" };

// Server component: fetches the learner's essays and hands them to the client
// workspace. The learner remains the author — this page stores their words and
// shows advice with reasons; it never writes essay content for them.
export default async function EssaysPage() {
  const result = await getEssays();
  const essays = result.ok ? result.essays : [];
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6">
      <div className="mb-5">
        <p className="text-[11px] font-black uppercase text-primary">Essays</p>
        <h1 className="text-xl font-semibold text-foreground">Your words, honest feedback</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Every draft is kept. Feedback tells you why. You decide what changes.
        </p>
      </div>
      <EssayWorkspace initial={essays} />
    </div>
  );
}
