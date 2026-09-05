import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BattutaGuidePage } from "@/components/battuta-guide-page";
import { JsonLd } from "@/components/json-ld";
import {
  battutaGuides,
  getBattutaGuideBySlug,
} from "@/content/battuta-guides";
import { battutaPaths, battutaRelease } from "@/content/battuta";
import { absoluteUrl } from "@/lib/utils";

type GuidePageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return battutaGuides.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({
  params,
}: GuidePageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = getBattutaGuideBySlug(slug);

  if (!guide) {
    return {
      title: "Battuta Guide Not Found",
      robots: { index: false, follow: false },
    };
  }

  const url = absoluteUrl(guide.path);
  const image = absoluteUrl("/battuta/battuta-icon.png");

  return {
    title: { absolute: guide.seoTitle },
    description: guide.description,
    alternates: { canonical: url },
    openGraph: {
      title: guide.seoTitle,
      description: guide.description,
      url,
      type: "article",
      modifiedTime: guide.updatedAt,
      images: [
        {
          url: image,
          width: 1236,
          height: 1236,
          alt: `Battuta keyboard sound app for ${guide.platform}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: guide.seoTitle,
      description: guide.description,
      images: [image],
    },
  };
}

function guideStructuredData(guide: (typeof battutaGuides)[number]) {
  const url = absoluteUrl(guide.path);
  const battutaUrl = absoluteUrl(battutaPaths.en);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TechArticle",
        "@id": `${url}#article`,
        headline: guide.title,
        name: guide.seoTitle,
        description: guide.description,
        url,
        dateModified: guide.updatedAt,
        inLanguage: "en",
        image: absoluteUrl("/battuta/battuta-icon.png"),
        author: {
          "@type": "Organization",
          "@id": absoluteUrl("/#organization"),
          name: "Wormforce",
          url: absoluteUrl("/"),
        },
        publisher: { "@id": absoluteUrl("/#organization") },
        about: {
          "@type": "SoftwareApplication",
          "@id": `${battutaUrl}#software`,
          name: "Battuta",
          softwareVersion: battutaRelease.version,
          operatingSystem: guide.platform,
          url: battutaUrl,
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Wormforce",
            item: absoluteUrl("/"),
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Battuta",
            item: battutaUrl,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: `${guide.platform} setup guide`,
            item: url,
          },
        ],
      },
    ],
  };
}

export default async function GuidePage({ params }: GuidePageProps) {
  const { slug } = await params;
  const guide = getBattutaGuideBySlug(slug);

  if (!guide) {
    notFound();
  }

  return (
    <>
      <JsonLd data={guideStructuredData(guide)} />
      <BattutaGuidePage guide={guide} />
    </>
  );
}
