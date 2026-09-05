const battutaRepositoryUrl = 'https://github.com/wormforce/battuta';
const battutaReleasesApiUrl = 'https://api.github.com/repos/wormforce/battuta/releases?per_page=20';

export const latestBattutaReleaseUrl = `${battutaRepositoryUrl}/releases/latest`;

export type BattutaPlatform = 'macos' | 'windows';

type GitHubReleaseAsset = {
  browser_download_url: string;
  name: string;
};

type GitHubRelease = {
  assets: GitHubReleaseAsset[];
  created_at: string;
  draft: boolean;
  prerelease: boolean;
  published_at: string | null;
  tag_name: string;
};

const assetPatterns: Record<BattutaPlatform, RegExp> = {
  macos: /^Battuta-\d+\.\d+\.\d+-unnotarized\.dmg$/,
  windows: /^Battuta-Windows-\d+\.\d+\.\d+-win-x64\.zip$/,
};

async function getPublishedBattutaReleases(): Promise<GitHubRelease[]> {
  try {
    const response = await fetch(battutaReleasesApiUrl, {
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'wormforce.net',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      return [];
    }

    const releases = (await response.json()) as GitHubRelease[];
    return releases
      .filter((release) => !release.draft && !release.prerelease && release.published_at)
      .sort(
        (left, right) =>
          Date.parse(right.created_at) - Date.parse(left.created_at),
      );
  } catch {
    return [];
  }
}

export async function getLatestBattutaVersion(): Promise<string> {
  const releases = await getPublishedBattutaReleases();
  const version = releases[0]?.tag_name.match(/^v(\d+\.\d+\.\d+)$/)?.[1];
  return version ?? '1.2.1';
}

export async function getLatestBattutaDownloadUrl(
  platform: BattutaPlatform,
): Promise<string | null> {
  const releases = await getPublishedBattutaReleases();

  for (const release of releases) {
    const asset = release.assets.find(({ name }) => assetPatterns[platform].test(name));
    if (!asset) {
      continue;
    }

    try {
      const downloadUrl = new URL(asset.browser_download_url);
      const expectedPathPrefix = '/wormforce/battuta/releases/download/';
      if (
        downloadUrl.protocol === 'https:' &&
        downloadUrl.hostname === 'github.com' &&
        downloadUrl.pathname.startsWith(expectedPathPrefix)
      ) {
        return downloadUrl.toString();
      }
    } catch {
      continue;
    }
  }

  return null;
}
