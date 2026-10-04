"use client";
import Image from "next/image";
import { KeyboardIcon, UserCircleIcon } from "@phosphor-icons/react";
import type { BattutaLocale } from "@/content/battuta";
import type { CommunityInstallDescriptor } from "@/lib/battuta-community";
import type { CommunityPresentation } from "@/lib/battuta-community-catalog";
import { releaseSwitchIllustration } from "@/lib/battuta-atlas-catalog";
import { BattutaCommunityInstallButton } from "./battuta-community-install-button";
import { BattutaReleasePlayer } from "./battuta-release-player";

export function BattutaReleaseCard({ release, presentation, locale, productPath }: {
  release: CommunityInstallDescriptor; presentation?: CommunityPresentation; locale: BattutaLocale; productPath: string;
}) {
  const en = locale === "en";
  const illustration = releaseSwitchIllustration(presentation);
  return <article className="community-library-sound-card community-release-card" data-source="published" id={`release-${release.releaseId}`}>
    <div className="community-library-card-body">
      <div className="community-library-card-product">
        <header className="community-library-sound-header">
          <span className="community-library-brand-name">{presentation?.manufacturer || (en ? "Independent recording" : "独立录音")}</span>
          <h3 title={release.name}>{release.name}</h3>
          <p>{presentation?.switchModel || (en ? "Creator sound pack" : "创作者音色包")}</p>
          <span className="community-release-status">{en ? "Reviewed · Installable" : "已审核 · 可安装"}</span>
        </header>
        <figure className="community-library-switch-visual community-release-visual">
          {illustration ? <Image src={illustration} alt={en ? "Illustrative switch, not the creator's recording hardware" : "轴体示意，非作者录音实物照片"}
            fill sizes="(max-width: 900px) 235px, 225px" /> :
            <div className="community-release-creator-visual"><KeyboardIcon size={92} weight="duotone" aria-hidden /><span>{presentation?.manufacturer || "Battuta"}</span></div>}
          <figcaption>{en ? "Illustration · Not a hardware photo" : "视觉示意 · 非录音实物照片"}</figcaption>
        </figure>
      </div>
      <BattutaReleasePlayer release={release} en={en} variant="card" />
    </div>
    <footer className="community-library-sound-meta">
      <div className="community-library-provenance">
        <span className="community-library-author-mark"><UserCircleIcon size={20} weight="fill" aria-hidden /></span>
        <span><strong title={presentation?.recordingAuthor || release.author.displayName}>{presentation?.recordingAuthor || release.author.displayName}</strong>
          <small>{release.license.name} · v{release.displayVersion}</small></span>
      </div>
      <BattutaCommunityInstallButton release={release} locale={locale} productPath={productPath} label={en ? "Install" : "安装"} />
    </footer>
    <details className="community-release-details"><summary>{en ? "Recording & release details" : "录音与版本信息"}</summary>
      {presentation?.description && <p>{presentation.description}</p>}
      <dl>
        <div><dt>{en ? "Uploaded by" : "上传者"}</dt><dd>{release.author.displayName}</dd></div>
        <div><dt>{en ? "Recording author" : "录音作者"}</dt><dd>{presentation?.recordingAuthor || (en ? "Not specified" : "未单独注明")}</dd></div>
        <div><dt>{en ? "License" : "许可"}</dt><dd>{release.license.name}</dd></div>
        <div><dt>{en ? "Package size" : "包大小"}</dt><dd>{(release.artifact.byteCount / 1024).toFixed(1)} KB</dd></div>
      </dl>
      <p>macOS ≥ {release.minimumBattutaVersion.macos} · Windows ≥ {release.minimumBattutaVersion.windows}</p>
      <p>SHA-256: {release.artifact.sha256}</p>
      <p>{en ? "The switch brand does not imply an official manufacturer submission." : "轴体品牌不代表该作品由厂家官方投稿。"}</p>
    </details>
  </article>;
}
