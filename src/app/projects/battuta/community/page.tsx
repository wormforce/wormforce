import type { Metadata } from "next";
import { BattutaCommunityPage } from "@/components/battuta-community-page";
import { JsonLd } from "@/components/json-ld";
import { battutaPaths } from "@/content/battuta";
import { battutaCommunityPacks, communityPackPath } from "@/lib/battuta-community";
import { absoluteUrl } from "@/lib/utils";

const pageUrl = absoluteUrl(battutaPaths.community.zh);
const englishPageUrl = absoluteUrl(battutaPaths.community.en);
const hasPublishedPacks = battutaCommunityPacks.length > 0;

export const metadata: Metadata = {
  title: "Battuta 社区音色",
  description: hasPublishedPacks
    ? "发现经过审核、许可清晰，并可由 Battuta 在 macOS 与 Windows 上安全安装的社区键盘音色。"
    : "了解正在准备中的 Battuta 社区音色、审核标准和面向 macOS 与 Windows 的安全安装机制。",
  alternates: {
    canonical: pageUrl,
    languages: { "zh-CN": pageUrl, en: englishPageUrl },
  },
  openGraph: {
    title: "Battuta 社区音色 | Wormforce",
    description: hasPublishedPacks
      ? "浏览经过审核的社区键盘音色，并安全安装到 Battuta。"
      : "Battuta 社区音色与安全安装机制正在准备中。",
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
        name: "Battuta 社区音色",
        url: pageUrl,
        numberOfItems: battutaCommunityPacks.length,
        itemListElement: battutaCommunityPacks.map((pack, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: pack.name,
          url: absoluteUrl(communityPackPath(pack, "zh-CN")),
        })),
      }} />
      <BattutaCommunityPage locale="zh-CN" />
    </>
  );
}
