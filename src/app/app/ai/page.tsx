import type { Metadata } from "next";
import { AIView } from "@/components/app/modules/ai-view";

export const metadata: Metadata = {
  title: "VERA AI",
};

export default function Page() {
  return <AIView />;
}
