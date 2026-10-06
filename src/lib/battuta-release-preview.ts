import type { CommunityInstallDescriptor } from "./battuta-community";

export type ReleasePreview = {
  schemaVersion: 1; recipe: string; sha256: string; byteCount: number; path: string;
  sampleRate: number; bitDepth: number; channelCount: number; durationSeconds: number;
  peak: number; rms: number; peaks: number[];
};

export type ReleaseInspection = {
  durationSeconds: number; peak: number; rms: number; points: number[]; markers: number[];
};

// slow-eight-keys-v1 starts its first press at 0.25s and release at 0.37s.
// Inspect actual PCM, not the 256 coarse buckets for the entire six-second demo.
export function inspectReleasePCM(bytes: Uint8Array, preview: ReleasePreview): ReleaseInspection {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const ascii = (offset: number, count: number) => String.fromCharCode(...bytes.subarray(offset, offset + count));
  if (bytes.length !== preview.byteCount || bytes.length < 44
    || ascii(0, 4) !== "RIFF" || view.getUint32(4, true) !== bytes.length - 8
    || ascii(8, 8) !== "WAVEfmt " || view.getUint32(16, true) !== 16
    || view.getUint16(20, true) !== 1 || view.getUint16(22, true) !== 1
    || view.getUint32(24, true) !== 48000 || view.getUint32(28, true) !== 96000
    || view.getUint16(32, true) !== 2 || view.getUint16(34, true) !== 16
    || ascii(36, 4) !== "data" || view.getUint32(40, true) !== bytes.length - 44) throw Error("invalid_preview_pcm");
  const startSeconds = 0.238; // 12ms of lead-in, preserving the transient.
  const durationSeconds = 0.25;
  const start = Math.round(startSeconds * preview.sampleRate);
  const count = Math.round(durationSeconds * preview.sampleRate);
  if (start + count > (bytes.length - 44) / 2) throw Error("preview_inspection_too_short");
  const values = Array.from({ length: count }, (_, index) => Math.abs(view.getInt16(44 + (start + index) * 2, true) / 32768));
  const peak = Math.max(...values);
  const rms = Math.sqrt(values.reduce((sum, value) => sum + value * value, 0) / count);
  const points = Array.from({ length: 1024 }, (_, index) => {
    const from = Math.floor(index * count / 1024);
    const to = Math.max(from + 1, Math.floor((index + 1) * count / 1024));
    return peak === 0 ? 0 : Math.max(...values.slice(from, to)) / peak;
  });
  return { durationSeconds, peak, rms, points, markers: [0.012 / durationSeconds, 0.132 / durationSeconds] };
}

export async function readReleaseInspection(response: Response, preview: ReleasePreview): Promise<ReleaseInspection> {
  if (!response.ok || response.headers.get("content-type")?.split(";")[0] !== "audio/wav" || !response.body) {
    await response.body?.cancel(); throw Error("preview_pcm_unavailable");
  }
  const reader = response.body.getReader(); const chunks: Uint8Array[] = []; let size = 0;
  for (;;) {
    const next = await reader.read(); if (next.done) break;
    size += next.value.length;
    if (size > preview.byteCount) { await reader.cancel(); throw Error("preview_pcm_too_large"); }
    chunks.push(next.value);
  }
  const bytes = new Uint8Array(size); let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  const hash = Array.from(new Uint8Array(digest), value => value.toString(16).padStart(2, "0")).join("");
  if (hash !== preview.sha256) throw Error("preview_pcm_checksum");
  return inspectReleasePCM(bytes, preview);
}

export function releaseEnvelopePath(points: number[]): string {
  if (!points.length) return "";
  const upper = points.map((point, index) => `${index / Math.max(1, points.length - 1) * 512},${60 - point * 51.6}`);
  const lower = points.map((point, index) => `${index / Math.max(1, points.length - 1) * 512},${60 + point * 51.6}`).reverse();
  return `M${upper.join("L")}L${lower.join("L")}Z`;
}
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
