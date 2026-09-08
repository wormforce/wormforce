import type { Metadata } from "next";
import { BattutaCommunityPage } from "@/components/battuta-community-page";
import { JsonLd } from "@/components/json-ld";
import { battutaPaths } from "@/content/battuta";
import { battutaDemoProfileCount, battutaDemoProfiles } from "@/content/battuta-demo-audio";
import { absoluteUrl } from "@/lib/utils";

const pageUrl = absoluteUrl(battutaPaths.community.zh);
const englishPageUrl = absoluteUrl(battutaPaths.community.en);

export const metadata: Metadata = {
  title: "Battuta 声音图鉴",
  description: `在线搜索、筛选并自由试听 ${battutaDemoProfileCount} 套真实机械键盘音色，支持单键试听、连续打字节奏与 A/B 对比。`,
  alternates: {
    canonical: pageUrl,
    languages: { "zh-CN": pageUrl, en: englishPageUrl },
  },
  openGraph: {
    title: "Battuta 声音图鉴 | Wormforce",
    description: `自由试听 ${battutaDemoProfileCount} 套真实机械键盘音色，并在浏览器中直接进行 A/B 对比。`,
    url: pageUrl,
    type: "website",
    images: [absoluteUrl("/battuta/og-v1.2.0.png")],
  },
};

export default function BattutaCommunityChinesePage() {
  return (
    <>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "Battuta 声音图鉴",
        url: pageUrl,
        numberOfItems: battutaDemoProfileCount,
        itemListElement: battutaDemoProfiles.map((profile, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: profile.name,
          url: `${pageUrl}#sound-${profile.id}`,
        })),
      }} />
      <BattutaCommunityPage locale="zh-CN" />
    </>
  );
}
