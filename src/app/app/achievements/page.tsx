import type { Metadata } from "next";
import { AchievementsView } from "@/components/app/modules/achievements-view";

export const metadata: Metadata = {
  title: "Achievements",
};

export default function Page() {
  return <AchievementsView />;
}