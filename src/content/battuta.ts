export const battutaRelease = {
  version: "1.2.1",
  updatedAt: "2026-08-28",
  repositoryUrl: "https://github.com/wormforce/battuta",
  releaseUrl: "https://github.com/wormforce/battuta/releases/tag/v1.2.1",
  macDownloadUrl:
    "https://github.com/wormforce/battuta/releases/download/v1.2.1/Battuta-1.2.1-unnotarized.dmg",
  windowsPortableDownloadUrl:
    "https://github.com/wormforce/battuta/releases/download/v1.2.1/Battuta-Windows-1.2.1-win-x64.zip",
  windowsStoreUrl: "https://apps.microsoft.com/detail/9NDHDBM6F3DR",
  licenseUrl: "https://github.com/wormforce/battuta/blob/main/LICENSE",
} as const;

export type BattutaLocale = "zh-CN" | "en";

export const battutaPaths = {
  zh: "/projects/battuta",
  en: "/en/projects/battuta",
  privacy: {
    zh: "/projects/battuta/privacy",
    en: "/en/projects/battuta/privacy",
  },
} as const;

export const battutaGuidePaths = {
  macos: "/projects/battuta/guides/keyboard-sounds-macos",
  windows: "/projects/battuta/guides/keyboard-sounds-windows",
} as const;
