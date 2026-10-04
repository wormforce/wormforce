import type { Metadata } from "next";
import { BattutaCommunityReview } from "@/components/battuta-community-review";
export const metadata: Metadata = { title: "Battuta 社区审核", robots: { index: false, follow: false } };
export default function ReviewPage() { return <BattutaCommunityReview />; }
