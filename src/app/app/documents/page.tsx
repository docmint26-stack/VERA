import type { Metadata } from "next";
import { DocumentsView } from "@/components/app/modules/documents-view";

export const metadata: Metadata = {
  title: "Documents",
};

export default function Page() {
  return <DocumentsView />;
}