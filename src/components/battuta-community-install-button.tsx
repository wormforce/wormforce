"use client";

import { useState } from "react";
import type { BattutaLocale } from "@/content/battuta";
import { communityCompatibilityLabel, communityInstallLink, type CommunityInstallDescriptor } from "@/lib/battuta-community";

/** A browser cannot reliably detect protocol registration or installation success. */
export function BattutaCommunityInstallButton({ release, locale, productPath, label }: {
  release: CommunityInstallDescriptor;
  locale: BattutaLocale;
  productPath: string;
  label?: string;
}) {
  const [requested, setRequested] = useState(false);
  const [windowsBlocked, setWindowsBlocked] = useState(false);
  const en = locale === "en";
  const macOnly = release.minimumBattutaVersion.windows === null;
  return (
    <div className="community-install-action">
      <a className="button button-primary community-install-button"
        href={communityInstallLink(release)} onClick={(event) => {
          if (macOnly && /Windows/i.test(navigator.userAgent)) {
            event.preventDefault();
            setWindowsBlocked(true);
            return;
          }
          setWindowsBlocked(false);
          setRequested(true);
        }}>
        {label ?? (en ? "Install with Battuta" : "安装到 Battuta")}{macOnly ? " · Mac" : ""}
      </a>
      {windowsBlocked && <p role="status">{en ? "This release is currently available on Mac only. Windows installation is not enabled yet." : "此版本目前仅限 Mac，Windows 安装暂未开放。"}</p>}
      {requested && (
        <div className="community-install-feedback" role="status">
          <p>{en
            ? "Allow your browser to open Battuta, then confirm installation in the app. This page cannot tell whether installation succeeded."
            : "请允许浏览器打开 Battuta，然后在应用中确认安装。网页不会自动判断安装是否成功。"}</p>
          <p>{en ? "Nothing opened? Install or update Battuta, then click the button again." : "没有打开？请先安装或更新 Battuta，再点击一次安装按钮。"}</p>
          <p>{communityCompatibilityLabel(release, en)}</p>
          <a href={`${productPath}#install`}>{en ? "Download Battuta" : "下载 Battuta"} →</a>
        </div>
      )}
    </div>
  );
}
