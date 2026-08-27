'use client';

import {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent as ReactFormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';

type AudioPhase = 'press' | 'release';
type KeyboardRow = 'R0' | 'R1' | 'R2' | 'R3' | 'R4';
type SpecialKey = 'space' | 'enter' | 'backspace';

type SpriteSample = {
  offsetFrames: number;
  frameCount: number;
};

type PhaseMap = {
  generic?: string;
  rows: Partial<Record<KeyboardRow, string>>;
  specials: Partial<Record<SpecialKey, string>>;
  keyOverrides?: Record<string, string>;
};

type DemoProfile = {
  id: string;
  displayName: string;
  family: string;
  tone: string;
  recommended?: boolean;
  baseProfileID?: string;
  sprite: string;
  samples: Record<string, SpriteSample>;
  press: PhaseMap;
  release: PhaseMap;
  attribution?: {
    author?: string;
    licenseName?: string;
  } | null;
};

type DemoManifest = {
  version: number;
  sampleRate: number;
  profiles: DemoProfile[];
};

type PreparedSample = {
  offsetSeconds: number;
  durationSeconds: number;
};

type LoadedBank = {
  profile: DemoProfile;
  buffer: AudioBuffer;
  samples: Map<string, PreparedSample>;
};

type ActiveVoice = {
  source: AudioBufferSourceNode;
  gain: GainNode;
};

type PendingResumePress = {
  profileID: string;
  code: string;
  requestedAt: number;
  releaseAfterSeconds?: number;
  maximumDelayMS?: number;
};

type AudioState = 'loading' | 'awaiting' | 'activating' | 'ready' | 'switching' | 'error';

type HeatmapKey = {
  code: string;
  label: string;
  span: number;
};

type TypingTelemetrySnapshot = {
  generation: number;
  total: number;
  mappedTotal: number;
  currentKPS: number;
  peakKPS: number;
  line: number[];
  bars: Array<{ id: number; value: number }>;
  secondBucketID: number;
  keyCounts: number[];
  topKeys: Array<{ label: string; count: number }>;
};

const manifestURL = '/battuta/demo-audio/manifest.json';
const defaultProfileID = 'bcp-suit80';
const quickProfileIDs = [
  'bcp-suit80',
  'holypanda',
  'g915brown',
  'mxblue',
  'blackink',
  'topre',
];

const playbackRecipes = [
  { gain: 1, rate: 1 },
  { gain: 0.975, rate: 0.978 },
  { gain: 0.99, rate: 1.018 },
  { gain: 1.02, rate: 0.992 },
];
const playbackOrder = [0, 2, 1, 3, 1, 0, 3, 2, 3, 1, 2, 0, 2, 3, 0, 1];

function isSoftTypingInput(inputType: string) {
  return /^(insertText|insertCompositionText|insertLineBreak|insertParagraph|deleteContentBackward|deleteContentForward)$/.test(inputType);
}

function softInputCode(inputType: string, data: string | null) {
  if (inputType === 'deleteContentBackward' || inputType === 'deleteContentForward') return 'Backspace';
  if (inputType === 'insertLineBreak' || inputType === 'insertParagraph') return 'Enter';
  if (data === ' ') return 'Space';
  return 'KeyA';
}

const row0Codes = new Set([
  'Backquote', 'Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6',
  'Digit7', 'Digit8', 'Digit9', 'Digit0', 'Minus', 'Equal',
]);
const row1Codes = new Set([
  'KeyQ', 'KeyW', 'KeyE', 'KeyR', 'KeyT', 'KeyY', 'KeyU', 'KeyI', 'KeyO',
  'KeyP', 'BracketLeft', 'BracketRight', 'Backslash',
]);
const row2Codes = new Set([
  'KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyG', 'KeyH', 'KeyJ', 'KeyK', 'KeyL',
  'Semicolon', 'Quote',
]);
const row3Codes = new Set([
  'KeyZ', 'KeyX', 'KeyC', 'KeyV', 'KeyB', 'KeyN', 'KeyM', 'Comma', 'Period',
  'Slash',
]);

const legacyCodeNames: Record<string, string> = {
  Backquote: 'backquote',
  Minus: 'minus',
  Equal: 'equal',
  BracketLeft: 'leftBracket',
  BracketRight: 'rightBracket',
  Backslash: 'backslash',
  Semicolon: 'semicolon',
  Quote: 'quote',
  Comma: 'comma',
  Period: 'period',
  Slash: 'slash',
  ShiftLeft: 'leftShift',
  ShiftRight: 'rightShift',
  ArrowLeft: 'leftArrow',
  ArrowRight: 'rightArrow',
  ArrowUp: 'upArrow',
  ArrowDown: 'downArrow',
  Space: 'space',
  Enter: 'enter',
  NumpadEnter: 'keypadEnter',
  Backspace: 'backspace',
  Delete: 'forwardDelete',
};

const telemetrySampleMS = 100;
const telemetrySampleCount = 120;
const telemetryBucketCount = telemetrySampleCount + 10;
const telemetryWindowSeconds = 12;
const telemetryBarCount = telemetryWindowSeconds + 1;

const heatmapRows: HeatmapKey[][] = [
  [
    { code: 'Backquote', label: '`', span: 4 },
    ...Array.from({ length: 10 }, (_, index) => ({
      code: `Digit${(index + 1) % 10}`,
      label: String((index + 1) % 10),
      span: 4,
    })),
    { code: 'Minus', label: '−', span: 4 },
    { code: 'Equal', label: '=', span: 4 },
    { code: 'Backspace', label: 'delete', span: 8 },
  ],
  [
    { code: 'Tab', label: 'tab', span: 6 },
    ...'QWERTYUIOP'.split('').map((letter) => ({ code: `Key${letter}`, label: letter, span: 4 })),
    { code: 'BracketLeft', label: '[', span: 4 },
    { code: 'BracketRight', label: ']', span: 4 },
    { code: 'Backslash', label: '\\', span: 6 },
  ],
  [
    { code: 'CapsLock', label: 'caps', span: 7 },
    ...'ASDFGHJKL'.split('').map((letter) => ({ code: `Key${letter}`, label: letter, span: 4 })),
    { code: 'Semicolon', label: ';', span: 4 },
    { code: 'Quote', label: "'", span: 4 },
    { code: 'Enter', label: 'return', span: 9 },
  ],
  [
    { code: 'ShiftLeft', label: 'shift', span: 9 },
    ...'ZXCVBNM'.split('').map((letter) => ({ code: `Key${letter}`, label: letter, span: 4 })),
    { code: 'Comma', label: ',', span: 4 },
    { code: 'Period', label: '.', span: 4 },
    { code: 'Slash', label: '/', span: 4 },
    { code: 'ShiftRight', label: 'shift', span: 11 },
  ],
  [
    { code: 'ControlLeft', label: 'ctrl', span: 5 },
    { code: 'MetaLeft', label: '⌘ / Win', span: 6 },
    { code: 'AltLeft', label: 'alt', span: 5 },
    { code: 'Space', label: 'space', span: 28 },
    { code: 'AltRight', label: 'alt', span: 5 },
    { code: 'MetaRight', label: '⌘ / Win', span: 6 },
    { code: 'ControlRight', label: 'ctrl', span: 5 },
  ],
];

const heatmapKeys = heatmapRows.flat();
const heatmapKeyIndexes = new Map(heatmapKeys.map((key, index) => [key.code, index]));

function emptyTelemetrySnapshot(generation = 0): TypingTelemetrySnapshot {
  return {
    generation,
    total: 0,
    mappedTotal: 0,
    currentKPS: 0,
    peakKPS: 0,
    line: Array(telemetryBarCount).fill(0),
    bars: Array.from({ length: telemetryBarCount }, (_, index) => ({ id: index, value: 0 })),
    secondBucketID: 0,
    keyCounts: Array(heatmapKeys.length).fill(0),
    topKeys: [],
  };
}

class TypingTelemetryStore {
  private readonly bucketIDs = new Float64Array(telemetryBucketCount);
  private readonly bucketCounts = new Uint16Array(telemetryBucketCount);
  private readonly keyCounts = new Uint32Array(heatmapKeys.length);
  private total = 0;
  private mappedTotal = 0;
  private peakKPS = 0;
  private lastEventAt: number | null = null;
  private generation = 0;
  private readonly listeners = new Set<() => void>();

  constructor() {
    this.bucketIDs.fill(-1);
  }

  recordPhysical(code: string, at = performance.now()) {
    this.recordRhythm(at);
    const keyIndex = heatmapKeyIndexes.get(code);
    if (keyIndex !== undefined) {
      this.keyCounts[keyIndex] += 1;
      this.mappedTotal += 1;
    }
    this.notify();
  }

  recordSoftInput(at = performance.now()) {
    this.recordRhythm(at);
    this.notify();
  }

  reset() {
    this.bucketIDs.fill(-1);
    this.bucketCounts.fill(0);
    this.keyCounts.fill(0);
    this.total = 0;
    this.mappedTotal = 0;
    this.peakKPS = 0;
    this.lastEventAt = null;
    this.generation += 1;
    this.notify();
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  shouldPublish(at: number, renderedGeneration: number) {
    return this.generation !== renderedGeneration
      || (this.lastEventAt !== null && at - this.lastEventAt <= telemetryWindowSeconds * 1000 + 200);
  }

  isActive(at: number) {
    return this.lastEventAt !== null && at - this.lastEventAt <= telemetryWindowSeconds * 1000 + 200;
  }

  snapshot(at: number): TypingTelemetrySnapshot {
    const currentBucketID = Math.floor(at / telemetrySampleMS);
    const rawCounts = Array.from({ length: telemetrySampleCount }, (_, index) => (
      this.countForBucket(currentBucketID - telemetrySampleCount + 1 + index)
    ));
    const currentKPS = rawCounts.slice(-10).reduce((sum, count) => sum + count, 0);
    this.peakKPS = Math.max(this.peakKPS, currentKPS);

    const currentSecondID = Math.floor(currentBucketID / 10);
    const bars = Array.from({ length: telemetryBarCount }, (_, secondIndex) => {
      const secondID = currentSecondID - telemetryWindowSeconds + secondIndex;
      let total = 0;
      for (let tenth = 0; tenth < 10; tenth += 1) {
        total += this.countForBucket(secondID * 10 + tenth);
      }
      return { id: secondID, value: total };
    });
    const line = bars.map((bar) => bar.value);

    const topKeys = Array.from(this.keyCounts)
      .map((count, index) => ({ label: heatmapKeys[index].label, count }))
      .filter((key) => key.count > 0)
      .sort((left, right) => right.count - left.count)
      .slice(0, 3);

    return {
      generation: this.generation,
      total: this.total,
      mappedTotal: this.mappedTotal,
      currentKPS,
      peakKPS: this.peakKPS,
      line,
      bars,
      secondBucketID: currentSecondID,
      keyCounts: Array.from(this.keyCounts),
      topKeys,
    };
  }

  private recordRhythm(at: number) {
    const bucketID = Math.floor(at / telemetrySampleMS);
    const slot = ((bucketID % telemetryBucketCount) + telemetryBucketCount) % telemetryBucketCount;
    if (this.bucketIDs[slot] !== bucketID) {
      this.bucketIDs[slot] = bucketID;
      this.bucketCounts[slot] = 0;
    }
    this.bucketCounts[slot] = Math.min(65535, this.bucketCounts[slot] + 1);
    this.total += 1;
    this.lastEventAt = at;
  }

  private countForBucket(bucketID: number) {
    const slot = ((bucketID % telemetryBucketCount) + telemetryBucketCount) % telemetryBucketCount;
    return this.bucketIDs[slot] === bucketID ? this.bucketCounts[slot] : 0;
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }
}

function buildSmoothChartPath(
  values: number[],
  maximum: number,
  width: number,
  height: number,
  xStep = width / Math.max(1, values.length),
) {
  const top = 10;
  const bottom = height - 10;
  const points = values.map((value, index) => ({
    x: (index + 0.5) * xStep,
    y: bottom - (Math.min(maximum, value) / maximum) * (bottom - top),
  }));
  if (points.length === 0) return '';
  let path = `M 0 ${points[0].y.toFixed(2)} L ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
  const tension = 0.72;
  for (let index = 0; index < points.length - 1; index += 1) {
    const before = points[Math.max(0, index - 1)];
    const current = points[index];
    const next = points[index + 1];
    const after = points[Math.min(points.length - 1, index + 2)];
    const minimumY = Math.min(current.y, next.y);
    const maximumY = Math.max(current.y, next.y);
    const controlOneY = Math.min(maximumY, Math.max(
      minimumY,
      current.y + ((next.y - before.y) / 6) * tension,
    ));
    const controlTwoY = Math.min(maximumY, Math.max(
      minimumY,
      next.y - ((after.y - current.y) / 6) * tension,
    ));
    const controlOneX = current.x + ((next.x - before.x) / 6) * tension;
    const controlTwoX = next.x - ((after.x - current.x) / 6) * tension;
    path += ` C ${controlOneX.toFixed(3)} ${controlOneY.toFixed(3)}, ${controlTwoX.toFixed(3)} ${controlTwoY.toFixed(3)}, ${next.x.toFixed(3)} ${next.y.toFixed(3)}`;
  }
  return `${path} L ${(values.length * xStep).toFixed(2)} ${points[points.length - 1].y.toFixed(2)}`;
}

const TypingTelemetryPanel = memo(function TypingTelemetryPanel({
  store,
}: {
  store: TypingTelemetryStore;
}) {
  const [snapshot, setSnapshot] = useState<TypingTelemetrySnapshot>(() => emptyTelemetrySnapshot());
  const snapshotRef = useRef(snapshot);
  const barTrackRef = useRef<SVGGElement | null>(null);
  const lineTrackRef = useRef<SVGGElement | null>(null);
  const renderedSecondBucketIDRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    let timerID: number | null = null;
    let forceNextPublish = false;
    const schedule = (delay: number) => {
      if (cancelled || timerID !== null || document.hidden) return;
      timerID = window.setTimeout(publish, delay);
    };
    const publish = () => {
      timerID = null;
      if (cancelled) return;
      const now = performance.now();
      const shouldPublish = forceNextPublish || store.shouldPublish(now, snapshotRef.current.generation);
      forceNextPublish = false;
      if (!document.hidden && shouldPublish) {
        const nextSnapshot = store.snapshot(now);
        snapshotRef.current = nextSnapshot;
        setSnapshot(nextSnapshot);
      }
      if (shouldPublish) {
        const delay = telemetrySampleMS - (performance.now() % telemetrySampleMS);
        schedule(Math.max(16, delay));
      }
    };
    const wake = (force = false) => {
      forceNextPublish ||= force;
      schedule(0);
    };
    const handleVisibility = () => {
      if (document.hidden && timerID !== null) {
        window.clearTimeout(timerID);
        timerID = null;
      } else if (!document.hidden) {
        wake(true);
      }
    };
    const unsubscribe = store.subscribe(wake);
    document.addEventListener('visibilitychange', handleVisibility);
    wake(true);
    return () => {
      cancelled = true;
      if (timerID !== null) window.clearTimeout(timerID);
      document.removeEventListener('visibilitychange', handleVisibility);
      unsubscribe();
    };
  }, [store]);

  const observedMaximum = Math.max(4, ...snapshot.bars.map((bar) => bar.value), ...snapshot.line);
  const axisMaximum = Math.ceil(observedMaximum / 2) * 2;
  const chartWidth = 520;
  const chartHeight = 176;
  const plotHeight = chartHeight - 20;
  const barStep = chartWidth / telemetryWindowSeconds;
  const linePath = buildSmoothChartPath(snapshot.line, axisMaximum, chartWidth, chartHeight, barStep);
  const maximumKeyCount = Math.max(0, ...snapshot.keyCounts);
  const topKeySummary = snapshot.topKeys.length > 0
    ? snapshot.topKeys.map((key) => `${key.label} ${key.count} 次`).join('、')
    : '还没有键位记录';

  useLayoutEffect(() => {
    renderedSecondBucketIDRef.current = snapshot.secondBucketID;
  }, [snapshot.secondBucketID]);

  useEffect(() => {
    let frameID: number | null = null;
    const resetTracks = () => {
      lineTrackRef.current?.setAttribute('transform', 'translate(0 0)');
      barTrackRef.current?.setAttribute('transform', 'translate(0 0)');
    };
    const animate = () => {
      frameID = null;
      if (document.hidden) return;
      const now = performance.now();
      if (!store.isActive(now)) {
        resetTracks();
        return;
      }
      const barProgress = Math.min(1, Math.max(0, now / 1000 - renderedSecondBucketIDRef.current));
      const barOffset = -barProgress * barStep;
      lineTrackRef.current?.setAttribute('transform', `translate(${barOffset.toFixed(3)} 0)`);
      barTrackRef.current?.setAttribute('transform', `translate(${barOffset.toFixed(3)} 0)`);
      frameID = window.requestAnimationFrame(animate);
    };
    const wake = () => {
      if (frameID === null && !document.hidden) frameID = window.requestAnimationFrame(animate);
    };
    const handleVisibility = () => {
      if (document.hidden && frameID !== null) {
        window.cancelAnimationFrame(frameID);
        frameID = null;
      } else if (!document.hidden) {
        wake();
      }
    };
    const unsubscribe = store.subscribe(wake);
    document.addEventListener('visibilitychange', handleVisibility);
    wake();
    return () => {
      if (frameID !== null) window.cancelAnimationFrame(frameID);
      document.removeEventListener('visibilitychange', handleVisibility);
      unsubscribe();
    };
  }, [barStep, store]);

  return (
    <aside className="typing-demo-insights" aria-label="本次输入统计">
      <section className="typing-demo-stat-card typing-demo-rhythm-card" aria-labelledby="typing-rhythm-title">
        <div className="typing-demo-stat-heading">
          <div>
            <span>Live rhythm</span>
            <h3 id="typing-rhythm-title">实时键速</h3>
          </div>
          <div className="typing-demo-chart-legend" aria-hidden="true">
            <span><i className="is-bar" />1 秒柱</span>
            <span><i className="is-line" />平滑趋势</span>
          </div>
        </div>

        <dl className="typing-demo-metrics">
          <div><dt>当前</dt><dd>{snapshot.currentKPS}<small>次/秒</small></dd></div>
          <div><dt>峰值</dt><dd>{snapshot.peakKPS}<small>次/秒</small></dd></div>
          <div><dt>本轮</dt><dd>{snapshot.total}<small>次</small></dd></div>
        </dl>

        <figure className="typing-demo-chart">
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none" aria-hidden="true">
            {[0.25, 0.5, 0.75, 1].map((ratio) => (
              <line
                key={ratio}
                x1="0"
                x2={chartWidth}
                y1={10 + plotHeight * (1 - ratio)}
                y2={10 + plotHeight * (1 - ratio)}
                className="typing-demo-chart-grid"
              />
            ))}
            <g ref={barTrackRef}>
              {snapshot.bars.map((bar, index) => {
                const height = (bar.value / axisMaximum) * plotHeight;
                return (
                  <rect
                    key={bar.id}
                    x={index * barStep + 3}
                    y={chartHeight - 10 - height}
                    width={Math.max(2, barStep - 6)}
                    height={Math.max(bar.value > 0 ? 2 : 0, height)}
                    rx="3"
                    className="typing-demo-chart-bar"
                  />
                );
              })}
            </g>
            <g ref={lineTrackRef}>
              <path d={linePath} className="typing-demo-chart-line-shadow" />
              <path d={linePath} className="typing-demo-chart-line" />
            </g>
          </svg>
          <figcaption>
            <span>最近 12 秒</span>
            <span>动态上限 {axisMaximum} 次/秒</span>
            <span>现在</span>
          </figcaption>
        </figure>
      </section>

      <section className="typing-demo-stat-card typing-demo-heatmap-card" aria-labelledby="typing-heatmap-title">
        <div className="typing-demo-stat-heading">
          <div>
            <span>Session heatmap</span>
            <h3 id="typing-heatmap-title">本次键位热力图</h3>
          </div>
          <p>{snapshot.mappedTotal} 次已映射</p>
        </div>
        <p className="typing-demo-visually-hidden">最常用键位：{topKeySummary}</p>
        <div className="typing-demo-keyboard-scroll">
          <div className="typing-demo-keyboard" aria-hidden="true">
            {heatmapRows.map((row, rowIndex) => (
              <div className="typing-demo-keyboard-row" key={rowIndex}>
                {row.map((key) => {
                  const keyIndex = heatmapKeyIndexes.get(key.code) ?? 0;
                  const count = snapshot.keyCounts[keyIndex] ?? 0;
                  const tier = count === 0 || maximumKeyCount === 0
                    ? 0
                    : Math.max(1, Math.ceil((Math.log1p(count) / Math.log1p(maximumKeyCount)) * 5));
                  return (
                    <span
                      key={key.code}
                      className={`typing-demo-heat-key heat-${tier}`}
                      style={{ gridColumn: `span ${key.span}` }}
                    >
                      <b>{key.label}</b>
                      {count > 0 ? <small>{count}</small> : null}
                    </span>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        <div className="typing-demo-heatmap-caption">
          <span>低</span><i /><i /><i /><i /><i /><span>高</span>
          <p>{topKeySummary}</p>
        </div>
      </section>
    </aside>
  );
});

function rowForCode(code: string): KeyboardRow {
  if (row0Codes.has(code)) return 'R0';
  if (row1Codes.has(code)) return 'R1';
  if (row2Codes.has(code)) return 'R2';
  if (row3Codes.has(code)) return 'R3';
  return 'R4';
}

function specialForCode(code: string): SpecialKey | undefined {
  if (code === 'Space') return 'space';
  if (code === 'Enter' || code === 'NumpadEnter') return 'enter';
  if (code === 'Backspace' || code === 'Delete') return 'backspace';
  return undefined;
}

function legacyIDForCode(code: string): string | undefined {
  if (/^Key[A-Z]$/.test(code)) return code.slice(3).toLowerCase();
  if (/^Digit[0-9]$/.test(code)) return `digit${code.slice(5)}`;
  if (/^F(?:[1-9]|1[0-9]|20)$/.test(code)) return code.toLowerCase();
  return legacyCodeNames[code];
}

function resolveSampleID(profile: DemoProfile, code: string, phase: AudioPhase): string | undefined {
  const map = profile[phase];
  const legacyID = legacyIDForCode(code);
  if (legacyID && map.keyOverrides?.[legacyID]) return map.keyOverrides[legacyID];

  const special = specialForCode(code);
  if (special && map.specials[special]) return map.specials[special];

  return map.rows[rowForCode(code)] ?? map.generic;
}

class TypingAudioEngine {
  private readonly profiles = new Map<string, DemoProfile>();
  private readonly rawAudio = new Map<string, Promise<ArrayBuffer>>();
  private readonly banks = new Map<string, LoadedBank>();
  private readonly bankLoads = new Map<string, Promise<LoadedBank>>();
  private readonly variationCursors = new Map<string, number>();
  private readonly fetchControllers = new Set<AbortController>();
  private context: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private voices: ActiveVoice[] = [];
  private resumePromise: Promise<void> | null = null;
  private pendingResumePress: PendingResumePress | null = null;
  private playbackResumeActive = false;
  private resumeAttempt = 0;
  private outputVolume = 0.66;
  private muted = false;
  private destroyed = false;
  private contextPoisoned = false;

  constructor(
    private readonly manifest: DemoManifest,
    private readonly onUnavailable?: () => void,
  ) {
    manifest.profiles.forEach((profile) => this.profiles.set(profile.id, profile));
  }

  prefetch(profileID: string) {
    if (this.destroyed) return Promise.reject(new Error('Battuta audio engine has been closed'));
    const profile = this.profiles.get(profileID);
    if (!profile) return Promise.reject(new Error(`Unknown Battuta profile: ${profileID}`));
    const cached = this.rawAudio.get(profileID);
    if (cached) return cached;
    const controller = new AbortController();
    this.fetchControllers.add(controller);
    const request = fetch(profile.sprite, { cache: 'force-cache', signal: controller.signal }).then(async (response) => {
      if (!response.ok) throw new Error(`Unable to load ${profile.displayName}`);
      return response.arrayBuffer();
    }).catch((error) => {
      this.rawAudio.delete(profileID);
      throw error;
    }).finally(() => {
      this.fetchControllers.delete(controller);
    });
    this.rawAudio.set(profileID, request);
    return request;
  }

  async activate(profileID: string) {
    if (this.contextPoisoned || this.context?.state === 'closed') this.rebuildContext();
    this.configureAudioSession();
    this.ensureContext();
    this.primeOutput();
    await this.resume();
    if (this.context?.state !== 'running') throw new Error('Battuta audio output did not start');
    await this.loadProfile(profileID);
  }

  async resume() {
    if (this.contextPoisoned) throw new Error('Battuta audio output needs to be restarted');
    if (!this.context || this.context.state === 'running' || this.context.state === 'closed') return;
    if (!this.resumePromise) {
      const context = this.context;
      const attempt = this.resumeAttempt + 1;
      this.resumeAttempt = attempt;
      let timeoutID = 0;
      this.resumePromise = new Promise<void>((resolve, reject) => {
        timeoutID = window.setTimeout(() => reject(new Error('Audio resume timed out')), 1200);
        context.resume().then(resolve, reject);
      }).then(() => {
        if (context !== this.context || context.state !== 'running') {
          throw new Error('Audio output is still interrupted');
        }
      }).catch((error) => {
        this.contextPoisoned = true;
        this.onUnavailable?.();
        throw error;
      }).finally(() => {
        window.clearTimeout(timeoutID);
        if (this.resumeAttempt === attempt) this.resumePromise = null;
      });
    }
    await this.resumePromise;
  }

  resumeFromGesture() {
    this.configureAudioSession();
    this.ensureContext();
    this.primeOutput();
    return this.resume();
  }

  async loadProfile(profileID: string) {
    const existing = this.banks.get(profileID);
    if (existing) return existing;
    const loading = this.bankLoads.get(profileID);
    if (loading) return loading;

    this.ensureContext();
    const profile = this.profiles.get(profileID);
    if (!profile || !this.context) throw new Error(`Unknown Battuta profile: ${profileID}`);
    const context = this.context;
    const request = (async () => {
      const raw = await this.prefetch(profileID);
      const buffer = await context.decodeAudioData(raw.slice(0));
      if (this.destroyed || context !== this.context) throw new Error('Battuta audio engine has been closed');
      const bank = this.prepareBank(profile, buffer);
      this.banks.set(profileID, bank);
      return bank;
    })();
    this.bankLoads.set(profileID, request);
    try {
      return await request;
    } finally {
      if (this.bankLoads.get(profileID) === request) this.bankLoads.delete(profileID);
    }
  }

  play(profileID: string, code: string, phase: AudioPhase, when?: number) {
    const bank = this.banks.get(profileID);
    const context = this.context;
    const masterGain = this.masterGain;
    if (!bank || !context || !masterGain || context.state === 'closed') return false;
    if (context.state !== 'running') {
      if (phase === 'press') {
        this.pendingResumePress = { profileID, code, requestedAt: performance.now() };
        this.configureAudioSession();
        this.primeOutput();
      } else if (this.pendingResumePress?.code === code) {
        this.pendingResumePress = null;
      }
      this.requestPlaybackResume();
      return false;
    }

    let resolvedBank = bank;
    let sampleID = resolveSampleID(bank.profile, code, phase);
    if ((!sampleID || !bank.samples.has(sampleID)) && bank.profile.baseProfileID) {
      const fallback = this.banks.get(bank.profile.baseProfileID);
      if (fallback) {
        resolvedBank = fallback;
        sampleID = resolveSampleID(fallback.profile, code, phase);
      }
    }
    if (!sampleID) return false;
    const sample = resolvedBank.samples.get(sampleID);
    if (!sample) return false;

    const cursorKey = `${resolvedBank.profile.id}:${sampleID}`;
    const cursor = this.variationCursors.get(cursorKey) ?? 0;
    const recipe = playbackRecipes[playbackOrder[cursor]];
    this.variationCursors.set(cursorKey, (cursor + 1) % playbackOrder.length);

    while (this.voices.length >= 16) {
      const oldest = this.voices.shift();
      if (!oldest) break;
      try { oldest.source.stop(); } catch { /* already stopped */ }
      oldest.source.disconnect();
      oldest.gain.disconnect();
    }

    const source = context.createBufferSource();
    const gain = context.createGain();
    source.buffer = resolvedBank.buffer;
    source.playbackRate.value = recipe.rate;
    source.connect(gain);
    gain.connect(masterGain);

    const startTime = Math.max(context.currentTime, when ?? context.currentTime);
    const outputDuration = sample.durationSeconds / recipe.rate;
    const fadeDuration = Math.min(0.004, outputDuration * 0.2);
    gain.gain.setValueAtTime(recipe.gain, startTime);
    if (fadeDuration > 0) {
      gain.gain.setValueAtTime(recipe.gain, Math.max(startTime, startTime + outputDuration - fadeDuration));
      gain.gain.linearRampToValueAtTime(0.0001, startTime + outputDuration);
    }

    const voice = { source, gain };
    this.voices.push(voice);
    source.onended = () => {
      const index = this.voices.indexOf(voice);
      if (index >= 0) this.voices.splice(index, 1);
      source.disconnect();
      gain.disconnect();
    };
    source.start(startTime, sample.offsetSeconds, sample.durationSeconds);
    return true;
  }

  tap(profileID: string, code = 'KeyA') {
    if (!this.context) return false;
    if (this.context.state !== 'running') {
      this.configureAudioSession();
      this.primeOutput();
      this.pendingResumePress = {
        profileID,
        code,
        requestedAt: performance.now(),
        releaseAfterSeconds: 0.055,
        maximumDelayMS: 500,
      };
      this.requestPlaybackResume();
      return true;
    }
    const now = this.context.currentTime;
    const played = this.play(profileID, code, 'press', now);
    if (played) this.play(profileID, code, 'release', now + 0.055);
    return played;
  }

  setVolume(value: number) {
    this.outputVolume = Math.min(1, Math.max(0, value));
    this.applyOutputLevel();
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    this.applyOutputLevel();
  }

  async destroy() {
    this.destroyed = true;
    this.fetchControllers.forEach((controller) => controller.abort());
    this.fetchControllers.clear();
    this.pendingResumePress = null;
    this.voices.forEach(({ source, gain }) => {
      try { source.stop(); } catch { /* already stopped */ }
      source.disconnect();
      gain.disconnect();
    });
    this.voices = [];
    await this.context?.close();
    this.context = null;
    this.masterGain = null;
    this.resumePromise = null;
    this.rawAudio.clear();
    this.bankLoads.clear();
    this.restoreAudioSession();
  }

  private rebuildContext() {
    const previousContext = this.context;
    this.voices.forEach(({ source, gain }) => {
      source.onended = null;
      try { source.stop(); } catch { /* already stopped */ }
      source.disconnect();
      gain.disconnect();
    });
    this.voices = [];
    this.context = null;
    this.masterGain = null;
    this.resumePromise = null;
    this.resumeAttempt += 1;
    this.pendingResumePress = null;
    this.playbackResumeActive = false;
    this.banks.clear();
    this.bankLoads.clear();
    this.contextPoisoned = false;
    if (previousContext && previousContext.state !== 'closed') {
      void previousContext.close().catch(() => undefined);
    }
    this.ensureContext();
  }

  private ensureContext() {
    if (this.context) return;
    const AudioContextConstructor = window.AudioContext
      ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextConstructor) throw new Error('This browser does not support Web Audio');
    try {
      this.context = new AudioContextConstructor({ latencyHint: 'interactive', sampleRate: this.manifest.sampleRate });
    } catch {
      this.context = new AudioContextConstructor();
    }
    this.masterGain = this.context.createGain();
    this.masterGain.connect(this.context.destination);
    this.applyOutputLevel(true);
  }

  private applyOutputLevel(immediate = false) {
    if (!this.context || !this.masterGain) return;
    const level = this.muted ? 0 : this.outputVolume;
    if (immediate) {
      this.masterGain.gain.value = level;
    } else {
      this.masterGain.gain.setTargetAtTime(level, this.context.currentTime, 0.008);
    }
  }

  private configureAudioSession() {
    const audioSession = (navigator as Navigator & {
      audioSession?: { type: string };
    }).audioSession;
    if (!audioSession) return;
    try {
      audioSession.type = 'playback';
    } catch {
      // Older WebKit builds expose a partial Audio Session implementation.
    }
  }

  private restoreAudioSession() {
    const audioSession = (navigator as Navigator & {
      audioSession?: { type: string };
    }).audioSession;
    if (!audioSession) return;
    try {
      audioSession.type = 'auto';
    } catch {
      // Leave platform-managed audio routing unchanged when unsupported.
    }
  }

  private primeOutput() {
    const context = this.context;
    const masterGain = this.masterGain;
    if (!context || !masterGain || context.state === 'closed') return;
    const source = context.createBufferSource();
    source.buffer = context.createBuffer(1, 1, context.sampleRate);
    source.connect(masterGain);
    source.onended = () => source.disconnect();
    source.start();
  }

  private requestPlaybackResume() {
    if (this.playbackResumeActive || this.destroyed) return;
    this.playbackResumeActive = true;
    void this.resume().then(() => {
      const pending = this.pendingResumePress;
      this.pendingResumePress = null;
      if (pending && performance.now() - pending.requestedAt <= (pending.maximumDelayMS ?? 120)) {
        const played = this.play(pending.profileID, pending.code, 'press');
        if (played && pending.releaseAfterSeconds && this.context) {
          this.play(
            pending.profileID,
            pending.code,
            'release',
            this.context.currentTime + pending.releaseAfterSeconds,
          );
        }
      }
    }).catch(() => {
      this.pendingResumePress = null;
    }).finally(() => {
      this.playbackResumeActive = false;
    });
  }

  private prepareBank(profile: DemoProfile, buffer: AudioBuffer): LoadedBank {
    const samples = new Map<string, PreparedSample>();
    const channel = buffer.getChannelData(0);
    const frameScale = buffer.sampleRate / this.manifest.sampleRate;
    const maximumScanFrames = Math.ceil(buffer.sampleRate * 0.25);
    const prerollFrames = Math.ceil(buffer.sampleRate * 0.00015);
    const minimumTrimFrames = Math.ceil(buffer.sampleRate * 0.0005);

    Object.entries(profile.samples).forEach(([sampleID, segment]) => {
      const startFrame = Math.round(segment.offsetFrames * frameScale);
      const endFrame = Math.min(
        channel.length,
        Math.round((segment.offsetFrames + segment.frameCount) * frameScale),
      );
      const frameCount = Math.max(1, endFrame - startFrame);
      const scanEnd = Math.min(endFrame, startFrame + maximumScanFrames);
      let firstAudibleFrame = startFrame;
      while (firstAudibleFrame < scanEnd && Math.abs(channel[firstAudibleFrame]) < 0.0008) {
        firstAudibleFrame += 1;
      }

      let trimFrames = Math.max(0, firstAudibleFrame - startFrame - prerollFrames);
      if (trimFrames < minimumTrimFrames || trimFrames >= frameCount) trimFrames = 0;
      const audibleStart = startFrame + trimFrames;
      samples.set(sampleID, {
        offsetSeconds: audibleStart / buffer.sampleRate,
        durationSeconds: Math.max(0.001, (endFrame - audibleStart) / buffer.sampleRate),
      });
    });

    return { profile, buffer, samples };
  }
}

function audioStateLabel(state: AudioState, selectedProfile?: DemoProfile) {
  switch (state) {
  case 'loading': return '正在准备网页音频…';
  case 'awaiting': return `${selectedProfile?.displayName ?? '音色'} 已下载，点击开启声音`;
  case 'activating': return `正在解码 ${selectedProfile?.displayName ?? '音色'}…`;
  case 'switching': return `正在切换到 ${selectedProfile?.displayName ?? '新音色'}…`;
  case 'ready': return `${selectedProfile?.displayName ?? '音色'} 已就绪，可以试打`;
  case 'error': return '音频没有成功开启，请重试';
  }
}

export function BattutaTypingDemo() {
  const [profiles, setProfiles] = useState<DemoProfile[]>([]);
  const [selectedProfileID, setSelectedProfileID] = useState(defaultProfileID);
  const [audioState, setAudioState] = useState<AudioState>('loading');
  const [volume, setVolume] = useState(66);
  const [muted, setMuted] = useState(false);
  const [conversionVisible, setConversionVisible] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [telemetryStore] = useState(() => new TypingTelemetryStore());
  const engineRef = useRef<TypingAudioEngine | null>(null);
  const activeProfileIDRef = useRef(defaultProfileID);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const pulseRef = useRef<HTMLDivElement | null>(null);
  const pressedCodesRef = useRef(new Set<string>());
  const successfulStrikeCountRef = useRef(0);
  const switchGenerationRef = useRef(0);
  const lastPhysicalEventRef = useRef(Number.NEGATIVE_INFINITY);
  const composingRef = useRef(false);
  const suppressComposedInputUntilRef = useRef(0);
  const pendingPhysicalInputRef = useRef(false);
  const skipNextInputRef = useRef(false);
  const focusAnimationFrameRef = useRef<number | null>(null);

  const selectedProfile = useMemo(
    () => profiles.find((profile) => profile.id === selectedProfileID),
    [profiles, selectedProfileID],
  );
  const quickProfiles = useMemo(
    () => quickProfileIDs.map((id) => profiles.find((profile) => profile.id === id)).filter(Boolean) as DemoProfile[],
    [profiles],
  );

  const syncPressedCodes = useCallback(() => {
    pulseRef.current?.setAttribute('data-active', pressedCodesRef.current.size > 0 ? 'true' : 'false');
  }, []);

  useEffect(() => {
    let cancelled = false;
    let engine: TypingAudioEngine | null = null;
    let prefetchTimer: number | null = null;
    const manifestController = new AbortController();
    const demoTextarea = textareaRef.current;
    fetch(manifestURL, { cache: 'no-cache', signal: manifestController.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error('Unable to load Battuta demo manifest');
        return response.json() as Promise<DemoManifest>;
      })
      .then((manifest) => {
        if (cancelled) return;
        const createdEngine = new TypingAudioEngine(manifest, () => {
          if (!cancelled && engineRef.current === createdEngine) setAudioState('error');
        });
        engine = createdEngine;
        engineRef.current = engine;
        setProfiles(manifest.profiles);
        const initialProfile = manifest.profiles.find((profile) => profile.id === defaultProfileID)
          ?? manifest.profiles[0];
        if (!initialProfile) throw new Error('Battuta demo manifest has no profiles');
        setSelectedProfileID(initialProfile.id);
        activeProfileIDRef.current = initialProfile.id;
        void engine.prefetch(initialProfile.id).then(() => {
          if (!cancelled) setAudioState('awaiting');
        }).catch(() => {
          if (!cancelled) setAudioState('error');
        });

        prefetchTimer = window.setTimeout(() => {
          quickProfileIDs
            .filter((profileID) => profileID !== initialProfile.id)
            .forEach((profileID) => void engine?.prefetch(profileID).catch(() => undefined));
        }, 700);
      })
      .catch(() => {
        if (!cancelled) setAudioState('error');
      });

    return () => {
      cancelled = true;
      manifestController.abort();
      if (prefetchTimer !== null) window.clearTimeout(prefetchTimer);
      if (focusAnimationFrameRef.current !== null) {
        window.cancelAnimationFrame(focusAnimationFrameRef.current);
        focusAnimationFrameRef.current = null;
      }
      if (demoTextarea) demoTextarea.value = '';
      void engine?.destroy();
      engineRef.current = null;
    };
  }, [loadAttempt]);

  useEffect(() => {
    const clearPressed = () => {
      pressedCodesRef.current.clear();
      syncPressedCodes();
    };
    const handleVisibility = () => {
      if (document.hidden) clearPressed();
    };
    window.addEventListener('blur', clearPressed);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      window.removeEventListener('blur', clearPressed);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [syncPressedCodes]);

  const registerStrike = useCallback(() => {
    successfulStrikeCountRef.current += 1;
    if (successfulStrikeCountRef.current === 8) setConversionVisible(true);
  }, []);

  const activateAudio = useCallback(async () => {
    const engine = engineRef.current;
    if (!engine || !selectedProfile) return;
    setAudioState('activating');
    try {
      await engine.activate(selectedProfile.id);
      if (engineRef.current !== engine) return;
      activeProfileIDRef.current = selectedProfile.id;
      setAudioState('ready');
      focusAnimationFrameRef.current = window.requestAnimationFrame(() => {
        textareaRef.current?.focus({ preventScroll: true });
        focusAnimationFrameRef.current = null;
      });
    } catch {
      if (engineRef.current === engine) setAudioState('error');
    }
  }, [selectedProfile]);

  const selectProfile = useCallback(async (profileID: string) => {
    const engine = engineRef.current;
    if (!engine || profileID === selectedProfileID) return;
    setSelectedProfileID(profileID);
    const generation = switchGenerationRef.current + 1;
    switchGenerationRef.current = generation;

    if (audioState === 'awaiting' || audioState === 'loading' || audioState === 'error') {
      setAudioState('loading');
      void engine.prefetch(profileID).then(() => {
        if (switchGenerationRef.current !== generation) return;
        activeProfileIDRef.current = profileID;
        setAudioState('awaiting');
      }).catch(() => {
        if (switchGenerationRef.current === generation) setAudioState('error');
      });
      return;
    }

    setAudioState('switching');
    try {
      await engine.loadProfile(profileID);
      if (engineRef.current !== engine || switchGenerationRef.current !== generation) return;
      activeProfileIDRef.current = profileID;
      setAudioState('ready');
    } catch {
      if (engineRef.current === engine && switchGenerationRef.current === generation) setAudioState('error');
    }
  }, [audioState, selectedProfileID]);

  const handleKeyDown = useCallback((event: ReactKeyboardEvent<HTMLTextAreaElement>) => {
    const code = event.code;
    if (!code || code === 'Unidentified') return;
    lastPhysicalEventRef.current = performance.now();
    const producesInput = !event.metaKey && !event.ctrlKey && !event.altKey && (
      event.key.length === 1
      || event.key === 'Backspace'
      || event.key === 'Delete'
      || event.key === 'Enter'
    );
    if (producesInput) pendingPhysicalInputRef.current = true;
    if (event.repeat) return;
    pressedCodesRef.current.add(code);
    const schedulingStart = performance.now();
    let played = false;
    const shouldRecord = audioState === 'ready';
    if (audioState === 'ready') {
      played = engineRef.current?.play(activeProfileIDRef.current, code, 'press') ?? false;
      if (played) registerStrike();
    } else if (audioState === 'awaiting' || audioState === 'error') {
      void activateAudio();
    }
    textareaRef.current?.setAttribute('data-last-schedule-ms', (performance.now() - schedulingStart).toFixed(3));
    if (shouldRecord) telemetryStore.recordPhysical(code, performance.now());
    syncPressedCodes();
  }, [activateAudio, audioState, registerStrike, syncPressedCodes, telemetryStore]);

  const handleKeyUp = useCallback((event: ReactKeyboardEvent<HTMLTextAreaElement>) => {
    const code = event.code;
    if (!code || code === 'Unidentified' || !pressedCodesRef.current.delete(code)) return;
    lastPhysicalEventRef.current = performance.now();
    if (audioState === 'ready') engineRef.current?.play(activeProfileIDRef.current, code, 'release');
    syncPressedCodes();
  }, [audioState, syncPressedCodes]);

  const recordSoftTap = useCallback((inputType: string, data: string | null, now: number) => {
    const queuedOrPlayed = engineRef.current?.tap(
      activeProfileIDRef.current,
      softInputCode(inputType, data),
    ) ?? false;
    if (queuedOrPlayed) registerStrike();
    telemetryStore.recordSoftInput(now);
  }, [registerStrike, telemetryStore]);

  const handleBeforeInput = useCallback((event: ReactFormEvent<HTMLTextAreaElement>) => {
    const nativeEvent = event.nativeEvent as InputEvent;
    const inputType = nativeEvent.inputType ?? '';
    if (!isSoftTypingInput(inputType)) return;
    skipNextInputRef.current = true;
    if (composingRef.current) return;
    const now = performance.now();
    if (now < suppressComposedInputUntilRef.current) return;
    if (pendingPhysicalInputRef.current) {
      pendingPhysicalInputRef.current = false;
      return;
    }
    if (audioState === 'ready') recordSoftTap(inputType, nativeEvent.data, now);
  }, [audioState, recordSoftTap]);

  const handleInput = useCallback((event: ReactFormEvent<HTMLTextAreaElement>) => {
    if (skipNextInputRef.current) {
      skipNextInputRef.current = false;
      return;
    }
    if (composingRef.current || audioState !== 'ready') return;
    const nativeEvent = event.nativeEvent as InputEvent;
    const inputType = nativeEvent.inputType ?? '';
    if (inputType && !isSoftTypingInput(inputType)) return;
    if (pendingPhysicalInputRef.current) {
      pendingPhysicalInputRef.current = false;
      return;
    }
    const now = performance.now();
    if (now < suppressComposedInputUntilRef.current || now - lastPhysicalEventRef.current < 450) return;
    recordSoftTap(inputType, nativeEvent.data, now);
  }, [audioState, recordSoftTap]);

  const handleInputAudioGesture = useCallback(() => {
    if (audioState !== 'ready') return;
    void engineRef.current?.resumeFromGesture().catch(() => undefined);
  }, [audioState]);

  const handleCompositionStart = useCallback(() => {
    composingRef.current = true;
  }, []);

  const handleCompositionEnd = useCallback(() => {
    composingRef.current = false;
    const now = performance.now();
    suppressComposedInputUntilRef.current = now + 250;
    if (audioState === 'ready' && now - lastPhysicalEventRef.current >= 450) {
      recordSoftTap('insertCompositionText', null, now);
    }
  }, [audioState, recordSoftTap]);

  const handleInputBlur = useCallback(() => {
    if (audioState === 'ready') {
      pressedCodesRef.current.forEach((code) => {
        engineRef.current?.play(activeProfileIDRef.current, code, 'release');
      });
    }
    pressedCodesRef.current.clear();
    pendingPhysicalInputRef.current = false;
    skipNextInputRef.current = false;
    syncPressedCodes();
  }, [audioState, syncPressedCodes]);

  const updateVolume = useCallback((nextVolume: number) => {
    setVolume(nextVolume);
    engineRef.current?.setVolume(nextVolume / 100);
  }, []);

  const toggleMuted = useCallback(() => {
    setMuted((current) => {
      engineRef.current?.setMuted(!current);
      return !current;
    });
  }, []);

  const clearInput = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.value = '';
      textareaRef.current.focus({ preventScroll: true });
    }
    telemetryStore.reset();
    successfulStrikeCountRef.current = 0;
    setConversionVisible(false);
  }, [telemetryStore]);

  const handleUnlock = useCallback(() => {
    if (!engineRef.current) {
      setAudioState('loading');
      setLoadAttempt((attempt) => attempt + 1);
      return;
    }
    void activateAudio();
  }, [activateAudio]);

  const inputReady = audioState === 'ready';
  const statusText = audioStateLabel(audioState, selectedProfile);

  return (
    <section className="typing-demo-section dark-section" id="try" aria-labelledby="typing-demo-title">
      <div className="section-inner">
        <div className="typing-demo-heading">
          <div>
            <p className="section-kicker lime">无需安装，先听真实手感</p>
            <h2 id="typing-demo-title">现在，先试着打一句。</h2>
          </div>
          <p>
            网页试听与 Battuta 使用同一套按下、回弹和大小键录音。桌面端会按物理键位匹配；
            安装应用后，才能在所有软件中持续生效。
          </p>
        </div>

        <div className="typing-demo-panel">
          <div className="typing-demo-toolbar">
            <div className="typing-demo-current">
              <span className="typing-demo-signal" aria-hidden="true"><i /><i /><i /><i /></span>
              <div>
                <span>当前音色</span>
                <strong>{selectedProfile?.displayName ?? 'BCP (Suit80)'}</strong>
                <small>{selectedProfile ? `${selectedProfile.family} · ${selectedProfile.tone}` : '正在载入音色目录'}</small>
              </div>
            </div>

            <label className="typing-demo-select-label">
              <span>全部 21 种音色</span>
              <select
                value={selectedProfileID}
                onChange={(event) => void selectProfile(event.target.value)}
                disabled={profiles.length === 0 || audioState === 'activating' || audioState === 'switching'}
              >
                {profiles.map((profile) => (
                  <option key={profile.id} value={profile.id}>
                    {profile.displayName} · {profile.family}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <fieldset className="typing-demo-profile-picks">
            <legend>推荐音色</legend>
            <div className="typing-demo-profile-scroll">
              {quickProfiles.map((profile) => (
                <button
                  key={profile.id}
                  type="button"
                  className={profile.id === selectedProfileID ? 'is-selected' : undefined}
                  aria-current={profile.id === selectedProfileID ? 'true' : undefined}
                  onClick={() => void selectProfile(profile.id)}
                  disabled={audioState === 'activating' || audioState === 'switching'}
                >
                  <span>{profile.displayName}</span>
                  <small>{profile.tone}</small>
                  {profile.recommended ? <em>推荐</em> : null}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="typing-demo-workbench">
            <div className="typing-demo-compose">
              <div className={`typing-demo-input-shell${inputReady ? ' is-ready' : ''}`}>
                <label htmlFor="battuta-demo-input">在这里输入 · 仅统计此输入框</label>
                <textarea
                  ref={textareaRef}
                  id="battuta-demo-input"
                  rows={8}
                  readOnly={!inputReady}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  placeholder="写一句今天想说的话，听听每一次按下与回弹……"
                  tabIndex={inputReady ? 0 : -1}
                  aria-describedby="battuta-demo-privacy battuta-demo-status"
                  onClick={handleInputAudioGesture}
                  onBeforeInput={handleBeforeInput}
                  onKeyDown={handleKeyDown}
                  onKeyUp={handleKeyUp}
                  onInput={handleInput}
                  onCompositionStart={handleCompositionStart}
                  onCompositionEnd={handleCompositionEnd}
                  onBlur={handleInputBlur}
                />
                {!inputReady ? (
                  <button
                    type="button"
                    className="typing-demo-unlock"
                    onClick={handleUnlock}
                    disabled={audioState === 'loading' || audioState === 'activating' || audioState === 'switching'}
                  >
                    <span aria-hidden="true">▶</span>
                    {audioState === 'loading'
                      ? '正在准备音频'
                      : audioState === 'activating'
                        ? '正在解码音色'
                        : profiles.length === 0
                          ? '重新载入音频'
                          : '开启声音并试打'}
                  </button>
                ) : null}
                <div ref={pulseRef} className="typing-demo-pulse" aria-hidden="true" data-active="false" />
              </div>

              <div className="typing-demo-controls">
                <button
                  type="button"
                  className="typing-demo-mute"
                  aria-pressed={muted}
                  onClick={toggleMuted}
                  disabled={!inputReady}
                >
                  <span aria-hidden="true">{muted ? '🔇' : '🔊'}</span>
                  {muted ? '恢复声音' : '静音'}
                </button>
                <label className="typing-demo-volume">
                  <span>试听音量</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={(event) => updateVolume(Number(event.target.value))}
                    disabled={!inputReady || muted}
                    aria-valuetext={`${volume}%`}
                  />
                  <output>{volume}%</output>
                </label>
                <button type="button" className="typing-demo-clear" onClick={clearInput} disabled={!inputReady}>
                  清空本次
                </button>
                <p id="battuta-demo-status" className="typing-demo-status" aria-live="polite">
                  <i data-state={audioState} />{statusText}
                </p>
              </div>

              <p className="typing-demo-local-note">
                <span aria-hidden="true">●</span>
                100 ms 记录敲击，1 秒汇总为柱状与趋势；清空或刷新页面即重置。
              </p>
            </div>

            <TypingTelemetryPanel store={telemetryStore} />
          </div>

          <div className="typing-demo-footer">
            <p id="battuta-demo-privacy">
              <span aria-hidden="true">⌁</span>
              仅在此输入框内统计匿名物理键位与敲击节奏；不读取文字内容、不上传、不保存，也不需要输入监控权限。
            </p>
            <div className="typing-demo-credits">
              <a
                href="/battuta/demo-audio/AUDIO-THIRD-PARTY-NOTICES.md"
                target="_blank"
                rel="noreferrer"
              >
                音频来源与许可 ↗
              </a>
            </div>
          </div>

          <div
            className={`typing-demo-conversion${conversionVisible ? ' is-visible' : ''}`}
            aria-hidden={!conversionVisible}
          >
            <div>
              <span>喜欢这个声音？</span>
              <strong>让所有应用都这样响。</strong>
            </div>
            <a href="#install" tabIndex={conversionVisible ? 0 : -1}>查看安装方式</a>
          </div>
        </div>

        <p className="typing-demo-mobile-note">
          手机软键盘会记录敲击节奏，但无法稳定提供物理键位和抬起事件；电脑端可体验完整键位热力图与回弹映射。
        </p>
      </div>
    </section>
  );
}
