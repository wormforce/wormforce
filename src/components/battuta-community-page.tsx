import Image from "next/image";
import Link from "next/link";
import {
  battutaPaths,
  battutaRelease,
  type BattutaLocale,
} from "@/content/battuta";
import {
  battutaCommunityPacks,
  communityPackPath,
  getLatestBattutaCommunityRelease,
} from "@/lib/battuta-community";

const copy = {
  "zh-CN": {
    navigationLabel: "Battuta 社区音色导航",
    product: "产品页",
    community: "社区音色",
    download: "下载 Battuta",
    switchLabel: "切换为英文",
    activeLocale: "ZH",
    targetLocale: "EN",
    heroKicker: "Battuta Community · 官方审核发布",
    heroKickerComing: "Battuta Community · 首批音色准备中",
    heroTitle: "让每一种手感，",
    heroAccent: "都有自己的声音。",
    heroBody:
      "发现由创作者录制、由 Battuta 校验的键盘音色。查看作者与许可后，一次点击即可交给桌面端安全安装。",
    heroBodyComing:
      "社区目录、审核规则和安装协议正在准备中。支持社区安装的 macOS 与 Windows 新版 Battuta 会和首批审核音色一同发布。",
    browse: "浏览已发布音色",
    browseComing: "查看社区计划",
    makePack: "了解 DIY 音色制作",
    metricPacks: "已发布音色",
    metricSafety: "下载前完整校验",
    metricPlatforms: "macOS + Windows",
    catalogKicker: "已审核目录",
    catalogTitle: "找到下一把不存在于桌面的键盘。",
    catalogBody: "每个版本都有固定 UUID、大小与 SHA-256；同一发布内容不会被静默替换。",
    emptyTitle: "首批社区音色正在准备中。",
    emptyBody:
      "第一批音色会在录音来源、许可与包格式通过审核，并且支持社区安装的双端客户端发布后出现在这里。",
    emptyAction: "先下载 Battuta",
    trustKicker: "从网页到本地，边界清楚",
    trustTitle: "安装链接很短，验证流程很完整。",
    trustCards: [
      ["01", "发布不可变", "链接固定到具体版本；更正必须发布新的版本 ID。"],
      ["02", "许可先展示", "安装前先看到作者、许可证、版本与压缩包大小。"],
      ["03", "本地修改受保护", "更新发现用户修改时会先询问，并可保留一份副本。"],
    ],
    footer: "社区音色由 Wormforce 审核发布，输入内容与本地统计不会上传。",
    source: "GitHub",
    privacy: "隐私政策",
  },
  en: {
    navigationLabel: "Battuta community sound navigation",
    product: "Product",
    community: "Community",
    download: "Download Battuta",
    switchLabel: "Switch to Chinese",
    activeLocale: "EN",
    targetLocale: "ZH",
    heroKicker: "Battuta Community · Curated releases",
    heroKickerComing: "Battuta Community · First releases in progress",
    heroTitle: "Give every feel",
    heroAccent: "a sound of its own.",
    heroBody:
      "Discover keyboard recordings made by creators and checked by Battuta. Review the author and license, then hand a pinned release to the desktop app in one click.",
    heroBodyComing:
      "The catalog, review rules, and install contract are being prepared. New macOS and Windows builds with community installation will launch with the first reviewed sounds.",
    browse: "Browse published sounds",
    browseComing: "See the community plan",
    makePack: "Learn about DIY sound packs",
    metricPacks: "Published sounds",
    metricSafety: "Verified before install",
    metricPlatforms: "macOS + Windows",
    catalogKicker: "Curated catalog",
    catalogTitle: "Find the next keyboard that does not sit on your desk.",
    catalogBody:
      "Every release has a pinned UUID, byte count, and SHA-256. Published bytes cannot be silently replaced.",
    emptyTitle: "The first community sounds are being prepared.",
    emptyBody:
      "Packs will appear after their recording source, license, and package format pass review and community-capable builds ship for both desktop platforms.",
    emptyAction: "Download Battuta first",
    trustKicker: "Clear boundaries from web to desktop",
    trustTitle: "The link stays small. The verification does not.",
    trustCards: [
      ["01", "Immutable releases", "Each link pins one release. Corrections receive a new release ID."],
      ["02", "License before install", "See the creator, license, version, and archive size before writing anything."],
      ["03", "Local edits stay protected", "Updates ask before replacing a modified pack and can preserve a copy."],
    ],
    footer: "Community sounds are reviewed by Wormforce. Typed content and local statistics are never uploaded.",
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
  const hasPublishedPacks = battutaCommunityPacks.length > 0;

  return (
    <div className="battuta-product battuta-community" lang={locale}>
      <nav className="battuta-subnav" aria-label={content.navigationLabel}>
        <div className="battuta-subnav-inner">
          <Link className="brand-lockup" href={productPath}>
            <Image src="/battuta/battuta-icon.png" alt="" width={68} height={68} />
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

      <header className="community-hero" id="top">
        <div className="section-inner community-hero-grid">
          <div className="community-hero-copy">
            <p className="section-kicker lime">
              {hasPublishedPacks ? content.heroKicker : content.heroKickerComing}
            </p>
            <h1>
              {content.heroTitle}
              <span>{content.heroAccent}</span>
            </h1>
            <p>{hasPublishedPacks ? content.heroBody : content.heroBodyComing}</p>
            <div className="hero-actions">
              <a className="button button-primary" href="#packs">
                {hasPublishedPacks ? content.browse : content.browseComing}
              </a>
              <a className="button button-secondary" href={`${productPath}#install`}>{content.makePack}</a>
            </div>
          </div>
          <div className="community-hero-mark" aria-hidden="true">
            <span className="community-hero-key">B</span>
            <span className="community-hero-wave community-hero-wave-one" />
            <span className="community-hero-wave community-hero-wave-two" />
          </div>
          <div className="community-metrics">
            <div><strong>{battutaCommunityPacks.length}</strong><span>{content.metricPacks}</span></div>
            <div><strong>SHA-256</strong><span>{content.metricSafety}</span></div>
            <div><strong>2</strong><span>{content.metricPlatforms}</span></div>
          </div>
        </div>
      </header>

      <div>
        <section className="community-catalog light-section" id="packs">
          <div className="section-inner">
            <div className="community-section-heading">
              <div>
                <p className="section-kicker green">{content.catalogKicker}</p>
                <h2>{content.catalogTitle}</h2>
              </div>
              <p>{content.catalogBody}</p>
            </div>

            {battutaCommunityPacks.length > 0 ? (
              <div className="community-pack-grid">
                {battutaCommunityPacks.map((pack) => {
                  const release = getLatestBattutaCommunityRelease(pack);
                  return release ? (
                    <Link className="community-pack-card" href={communityPackPath(pack, locale)} key={pack.packId}>
                      {pack.coverImage ? (
                        <Image src={pack.coverImage} alt="" width={960} height={640} />
                      ) : (
                        <div className="community-pack-placeholder" aria-hidden>{pack.name.slice(0, 1)}</div>
                      )}
                      <div>
                        <p>{release.author.displayName}</p>
                        <h3>{pack.name}</h3>
                        <span>{pack.summary[locale]}</span>
                      </div>
                    </Link>
                  ) : null;
                })}
              </div>
            ) : (
              <div className="community-empty-state">
                <div className="community-empty-icon" aria-hidden>⌁</div>
                <div>
                  <p className="community-empty-label">CATALOG 00</p>
                  <h3>{content.emptyTitle}</h3>
                  <p>{content.emptyBody}</p>
                </div>
                <a className="button button-primary" href={`${productPath}#install`}>{content.emptyAction}</a>
              </div>
            )}
          </div>
        </section>

        <section className="community-trust dark-section">
          <div className="section-inner">
            <div className="community-trust-heading">
              <p className="section-kicker lime">{content.trustKicker}</p>
              <h2>{content.trustTitle}</h2>
            </div>
            <div className="community-trust-grid">
              {content.trustCards.map(([number, title, body]) => (
                <article key={number}>
                  <span>{number}</span>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>

      <section className="battuta-product-footer" aria-label={content.community}>
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
