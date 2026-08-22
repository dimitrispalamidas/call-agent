import type { Metadata } from "next";
import { HomeLanding } from "@/components/landing/home-landing";

export const metadata: Metadata = {
  title: "CallAgent",
  description:
    "AI τηλεφωνικός πράκτορας: απαντά από τη βάση γνώσης σας και μεταφέρει σε υπάλληλο όταν χρειάζεται.",
};

export default function HomePage() {
  return <HomeLanding />;
}
