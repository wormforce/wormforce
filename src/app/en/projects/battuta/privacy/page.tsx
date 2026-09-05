import type { Metadata } from "next";
import { BattutaPrivacyPage } from "@/app/projects/battuta/privacy/page";
import { battutaPaths } from "@/content/battuta";
import { absoluteUrl } from "@/lib/utils";

const pageUrl = absoluteUrl(battutaPaths.privacy.en);
const chinesePageUrl = absoluteUrl(battutaPaths.privacy.zh);

export const metadata: Metadata = {
  title: "Battuta Privacy Policy",
  description:
    "Learn how Battuta processes local keyboard and pointer events, typing statistics, custom sounds, and update requests.",
  alternates: {
    canonical: pageUrl,
    languages: {
      "zh-CN": chinesePageUrl,
      en: pageUrl,
    },
  },
  openGraph: {
    title: "Battuta Privacy Policy | Wormforce",
    description:
      "Battuta data handling, local storage, user controls, and third-party-service information.",
    url: pageUrl,
    type: "article",
    images: [
      {
        url: absoluteUrl("/battuta/og-v1.2.0.png"),
        width: 1672,
        height: 941,
        alt: "Battuta keyboard sound app for macOS and Windows",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Battuta Privacy Policy | Wormforce",
    description: "How Battuta handles and protects your data.",
    images: [absoluteUrl("/battuta/og-v1.2.0.png")],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function BattutaEnglishPrivacyPage() {
  return <BattutaPrivacyPage locale="en" />;
}
