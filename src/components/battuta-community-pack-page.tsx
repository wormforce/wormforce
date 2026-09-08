import Image from "next/image";
import Link from "next/link";
import {
  battutaPaths,
  battutaRelease,
  type BattutaLocale,
} from "@/content/battuta";
import {
  communityInstallLink,
  communityPackPath,
  getLatestBattutaCommunityRelease,
  type BattutaCommunityPack,
} from "@/lib/battuta-community";

const copy = {
  "zh-CN": {
    navigationLabel: "Battuta 社区音色详情导航",
    product: "产品页",
    community: "社区音色",
    switchLabel: "切换为英文",
    activeLocale: "ZH",
    targetLocale: "EN",
    back: "返回社区目录",
    reviewed: "Wormforce 审核发布",
    by: "作者",
    version: "版本",
    license: "许可证",
    attribution: "署名要求",
    archive: "下载大小",
    minimum: "最低 Battuta 版本",
    published: "发布时间",
    preview: "试听",
    previewFallback: "你的浏览器不支持音频试听。",
    install: "用 Battuta 安装",
    installNote: "按钮只把音色与发布版本的两个固定 ID 交给 Battuta；下载地址、大小和 SHA-256 由应用从 Wormforce API 获取并重新验证。",
    needApp: "还没有 Battuta？",
    downloadApp: "先下载 macOS 或 Windows 版",
    releases: "版本记录",
    latest: "当前版本",
    installRelease: "安装此版本",
    noRelease: "这个音色暂时没有可安装版本。",
    footer: "输入内容、本地统计和 DIY 音频不会因安装社区音色而上传。",
    privacy: "隐私政策",
  },
  en: {
    navigationLabel: "Battuta community sound detail navigation",
    product: "Product",
    community: "Community",
    switchLabel: "Switch to Chinese",
    activeLocale: "EN",
    targetLocale: "ZH",
    back: "Back to the catalog",
    reviewed: "Reviewed and published by Wormforce",
    by: "Creator",
    version: "Version",
    license: "License",
    attribution: "Attribution",
    archive: "Download size",
    minimum: "Minimum Battuta version",
    published: "Published",
    preview: "Preview",
    previewFallback: "Your browser does not support audio previews.",
    install: "Install with Battuta",
    installNote: "This button gives Battuta only two pinned IDs for the sound and release. The app obtains the URL, size, and SHA-256 from the Wormforce API and verifies them again.",
    needApp: "Need Battuta first?",
    downloadApp: "Download the macOS or Windows app",
    releases: "Release history",
    latest: "Current release",
    installRelease: "Install this release",
    noRelease: "This sound does not have an installable release yet.",
    footer: "Installing a community sound never uploads typed content, local statistics, or DIY audio.",
    privacy: "Privacy",
  },
} as const;

function formatBytes(byteCount: number, locale: BattutaLocale) {
  return new Intl.NumberFormat(locale, {
    style: "unit",
    unit: "megabyte",
    maximumFractionDigits: 1,
  }).format(byteCount / 1_000_000);
}

function formatDate(value: string, locale: BattutaLocale) {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

export function BattutaCommunityPackPage({
  locale,
  pack,
}: {
  locale: BattutaLocale;
  pack: BattutaCommunityPack;
}) {
  const content = copy[locale];
  const isEnglish = locale === "en";
  const productPath = isEnglish ? battutaPaths.en : battutaPaths.zh;
  const communityPath = isEnglish ? battutaPaths.community.en : battutaPaths.community.zh;
  const privacyPath = isEnglish ? battutaPaths.privacy.en : battutaPaths.privacy.zh;
  const otherLocale: BattutaLocale = isEnglish ? "zh-CN" : "en";
  const latestRelease = getLatestBattutaCommunityRelease(pack);

  return (
    <div className="battuta-product battuta-community community-pack-page" lang={locale}>
      <nav className="battuta-subnav" aria-label={content.navigationLabel}>
        <div className="battuta-subnav-inner">
          <Link className="brand-lockup" href={productPath}>
            <Image src="/battuta/battuta-icon.png" alt="" width={68} height={68} />
            <span>Battuta</span>
          </Link>
          <div className="nav-links">
            <Link href={productPath}>{content.product}</Link>
            <Link className="community-nav-active" href={communityPath}>{content.community}</Link>
            <span className="locale-switcher" aria-label={content.switchLabel}>
              <span aria-current="page">{content.activeLocale}</span>
              <Link href={communityPackPath(pack, otherLocale)} lang={isEnglish ? "zh-CN" : "en"}>
                {content.targetLocale}
              </Link>
            </span>
          </div>
        </div>
      </nav>

      <div className="community-pack-hero dark-section">
        <div className="section-inner community-pack-hero-grid">
          <div className="community-pack-art">
            {pack.coverImage ? (
              <Image src={pack.coverImage} alt="" width={1200} height={1200} priority />
            ) : (
              <div className="community-pack-art-placeholder" aria-hidden>{pack.name.slice(0, 1)}</div>
            )}
          </div>
          <div className="community-pack-copy">
            <Link className="community-pack-back" href={communityPath}>← {content.back}</Link>
            <p className="section-kicker lime">{content.reviewed}</p>
            <h1>{pack.name}</h1>
            <p className="community-pack-summary">{pack.description[locale]}</p>
            <div className="community-pack-tags" aria-label={pack.tags[locale].join(", ")}>
              {pack.tags[locale].map((tag) => <span key={tag}>{tag}</span>)}
            </div>

            {latestRelease ? (
              <>
                <dl className="community-pack-facts">
                  <div><dt>{content.by}</dt><dd>{latestRelease.author.displayName}</dd></div>
                  <div><dt>{content.version}</dt><dd>{latestRelease.displayVersion}</dd></div>
                  <div>
                    <dt>{content.license}</dt>
                    <dd>
                      {latestRelease.license.url ? (
                        <a href={latestRelease.license.url} target="_blank" rel="noreferrer">{latestRelease.license.name} ↗</a>
                      ) : latestRelease.license.name}
                    </dd>
                  </div>
                  {latestRelease.license.attribution ? (
                    <div><dt>{content.attribution}</dt><dd>{latestRelease.license.attribution}</dd></div>
                  ) : null}
                  <div><dt>{content.archive}</dt><dd>{formatBytes(latestRelease.artifact.byteCount, locale)}</dd></div>
                  <div><dt>{content.minimum}</dt><dd>macOS {latestRelease.minimumBattutaVersion.macos} · Windows {latestRelease.minimumBattutaVersion.windows}</dd></div>
                  <div><dt>{content.published}</dt><dd>{formatDate(latestRelease.publishedAt, locale)}</dd></div>
                </dl>

                {pack.previewAudio ? (
                  <div className="community-pack-preview">
                    <p>{content.preview}</p>
                    <audio controls preload="none" aria-label={content.preview}>
                      <source src={pack.previewAudio} />
                      {content.previewFallback}
                    </audio>
                  </div>
                ) : null}

                <a className="button button-primary community-install-button" href={communityInstallLink(latestRelease)}>
                  {content.install}
                </a>
                <p className="community-install-note">{content.installNote}</p>
              </>
            ) : <p>{content.noRelease}</p>}

            <p className="community-need-app">
              {content.needApp} <Link href={`${productPath}#install`}>{content.downloadApp} →</Link>
            </p>
          </div>
        </div>
      </div>

      {pack.releases.length > 0 ? (
        <section className="community-release-section light-section">
          <div className="section-inner">
            <p className="section-kicker green">{content.releases}</p>
            <div className="community-release-list">
              {[...pack.releases].sort((a, b) => b.releaseSequence - a.releaseSequence).map((release) => (
                <article key={release.releaseId}>
                  <div>
                    <span>{release.releaseId === pack.latestReleaseId ? content.latest : `#${release.releaseSequence}`}</span>
                    <h2>{release.displayVersion}</h2>
                    <p>{formatDate(release.publishedAt, locale)} · {formatBytes(release.artifact.byteCount, locale)}</p>
                  </div>
                  <a className="button button-outline-dark" href={communityInstallLink(release)}>{content.installRelease}</a>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="battuta-product-footer" aria-label={content.community}>
        <div className="footer-inner">
          <Link className="brand-lockup" href={productPath}>
            <Image src="/battuta/battuta-icon.png" alt="" width={68} height={68} />
            <span>Battuta</span>
          </Link>
          <p>{content.footer}</p>
          <div>
            <a href={battutaRelease.repositoryUrl} target="_blank" rel="noreferrer">GitHub</a>
            <Link href={privacyPath}>{content.privacy}</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
