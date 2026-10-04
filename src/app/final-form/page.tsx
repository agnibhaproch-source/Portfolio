import type { Metadata } from "next";
import { FinalForm } from "./FinalForm";

export const metadata: Metadata = {
  title: "Sealed page",
  robots: { index: false, follow: false },
};

export default function FinalFormPage() {
  return <FinalForm />;
}
