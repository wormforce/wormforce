import type { Metadata } from "next";
import { BattutaCommunityPage } from "@/components/battuta-community-page";
import { JsonLd } from "@/components/json-ld";
import { battutaPaths } from "@/content/battuta";
import { battutaDemoProfileCount, battutaDemoProfiles } from "@/content/battuta-demo-audio";
import { absoluteUrl } from "@/lib/utils";

const pageUrl = absoluteUrl(battutaPaths.community.en);
const chinesePageUrl = absoluteUrl(battutaPaths.community.zh);

export const metadata: Metadata = {
  title: "Battuta Sound Atlas",
  description: `Search, filter, and freely audition ${battutaDemoProfileCount} real mechanical-keyboard sound profiles with single-key samples, typing sequences, and A/B comparison.`,
  alternates: {
    canonical: pageUrl,
    languages: { "zh-CN": chinesePageUrl, en: pageUrl },
  },
  openGraph: {
    title: "Battuta Sound Atlas | Wormforce",
    description: `Freely audition ${battutaDemoProfileCount} real mechanical-keyboard sounds and compare them directly in your browser.`,
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
        name: "Battuta Sound Atlas",
        url: pageUrl,
        numberOfItems: battutaDemoProfileCount,
        itemListElement: battutaDemoProfiles.map((profile, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: profile.name,
          url: `${pageUrl}#sound-${profile.id}`,
        })),
      }} />
      <BattutaCommunityPage locale="en" />
    </>
  );
}
