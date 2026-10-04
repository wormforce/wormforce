"use client";

import { useState } from "react";
import type { BattutaLocale } from "@/content/battuta";
import { useBattutaCommunityCatalog } from "./use-battuta-community-catalog";
import { BattutaReleaseCard } from "./battuta-release-card";

export function BattutaPublishedPacks({ locale, productPath }: { locale: BattutaLocale; productPath: string }) {
  const en = locale === "en";
  const [filters, setFilters] = useState("");
  const { releases, presentations, covers, cursor, loading, failed, loaded, retry, refresh, loadMore } = useBattutaCommunityCatalog(filters);
  return (
    <section id="published-packs" className="community-published-packs light-section" aria-labelledby="published-packs-heading">
      <div className="section-inner">
        <p className="section-kicker green">{en ? "COMMUNITY RELEASES" : "社区发布"}</p>
        <h2 id="published-packs-heading">{en ? "Ready to install" : "可安装的社区音色"}</h2>
        <p>{en ? "Reviewed releases, downloaded and verified by Battuta after your confirmation." : "审核发布的真实音色，由 Battuta 在你确认后下载、校验并安装。"}</p>
        <form role="search" aria-label={en ? "Search community releases" : "搜索社区音色"}
          style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBlock: 24 }}
          onSubmit={event => {
            event.preventDefault(); const data = new FormData(event.currentTarget); const query = new URLSearchParams();
            for (const key of ["q", "manufacturer", "switchType", "author"]) { const value = String(data.get(key) ?? "").trim(); if (value) query.set(key, value); }
            const next = query.toString(); if (next === filters) refresh(); else setFilters(next);
          }}>
          <label>{en ? "Search" : "搜索"}<input name="q" maxLength={160} placeholder={en ? "Name, switch or author" : "音色、型号或作者"} /></label>
          <label>{en ? "Brand" : "品牌"}<input name="manufacturer" maxLength={80} placeholder={en ? "All brands" : "全部品牌（填写完整名称）"} /></label>
          <label>{en ? "Creator" : "创作者"}<input name="author" maxLength={160} placeholder={en ? "Recording author or uploader" : "录音作者或上传者"} /></label>
          <label>{en ? "Switch type" : "轴体类型"}<select name="switchType" defaultValue="">
            <option value="">{en ? "All types" : "全部类型"}</option>
            {[["linear", "线性轴", "Linear"], ["tactile", "段落轴", "Tactile"], ["clicky", "点击轴", "Clicky"], ["silent", "静音", "Silent"], ["electrocapacitive", "静电容", "Electrocapacitive"], ["magnetic", "磁轴", "Magnetic"], ["other", "其他", "Other"]].map(([id, zh, english]) => <option key={id} value={id}>{en ? english : zh}</option>)}
          </select></label>
          <button type="submit">{en ? "Apply" : "筛选"}</button>
          <button type="reset" onClick={() => { if (!filters) refresh(); else setFilters(""); }}>{en ? "Clear" : "清除筛选"}</button>
        </form>
        {loading && <p role="status">{en ? "Loading published sounds…" : "正在加载已发布音色…"}</p>}
        {failed && <div role="alert"><p>{en ? "Community releases could not be loaded. Please try again." : "社区目录暂时无法加载，请重试。这不代表社区没有作品。"}</p>
          <button type="button" onClick={retry} disabled={loading}>{en ? "Retry" : "重试"}</button></div>}
        {loaded && !loading && !failed && releases.length === 0 ? (
          <p className="community-published-empty">{filters ? (en ? "No releases match these filters." : "没有符合当前筛选条件的音色。") : (en ? "No community releases are available yet. The listening demos above do not represent published community packages." : "暂时没有已发布的社区音色包。上方试听示范不代表已经开放下载的社区作品。")}</p>
        ) : (
          <div className="community-library-sound-grid">
            {releases.map(release => <BattutaReleaseCard key={release.releaseId} release={release}
              presentation={presentations[release.releaseId]} cover={covers[release.releaseId]} locale={locale} productPath={productPath} />)}
          </div>
        )}
        {cursor && !failed && <button type="button" disabled={loading} onClick={loadMore}>{en ? "Load more" : "加载更多"}</button>}
      </div>
    </section>
  );
}
