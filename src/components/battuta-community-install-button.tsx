"use client";

import { useState } from "react";
import type { BattutaLocale } from "@/content/battuta";
import { communityInstallLink, type CommunityInstallDescriptor } from "@/lib/battuta-community";

/** A browser cannot reliably detect protocol registration or installation success. */
export function BattutaCommunityInstallButton({ release, locale, productPath, label }: {
  release: CommunityInstallDescriptor;
  locale: BattutaLocale;
  productPath: string;
  label?: string;
}) {
  const [requested, setRequested] = useState(false);
  const en = locale === "en";
  return (
    <div className="community-install-action">
      <a className="button button-primary community-install-button"
        href={communityInstallLink(release)} onClick={() => setRequested(true)}>
        {label ?? (en ? "Install with Battuta" : "安装到 Battuta")}
      </a>
      {requested && (
        <div className="community-install-feedback" role="status">
          <p>{en
            ? "Allow your browser to open Battuta, then confirm installation in the app. This page cannot tell whether installation succeeded."
            : "请允许浏览器打开 Battuta，然后在应用中确认安装。网页不会自动判断安装是否成功。"}</p>
          <p>{en ? "Nothing opened? Install or update Battuta, then click the button again." : "没有打开？请先安装或更新 Battuta，再点击一次安装按钮。"}</p>
          <p>macOS ≥ {release.minimumBattutaVersion.macos} · Windows ≥ {release.minimumBattutaVersion.windows}</p>
          <a href={`${productPath}#install`}>{en ? "Download Battuta" : "下载 Battuta"} →</a>
        </div>
      )}
    </div>
  );
}
