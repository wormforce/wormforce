"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { BattutaLocale } from "@/content/battuta";
import { type CommunityInstallDescriptor } from "@/lib/battuta-community";
import { readCatalogResponse, type CommunityPresentation } from "@/lib/battuta-community-catalog";
import { BattutaCommunityInstallButton } from "@/components/battuta-community-install-button";
import { BattutaReleasePlayer } from "@/components/battuta-release-player";

export function BattutaPublishedPacks({ locale, productPath }: { locale: BattutaLocale; productPath: string }) {
  const en = locale === "en";
  const [releases, setReleases] = useState<CommunityInstallDescriptor[]>([]);
  const [presentations, setPresentations] = useState<Record<string, CommunityPresentation>>({});
  const [filters, setFilters] = useState("");
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const pending = useRef<AbortController | null>(null);
  const load = useCallback(async (after: string | null) => {
    pending.current?.abort();
    const controller = new AbortController(); pending.current = controller;
    setLoading(true); setFailed(false);
    if (!after) { setReleases([]); setPresentations({}); setCursor(null); }
    try {
      const query = new URLSearchParams(filters);
      if (after) query.set("after", after);
      const response = await fetch(`/api/battuta/community/v1/packs?${query}`, {
        cache: "no-store", signal: AbortSignal.any([controller.signal, AbortSignal.timeout(20000)]),
      });
      const page = await readCatalogResponse(response);
      if (controller.signal.aborted) return;
      if (after && page.nextCursor && page.nextCursor <= after) throw Error("catalog_cursor_did_not_advance");
      setReleases(previous => {
        const merged = new Map((after ? previous : []).map(item => [item.packId, item]));
        for (const item of page.releases) merged.set(item.packId, item);
        return [...merged.values()];
      });
      setCursor(page.nextCursor); setLoaded(true);
      setPresentations(previous => ({ ...(after ? previous : {}), ...page.presentations }));
    } catch { if (!controller.signal.aborted) setFailed(true); }
    finally { if (!controller.signal.aborted) setLoading(false); }
  }, [filters]);
  useEffect(() => { void load(null); return () => pending.current?.abort(); }, [load]);
  return (
    <section id="published-packs" className="community-published-packs light-section" aria-labelledby="published-packs-heading">
      <div className="section-inner">
        <p className="section-kicker green">{en ? "COMMUNITY RELEASES" : "社区发布"}</p>
        <h2 id="published-packs-heading">{en ? "Ready to install" : "可安装的社区音色"}</h2>
        <p>{en ? "Reviewed releases, installed and verified by Battuta. Separate from the built-in listening demos." : "审核发布后，由 Battuta 下载校验并安装；与内置试听示范分开显示。"}</p>
        <form role="search" aria-label={en ? "Search community releases" : "搜索社区音色"}
          style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBlock: 24 }}
          onSubmit={event => {
            event.preventDefault(); const data = new FormData(event.currentTarget); const query = new URLSearchParams();
            for (const key of ["q", "manufacturer", "switchType", "author"]) { const value = String(data.get(key) ?? "").trim(); if (value) query.set(key, value); }
            const next = query.toString(); if (next === filters) void load(null); else setFilters(next);
          }}>
          <label>{en ? "Search" : "搜索"}<input name="q" maxLength={160} placeholder={en ? "Name, switch or author" : "音色、型号或作者"} /></label>
          <label>{en ? "Brand" : "品牌"}<input name="manufacturer" maxLength={80} placeholder={en ? "All brands" : "全部品牌（填写完整名称）"} /></label>
          <label>{en ? "Creator" : "创作者"}<input name="author" maxLength={160} placeholder={en ? "Recording author or uploader" : "录音作者或上传者"} /></label>
          <label>{en ? "Switch type" : "轴体类型"}<select name="switchType" defaultValue="">
            <option value="">{en ? "All types" : "全部类型"}</option>
            {[["linear", "线性轴", "Linear"], ["tactile", "段落轴", "Tactile"], ["clicky", "点击轴", "Clicky"], ["silent", "静音", "Silent"], ["electrocapacitive", "静电容", "Electrocapacitive"], ["magnetic", "磁轴", "Magnetic"], ["other", "其他", "Other"]].map(([id, zh, english]) => <option key={id} value={id}>{en ? english : zh}</option>)}
          </select></label>
          <button type="submit">{en ? "Apply" : "筛选"}</button>
          <button type="reset" onClick={() => { if (!filters) void load(null); else setFilters(""); }}>{en ? "Clear" : "清除筛选"}</button>
        </form>
        {loading && <p role="status">{en ? "Loading published sounds…" : "正在加载已发布音色…"}</p>}
        {failed && <div role="alert"><p>{en ? "Community releases could not be loaded. Please try again." : "社区目录暂时无法加载，请重试。这不代表社区没有作品。"}</p>
          <button type="button" onClick={() => void load(cursor)} disabled={loading}>{en ? "Retry" : "重试"}</button></div>}
        {loaded && !loading && !failed && releases.length === 0 ? (
          <p className="community-published-empty">{filters ? (en ? "No releases match these filters." : "没有符合当前筛选条件的音色。") : (en ? "No community releases are available yet. The listening demos above do not represent published community packages." : "暂时没有已发布的社区音色包。上方试听示范不代表已经开放下载的社区作品。")}</p>
        ) : (
          <div className="community-published-grid">
            {releases.map(release => {
              const info = presentations[release.releaseId];
              return (
                <article className="community-published-card" key={release.releaseId}>
                  <h3>{release.name}</h3>
                  {info?.manufacturer && <p>{en ? "Switch brand" : "轴体品牌"}：{info.manufacturer}{info.switchModel ? ` · ${info.switchModel}` : ""}</p>}
                  {info?.recordingAuthor && <p>{en ? "Recording by" : "录音作者"}：{info.recordingAuthor}</p>}
                  <p>{en ? "Uploaded by" : "上传者"}：{release.author.displayName} · {release.displayVersion}</p>
                  {info?.description && <p>{info.description}</p>}
                  <p>{release.license.name} · {(release.artifact.byteCount / 1024).toFixed(1)} KB</p>
                  <BattutaReleasePlayer release={release} en={en} />
                  <BattutaCommunityInstallButton release={release} locale={locale} productPath={productPath} />
                  <details><summary>{en ? "Release information" : "版本信息"}</summary>
                    <p>macOS ≥ {release.minimumBattutaVersion.macos} · Windows ≥ {release.minimumBattutaVersion.windows}</p>
                    <p style={{ overflowWrap: "anywhere" }}>SHA-256: {release.artifact.sha256}</p>
                  </details>
                </article>
              );
            })}
          </div>
        )}
        {cursor && !failed && <button type="button" disabled={loading} onClick={() => void load(cursor)}>{en ? "Load more" : "加载更多"}</button>}
      </div>
    </section>
  );
}
