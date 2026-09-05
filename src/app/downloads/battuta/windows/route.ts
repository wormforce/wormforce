import {
  getLatestBattutaDownloadUrl,
  latestBattutaReleaseUrl,
} from '@/lib/battuta-releases';

export async function GET() {
  const downloadUrl = await getLatestBattutaDownloadUrl('windows');
  return Response.redirect(downloadUrl ?? latestBattutaReleaseUrl, 307);
}
