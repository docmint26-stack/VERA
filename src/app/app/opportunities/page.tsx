import type { Metadata } from "next";
import { OpportunitiesView } from "@/components/app/modules/opportunities-view";

export const metadata: Metadata = {
  title: "Opportunities",
};

export default function Page() {
  return <OpportunitiesView />;
}