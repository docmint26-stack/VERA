import type { Metadata } from "next";
import { RewardsView } from "@/components/app/modules/rewards-view";

export const metadata: Metadata = {
  title: "Rewards",
};

export default function Page() {
  return <RewardsView />;
}