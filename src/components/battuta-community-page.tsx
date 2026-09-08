import Image from "next/image";
import Link from "next/link";
import { BattutaSoundLibrary } from "@/components/battuta-sound-library";
import {
  battutaPaths,
  battutaRelease,
  type BattutaLocale,
} from "@/content/battuta";

const copy = {
  "zh-CN": {
    navigationLabel: "Battuta 声音图鉴导航",
    product: "产品页",
    community: "社区音色",
    download: "下载 Battuta",
    switchLabel: "切换为英文",
    activeLocale: "ZH",
    targetLocale: "EN",
    footer: "21 套音色均在浏览器本地播放；输入文字、试听记录与偏好不会上传。",
    source: "GitHub",
    privacy: "隐私政策",
  },
  en: {
    navigationLabel: "Battuta sound atlas navigation",
    product: "Product",
    community: "Community",
    download: "Download Battuta",
    switchLabel: "Switch to Chinese",
    activeLocale: "EN",
    targetLocale: "ZH",
    footer: "All 21 profiles play locally in your browser. Typed text, listening history, and preferences are never uploaded.",
    source: "GitHub",
    privacy: "Privacy",
  },
} as const;

export function BattutaCommunityPage({ locale }: { locale: BattutaLocale }) {
  const content = copy[locale];
  const isEnglish = locale === "en";
  const productPath = isEnglish ? battutaPaths.en : battutaPaths.zh;
  const communityPath = isEnglish ? battutaPaths.community.en : battutaPaths.community.zh;
  const otherCommunityPath = isEnglish ? battutaPaths.community.zh : battutaPaths.community.en;
  const privacyPath = isEnglish ? battutaPaths.privacy.en : battutaPaths.privacy.zh;

  return (
    <div className="battuta-product battuta-community battuta-community-library-page" lang={locale}>
      <nav className="battuta-subnav community-library-nav" aria-label={content.navigationLabel}>
        <div className="battuta-subnav-inner">
          <Link className="brand-lockup" href={productPath}>
            <Image src="/battuta/battuta-icon.png" alt="" width={68} height={68} priority />
            <span>Battuta</span>
          </Link>
          <div className="nav-links">
            <Link href={productPath}>{content.product}</Link>
            <Link className="community-nav-active" href={communityPath} aria-current="page">
              {content.community}
            </Link>
            <span className="locale-switcher" aria-label={content.switchLabel}>
              <span aria-current="page">{content.activeLocale}</span>
              <Link href={otherCommunityPath} lang={isEnglish ? "zh-CN" : "en"}>
                {content.targetLocale}
              </Link>
            </span>
            <a className="nav-download" href={`${productPath}#install`}>
              {content.download}
            </a>
          </div>
        </div>
      </nav>

      <BattutaSoundLibrary locale={locale} productPath={productPath} />

      <section className="battuta-product-footer community-library-footer" aria-label={content.community}>
        <div className="footer-inner">
          <Link className="brand-lockup" href={productPath}>
            <Image src="/battuta/battuta-icon.png" alt="" width={68} height={68} />
            <span>Battuta</span>
          </Link>
          <p>{content.footer}</p>
          <div>
            <a href={battutaRelease.repositoryUrl} target="_blank" rel="noreferrer">{content.source}</a>
            <Link href={privacyPath}>{content.privacy}</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
