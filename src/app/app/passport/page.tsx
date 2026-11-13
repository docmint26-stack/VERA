import type { Metadata } from "next";
import { PassportView } from "@/components/app/modules/passport-view";

export const metadata: Metadata = {
  title: "Passport",
};

export default function Page() {
  return <PassportView />;
}