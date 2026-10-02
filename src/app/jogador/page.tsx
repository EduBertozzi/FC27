import { type Metadata } from "next";

import { ProfileView } from "@/components/profile/profile-view";

export const metadata: Metadata = { title: "Perfil do jogador" };

export default function ProfilePage() {
  return <ProfileView />;
}
