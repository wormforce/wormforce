"use client";

import { useEffect, useRef, useState } from "react";
import { PauseIcon, PlayIcon } from "@phosphor-icons/react";
import type { CommunityInstallDescriptor } from "@/lib/battuta-community";
import { readReleasePreview, type ReleasePreview } from "@/lib/battuta-release-preview";
import { battutaPlaybackOwner } from "@/lib/battuta-playback-owner";

export function BattutaReleasePlayer({ release, en, variant = "detail" }: {
  release: CommunityInstallDescriptor; en: boolean; variant?: "card" | "detail";
}) {
  const root = useRef<HTMLElement>(null);
  const audio = useRef<HTMLAudioElement>(null);
  const owner = useRef(Symbol("battuta-release"));
  const playGeneration = useRef(0);
  const [preview, setPreview] = useState<ReleasePreview | null>(null);
  const [failed, setFailed] = useState(false);
  const [retry, setRetry] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [visible, setVisible] = useState(false);
  const base = `/api/battuta/community/v1/packs/${release.packId}/releases/${release.releaseId}`;
  useEffect(() => {
    if (!root.current) return;
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { setVisible(true); observer.disconnect(); }
    }, { rootMargin: "180px" });
    observer.observe(root.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!visible) return;
    const controller = new AbortController();
    void fetch(`${base}/preview.json`, { cache: "no-store", signal: AbortSignal.any([controller.signal, AbortSignal.timeout(20000)]) })
      .then(response => readReleasePreview(response, { packId: release.packId, releaseId: release.releaseId }))
      .then(value => { if (!controller.signal.aborted) setPreview(value); })
      .catch(() => { if (!controller.signal.aborted) setFailed(true); });
    return () => controller.abort();
  }, [base, visible, release.packId, release.releaseId, retry]);
  useEffect(() => battutaPlaybackOwner.register(owner.current, () => {
    playGeneration.current += 1;
    audio.current?.pause();
    setPlaying(false);
  }), []);
  const db = (value: number) => value === 0 ? "−∞" : (20 * Math.log10(value)).toFixed(1);
  return <section ref={root} className={`community-library-waveform-inspector community-release-player community-release-player-${variant}`} aria-label={`${en ? "Sound inspector" : "声音检查器"}: ${release.name}`}>
    <header><strong>{en ? "Sound inspector" : "声音检查器"}</strong><span>{en ? "Recorded samples · Slow key sequence" : "真实采样 · 慢速按键试听"}</span></header>
    {failed ? <div className="community-release-preview-status" role="status"><p>{en ? "Preview unavailable. Installation details remain below." : "试听暂不可用，安装信息仍可在下方查看。"}</p>
      <button type="button" onClick={() => { setFailed(false); setPreview(null); setRetry(value => value + 1); audio.current?.load(); }}>{en ? "Retry preview" : "重试试听"}</button></div>
      : !preview ? <p className="community-release-preview-status" role="status">{en ? "Loading real waveform…" : "正在加载真实波形…"}</p>
      : <>
        <div className="community-library-inspector-ruler" aria-hidden>
          {[0, 1 / 3, 2 / 3, 1].map((ratio, index) => <span key={index}>{(preview.durationSeconds * ratio).toFixed(1)}s</span>)}
        </div>
        <div className="community-release-waveform">
        <svg viewBox="0 0 512 120" width="100%" height="120" role="img" aria-label={en ? "Waveform from recorded samples" : "由真实采样生成的波形"}>
          <path d="M0 60H512" stroke="#636a65" strokeWidth="0.5" />
          {preview.peaks.map((peak, index) => {
            const amplitude = preview.peak > 0 ? peak / preview.peak * 54 : 0;
            return <line key={index} x1={index * 2} x2={index * 2} y1={60 - amplitude} y2={60 + amplitude}
              stroke={index / 256 < position / preview.durationSeconds ? "#caff36" : "#b0b6ae"} strokeWidth="1" />;
          })}
        </svg>
        </div>
        <dl className="community-library-signal-metrics">
          <div><dt>{en ? "Peak" : "峰值"}</dt><dd>{db(preview.peak)} dBFS</dd></div>
          <div><dt>RMS</dt><dd>{db(preview.rms)} dBFS</dd></div>
          <div><dt>{en ? "Duration" : "时长"}</dt><dd>{preview.durationSeconds.toFixed(2)} s</dd></div>
        </dl>
        <div className="community-release-transport">
        <button className="community-release-play" type="button" aria-label={`${playing ? (en ? "Pause" : "暂停") : (en ? "Play" : "试听")} ${release.name}`}
          onClick={() => {
            if (!audio.current) return;
            if (playing) { playGeneration.current += 1; audio.current.pause(); battutaPlaybackOwner.release(owner.current); }
            else {
              if (!battutaPlaybackOwner.claim(owner.current)) return;
              const generation = ++playGeneration.current;
              if (audio.current.ended) audio.current.currentTime = 0;
              void audio.current.play().catch(() => {
                if (generation === playGeneration.current && battutaPlaybackOwner.owns(owner.current)) {
                  setFailed(true); battutaPlaybackOwner.release(owner.current);
                }
              });
            }
          }}>{playing ? <PauseIcon size={20} weight="fill" aria-hidden /> : <PlayIcon size={20} weight="fill" aria-hidden />}</button>
        <div className="community-release-seek">
        <input type="range" aria-label={en ? "Preview position" : "试听进度"} min="0" max={preview.durationSeconds} step="0.01" value={Math.min(position, preview.durationSeconds)}
          onChange={event => { const next = Number(event.target.value); if (audio.current && Number.isFinite(audio.current.duration)) audio.current.currentTime = next; setPosition(next); }} />
        <span>{position.toFixed(1)} / {preview.durationSeconds.toFixed(1)} s</span>
        </div></div>
      </>}
    <audio ref={audio} src={`${base}/preview.wav`} preload="none"
      onPlay={() => { if (!battutaPlaybackOwner.owns(owner.current)) { audio.current?.pause(); return; } setPlaying(true); }} onPause={() => setPlaying(false)}
      onEnded={() => { setPlaying(false); battutaPlaybackOwner.release(owner.current); }} onTimeUpdate={() => setPosition(audio.current?.currentTime ?? 0)}
      onError={() => { setFailed(true); setPlaying(false); battutaPlaybackOwner.release(owner.current); }} />
  </section>;
}
