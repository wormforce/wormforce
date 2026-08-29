import {
  getLatestBattutaDownloadUrl,
  latestBattutaReleaseUrl,
} from '@/lib/battuta-releases';

export async function GET() {
  const downloadUrl = await getLatestBattutaDownloadUrl('macos');
  return Response.redirect(downloadUrl ?? latestBattutaReleaseUrl, 307);
}
