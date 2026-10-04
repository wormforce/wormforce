"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

type Entry = { submissionId: string; name: string; author: string };
type Detail = Entry & { status: string; presentation?: Record<string, string> | null; rights: { confirmed: boolean; license: string }; validation: {
  byteCount: number; sha256: string; manifest: Record<string, unknown>;
  preview: { available: boolean } | null;
} };
const base = "/api/battuta/community/v1/moderation/submissions";
async function checkedJSON(response: Response) {
  if (response.status === 401) throw Error("请先登录 GitHub，再返回此页。");
  if (response.status === 403) throw Error("当前账号没有审核权限，或账号已停用。");
  if (!response.ok) throw Error("请求失败，作品可能已由其他审核员处理。请刷新后重试。");
  return response.json();
}
export function BattutaCommunityReview() {
  const [items, setItems] = useState<Entry[]>([]);
  const [after, setAfter] = useState<string | null>(null);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [reason, setReason] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [notice, setNotice] = useState("");
  const pending = useRef<AbortController | null>(null);
  const queue = useCallback(async (cursor: string | null = null) => {
    pending.current?.abort(); const controller = new AbortController(); pending.current = controller;
    setBusy(true); setError("");
    try {
      const page = await checkedJSON(await fetch(`${base}${cursor ? `?after=${cursor}` : ""}`, {
        cache: "no-store", signal: AbortSignal.any([controller.signal, AbortSignal.timeout(20000)]),
      }));
      if (!controller.signal.aborted) { setItems(page.submissions); setAfter(page.nextCursor); }
    } catch (e) { if (!controller.signal.aborted) setError((e as Error).message); }
    finally { if (!controller.signal.aborted) setBusy(false); }
  }, []);
  useEffect(() => { void queue(); return () => pending.current?.abort(); }, [queue]);
  async function select(item: Entry) {
    setBusy(true); setError(""); setDetail(null); setConfirmed(false); setReason(""); setNotice("");
    try { setDetail(await checkedJSON(await fetch(`${base}/${item.submissionId}`, { cache: "no-store", signal: AbortSignal.timeout(20000) }))); }
    catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  }
  async function decide(action: "approve" | "reject") {
    if (!detail || !reason.trim() || (action === "approve" && !confirmed)) return;
    setBusy(true); setError("");
    try {
      await checkedJSON(await fetch(`${base}/${detail.submissionId}`, { method: "POST",
        headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, reason }), signal: AbortSignal.timeout(20000) }));
      setDetail(null); setNotice(action === "approve" ? "已通过审核；尚未发布，需要独立发布操作。" : "已拒绝，原因已记录。");
      await queue();
    } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  }
  return <main className="light-section" style={{ minHeight: "100vh", padding: "48px 24px" }}><div style={{ maxWidth: 1000, margin: "auto" }}>
    <Link href="/projects/battuta/community">← 返回声音图鉴</Link><h1>社区音色审核</h1>
    <p>仅限授权审核员。审核通过不等于发布，提交说明不等于已核实的授权。</p>
    <button type="button" onClick={() => window.location.assign("/api/battuta/community/v1/auth/github")}>使用 GitHub 登录</button>
    <button disabled={busy} onClick={() => void queue()}>刷新待审列表</button>
    {busy && <p role="status">正在处理…</p>}{error && <p role="alert">{error}</p>}{notice && <p role="status">{notice}</p>}
    {!busy && !error && items.length === 0 && <p>当前没有待审核作品。</p>}
    <ul>{items.map(item => <li key={item.submissionId}><button disabled={busy} onClick={() => void select(item)}>{item.name} · {item.author}</button></li>)}</ul>
    {after && <button disabled={busy} onClick={() => void queue(after)}>下一页</button>}
    {detail && <section key={detail.submissionId}><h2>{detail.name}</h2><p>提交者：{detail.author} · 状态：{detail.status}</p>
      <p>声明许可：{detail.rights.license} · 已确认分享权利：{detail.rights.confirmed ? "是" : "否"}</p>
      {detail.presentation && <section aria-label="提交的展示信息"><h3>展示信息（品牌不代表官方投稿）</h3>
        <p>轴体品牌：{detail.presentation.manufacturer || "未填写"} · 型号：{detail.presentation.switchModel || "未填写"}</p>
        <p>录音作者：{detail.presentation.recordingAuthor || "未填写"} · 类型：{detail.presentation.switchType || "未填写"}</p>
        <p>{detail.presentation.description}</p></section>}
      <p style={{ overflowWrap: "anywhere" }}>校验包：{detail.validation.byteCount} 字节 · SHA-256 {detail.validation.sha256}</p>
      {detail.validation.preview?.available ? <audio controls preload="none" src={`${base}/${detail.submissionId}/preview.wav`} aria-label="待审音色真实试听" />
        : <p>试听尚未生成，或包依赖外部基础采样；暂不可通过审核。</p>}
      <details><summary>按键映射、录音作者与来源声明</summary><pre style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{JSON.stringify(detail.validation.manifest, null, 2)}</pre></details>
      <label style={{ display: "block" }}>审核原因<textarea value={reason} maxLength={2000} onChange={e => setReason(e.target.value)} disabled={busy} /></label>
      <label style={{ display: "block" }}><input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} disabled={busy} />我已试听，并核对录音来源、分享许可和署名；未将轴体厂家当作录音作者。</label>
      <button disabled={busy || !reason.trim() || !confirmed || !detail.rights.confirmed || !detail.validation.preview?.available || detail.status !== "pending_review"} onClick={() => void decide("approve")}>通过审核（不发布）</button>
      <button disabled={busy || !reason.trim() || detail.status !== "pending_review"} onClick={() => void decide("reject")}>拒绝并记录原因</button>
    </section>}
  </div></main>;
}
