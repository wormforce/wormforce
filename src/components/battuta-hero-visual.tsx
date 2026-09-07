"use client";

import { ArrowClockwiseIcon, ArrowLeftIcon, ArrowRightIcon, PauseIcon, PlayIcon, SkipForwardIcon } from "@phosphor-icons/react";
import { memo, useEffect, useRef, useState, type CSSProperties } from "react";
import type { BattutaLocale } from "@/content/battuta";
import { DEFAULT_HERO_ALIGNMENT, MODEL_FADE_DURATION, MODEL_INTRO_DURATION, sampleModelIntro, settledHeroArea, type HeroPhase } from "@/lib/battuta-hero-choreography";
import type { SwitchScene } from "@/lib/battuta-switch-scene";

export const BattutaHeroVisual = memo(function BattutaHeroVisual({ locale }: { locale: BattutaLocale }) {
  const english = locale === "en";
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [phase, setPhase] = useState<HeroPhase>("blend");
  const [rotating, setRotating] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [replay, setReplay] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<SwitchScene | null>(null);
  const skipRef = useRef<(() => void) | null>(null);
  const desiredRotation = useRef(true);

  useEffect(() => {
    const container = canvasRef.current;
    if (!container) return;
    let disposed = false;
    const controller = new AbortController();
    const fallback = () => {
      if (disposed) return;
      sceneRef.current?.dispose();
      sceneRef.current = null;
      rootRef.current?.style.setProperty("--hero-model-opacity", "0");
      setPhase("blend");
      setStatus("error");
    };
    void import("@/lib/battuta-switch-scene")
      .then(({ createSwitchScene }) => createSwitchScene(container, controller.signal, {
        baked: true, layeredGlass: true, rotating: false,
        onRotationChange: (value) => { if (!disposed) setRotating(value); },
        onError: fallback,
        onPathTracingChange: () => {},
      }))
      .then((scene) => {
        if (disposed) { scene.dispose(); return; }
        sceneRef.current = scene;
        scene.setInteractive(false);
        setStatus("ready");
      })
      .catch(fallback);
    return () => {
      disposed = true;
      controller.abort();
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
  }, [attempt]);

  useEffect(() => {
    const root = rootRef.current;
    const container = canvasRef.current;
    const scene = sceneRef.current;
    if (status !== "ready" || !root || !container || !scene) return;
    let cancelled = false;
    let frameID: number | null = null;
    let elapsed = 0;
    let lastTime = 0;
    let lastRender = 0;
    let visible = false;
    let complete = false;
    let paintedElapsed = 0;
    let currentPhase: HeroPhase = "blend";
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const frames = () => {
      const viewport = container.getBoundingClientRect();
      const settled = scene.fitFrame(settledHeroArea(viewport.width, viewport.height));
      const centered = scene.fitFrame({ x: 0, y: 0, width: viewport.width, height: viewport.height }, true);
      const startWidth = settled.width * 1.75;
      const scale = startWidth / Math.max(1, centered.width);
      // Place the whole silhouette at the right-hand third, not its stem anchor.
      return {
        start: {
          anchorX: viewport.width * 2 / 3 + (centered.anchorX - viewport.width / 2) * scale,
          anchorY: viewport.height / 2 + (centered.anchorY - viewport.height / 2) * scale,
          width: startWidth,
        },
        settled,
      };
    };
    root.style.setProperty("--hero-model-opacity", "0");
    scene.setRotating(false);
    scene.setInteractive(false);
    scene.resetPose(DEFAULT_HERO_ALIGNMENT);
    let alignment = frames();
    const paint = () => {
      const sample = sampleModelIntro(elapsed, alignment.start, alignment.settled);
      root.style.setProperty("--hero-intro-elapsed", `${elapsed}ms`);
      root.style.setProperty("--hero-model-opacity", String(sample.modelOpacity));
      const orbitDelta = Math.max(0, elapsed - MODEL_FADE_DURATION) - Math.max(0, paintedElapsed - MODEL_FADE_DURATION);
      scene.frame(sample.frame, desiredRotation.current && !complete ? orbitDelta / 1000 : 0);
      paintedElapsed = elapsed;
      if (sample.phase !== currentPhase) { currentPhase = sample.phase; setPhase(sample.phase); }
    };
    setPhase("blend");
    paint();
    const finish = () => {
      if (cancelled || complete) return;
      complete = true;
      elapsed = MODEL_INTRO_DURATION;
      if (frameID !== null) cancelAnimationFrame(frameID);
      frameID = null;
      paint();
      scene.setInteractive(true);
      scene.setRotating(desiredRotation.current);
    };
    const tick = (now: number) => {
      frameID = null;
      if (cancelled || complete || !visible || document.hidden) return;
      elapsed += lastTime ? Math.min(now - lastTime, 80) : 0;
      lastTime = now;
      if (elapsed >= MODEL_INTRO_DURATION) { finish(); return; }
      if (now - lastRender >= 1000 / 30) { paint(); lastRender = now; }
      frameID = requestAnimationFrame(tick);
    };
    const sync = () => {
      if (frameID !== null) cancelAnimationFrame(frameID);
      frameID = null;
      lastTime = 0;
      if (motion.matches) { finish(); return; }
      if (!cancelled && !complete && visible && !document.hidden) frameID = requestAnimationFrame(tick);
    };
    const resize = new ResizeObserver(() => {
      alignment = frames();
      if (complete) scene.frame(alignment.settled);
      else paint();
    });
    resize.observe(container);
    const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }, { threshold: 0.1 });
    intersection.observe(container);
    document.addEventListener("visibilitychange", sync);
    motion.addEventListener("change", sync);
    skipRef.current = finish;
    if (motion.matches) finish();
    return () => {
      cancelled = true;
      if (frameID !== null) cancelAnimationFrame(frameID);
      resize.disconnect();
      intersection.disconnect();
      document.removeEventListener("visibilitychange", sync);
      motion.removeEventListener("change", sync);
      skipRef.current = null;
    };
  }, [status, replay]);

  return (
    <div ref={rootRef} className="community-library-hero-visual" data-phase={phase} data-scene-status={status}>
      <div key={replay} className="community-library-hero-wordmark" aria-hidden>
        {Array.from("Battuta").map((letter, index) => <span key={index} style={{ "--letter-delay": (index * 75 + 120) + "ms" } as CSSProperties}>{letter}</span>)}
      </div>
      <div
        ref={canvasRef}
        className="community-library-hero-model"
        role={phase === "model" ? "img" : undefined}
        aria-hidden={phase !== "model"}
        aria-label={phase === "model" ? (english ? "Interactive 3D mechanical switch. Use the rotation controls to change the view." : "机械键盘轴体 3D 模型，可通过旋转按钮查看不同角度。") : undefined}
      />
      <div className="community-library-hero-view-controls">
        {status === "ready" && phase === "model" ? <>
          <div className="community-library-hero-rotation-controls" role="group" aria-label={english ? "Switch rotation" : "轴体旋转"}>
            <button type="button" aria-label={english ? "Rotate left" : "向左旋转"} onClick={() => sceneRef.current?.rotateBy(-Math.PI / 6)}><ArrowLeftIcon size={17} aria-hidden /></button>
            <button type="button" aria-label={rotating ? (english ? "Pause rotation" : "暂停旋转") : (english ? "Resume rotation" : "继续旋转")} onClick={() => { desiredRotation.current = !rotating; sceneRef.current?.setRotating(!rotating); }}>
              {rotating ? <PauseIcon size={17} weight="fill" aria-hidden /> : <PlayIcon size={17} weight="fill" aria-hidden />}
            </button>
            <button type="button" aria-label={english ? "Rotate right" : "向右旋转"} onClick={() => sceneRef.current?.rotateBy(Math.PI / 6)}><ArrowRightIcon size={17} aria-hidden /></button>
          </div>
          <button type="button" className="community-library-hero-replay" onClick={() => { setPhase("blend"); setReplay((value) => value + 1); }}><ArrowClockwiseIcon size={16} aria-hidden />{english ? "Replay intro" : "重播开场"}</button>
          <a className="community-library-hero-model-credit" href="/battuta/community/hero/ATTRIBUTION.txt" target="_blank" rel="noreferrer">{english ? "Model credits" : "模型来源"}</a>
        </> : null}
        {status === "ready" && phase !== "model" ? <button className="community-library-hero-replay" type="button" onClick={() => skipRef.current?.()}><SkipForwardIcon size={16} aria-hidden />{english ? "Skip intro" : "跳过动画"}</button> : null}
        {status === "loading" ? <span role="status" className="community-library-visually-hidden">{english ? "Preparing 3D preview" : "正在准备 3D 展示"}</span> : null}
        {status === "error" ? <button type="button" className="community-library-hero-replay" onClick={() => { setStatus("loading"); setAttempt((value) => value + 1); }}>{english ? "Retry 3D" : "重试 3D"}</button> : null}
      </div>
    </div>
  );
});
