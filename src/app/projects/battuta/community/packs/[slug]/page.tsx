import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BattutaCommunityPackPage } from "@/components/battuta-community-pack-page";
import { JsonLd } from "@/components/json-ld";
import { battutaPaths } from "@/content/battuta";
import {
  battutaCommunityPacks,
  communityPackPath,
  getBattutaCommunityPackBySlug,
  getLatestBattutaCommunityRelease,
} from "@/lib/battuta-community";
import { absoluteUrl } from "@/lib/utils";

type PackPageProps = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return battutaCommunityPacks.map((pack) => ({ slug: pack.slug }));
}

export async function generateMetadata({ params }: PackPageProps): Promise<Metadata> {
  const { slug } = await params;
  const pack = getBattutaCommunityPackBySlug(slug);
  if (!pack) return { title: "未找到社区音色", robots: { index: false, follow: false } };

  const pageUrl = absoluteUrl(communityPackPath(pack, "zh-CN"));
  const englishUrl = absoluteUrl(communityPackPath(pack, "en"));
  const imageUrl = pack.coverImage?.startsWith("https://")
    ? pack.coverImage
    : absoluteUrl(pack.coverImage ?? "/battuta/og-v1.2.0.png");
  return {
    title: `${pack.name} · Battuta 社区音色`,
    description: pack.summary["zh-CN"],
    alternates: { canonical: pageUrl, languages: { "zh-CN": pageUrl, en: englishUrl } },
    openGraph: {
      title: `${pack.name} · Battuta 社区音色`,
      description: pack.summary["zh-CN"],
      url: pageUrl,
      type: "website",
      images: [imageUrl],
    },
  };
}

export default async function BattutaCommunityPackChinesePage({ params }: PackPageProps) {
  const { slug } = await params;
  const pack = getBattutaCommunityPackBySlug(slug);
  if (!pack) notFound();
  const release = getLatestBattutaCommunityRelease(pack);
  const pageUrl = absoluteUrl(communityPackPath(pack, "zh-CN"));

  return (
    <>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "CreativeWork",
            name: pack.name,
            description: pack.description["zh-CN"],
            url: pageUrl,
            inLanguage: "zh-CN",
            author: release ? { "@type": "Person", name: release.author.displayName } : undefined,
            license: release?.license.url,
            datePublished: release?.publishedAt,
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Battuta", item: absoluteUrl(battutaPaths.zh) },
              { "@type": "ListItem", position: 2, name: "社区音色", item: absoluteUrl(battutaPaths.community.zh) },
              { "@type": "ListItem", position: 3, name: pack.name, item: pageUrl },
            ],
          },
        ],
      }} />
      <BattutaCommunityPackPage locale="zh-CN" pack={pack} />
    </>
  );
}
