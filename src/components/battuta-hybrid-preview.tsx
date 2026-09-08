"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { SwitchScene } from "@/lib/battuta-switch-scene";
import styles from "./battuta-hybrid-preview.module.css";

export default function BattutaHybridPreview() {
  const host = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<SwitchScene | null>(null);
  const [state, setState] = useState("loading");
  const [rotating, setRotating] = useState(false);
  const [layered, setLayered] = useState(true);
  useEffect(() => {
    const container = host.current;
    if (!container) return;
    let disposed = false;
    let observer: ResizeObserver | undefined;
    const controller = new AbortController();
    void import("@/lib/battuta-switch-scene").then(({ createSwitchScene }) => createSwitchScene(container, controller.signal, {
      baked: true, layeredGlass: layered, rotating: false,
      onRotationChange: value => { if (!disposed) setRotating(value); },
      onPathTracingChange: () => {},
      onError: () => { if (!disposed) setState("error"); },
    })).then(scene => {
      if (disposed) { scene.dispose(); return; }
      sceneRef.current = scene;
      scene.resetPose();
      scene.setInteractive(true);
      const resize = () => scene.fitOrbit();
      observer = new ResizeObserver(resize);
      observer.observe(container);
      resize();
      setState("ready");
    }).catch(() => { if (!disposed) setState("error"); });
    return () => {
      disposed = true; controller.abort(); observer?.disconnect();
      sceneRef.current?.dispose(); sceneRef.current = null;
    };
  }, [layered]);
  return <main className={styles.page}>
    <header><strong>Battuta / REALTIME MATERIAL STUDY</strong><Link href="/projects/battuta/community">返回声音图鉴</Link></header>
    <h1>任意角度，保持同一套质感。</h1>
    <p>{layered ? "分层透明壳体 · 背面深度估算壁厚 · 双层实时折射" : "旧版对照 · 固定壁厚 · 烘焙凹槽阴影"}</p>
    <div className={styles.stage}>
      <div ref={host} className={styles.canvas} aria-label="可上下左右拖动的机械轴体模型" role="img" />
      {state !== "ready" && <div className={styles.message} role="status">{state === "error" ? "3D 预览暂时无法启动，请刷新重试。" : "正在加载模型与烘焙贴图…"}</div>}
      <div className={styles.controls}>
        <button disabled={state !== "ready"} onClick={() => { setState("loading"); setLayered(value => !value); }}>{layered ? "对比旧版" : "使用新版分层折射"}</button>
        <button disabled={state !== "ready"} onClick={() => sceneRef.current?.setRotating(!rotating)} aria-pressed={rotating}>{rotating ? "暂停旋转" : "自动旋转"}</button>
        <button disabled={state !== "ready"} onClick={() => { sceneRef.current?.setRotating(false); sceneRef.current?.resetPose(); sceneRef.current?.fitOrbit(); }}>恢复初始角度</button>
        <a href="/battuta/community/hero/offline-turntable/index.html">对比离线光追</a>
      </div>
    </div>
    <p className={styles.note}>在模型上上下左右拖动。烘焙只负责固定的接触阴影，反光和折射会随视角变化；这里不运行渐进光追，拖动时不会切换到另一套低画质材质。</p>
    <small>这是独立实验预览，尚未替换首屏。透明外壳仍采用实时近似折射，不等同于完整离线路径追踪。</small>
  </main>;
}
