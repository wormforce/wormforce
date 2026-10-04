import type { CommunityInstallDescriptor } from "./battuta-community";

export type ReleasePreview = {
  schemaVersion: 1; recipe: string; sha256: string; byteCount: number; path: string;
  sampleRate: number; bitDepth: number; channelCount: number; durationSeconds: number;
  peak: number; rms: number; peaks: number[];
};
export function parseReleasePreview(value: unknown, release: Pick<CommunityInstallDescriptor, "packId" | "releaseId">): ReleasePreview {
  const p = value as ReleasePreview;
  if (!p || p.schemaVersion !== 1 || p.recipe !== "slow-eight-keys-v1"
    || typeof p.sha256 !== "string" || !/^[a-f0-9]{64}$/.test(p.sha256)
    || !Number.isInteger(p.byteCount) || p.byteCount <= 44 || p.byteCount > 1152044
    || p.sampleRate !== 48000 || p.bitDepth !== 16 || p.channelCount !== 1
    || !Number.isFinite(p.durationSeconds) || p.durationSeconds <= 0 || p.durationSeconds > 12
    || Math.abs((p.byteCount - 44) / 96000 - p.durationSeconds) > 0.000001
    || ![p.peak, p.rms].every(n => Number.isFinite(n) && n >= 0 && n <= 1) || p.rms > p.peak
    || !Array.isArray(p.peaks) || p.peaks.length !== 256 || !p.peaks.every(n => Number.isFinite(n) && n >= 0 && n <= p.peak)
    || p.path !== `battuta/packs/${release.packId}/releases/${release.releaseId}/${p.sha256}.preview.wav`) throw Error("invalid_preview");
  return p;
}
export async function readReleasePreview(response: Response, release: Pick<CommunityInstallDescriptor, "packId" | "releaseId">) {
  if (!response.ok || response.headers.get("content-type")?.split(";")[0] !== "application/json" || !response.body) {
    await response.body?.cancel(); throw Error("preview_unavailable");
  }
  const reader = response.body.getReader(); const chunks: Uint8Array[] = []; let size = 0;
  for (;;) {
    const next = await reader.read(); if (next.done) break;
    size += next.value.length;
    if (size > 32768) { await reader.cancel(); throw Error("preview_too_large"); }
    chunks.push(next.value);
  }
  const bytes = new Uint8Array(size); let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  return parseReleasePreview(JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes)), release);
}
