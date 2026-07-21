import { getTwin, type StudentTwin } from "./service";
import { ProfileView } from "./_components/profile-view";

// Authenticated, per-request (reads the twin for the signed-in learner).
export const dynamic = "force-dynamic";

const EMPTY_TWIN: StudentTwin = {
  learnerId: "",
  consentStatus: "ACTIVE",
  consentPurposes: [],
  attributes: [],
};

export default async function ProfilePage() {
  const res = await getTwin();
  const twin: StudentTwin =
    res?.success && res.data ? (res.data as StudentTwin) : EMPTY_TWIN;
  return <ProfileView initialTwin={twin} />;
}
