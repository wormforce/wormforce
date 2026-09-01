import type { Metadata } from "next";
import { BattutaProductPage } from "@/components/battuta-product-page";
import { JsonLd } from "@/components/json-ld";
import { battutaPaths } from "@/content/battuta";
import { battutaStructuredData } from "@/lib/structured-data";
import { absoluteUrl } from "@/lib/utils";

const pageUrl = absoluteUrl(battutaPaths.en);
const chinesePageUrl = absoluteUrl(battutaPaths.zh);
const socialImage = absoluteUrl("/battuta/og-v1.2.0.png");

export const metadata: Metadata = {
  title: "Battuta: Keyboard Sound App for Mac and Windows",
  description:
    "Battuta is an open-source keyboard sound app for macOS and Windows with 21 mechanical profiles, custom sound packs, low-latency playback, and private local typing statistics.",
  alternates: {
    canonical: pageUrl,
    languages: {
      "zh-CN": chinesePageUrl,
      en: pageUrl,
    },
  },
  openGraph: {
    title: "Battuta: Keyboard Sound App for Mac and Windows | Wormforce",
    description:
      "Open-source keyboard sounds, DIY sound packs, and private local typing statistics for macOS and Windows.",
    url: pageUrl,
    type: "website",
    images: [
      {
        url: socialImage,
        width: 1672,
        height: 941,
        alt: "Battuta keyboard sound app for macOS and Windows",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Battuta: Keyboard Sound App for Mac and Windows | Wormforce",
    description:
      "Open-source keyboard sounds, DIY sound packs, and private local typing statistics for macOS and Windows.",
    images: [socialImage],
  },
};

export default function BattutaEnglishPage() {
  return (
    <>
      <JsonLd data={battutaStructuredData("en")} />
      <BattutaProductPage locale="en" />
    </>
  );
}
