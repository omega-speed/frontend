import { getMe } from "@/app/(dashboard)/service";
import ProfileMenu from "./profile-menu";

export default async function UserProfile() {
  const response = await getMe();
  const { name, email } = response?.data ?? { name: "", email: "" };

  return <ProfileMenu name={name} email={email} />;
}
