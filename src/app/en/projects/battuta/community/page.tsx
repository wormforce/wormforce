import type { Metadata } from "next";
import { BattutaCommunityPage } from "@/components/battuta-community-page";
import { JsonLd } from "@/components/json-ld";
import { battutaPaths } from "@/content/battuta";
import { battutaCommunityPacks, communityPackPath } from "@/lib/battuta-community";
import { absoluteUrl } from "@/lib/utils";

const pageUrl = absoluteUrl(battutaPaths.community.en);
const chinesePageUrl = absoluteUrl(battutaPaths.community.zh);
const hasPublishedPacks = battutaCommunityPacks.length > 0;

export const metadata: Metadata = {
  title: "Battuta Community Sounds",
  description: hasPublishedPacks
    ? "Discover curated keyboard recordings with clear licenses and safe one-click installation for Battuta on macOS and Windows."
    : "Preview the Battuta community catalog, review standards, and secure installation model being prepared for macOS and Windows.",
  alternates: {
    canonical: pageUrl,
    languages: { "zh-CN": chinesePageUrl, en: pageUrl },
  },
  openGraph: {
    title: "Battuta Community Sounds | Wormforce",
    description: hasPublishedPacks
      ? "Browse curated community keyboard sounds and install a pinned release safely in Battuta."
      : "Battuta Community and its secure installation model are being prepared.",
    url: pageUrl,
    type: "website",
    images: [absoluteUrl("/battuta/og-v1.2.0.png")],
  },
};

export default function BattutaCommunityEnglishPage() {
  return (
    <>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "Battuta Community Sounds",
        url: pageUrl,
        numberOfItems: battutaCommunityPacks.length,
        itemListElement: battutaCommunityPacks.map((pack, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: pack.name,
          url: absoluteUrl(communityPackPath(pack, "en")),
        })),
      }} />
      <BattutaCommunityPage locale="en" />
    </>
  );
}
