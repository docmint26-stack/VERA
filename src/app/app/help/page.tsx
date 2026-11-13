import type { Metadata } from "next";
import { HelpView } from "@/components/app/modules/help-view";

export const metadata: Metadata = {
  title: "Help",
};

export default function Page() {
  return <HelpView />;
}