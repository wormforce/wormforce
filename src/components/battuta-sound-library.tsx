"use client";

import {
  ArrowsClockwiseIcon,
  BackspaceIcon,
  BriefcaseIcon,
  CaretDoubleLeftIcon,
  CheckIcon,
  DownloadSimpleIcon,
  GridFourIcon,
  HeartIcon,
  KeyboardIcon,
  ListIcon,
  MagnifyingGlassIcon,
  MoonIcon,
  PauseIcon,
  PlayIcon,
  PlusIcon,
  ShuffleIcon,
  SkipBackIcon,
  SkipForwardIcon,
  SpeakerHighIcon,
  SpeakerSlashIcon,
  SparkleIcon,
  WaveformIcon,
  XIcon,
} from "@phosphor-icons/react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import type { BattutaLocale } from "@/content/battuta";
import {
  BattutaPreviewAudio,
  type DemoManifest,
  type DemoProfile,
} from "@/lib/battuta-preview-audio";

type FamilyFilter = "all" | "线性" | "段落" | "点击" | "静电容" | "屈曲弹簧";
type SortMode = "curated" | "name" | "samples";
type ViewMode = "grid" | "list";

type Collection = {
  id: string;
  title: string;
  description: string;
  profileIDs: string[];
  icon: typeof MoonIcon;
};

const manifestURL = "/battuta/demo-audio/manifest.json";
const defaultProfileID = "bcp-suit80";
const curatedProfileOrder = [
  "bcp-suit80",
  "holypanda",
  "mxblue",
  "cream",
  "topre",
  "buckling",
  "mxbrown",
  "mxclear",
  "g915brown",
  "studiotactile",
  "boxnavy",
  "boxwhite",
  "lowprofileblue",
  "bluealps",
  "studioclicky",
  "alpaca",
  "blackink",
  "redink",
  "mxblack",
  "turquoise",
  "keychronred",
] as const;
const curatedProfileRank = new Map<string, number>(
  curatedProfileOrder.map((profileID, index) => [profileID, index]),
);
const sequenceDurationMS = 12_000;
const typingCodes = [
  "KeyT", "KeyH", "KeyE", "Space", "KeyQ", "KeyU", "KeyI", "KeyC", "KeyK",
  "Space", "KeyB", "KeyR", "KeyO", "KeyW", "KeyN", "Space", "KeyF", "KeyO",
  "KeyX", "Space", "KeyJ", "KeyU", "KeyM", "KeyP", "KeyS", "Enter",
];
const typingIntervals = [96, 82, 121, 168, 74, 88, 109, 77, 142, 196, 92, 71, 114, 86, 133, 182];

const familyEnglish: Record<string, string> = {
  "线性": "Linear",
  "段落": "Tactile",
  "点击": "Clicky",
  "静电容": "Electro-capacitive",
  "屈曲弹簧": "Buckling spring",
};

const toneEnglish: Record<string, string> = {
  "厚实、木感": "Full, woody",
  "饱满、集中": "Full, focused",
  "温和、均衡": "Gentle, balanced",
  "扎实、段落明显": "Firm, tactile",
  "轻薄、利落": "Light, crisp",
  "近场、细腻": "Close, detailed",
  "清脆、经典": "Crisp, classic",
  "厚重、响亮": "Heavy, loud",
  "短促、清亮": "Short, bright",
  "薄脆、双向点击": "Thin, double-click",
  "复古、锐利": "Vintage, sharp",
  "明快、颗粒感": "Bright, textured",
  "顺滑、奶油": "Smooth, creamy",
  "干净、柔和": "Clean, soft",
  "低沉、扎实": "Low, solid",
  "轻快、圆润": "Light, rounded",
  "沉稳、硬朗": "Steady, firm",
  "明亮、顺滑": "Bright, smooth",
  "干净、轻快": "Clean, lively",
  "柔韧、闷响": "Springy, muted",
  "复古、金属感": "Vintage, metallic",
};

const copy = {
  "zh-CN": {
    title: "声音图鉴",
    subtitle: "发现、试听并比较真实机械键盘音色",
    search: "搜索音色、轴体、作者或听感…",
    random: "随机试听",
    filters: {
      all: "全部",
      "线性": "线性轴",
      "段落": "段落轴",
      "点击": "点击轴",
      "静电容": "静电容",
      "屈曲弹簧": "屈曲弹簧",
    },
    moreFilters: "更多筛选",
    sortCurated: "精选排序",
    sortName: "名称排序",
    sortSamples: "样本数量",
    sounds: "套音色",
    collections: [
      { id: "night", title: "深夜线性", description: "低频、克制、顺滑", profileIDs: ["blackink", "mxblack", "alpaca"], icon: MoonIcon },
      { id: "crisp", title: "清脆点击", description: "清亮、利落、反馈明确", profileIDs: ["mxblue", "boxwhite", "bluealps"], icon: SparkleIcon },
      { id: "office", title: "办公室友好", description: "温和、耐听、不过分抢耳", profileIDs: ["mxbrown", "topre", "g915brown"], icon: BriefcaseIcon },
    ] satisfies Collection[],
    playCollection: "试听合集",
    bundled: "Battuta 内置音色",
    samples: "个真实样本",
    addCompare: "加入对比",
    removeCompare: "移出对比",
    favorite: "收藏",
    unfavorite: "取消收藏",
    playing: "正在播放",
    playerEmpty: "选择任意音色开始试听",
    loop: "循环播放",
    mute: "静音",
    unmute: "恢复声音",
    quickListen: "快速试听",
    typeTest: "自由试打",
    typePlaceholder: "点这里，直接打字试听…",
    normalKey: "普通键",
    install: "安装 Battuta",
    audioCredits: "音频来源",
    selected: "已选",
    compareHint: "最多选择 3 套，快速 A/B 切换",
    addSound: "添加音色",
    clear: "清空",
    compare: "开始对比试听",
    comparing: "正在对比",
    loading: "正在载入 21 套真实音色…",
    loadError: "音色没有成功载入，请刷新后重试。",
    noResults: "没有找到匹配音色",
    noResultsHint: "换一个关键词或清除筛选试试。",
    audioError: "浏览器没有成功开启音频，请再次点击播放。",
    local: "所有音频与试打都在浏览器本地完成",
    listView: "列表视图",
    gridView: "网格视图",
    previous: "上一个音色",
    next: "下一个音色",
    stop: "暂停试听",
    play: "播放试听",
  },
  en: {
    title: "Sound Atlas",
    subtitle: "Discover, audition, and compare real mechanical-keyboard sounds",
    search: "Search sounds, switches, creators, or tone…",
    random: "Surprise me",
    filters: {
      all: "All",
      "线性": "Linear",
      "段落": "Tactile",
      "点击": "Clicky",
      "静电容": "Electro-capacitive",
      "屈曲弹簧": "Buckling spring",
    },
    moreFilters: "More filters",
    sortCurated: "Curated order",
    sortName: "Name",
    sortSamples: "Sample count",
    sounds: "profiles",
    collections: [
      { id: "night", title: "Late-night linear", description: "Low, restrained, smooth", profileIDs: ["blackink", "mxblack", "alpaca"], icon: MoonIcon },
      { id: "crisp", title: "Crisp clicks", description: "Bright, precise, unmistakable", profileIDs: ["mxblue", "boxwhite", "bluealps"], icon: SparkleIcon },
      { id: "office", title: "Office friendly", description: "Gentle, balanced, easy to live with", profileIDs: ["mxbrown", "topre", "g915brown"], icon: BriefcaseIcon },
    ] satisfies Collection[],
    playCollection: "Play collection",
    bundled: "Battuta built-in",
    samples: "real samples",
    addCompare: "Add to comparison",
    removeCompare: "Remove from comparison",
    favorite: "Favorite",
    unfavorite: "Remove favorite",
    playing: "Now playing",
    playerEmpty: "Choose any sound to start listening",
    loop: "Loop preview",
    mute: "Mute",
    unmute: "Unmute",
    quickListen: "Quick samples",
    typeTest: "Type to test",
    typePlaceholder: "Click here and type anything…",
    normalKey: "Regular key",
    install: "Install Battuta",
    audioCredits: "Audio credits",
    selected: "Selected",
    compareHint: "Choose up to 3 profiles for quick A/B switching",
    addSound: "Add sound",
    clear: "Clear",
    compare: "Start A/B comparison",
    comparing: "Comparing",
    loading: "Loading 21 real sound profiles…",
    loadError: "The sound library could not load. Refresh and try again.",
    noResults: "No matching sounds",
    noResultsHint: "Try another search or clear the filter.",
    audioError: "The browser could not start audio. Click play again.",
    local: "Audio and typing stay entirely in this browser",
    listView: "List view",
    gridView: "Grid view",
    previous: "Previous sound",
    next: "Next sound",
    stop: "Pause preview",
    play: "Play preview",
  },
} as const;

function localizedFamily(profile: DemoProfile, locale: BattutaLocale) {
  return locale === "en" ? (familyEnglish[profile.family] ?? profile.family) : profile.family;
}

function localizedTone(profile: DemoProfile, locale: BattutaLocale) {
  return locale === "en" ? (toneEnglish[profile.tone] ?? profile.tone) : profile.tone;
}

function profileAuthor(profile: DemoProfile, fallback: string) {
  return profile.attribution?.author?.trim() || fallback;
}

function AudioWaveform({
  points,
  active = false,
  progress = 0,
  light = false,
  label,
  className = "",
}: {
  points?: number[];
  active?: boolean;
  progress?: number;
  light?: boolean;
  label: string;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const density = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(rect.width * density);
      canvas.height = Math.round(rect.height * density);
      const context = canvas.getContext("2d");
      if (!context) return;
      context.setTransform(density, 0, 0, density, 0, 0);
      context.clearRect(0, 0, rect.width, rect.height);

      const center = rect.height / 2;
      const values = points?.length ? points : [0.08, 0.08, 0.08, 0.08];
      const slot = rect.width / values.length;
      const barWidth = Math.max(1, Math.min(3, slot * 0.48));
      values.forEach((value, index) => {
        const x = (index + 0.5) * slot;
        const amplitude = Math.max(1, value * rect.height * 0.43);
        const played = active && x / rect.width <= progress;
        context.strokeStyle = played
          ? "#d8ff73"
          : light
            ? "rgba(21, 23, 20, 0.28)"
            : "rgba(246, 248, 241, 0.68)";
        context.lineWidth = barWidth;
        context.lineCap = "round";
        context.beginPath();
        context.moveTo(x, center - amplitude);
        context.lineTo(x, center + amplitude);
        context.stroke();
      });
    };

    draw();
    const observer = new ResizeObserver(draw);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [active, light, points, progress]);

  return <canvas ref={canvasRef} className={className} role="img" aria-label={label} />;
}

function formatTime(milliseconds: number) {
  const seconds = Math.max(0, Math.min(sequenceDurationMS, milliseconds)) / 1000;
  return "0:" + String(Math.floor(seconds)).padStart(2, "0");
}

export function BattutaSoundLibrary({
  locale,
  productPath,
}: {
  locale: BattutaLocale;
  productPath: string;
}) {
  const content = copy[locale];
  const [profiles, setProfiles] = useState<DemoProfile[]>([]);
  const [sampleRate, setSampleRate] = useState(48_000);
  const [waveforms, setWaveforms] = useState<Record<string, number[]>>({});
  const [selectedProfileID, setSelectedProfileID] = useState(defaultProfileID);
  const [playingProfileID, setPlayingProfileID] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [comparisonRunning, setComparisonRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [query, setQuery] = useState("");
  const [family, setFamily] = useState<FamilyFilter>("all");
  const [sort, setSort] = useState<SortMode>("curated");
  const [view, setView] = useState<ViewMode>("grid");
  const [loop, setLoop] = useState(true);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(66);
  const [compareIDs, setCompareIDs] = useState<string[]>([defaultProfileID, "topre"]);
  const [favorites, setFavorites] = useState<Set<string>>(() => new Set());
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");
  const [audioError, setAudioError] = useState(false);

  const engineRef = useRef<BattutaPreviewAudio | null>(null);
  const timerIDsRef = useRef<number[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const playbackTokenRef = useRef(0);
  const loopRef = useRef(loop);
  const playingProfileRef = useRef<string | null>(null);
  const isPlayingRef = useRef(false);

  useEffect(() => { loopRef.current = loop; }, [loop]);
  useEffect(() => { playingProfileRef.current = playingProfileID; }, [playingProfileID]);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);

  useEffect(() => {
    const controller = new AbortController();
    let disposed = false;

    void fetch(manifestURL, { signal: controller.signal, cache: "force-cache" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to load Battuta audio manifest");
        const manifest = await response.json() as DemoManifest;
        if (disposed) return;
        const engine = new BattutaPreviewAudio(manifest, () => setAudioError(true));
        engine.setVolume(volume / 100);
        engineRef.current = engine;
        setProfiles(manifest.profiles);
        setSampleRate(manifest.sampleRate);
        setLoadState("ready");

        manifest.profiles.forEach((profile) => {
          void engine.preloadWaveform(profile.id, 128).then((points) => {
            if (!disposed) {
              setWaveforms((current) => ({ ...current, [profile.id]: points }));
            }
          }).catch(() => undefined);
        });
      })
      .catch((error: unknown) => {
        if (!disposed && !(error instanceof DOMException && error.name === "AbortError")) {
          setLoadState("error");
        }
      });

    return () => {
      disposed = true;
      playbackTokenRef.current += 1;
      controller.abort();
      const engine = engineRef.current;
      engineRef.current = null;
      timerIDsRef.current.forEach((id) => window.clearTimeout(id));
      timerIDsRef.current = [];
      if (animationFrameRef.current !== null) cancelAnimationFrame(animationFrameRef.current);
      void engine?.destroy();
    };
  // Volume is pushed through a dedicated effect after the engine is created.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    engineRef.current?.setVolume(volume / 100);
  }, [volume]);

  useEffect(() => {
    engineRef.current?.setMuted(muted);
  }, [muted]);

  const selectedProfile = useMemo(
    () => profiles.find((profile) => profile.id === selectedProfileID) ?? profiles[0],
    [profiles, selectedProfileID],
  );

  const visibleProfiles = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    const result = profiles.filter((profile) => {
      if (family !== "all" && profile.family !== family) return false;
      if (!normalizedQuery) return true;
      const searchable = [
        profile.displayName,
        profile.family,
        profile.tone,
        familyEnglish[profile.family],
        toneEnglish[profile.tone],
        profile.attribution?.author,
        profile.attribution?.title,
      ].filter(Boolean).join(" ").toLocaleLowerCase();
      return searchable.includes(normalizedQuery);
    });

    if (sort === "name") return [...result].sort((a, b) => a.displayName.localeCompare(b.displayName));
    if (sort === "samples") {
      return [...result].sort((a, b) => Object.keys(b.samples).length - Object.keys(a.samples).length);
    }
    return [...result].sort((a, b) => (
      (curatedProfileRank.get(a.id) ?? Number.MAX_SAFE_INTEGER)
      - (curatedProfileRank.get(b.id) ?? Number.MAX_SAFE_INTEGER)
    ));
  }, [family, profiles, query, sort]);

  const clearPlayback = useCallback((resetProgress = true) => {
    playbackTokenRef.current += 1;
    timerIDsRef.current.forEach((id) => window.clearTimeout(id));
    timerIDsRef.current = [];
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    engineRef.current?.stopAll();
    isPlayingRef.current = false;
    playingProfileRef.current = null;
    setIsPlaying(false);
    setComparisonRunning(false);
    setPlayingProfileID(null);
    if (resetProgress) setProgress(0);
  }, []);

  const playProfile = useCallback(async function runProfile(profileID: string) {
    const engine = engineRef.current;
    if (!engine) return;

    if (isPlayingRef.current && playingProfileRef.current === profileID && !comparisonRunning) {
      clearPlayback();
      return;
    }

    clearPlayback();
    const token = playbackTokenRef.current;
    setSelectedProfileID(profileID);
    setAudioError(false);

    try {
      await engine.activate(profileID);
      if (token !== playbackTokenRef.current) return;
      setPlayingProfileID(profileID);
      setIsPlaying(true);
      setProgress(0);

      let elapsed = 70;
      let hitIndex = 0;
      while (elapsed < sequenceDurationMS - 240) {
        const code = typingCodes[hitIndex % typingCodes.length];
        const timerID = window.setTimeout(() => {
          if (token === playbackTokenRef.current) engine.tap(profileID, code);
        }, elapsed);
        timerIDsRef.current.push(timerID);
        elapsed += typingIntervals[hitIndex % typingIntervals.length];
        hitIndex += 1;
      }

      const startedAt = performance.now();
      const updateProgress = () => {
        if (token !== playbackTokenRef.current) return;
        const nextProgress = Math.min(1, (performance.now() - startedAt) / sequenceDurationMS);
        setProgress(nextProgress);
        if (nextProgress < 1) {
          animationFrameRef.current = requestAnimationFrame(updateProgress);
        } else if (loopRef.current) {
          clearPlayback();
          void runProfile(profileID);
        } else {
          clearPlayback(false);
          setProgress(1);
        }
      };
      animationFrameRef.current = requestAnimationFrame(updateProgress);
    } catch {
      if (token === playbackTokenRef.current) {
        clearPlayback();
        setAudioError(true);
      }
    }
  }, [clearPlayback, comparisonRunning]);

  const triggerSample = useCallback(async (profileID: string, code: string) => {
    const engine = engineRef.current;
    if (!engine) return;
    setSelectedProfileID(profileID);
    setAudioError(false);
    try {
      await engine.activate(profileID);
      if (engine !== engineRef.current) return;
      engine.tap(profileID, code);
    } catch {
      if (engine === engineRef.current) setAudioError(true);
    }
  }, []);

  const moveProfile = useCallback((direction: number) => {
    if (!profiles.length) return;
    const currentIndex = Math.max(0, profiles.findIndex((profile) => profile.id === selectedProfileID));
    const nextIndex = (currentIndex + direction + profiles.length) % profiles.length;
    void playProfile(profiles[nextIndex].id);
  }, [playProfile, profiles, selectedProfileID]);

  const playRandom = useCallback(() => {
    if (!profiles.length) return;
    const candidates = profiles.filter((profile) => profile.id !== selectedProfileID);
    const profile = candidates[Math.floor(Math.random() * candidates.length)] ?? profiles[0];
    void playProfile(profile.id);
  }, [playProfile, profiles, selectedProfileID]);

  const toggleCompare = useCallback((profileID: string) => {
    if (comparisonRunning) clearPlayback();
    setCompareIDs((current) => {
      if (current.includes(profileID)) return current.filter((id) => id !== profileID);
      if (current.length >= 3) return [...current.slice(1), profileID];
      return [...current, profileID];
    });
  }, [clearPlayback, comparisonRunning]);

  const addNextCompareProfile = useCallback(() => {
    if (comparisonRunning) clearPlayback();
    const next = profiles.find((profile) => !compareIDs.includes(profile.id));
    if (next) setCompareIDs((current) => [...current, next.id].slice(0, 3));
  }, [clearPlayback, compareIDs, comparisonRunning, profiles]);

  const clearComparison = useCallback(() => {
    if (comparisonRunning) clearPlayback();
    setCompareIDs([]);
  }, [clearPlayback, comparisonRunning]);

  const runComparison = useCallback(async () => {
    const engine = engineRef.current;
    const IDs = compareIDs.filter((id) => profiles.some((profile) => profile.id === id));
    if (!engine || IDs.length < 2) return;
    clearPlayback();
    const token = playbackTokenRef.current;
    setComparisonRunning(true);
    setIsPlaying(true);
    setProgress(0);
    try {
      await engine.activate(IDs[0]);
      await Promise.all(IDs.map((id) => engine.loadProfile(id)));
      if (token !== playbackTokenRef.current) return;

      const sampleCodes = ["KeyA", "KeyS", "KeyD", "Space", "KeyJ", "KeyK", "Enter"];
      let cursor = 0;
      const segmentDuration = 1_650;
      IDs.forEach((profileID) => {
        const selectionTimer = window.setTimeout(() => {
          if (token !== playbackTokenRef.current) return;
          setSelectedProfileID(profileID);
          setPlayingProfileID(profileID);
        }, cursor);
        timerIDsRef.current.push(selectionTimer);
        sampleCodes.forEach((code, index) => {
          const timerID = window.setTimeout(() => {
            if (token === playbackTokenRef.current) engine.tap(profileID, code);
          }, cursor + 130 + index * 142);
          timerIDsRef.current.push(timerID);
        });
        cursor += segmentDuration;
      });

      const comparisonStartedAt = performance.now();
      const totalDuration = cursor;
      const update = () => {
        if (token !== playbackTokenRef.current) return;
        const nextProgress = Math.min(1, (performance.now() - comparisonStartedAt) / totalDuration);
        setProgress(nextProgress);
        if (nextProgress < 1) {
          animationFrameRef.current = requestAnimationFrame(update);
        } else {
          clearPlayback(false);
          setProgress(1);
        }
      };
      animationFrameRef.current = requestAnimationFrame(update);
    } catch {
      if (token === playbackTokenRef.current) {
        clearPlayback();
        setAudioError(true);
      }
    }
  }, [clearPlayback, compareIDs, profiles]);

  const handleTypingKey = useCallback((event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.repeat || event.nativeEvent.isComposing || event.metaKey || event.ctrlKey || event.altKey) return;
    const profile = selectedProfile;
    if (profile) void triggerSample(profile.id, event.code || "KeyA");
  }, [selectedProfile, triggerSample]);

  const toggleFavorite = useCallback((profileID: string) => {
    setFavorites((current) => {
      const next = new Set(current);
      if (next.has(profileID)) next.delete(profileID);
      else next.add(profileID);
      return next;
    });
  }, []);

  if (loadState === "loading") {
    return (
      <main className="community-library-shell community-library-loading">
        <WaveformIcon size={28} weight="duotone" />
        <p>{content.loading}</p>
      </main>
    );
  }

  if (loadState === "error" || !selectedProfile) {
    return (
      <main className="community-library-shell community-library-loading is-error">
        <WaveformIcon size={28} weight="duotone" />
        <p>{content.loadError}</p>
      </main>
    );
  }

  const selectedWaveform = waveforms[selectedProfile.id];
  const selectedAuthor = profileAuthor(selectedProfile, content.bundled);
  const currentElapsed = progress * sequenceDurationMS;
  const sampleRateLabel = Math.round(sampleRate / 1000) + " kHz";
  const familyFilters: FamilyFilter[] = ["all", "线性", "段落", "点击", "静电容", "屈曲弹簧"];

  return (
    <main className="community-library-shell">
      <div className="community-library-workspace">
        <section className="community-library-main" aria-labelledby="sound-atlas-title">
          <header className="community-library-topbar">
            <div className="community-library-title-block">
              <h1 id="sound-atlas-title">{content.title}</h1>
              <p>{content.subtitle}</p>
            </div>
            <label className="community-library-search">
              <MagnifyingGlassIcon size={21} weight="bold" aria-hidden />
              <span className="community-library-visually-hidden">{content.search}</span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={content.search}
              />
            </label>
            <button className="community-library-random-button" type="button" onClick={playRandom}>
              <ShuffleIcon size={20} weight="bold" aria-hidden />
              <span>{content.random}</span>
            </button>
          </header>

          <div className="community-library-filter-row" aria-label={locale === "en" ? "Sound filters" : "音色筛选"}>
            <div className="community-library-filter-scroll">
              {familyFilters.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  aria-pressed={family === filter}
                  onClick={() => setFamily(filter)}
                >
                  {content.filters[filter]}
                </button>
              ))}
            </div>
            <div className="community-library-view-tools">
              <select value={sort} onChange={(event) => setSort(event.target.value as SortMode)} aria-label={locale === "en" ? "Sort sounds" : "音色排序"}>
                <option value="curated">{content.sortCurated}</option>
                <option value="name">{content.sortName}</option>
                <option value="samples">{content.sortSamples}</option>
              </select>
              <span className="community-library-view-toggle">
                <button type="button" aria-label={content.listView} aria-pressed={view === "list"} onClick={() => setView("list")}>
                  <ListIcon size={18} weight="bold" aria-hidden />
                </button>
                <button type="button" aria-label={content.gridView} aria-pressed={view === "grid"} onClick={() => setView("grid")}>
                  <GridFourIcon size={18} weight="bold" aria-hidden />
                </button>
              </span>
            </div>
          </div>

          <section className="community-library-collection-grid" aria-label={locale === "en" ? "Curated collections" : "精选合集"}>
            {content.collections.map((collection) => {
              const representative = profiles.find((profile) => profile.id === collection.profileIDs[0]);
              const CollectionIcon = collection.icon;
              return (
                <article className="community-library-collection-card" key={collection.id}>
                  <div>
                    <CollectionIcon size={24} weight="fill" aria-hidden />
                    <span>
                      <strong>{collection.title}</strong>
                      <small>{collection.description}</small>
                    </span>
                    <button
                      type="button"
                      aria-label={content.playCollection + ": " + collection.title}
                      onClick={() => representative && void playProfile(representative.id)}
                    >
                      <PlayIcon size={17} weight="fill" aria-hidden />
                      <span>{content.playCollection}</span>
                    </button>
                  </div>
                  {representative ? (
                    <AudioWaveform
                      points={waveforms[representative.id]}
                      active={playingProfileID === representative.id && isPlaying}
                      progress={playingProfileID === representative.id ? progress : 0}
                      light
                      label={representative.displayName + " waveform"}
                    />
                  ) : null}
                </article>
              );
            })}
          </section>

          <div className="community-library-catalog-heading">
            <p><strong>{visibleProfiles.length}</strong> {content.sounds}</p>
            <span><WaveformIcon size={16} weight="bold" aria-hidden /> {content.local}</span>
          </div>

          {visibleProfiles.length ? (
            <section className={"community-library-sound-grid is-" + view} aria-label={content.title}>
              {visibleProfiles.map((profile) => {
                const isSelected = selectedProfileID === profile.id;
                const profileIsPlaying = playingProfileID === profile.id && isPlaying;
                const isCompared = compareIDs.includes(profile.id);
                const isFavorite = favorites.has(profile.id);
                const profileSamples = Object.keys(profile.samples).length;
                const author = profileAuthor(profile, content.bundled);
                return (
                  <article
                    className="community-library-sound-card"
                    data-selected={isSelected}
                    data-playing={profileIsPlaying}
                    id={"sound-" + profile.id}
                    key={profile.id}
                  >
                    <header className="community-library-sound-header">
                      <div>
                        <h2>{profile.displayName}</h2>
                        <div className="community-library-sound-tags">
                          <span>{localizedFamily(profile, locale)}</span>
                          <span>{localizedTone(profile, locale)}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="community-library-icon-button"
                        aria-label={(isFavorite ? content.unfavorite : content.favorite) + ": " + profile.displayName}
                        aria-pressed={isFavorite}
                        onClick={() => toggleFavorite(profile.id)}
                      >
                        <HeartIcon size={20} weight={isFavorite ? "fill" : "regular"} aria-hidden />
                      </button>
                    </header>

                    <div className="community-library-waveform-panel">
                      <AudioWaveform
                        points={waveforms[profile.id]}
                        active={profileIsPlaying}
                        progress={profileIsPlaying ? progress : 0}
                        label={profile.displayName + " waveform"}
                      />
                      <button
                        type="button"
                        className="community-library-card-play"
                        aria-label={(profileIsPlaying ? content.stop : content.play) + ": " + profile.displayName}
                        onClick={() => void playProfile(profile.id)}
                      >
                        {profileIsPlaying ? <PauseIcon size={26} weight="fill" aria-hidden /> : <PlayIcon size={26} weight="fill" aria-hidden />}
                      </button>
                      {profileIsPlaying ? (
                        <div className="community-library-card-progress">
                          <span>{formatTime(currentElapsed)} / 0:12</span>
                          <i style={{ "--progress": String(progress) } as CSSProperties} />
                        </div>
                      ) : null}
                    </div>

                    <footer className="community-library-sound-meta">
                      <span className="community-library-author-mark"><WaveformIcon size={13} weight="bold" aria-hidden /></span>
                      <span className="community-library-author">{author}</span>
                      <span className="community-library-fact">{profileSamples} {content.samples}</span>
                      <span className="community-library-fact">{sampleRateLabel}</span>
                      <button
                        type="button"
                        className="community-library-compare-toggle"
                        aria-label={(isCompared ? content.removeCompare : content.addCompare) + ": " + profile.displayName}
                        aria-pressed={isCompared}
                        onClick={() => toggleCompare(profile.id)}
                      >
                        {isCompared ? <CheckIcon size={17} weight="bold" aria-hidden /> : <PlusIcon size={17} weight="bold" aria-hidden />}
                      </button>
                    </footer>
                  </article>
                );
              })}
            </section>
          ) : (
            <div className="community-library-empty-state">
              <MagnifyingGlassIcon size={28} weight="duotone" aria-hidden />
              <h2>{content.noResults}</h2>
              <p>{content.noResultsHint}</p>
              <button type="button" onClick={() => { setQuery(""); setFamily("all"); }}>{content.filters.all}</button>
            </div>
          )}
        </section>

        <aside className="community-library-player-rail" aria-label={content.playing}>
          <div className="community-library-player-heading">
            <strong>{content.playing}</strong>
            <CaretDoubleLeftIcon size={18} weight="bold" aria-hidden />
          </div>
          <section className="community-library-player-card">
            <div className="community-library-player-title">
              <span className="community-library-author-mark"><WaveformIcon size={14} weight="bold" aria-hidden /></span>
              <div>
                <h2>{selectedProfile.displayName}</h2>
                <p>{selectedAuthor}</p>
              </div>
            </div>
            <div className="community-library-player-waveform">
              <AudioWaveform
                points={selectedWaveform}
                active={playingProfileID === selectedProfile.id && isPlaying}
                progress={playingProfileID === selectedProfile.id ? progress : 0}
                label={selectedProfile.displayName + " detailed waveform"}
              />
              <div>
                <strong>{formatTime(currentElapsed)}</strong>
                <span>/ 0:12</span>
              </div>
            </div>
            <div className="community-library-player-controls">
              <button type="button" aria-label={content.previous} onClick={() => moveProfile(-1)}><SkipBackIcon size={25} weight="fill" aria-hidden /></button>
              <button className="is-primary" type="button" aria-label={isPlaying ? content.stop : content.play} onClick={() => void playProfile(selectedProfile.id)}>
                {isPlaying ? <PauseIcon size={29} weight="fill" aria-hidden /> : <PlayIcon size={29} weight="fill" aria-hidden />}
              </button>
              <button type="button" aria-label={content.next} onClick={() => moveProfile(1)}><SkipForwardIcon size={25} weight="fill" aria-hidden /></button>
            </div>
            <div className="community-library-player-options">
              <button type="button" aria-pressed={loop} onClick={() => setLoop((current) => !current)}>
                <ArrowsClockwiseIcon size={17} weight="bold" aria-hidden />
                <span>{content.loop}</span>
              </button>
              <div className="community-library-volume">
                <button type="button" aria-label={muted ? content.unmute : content.mute} onClick={() => setMuted((current) => !current)}>
                  {muted ? <SpeakerSlashIcon size={18} weight="bold" aria-hidden /> : <SpeakerHighIcon size={18} weight="bold" aria-hidden />}
                </button>
                <input type="range" min="0" max="100" value={volume} onChange={(event) => setVolume(Number(event.target.value))} aria-label={locale === "en" ? "Preview volume" : "试听音量"} />
              </div>
            </div>
          </section>

          <section className="community-library-quick-listen">
            <h2>{content.quickListen}</h2>
            <div className="community-library-key-grid">
              {[
                { label: content.normalKey, keyLabel: "A", code: "KeyA" },
                { label: "Space", keyLabel: "Space", code: "Space" },
                { label: "Enter", keyLabel: "Enter", code: "Enter" },
                { label: "Backspace", keyLabel: <BackspaceIcon size={23} weight="regular" aria-hidden />, code: "Backspace" },
              ].map((sample) => (
                <button type="button" key={sample.code} onClick={() => void triggerSample(selectedProfile.id, sample.code)}>
                  <span>{sample.label}</span>
                  <kbd>{sample.keyLabel}</kbd>
                  <PlayIcon size={15} weight="fill" aria-hidden />
                </button>
              ))}
            </div>
          </section>

          <label className="community-library-type-test">
            <span><KeyboardIcon size={17} weight="bold" aria-hidden /> {content.typeTest}</span>
            <input type="text" maxLength={120} placeholder={content.typePlaceholder} onKeyDown={handleTypingKey} onFocus={() => void engineRef.current?.activate(selectedProfile.id).catch(() => setAudioError(true))} />
          </label>

          {audioError ? <p className="community-library-audio-error" role="status">{content.audioError}</p> : null}

          <div className="community-library-player-actions">
            <a href={productPath + "#audio-credits"}>{content.audioCredits}</a>
            <a className="is-install" href={productPath + "#install"}>
              <DownloadSimpleIcon size={19} weight="bold" aria-hidden />
              {content.install}
            </a>
          </div>
        </aside>
      </div>

      <section className="community-library-compare-dock" aria-label={content.compare}>
        <div className="community-library-compare-summary">
          <strong>{content.selected} {compareIDs.length}/3</strong>
          <span>{content.compareHint}</span>
        </div>
        <div className="community-library-compare-list">
          {compareIDs.map((profileID) => {
            const profile = profiles.find((candidate) => candidate.id === profileID);
            if (!profile) return null;
            return (
              <div className="community-library-compare-item" key={profile.id}>
                <button type="button" className="community-library-compare-preview" onClick={() => void triggerSample(profile.id, "KeyA")}>
                  <span className="community-library-author-mark"><WaveformIcon size={13} weight="bold" aria-hidden /></span>
                  <span><strong>{profile.displayName}</strong><small>{profileAuthor(profile, content.bundled)}</small></span>
                  <AudioWaveform points={waveforms[profile.id]} light label={profile.displayName + " waveform"} />
                </button>
                <button type="button" className="community-library-compare-remove" aria-label={content.removeCompare + ": " + profile.displayName} onClick={() => toggleCompare(profile.id)}><XIcon size={14} weight="bold" aria-hidden /></button>
              </div>
            );
          })}
          {compareIDs.length < 3 ? (
            <button type="button" className="community-library-compare-add" onClick={addNextCompareProfile}>
              <PlusIcon size={18} weight="bold" aria-hidden />
              {content.addSound}
            </button>
          ) : null}
        </div>
        <div className="community-library-compare-actions">
          <button type="button" className="is-clear" onClick={clearComparison} disabled={!compareIDs.length}>{content.clear}</button>
          <button type="button" className="is-compare" onClick={() => comparisonRunning ? clearPlayback() : void runComparison()} disabled={compareIDs.length < 2}>
            {comparisonRunning ? <PauseIcon size={18} weight="fill" aria-hidden /> : <PlayIcon size={18} weight="fill" aria-hidden />}
            {comparisonRunning ? content.comparing : content.compare}
          </button>
        </div>
      </section>
    </main>
  );
}
