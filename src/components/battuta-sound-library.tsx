"use client";

import Image from "next/image";
import { BattutaHeroVisual } from "@/components/battuta-hero-visual";
import {
  ArrowsClockwiseIcon,
  ArrowRightIcon,
  BackspaceIcon,
  CheckIcon,
  DownloadSimpleIcon,
  KeyboardIcon,
  MagnifyingGlassIcon,
  PauseIcon,
  PlayIcon,
  PlusIcon,
  SealCheckIcon,
  SkipBackIcon,
  SkipForwardIcon,
  SpeakerHighIcon,
  SpeakerSlashIcon,
  UploadSimpleIcon,
  UserCircleIcon,
  UsersThreeIcon,
  WaveformIcon,
  XIcon,
} from "@phosphor-icons/react";
import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import type { BattutaLocale } from "@/content/battuta";
import {
  BattutaPreviewAudio,
  type BattutaPreparedSequence,
  type BattutaSequenceHit,
  type BattutaWaveformMetrics,
  type DemoManifest,
  type DemoProfile,
} from "@/lib/battuta-preview-audio";

import { discoveryMix } from "@/lib/battuta-discovery";

type FamilyFilter = "all" | "线性" | "段落" | "点击" | "静电容" | "屈曲弹簧";
type SortMode = "curated" | "name" | "samples";
type PlaybackKind = "profile" | "comparison";
type SourceKind = "official" | "community" | "bundled";
type ProfileBrand =
  | "cherry"
  | "kailh"
  | "gateron"
  | "topre"
  | "ibm"
  | "novelkeys"
  | "keychron"
  | "logitech"
  | "alps"
  | "alpaca"
  | "zealpc"
  | "studio"
  | "community"
  | "other";
type BrandFilter = "all" | "community-upload" | "more" | ProfileBrand;

type ProfilePresentation = {
  brand: ProfileBrand;
  sourceKind: SourceKind;
};

type SwitchVisual = "blue" | "brown" | "clear" | "black" | "red" | "cream" | "navy" | "turquoise";

const manifestURL = "/battuta/demo-audio/manifest.json";
const defaultProfileID = "mxblue";
const profilePresentation: Record<string, ProfilePresentation> = {
  "bcp-suit80": { brand: "community", sourceKind: "community" },
  holypanda: { brand: "community", sourceKind: "bundled" },
  mxbrown: { brand: "cherry", sourceKind: "bundled" },
  mxclear: { brand: "cherry", sourceKind: "bundled" },
  mxblue: { brand: "cherry", sourceKind: "bundled" },
  mxblack: { brand: "cherry", sourceKind: "bundled" },
  boxnavy: { brand: "kailh", sourceKind: "bundled" },
  boxwhite: { brand: "kailh", sourceKind: "bundled" },
  lowprofileblue: { brand: "kailh", sourceKind: "bundled" },
  blackink: { brand: "gateron", sourceKind: "bundled" },
  redink: { brand: "gateron", sourceKind: "bundled" },
  topre: { brand: "topre", sourceKind: "bundled" },
  buckling: { brand: "ibm", sourceKind: "bundled" },
  cream: { brand: "novelkeys", sourceKind: "bundled" },
  keychronred: { brand: "keychron", sourceKind: "community" },
  g915brown: { brand: "logitech", sourceKind: "bundled" },
  bluealps: { brand: "alps", sourceKind: "bundled" },
  alpaca: { brand: "alpaca", sourceKind: "bundled" },
  turquoise: { brand: "zealpc", sourceKind: "bundled" },
  studiotactile: { brand: "studio", sourceKind: "bundled" },
  studioclicky: { brand: "studio", sourceKind: "bundled" },
};

const switchVisualSources: Record<SwitchVisual, string> = {
  blue: "/battuta/community/switches/cherry-mx-blue.png",
  brown: "/battuta/community/switches/cherry-mx-brown.png",
  clear: "/battuta/community/switches/cherry-mx-clear.png",
  black: "/battuta/community/switches/switch-black.png",
  red: "/battuta/community/switches/switch-red.png",
  cream: "/battuta/community/switches/switch-cream.png",
  navy: "/battuta/community/switches/switch-navy.png",
  turquoise: "/battuta/community/switches/switch-turquoise.png",
};

const profileSwitchVisuals: Partial<Record<string, SwitchVisual>> = {
  mxblue: "blue",
  mxbrown: "brown",
  mxclear: "clear",
  mxblack: "black",
  boxnavy: "navy",
  boxwhite: "clear",
  lowprofileblue: "blue",
  blackink: "black",
  redink: "red",
  topre: "clear",
  buckling: "brown",
  cream: "cream",
  keychronred: "red",
  g915brown: "brown",
  bluealps: "navy",
  alpaca: "cream",
  turquoise: "turquoise",
  studiotactile: "brown",
  studioclicky: "blue",
  "bcp-suit80": "clear",
  holypanda: "cream",
};

const brandNames: Record<ProfileBrand, Record<BattutaLocale, string>> = {
  cherry: { "zh-CN": "CHERRY", en: "CHERRY" },
  kailh: { "zh-CN": "Kailh 凯华", en: "Kailh" },
  gateron: { "zh-CN": "Gateron 佳达隆", en: "Gateron" },
  topre: { "zh-CN": "Topre", en: "Topre" },
  ibm: { "zh-CN": "IBM", en: "IBM" },
  novelkeys: { "zh-CN": "NovelKeys", en: "NovelKeys" },
  keychron: { "zh-CN": "Keychron", en: "Keychron" },
  logitech: { "zh-CN": "Logitech 罗技", en: "Logitech" },
  alps: { "zh-CN": "ALPS", en: "ALPS" },
  alpaca: { "zh-CN": "Alpaca", en: "Alpaca" },
  zealpc: { "zh-CN": "ZealPC", en: "ZealPC" },
  studio: { "zh-CN": "Studio 通用录音", en: "Studio recordings" },
  community: { "zh-CN": "社区方案", en: "Community designs" },
  other: { "zh-CN": "其他来源", en: "Other sources" },
};

const featuredBrandFilters: BrandFilter[] = [
  "all",
  "cherry",
  "kailh",
  "gateron",
  "topre",
  "ibm",
  "novelkeys",
  "keychron",
];
const directlyListedBrands = new Set<ProfileBrand>([
  "cherry", "kailh", "gateron", "topre", "ibm", "novelkeys", "keychron",
]);
const brandSortOrder: ProfileBrand[] = [
  "cherry", "kailh", "gateron", "topre", "ibm", "novelkeys", "keychron",
  "logitech", "alps", "alpaca", "zealpc", "studio", "community", "other",
];
const brandSortRank = new Map<ProfileBrand, number>(
  brandSortOrder.map((brand, index) => [brand, index]),
);
const profileSortOrder = [
  "mxblue", "mxbrown", "mxclear", "mxblack", "boxnavy", "boxwhite",
  "lowprofileblue", "blackink", "redink", "topre", "buckling", "cream",
  "keychronred", "g915brown", "bluealps", "alpaca", "turquoise",
  "studiotactile", "studioclicky", "bcp-suit80", "holypanda",
] as const;
const profileSortRank = new Map<string, number>(
  profileSortOrder.map((profileID, index) => [profileID, index]),
);
const sequenceDurationMS = 12_000;
const inspectorDurationMS = 250;
const waveformPointCount = 256;
const typingCodes = [
  "KeyT", "KeyH", "KeyE", "Space", "KeyQ", "KeyU", "KeyI", "KeyC", "KeyK",
  "Space", "KeyB", "KeyR", "KeyO", "KeyW", "KeyN", "Space", "KeyF", "KeyO",
  "KeyX", "Space", "KeyJ", "KeyU", "KeyM", "KeyP", "KeyS", "Enter",
];
const typingIntervals = [
  216, 198, 231, 360, 207, 224, 203, 218, 238, 390, 211, 195, 229,
  214, 235, 375, 202, 223, 217, 405, 208, 226, 199, 232, 219, 520,
];
const typingSequenceStartMS = 120;
const comparisonCodes = ["KeyA", "KeyS", "KeyD", "Space", "KeyJ", "KeyK", "Enter"];
const comparisonOffsetsMS = [160, 380, 605, 835, 1_205, 1_425, 1_650];
const comparisonSegmentDurationMS = 2_200;

function buildTypingSequence(): BattutaSequenceHit[] {
  const hits: BattutaSequenceHit[] = [];
  let elapsed = typingSequenceStartMS;
  let hitIndex = 0;
  while (elapsed < sequenceDurationMS - 300) {
    const code = typingCodes[hitIndex % typingCodes.length];
    hits.push({
      code,
      atMilliseconds: elapsed,
    });
    elapsed += typingIntervals[hitIndex % typingIntervals.length];
    hitIndex += 1;
  }
  return hits;
}

function buildMultiProfileSequence(profileIDs: readonly string[]): BattutaSequenceHit[] {
  return profileIDs.flatMap((profileID, profileIndex) => (
    comparisonCodes.map((code, sampleIndex) => ({
      profileID,
      code,
      atMilliseconds: profileIndex * comparisonSegmentDurationMS
        + comparisonOffsetsMS[sampleIndex],
    }))
  ));
}

const typingSequence = buildTypingSequence();
const inspectorSequence: BattutaSequenceHit[] = [{ code: "KeyA", atMilliseconds: 12 }];
const inspectorMarkers = [
  inspectorSequence[0].atMilliseconds / inspectorDurationMS,
  (inspectorSequence[0].atMilliseconds + 55) / inspectorDurationMS,
];
const typingMarkers = typingSequence
  .filter((_, index) => index % 6 === 0)
  .map((hit) => hit.atMilliseconds / sequenceDurationMS);
const unavailableWaveform = new Array<number>(waveformPointCount).fill(0);

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
    heroHeadline: "听见每一种手感",
    heroBody: "真实录音、真实波形，找到最贴近你的那一颗轴。",
    startListening: "开始试听",
    subtitle: "按品牌探索机械键盘的声音，也听见每一位创作者的录音",
    search: "搜索音色、轴体、品牌或作者…",
    random: "随机试听",
    submit: "投稿音色",
    allBrands: "全部",
    communityUploads: "社区投稿",
    moreBrands: "更多品牌",
    profileCount: "套",
    catalogEyebrow: "品牌 / 来源",
    catalogAll: "全系声音细细听",
    catalogCommunity: "来自玩家的真实录音",
    browseSuffix: "的声音",
    catalogNote: "真实波形 · 浏览器本地试听",
    filters: {
      all: "全部轴体",
      "线性": "线性轴",
      "段落": "段落轴",
      "点击": "点击轴",
      "静电容": "静电容",
      "屈曲弹簧": "屈曲弹簧",
    },
    familyLabel: "轴体类型",
    sortLabel: "排序方式",
    sortCurated: "品牌顺序",
    sortName: "名称排序",
    sortSamples: "样本数量",
    sounds: "套音色",
    bundled: "Battuta 内置试听",
    communitySource: "社区投稿",
    officialSource: "品牌官方",
    sourceRecorded: "来源已记录",
    samples: "个采样片段",
    inspector: "声音检查器",
    visualNote: "轴体视觉示意",
    peakMetric: "峰值",
    rmsMetric: "RMS",
    durationMetric: "时长",
    waveformLoading: "正在生成真实波形",
    waveformUnavailable: "波形暂不可用",
    addCompare: "加入对比",
    removeCompare: "移出对比",
    playing: "正在播放",
    loop: "循环播放",
    mute: "静音",
    unmute: "恢复声音",
    quickListen: "快速试听",
    typeTest: "自由试打",
    typeTestHint: "所选音色会响应这里的每次按键",
    typePlaceholder: "点这里，直接敲击键盘试听…",
    normalKey: "普通键",
    install: "安装 Battuta",
    installShort: "安装",
    selected: "已选",
    compareHint: "最多选择 3 套，快速 A/B 切换",
    clear: "清空",
    close: "关闭",
    openComparison: "查看对比",
    compare: "开始对比试听",
    comparing: "正在对比",
    communityTitle: "每一套投稿，都保留作者名字",
    communityBody: "个人录音会按品牌归档，同时展示作者、许可证与来源说明；来源不清晰的内容不会公开。",
    communityAction: "投稿审核",
    submitEyebrow: "COMMUNITY SUBMISSION",
    submitTitle: "把你的声音带进 Battuta",
    submitBody: "目前采用人工审核，不会把文件直接公开。请先从 Battuta 导出音色包，再把下载链接、录音来源和许可证发给我们。",
    submitSteps: ["导出 .simuboardpack 音色包", "准备试听录音与来源说明", "邮件提交，完成授权与格式审核"],
    submitEmail: "邮件提交审核",
    learnPack: "了解音色包",
    submitNote: "审核通过后，页面会保留作者署名，并确认来源与可分发许可。",
    loading: "正在载入 21 套真实音色…",
    loadError: "音色没有成功载入，请刷新后重试。",
    noResults: "没有找到匹配音色",
    noResultsHint: "换一个关键词或清除筛选试试。",
    audioError: "浏览器没有成功开启音频，请再次点击播放。",
    local: "所有音频与试打都在浏览器本地完成",
    previous: "上一个音色",
    next: "下一个音色",
    stop: "暂停试听",
    play: "播放试听",
  },
  en: {
    title: "Sound Atlas",
    heroHeadline: "Hear every feel",
    heroBody: "Real recordings and real waveforms, tuned to the switch that feels like yours.",
    startListening: "Start listening",
    subtitle: "Explore keyboard sound by brand, and hear every contributor behind it",
    search: "Search sounds, switches, brands, or creators…",
    random: "Surprise me",
    submit: "Submit a sound",
    allBrands: "All",
    communityUploads: "Community",
    moreBrands: "More brands",
    profileCount: "sounds",
    catalogEyebrow: "Brand / source",
    catalogAll: "Listen across the full range",
    catalogCommunity: "Real recordings from the community",
    browseSuffix: " sounds",
    catalogNote: "Real waveforms · Local browser playback",
    filters: {
      all: "All switches",
      "线性": "Linear",
      "段落": "Tactile",
      "点击": "Clicky",
      "静电容": "Electro-capacitive",
      "屈曲弹簧": "Buckling spring",
    },
    familyLabel: "Switch type",
    sortLabel: "Sort",
    sortCurated: "Brand order",
    sortName: "Name",
    sortSamples: "Sample count",
    sounds: "profiles",
    bundled: "Battuta built-in preview",
    communitySource: "Community submission",
    officialSource: "Official brand source",
    sourceRecorded: "Source documented",
    samples: "sample clips",
    inspector: "Sound inspector",
    visualNote: "Switch visual",
    peakMetric: "Peak",
    rmsMetric: "RMS",
    durationMetric: "Duration",
    waveformLoading: "Rendering real waveform",
    waveformUnavailable: "Waveform unavailable",
    addCompare: "Add to comparison",
    removeCompare: "Remove from comparison",
    playing: "Now playing",
    loop: "Loop preview",
    mute: "Mute",
    unmute: "Unmute",
    quickListen: "Quick samples",
    typeTest: "Type to test",
    typeTestHint: "Every key in this field uses the selected sound",
    typePlaceholder: "Click here and type to hear it…",
    normalKey: "Regular key",
    install: "Install Battuta",
    installShort: "Install",
    selected: "Selected",
    compareHint: "Choose up to 3 profiles for quick A/B switching",
    clear: "Clear",
    close: "Close",
    openComparison: "View comparison",
    compare: "Start A/B comparison",
    comparing: "Comparing",
    communityTitle: "Every submission keeps its creator credit",
    communityBody: "Personal recordings stay filed under their brand while showing creator, license, and provenance details. Unclear sources are never published.",
    communityAction: "Submit for review",
    submitEyebrow: "COMMUNITY SUBMISSION",
    submitTitle: "Bring your sound to Battuta",
    submitBody: "Submissions are reviewed manually and are never published immediately. Export a sound pack from Battuta, then send us a download link, recording provenance, and license.",
    submitSteps: ["Export a .simuboardpack sound pack", "Prepare a preview and provenance notes", "Submit by email for rights and format review"],
    submitEmail: "Submit by email",
    learnPack: "Learn about sound packs",
    submitNote: "Once approved, your creator credit stays visible and the source and redistribution license are confirmed.",
    loading: "Loading 21 real sound profiles…",
    loadError: "The sound library could not load. Refresh and try again.",
    noResults: "No matching sounds",
    noResultsHint: "Try another search or clear the filter.",
    audioError: "The browser could not start audio. Click play again.",
    local: "Audio and typing stay entirely in this browser",
    previous: "Previous sound",
    next: "Next sound",
    stop: "Pause preview",
    play: "Play preview",
  },
} as const;

function presentationFor(profile: DemoProfile): ProfilePresentation {
  return profilePresentation[profile.id] ?? {
    brand: "other",
    sourceKind: profile.attribution?.author ? "community" : "bundled",
  };
}

function localizedBrand(profile: DemoProfile, locale: BattutaLocale) {
  return brandNames[presentationFor(profile).brand][locale];
}

function matchesBrandFilter(profile: DemoProfile, filter: BrandFilter) {
  if (filter === "all") return true;
  const presentation = presentationFor(profile);
  if (filter === "community-upload") return presentation.sourceKind === "community";
  if (filter === "more") return !directlyListedBrands.has(presentation.brand);
  return presentation.brand === filter;
}

function localizedFamily(profile: DemoProfile, locale: BattutaLocale) {
  return locale === "en" ? (familyEnglish[profile.family] ?? profile.family) : profile.family;
}

function localizedTone(profile: DemoProfile, locale: BattutaLocale) {
  return locale === "en" ? (toneEnglish[profile.tone] ?? profile.tone) : profile.tone;
}

function profileAuthor(profile: DemoProfile, fallback: string) {
  return profile.attribution?.author?.trim() || fallback;
}

function waveformLabel(profileName: string, locale: BattutaLocale) {
  return profileName + (locale === "en" ? " waveform" : " 波形图");
}

function waveformSource(exact: boolean | undefined | null) {
  if (exact == null) return "pending" as const;
  return exact ? "rendered-sequence" as const : "unavailable" as const;
}

function switchVisualFor(profile: DemoProfile) {
  const variant = profileSwitchVisuals[profile.id]
    ?? (profile.family === "点击" ? "blue" : profile.family === "段落" ? "brown" : "clear");
  return switchVisualSources[variant];
}

function switchVisualAlt(profile: DemoProfile, locale: BattutaLocale) {
  return locale === "en"
    ? `${profile.displayName} switch visual`
    : `${profile.displayName} 轴体视觉示意`;
}

function formatDecibels(value: number | undefined) {
  if (value === undefined || !Number.isFinite(value)) return "—";
  return `${value.toFixed(1)} dBFS`;
}

function formatSeconds(milliseconds: number | undefined) {
  if (milliseconds === undefined || !Number.isFinite(milliseconds)) return "—";
  const seconds = milliseconds / 1000;
  return `${seconds < 1 ? seconds.toFixed(2) : seconds.toFixed(1)} s`;
}

function AudioWaveform({
  points,
  active = false,
  progress = 0,
  light = false,
  markers,
  showPlayhead = false,
  source = "pending",
  onVisible,
  label,
  pendingLabel,
  unavailableLabel,
  className = "",
}: {
  points?: number[];
  active?: boolean;
  progress?: number;
  light?: boolean;
  markers?: number[];
  showPlayhead?: boolean;
  source?: "rendered-sequence" | "unavailable" | "pending";
  onVisible?: () => void;
  label: string;
  pendingLabel: string;
  unavailableLabel: string;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const onVisibleRef = useRef(onVisible);
  const waveformStateRef = useRef({ active, light, markers: markers ?? [], points, progress, showPlayhead, source });

  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const waveformState = waveformStateRef.current;
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const density = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(rect.width * density);
    canvas.height = Math.round(rect.height * density);
    const context = canvas.getContext("2d");
    if (!context) return;
    context.setTransform(density, 0, 0, density, 0, 0);
    context.clearRect(0, 0, rect.width, rect.height);
    if (waveformState.source !== "rendered-sequence" || !waveformState.points?.length) return;

    const center = rect.height / 2;
    const values = waveformState.points;
    const xForIndex = (index: number) => (
      values.length === 1
        ? rect.width / 2
        : (index / (values.length - 1)) * rect.width
    );
    const amplitudeForValue = (value: number) => Math.max(0, value * rect.height * 0.43);
    const drawEnvelope = (fillStyle: string, strokeStyle: string) => {
      context.beginPath();
      context.moveTo(xForIndex(0), center - amplitudeForValue(values[0]));
      values.forEach((value, index) => {
        context.lineTo(xForIndex(index), center - amplitudeForValue(value));
      });
      for (let index = values.length - 1; index >= 0; index -= 1) {
        context.lineTo(
          xForIndex(index),
          center + amplitudeForValue(values[index]),
        );
      }
      context.closePath();
      context.fillStyle = fillStyle;
      context.fill();
      context.strokeStyle = strokeStyle;
      context.lineWidth = 0.8;
      context.lineJoin = "round";
      context.stroke();
    };

    context.strokeStyle = waveformState.light
      ? "rgba(21, 23, 20, 0.10)"
      : "rgba(246, 248, 241, 0.12)";
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(0, center);
    context.lineTo(rect.width, center);
    context.stroke();

    if (waveformState.markers.length) {
      waveformState.markers.forEach((marker, index) => {
        const x = Math.max(0, Math.min(rect.width, marker * rect.width));
        context.strokeStyle = !waveformState.light && index === 0
          ? "#cfff3e"
          : waveformState.light
            ? "rgba(21, 23, 20, 0.14)"
            : "rgba(246, 248, 241, 0.22)";
        context.lineWidth = !waveformState.light && index === 0 ? 1.1 : 0.75;
        context.beginPath();
        context.moveTo(x, 3);
        context.lineTo(x, rect.height - 3);
        context.stroke();
      });
    }

    drawEnvelope(
      waveformState.light ? "rgba(21, 23, 20, 0.13)" : "rgba(246, 248, 241, 0.30)",
      waveformState.light ? "rgba(21, 23, 20, 0.30)" : "rgba(246, 248, 241, 0.66)",
    );

    if (waveformState.active && waveformState.progress > 0) {
      context.save();
      context.beginPath();
      context.rect(0, 0, rect.width * waveformState.progress, rect.height);
      context.clip();
      drawEnvelope("rgba(210, 255, 60, 0.46)", "#d8ff73");
      context.restore();
    }

    if (waveformState.showPlayhead && waveformState.progress > 0) {
      const x = Math.max(0, Math.min(rect.width, rect.width * waveformState.progress));
      context.strokeStyle = waveformState.light ? "#161814" : "#d4ff3f";
      context.lineWidth = 1.25;
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, rect.height);
      context.stroke();
    }
  }, []);

  useEffect(() => {
    waveformStateRef.current = { active, light, markers: markers ?? [], points, progress, showPlayhead, source };
    drawWaveform();
  }, [active, drawWaveform, light, markers, points, progress, showPlayhead, source]);

  useEffect(() => {
    onVisibleRef.current = onVisible;
  }, [onVisible]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const observer = new ResizeObserver(drawWaveform);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [drawWaveform]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !onVisibleRef.current) return;
    if (!("IntersectionObserver" in window)) {
      onVisibleRef.current();
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      onVisibleRef.current?.();
    }, { rootMargin: "420px 160px" });
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={"community-library-waveform " + className}
      data-waveform-source={source}
      role="img"
      aria-label={source === "pending"
        ? `${label}. ${pendingLabel}`
        : source === "unavailable"
          ? `${label}. ${unavailableLabel}`
          : label}
    >
      <canvas ref={canvasRef} aria-hidden />
      {source !== "rendered-sequence" ? (
        <span>{source === "pending" ? pendingLabel : unavailableLabel}</span>
      ) : null}
    </div>
  );
}

function formatTime(milliseconds: number) {
  const seconds = Math.floor(Math.max(0, milliseconds) / 1000);
  return Math.floor(seconds / 60) + ":" + String(seconds % 60).padStart(2, "0");
}

function formatDuration(milliseconds: number) {
  const seconds = Math.ceil(Math.max(0, milliseconds) / 1000);
  return Math.floor(seconds / 60) + ":" + String(seconds % 60).padStart(2, "0");
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
  const [waveformMetrics, setWaveformMetrics] = useState<Record<string, BattutaWaveformMetrics>>({});
  const [waveformExact, setWaveformExact] = useState<Record<string, boolean>>({});
  const [selectedProfileID, setSelectedProfileID] = useState(defaultProfileID);
  const [playingProfileID, setPlayingProfileID] = useState<string | null>(null);
  const [playbackKind, setPlaybackKind] = useState<PlaybackKind | null>(null);
  const [activePlaybackWaveform, setActivePlaybackWaveform] = useState<number[] | null>(null);
  const [activePlaybackExact, setActivePlaybackExact] = useState<boolean | null>(null);
  const [activePlaybackDurationMS, setActivePlaybackDurationMS] = useState(sequenceDurationMS);
  const [isPlaying, setIsPlaying] = useState(false);
  const [comparisonRunning, setComparisonRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [query, setQuery] = useState("");
  const [brandFilter, setBrandFilter] = useState<BrandFilter>("all");
  const [sourceFilter, setSourceFilter] = useState<"all" | SourceKind>("all");
  const [brandPanelOpen, setBrandPanelOpen] = useState(false);
  const [brandQuery, setBrandQuery] = useState("");
  const [recommendationSeed, setRecommendationSeed] = useState(0);
  const [family, setFamily] = useState<FamilyFilter>("all");
  const [sort, setSort] = useState<SortMode>("curated");
  const [loop, setLoop] = useState(true);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(66);
  const [compareIDs, setCompareIDs] = useState<string[]>([]);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");
  const [audioError, setAudioError] = useState(false);
  const [playerVisible, setPlayerVisible] = useState(false);
  const [auditionOpen, setAuditionOpen] = useState(false);
  const [comparisonOpen, setComparisonOpen] = useState(false);
  const [comparisonFocusRequest, setComparisonFocusRequest] = useState(0);
  const [submissionOpen, setSubmissionOpen] = useState(false);
  const [catalogColumns, setCatalogColumns] = useState(3);

  const engineRef = useRef<BattutaPreviewAudio | null>(null);
  const profileWaveformRequestsRef = useRef(new Map<string, Promise<void>>());
  const readyProfileWaveformsRef = useRef(new Set<string>());
  const timerIDsRef = useRef<number[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const playbackTokenRef = useRef(0);
  const sampleRequestGenerationRef = useRef(0);
  const sampleRequestProfileRef = useRef<string | null>(null);
  const loopRef = useRef(loop);
  const playingProfileRef = useRef<string | null>(null);
  const isPlayingRef = useRef(false);
  const submissionModalRef = useRef<HTMLElement | null>(null);
  const submissionCloseRef = useRef<HTMLButtonElement | null>(null);
  const comparisonDrawerRef = useRef<HTMLElement | null>(null);
  const comparisonReturnFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => { loopRef.current = loop; }, [loop]);
  useEffect(() => { playingProfileRef.current = playingProfileID; }, [playingProfileID]);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);

  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 1361px)");
    const tabletQuery = window.matchMedia("(min-width: 901px)");
    const updateCatalogColumns = () => {
      setCatalogColumns(desktopQuery.matches ? 3 : tabletQuery.matches ? 2 : 1);
    };
    updateCatalogColumns();
    desktopQuery.addEventListener("change", updateCatalogColumns);
    tabletQuery.addEventListener("change", updateCatalogColumns);
    return () => {
      desktopQuery.removeEventListener("change", updateCatalogColumns);
      tabletQuery.removeEventListener("change", updateCatalogColumns);
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const profileWaveformRequests = profileWaveformRequestsRef.current;
    const readyProfileWaveforms = readyProfileWaveformsRef.current;
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
        setRecommendationSeed(Math.floor(Math.random() * 0xffffffff));
        setSampleRate(manifest.sampleRate);
        setLoadState("ready");
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
      profileWaveformRequests.clear();
      readyProfileWaveforms.clear();
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

  useEffect(() => {
    if (!submissionOpen) return;
    const previousBodyOverflow = document.body.style.overflow;
    const backgroundSections = Array.from(document.querySelectorAll<HTMLElement>(
      ".community-library-shell > :not(.community-library-modal-backdrop)",
    )).map((element) => ({ element, wasInert: element.hasAttribute("inert") }));
    document.body.style.overflow = "hidden";
    backgroundSections.forEach(({ element }) => element.setAttribute("inert", ""));
    const restoreFocus = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    const focusTimer = window.requestAnimationFrame(() => submissionCloseRef.current?.focus());
    const handleDialogKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSubmissionOpen(false);
        return;
      }
      if (event.key !== "Tab") return;
      const modal = submissionModalRef.current;
      if (!modal) return;
      const focusable = Array.from(modal.querySelectorAll<HTMLElement>(
        "a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])",
      )).filter((element) => !element.hasAttribute("hidden"));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", handleDialogKey);
    return () => {
      window.cancelAnimationFrame(focusTimer);
      window.removeEventListener("keydown", handleDialogKey);
      document.body.style.overflow = previousBodyOverflow;
      backgroundSections.forEach(({ element, wasInert }) => {
        if (!wasInert) element.removeAttribute("inert");
      });
      restoreFocus?.focus();
    };
  }, [submissionOpen]);

  const ensureProfileWaveform = useCallback((profileID: string) => {
    const engine = engineRef.current;
    if (!engine || readyProfileWaveformsRef.current.has(profileID)) return;
    if (profileWaveformRequestsRef.current.has(profileID)) return;

    const request = engine.preparePreviewSequence(
      profileID,
      inspectorSequence,
      inspectorDurationMS,
      waveformPointCount,
    ).then((prepared) => {
      if (engine !== engineRef.current) return;
      setWaveforms((current) => ({
        ...current,
        [profileID]: prepared.exact ? prepared.waveform : unavailableWaveform,
      }));
      if (prepared.exact && prepared.metrics) {
        const metrics = prepared.metrics;
        setWaveformMetrics((current) => ({ ...current, [profileID]: metrics }));
      }
      setWaveformExact((current) => ({
        ...current,
        [profileID]: prepared.exact,
      }));
      readyProfileWaveformsRef.current.add(profileID);
    }).catch(() => {
      if (engine !== engineRef.current) return;
      setWaveforms((current) => ({
        ...current,
        [profileID]: unavailableWaveform,
      }));
      setWaveformExact((current) => ({
        ...current,
        [profileID]: false,
      }));
      readyProfileWaveformsRef.current.add(profileID);
    }).finally(() => {
      profileWaveformRequestsRef.current.delete(profileID);
    });
    profileWaveformRequestsRef.current.set(profileID, request);
  }, []);

  const selectedProfile = useMemo(
    () => profiles.find((profile) => profile.id === selectedProfileID) ?? profiles[0],
    [profiles, selectedProfileID],
  );

  const filteredProfiles = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    const result = profiles.filter((profile) => {
      if (!matchesBrandFilter(profile, brandFilter)) return false;
      if (sourceFilter !== "all" && presentationFor(profile).sourceKind !== sourceFilter) return false;
      if (family !== "all" && profile.family !== family) return false;
      if (!normalizedQuery) return true;
      const searchable = [
        profile.displayName,
        localizedBrand(profile, locale),
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
    return [...result].sort((a, b) => {
      const brandDifference = (brandSortRank.get(presentationFor(a).brand) ?? Number.MAX_SAFE_INTEGER)
        - (brandSortRank.get(presentationFor(b).brand) ?? Number.MAX_SAFE_INTEGER);
      if (brandDifference) return brandDifference;
      return (profileSortRank.get(a.id) ?? Number.MAX_SAFE_INTEGER)
        - (profileSortRank.get(b.id) ?? Number.MAX_SAFE_INTEGER);
    });
  }, [brandFilter, family, locale, profiles, query, sort, sourceFilter]);

  const visibleProfiles = filteredProfiles;
  const recommendedProfiles = useMemo(() => discoveryMix(profiles.map(profile => ({ ...profile, brand: presentationFor(profile).brand, community: presentationFor(profile).sourceKind === "community" })), recommendationSeed, 3), [profiles, recommendationSeed]);

  const brandFilterCounts = useMemo(() => Object.fromEntries(
    featuredBrandFilters.map((filter) => [
      filter,
      profiles.filter((profile) => matchesBrandFilter(profile, filter)).length,
    ]),
  ) as Record<BrandFilter, number>, [profiles]);

  const playPreparedOrFallback = useCallback((
    engine: BattutaPreviewAudio,
    prepared: BattutaPreparedSequence,
    defaultProfileIDForSequence: string,
    hits: readonly BattutaSequenceHit[],
    token: number,
  ): boolean => {
    if (prepared.exact && engine.playPreparedSequence(prepared)) return true;

    const profileIDs = new Set([
      defaultProfileIDForSequence,
      ...hits.map((hit) => hit.profileID ?? defaultProfileIDForSequence),
    ]);
    profileIDs.forEach((profileID) => engine.resetVariations(profileID));
    hits.forEach((hit) => {
      const timerID = window.setTimeout(() => {
        if (token === playbackTokenRef.current) {
          engine.tap(hit.profileID ?? defaultProfileIDForSequence, hit.code);
        }
      }, hit.atMilliseconds);
      timerIDsRef.current.push(timerID);
    });
    return false;
  }, []);

  const clearPlayback = useCallback((resetProgress = true, preserveVisualization = false) => {
    playbackTokenRef.current += 1;
    sampleRequestGenerationRef.current += 1;
    sampleRequestProfileRef.current = null;
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
    setPlaybackKind(null);
    if (!preserveVisualization) {
      setActivePlaybackWaveform(null);
      setActivePlaybackExact(null);
      setActivePlaybackDurationMS(sequenceDurationMS);
    }
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
    isPlayingRef.current = true;
    playingProfileRef.current = profileID;
    setSelectedProfileID(profileID);
    setAudioError(false);

    try {
      await engine.activate(profileID);
      const prepared = await engine.preparePreviewSequence(
        profileID,
        typingSequence,
        sequenceDurationMS,
        waveformPointCount,
      );
      if (token !== playbackTokenRef.current || engine !== engineRef.current) return;
      const exactPlayback = playPreparedOrFallback(
        engine,
        prepared,
        profileID,
        typingSequence,
        token,
      );
      const renderedWaveform = exactPlayback ? prepared.waveform : unavailableWaveform;
      setPlayingProfileID(profileID);
      setPlaybackKind("profile");
      setActivePlaybackWaveform(renderedWaveform);
      setActivePlaybackExact(exactPlayback);
      setActivePlaybackDurationMS(prepared.durationMilliseconds);
      isPlayingRef.current = true;
      playingProfileRef.current = profileID;
      setIsPlaying(true);
      setPlayerVisible(true);
      setProgress(0);

      const startedAt = performance.now();
      const updateProgress = () => {
        if (token !== playbackTokenRef.current) return;
        const nextProgress = Math.min(
          1,
          (performance.now() - startedAt) / prepared.durationMilliseconds,
        );
        setProgress(nextProgress);
        if (nextProgress < 1) {
          animationFrameRef.current = requestAnimationFrame(updateProgress);
        } else if (loopRef.current) {
          clearPlayback();
          void runProfile(profileID);
        } else {
          clearPlayback(false, true);
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
  }, [clearPlayback, comparisonRunning, playPreparedOrFallback]);

  const triggerSample = useCallback(async (profileID: string, code: string) => {
    const engine = engineRef.current;
    if (!engine) return;
    if (isPlayingRef.current) clearPlayback();
    if (sampleRequestProfileRef.current !== profileID) {
      sampleRequestProfileRef.current = profileID;
      sampleRequestGenerationRef.current += 1;
    }
    const generation = sampleRequestGenerationRef.current;
    setSelectedProfileID(profileID);
    setAudioError(false);
    try {
      await engine.activate(profileID);
      if (
        engine !== engineRef.current
        || generation !== sampleRequestGenerationRef.current
        || sampleRequestProfileRef.current !== profileID
      ) return;
      engine.tap(profileID, code);
      setPlayerVisible(true);
    } catch {
      if (engine === engineRef.current && generation === sampleRequestGenerationRef.current) {
        setAudioError(true);
      }
    }
  }, [clearPlayback]);

  const moveProfile = useCallback((direction: number) => {
    const pool = visibleProfiles.length ? visibleProfiles : profiles;
    if (!pool.length) return;
    const currentIndex = Math.max(0, pool.findIndex((profile) => profile.id === selectedProfileID));
    const nextIndex = (currentIndex + direction + pool.length) % pool.length;
    void playProfile(pool[nextIndex].id);
  }, [playProfile, profiles, selectedProfileID, visibleProfiles]);

  const playRandom = useCallback(() => {
    const pool = visibleProfiles.length ? visibleProfiles : profiles;
    if (!pool.length) return;
    const candidates = pool.filter((profile) => profile.id !== selectedProfileID);
    const profile = candidates[Math.floor(Math.random() * candidates.length)] ?? pool[0];
    void playProfile(profile.id);
  }, [playProfile, profiles, selectedProfileID, visibleProfiles]);

  const openComparisonDrawer = useCallback((moveFocus: boolean) => {
    setComparisonOpen(true);
    if (!moveFocus) return;
    comparisonReturnFocusRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    setComparisonFocusRequest((current) => current + 1);
  }, []);

  const closeComparisonDrawer = useCallback((restoreFocus = true) => {
    setComparisonOpen(false);
    if (!restoreFocus) return;
    const returnTarget = comparisonReturnFocusRef.current;
    comparisonReturnFocusRef.current = null;
    window.requestAnimationFrame(() => returnTarget?.focus());
  }, []);

  useEffect(() => {
    if (!comparisonOpen || !comparisonFocusRequest) return;
    const focusTimer = window.requestAnimationFrame(() => comparisonDrawerRef.current?.focus());
    return () => window.cancelAnimationFrame(focusTimer);
  }, [comparisonFocusRequest, comparisonOpen]);

  const toggleCompare = useCallback((profileID: string, moveFocus = false) => {
    if (comparisonRunning) clearPlayback();
    const isAdding = !compareIDs.includes(profileID);
    if (isAdding) openComparisonDrawer(moveFocus);
    setCompareIDs((current) => {
      if (current.includes(profileID)) return current.filter((id) => id !== profileID);
      if (current.length >= 3) return current;
      return [...current, profileID];
    });
  }, [clearPlayback, compareIDs, comparisonRunning, openComparisonDrawer]);

  useEffect(() => {
    if (!compareIDs.length && comparisonOpen) closeComparisonDrawer();
  }, [closeComparisonDrawer, compareIDs.length, comparisonOpen]);

  const clearComparison = useCallback(() => {
    if (comparisonRunning) clearPlayback();
    setCompareIDs([]);
    closeComparisonDrawer();
  }, [clearPlayback, closeComparisonDrawer, comparisonRunning]);

  const runComparison = useCallback(async function runComparisonPreview() {
    const engine = engineRef.current;
    const IDs = compareIDs.filter((id) => profiles.some((profile) => profile.id === id));
    if (!engine || IDs.length < 2) return;
    clearPlayback();
    const token = playbackTokenRef.current;
    isPlayingRef.current = true;
    playingProfileRef.current = IDs[0];
    const hits = buildMultiProfileSequence(IDs);
    const duration = IDs.length * comparisonSegmentDurationMS;
    setComparisonRunning(true);
    setAudioError(false);
    setProgress(0);
    try {
      await engine.activate(IDs[0]);
      const prepared = await engine.preparePreviewSequence(IDs[0], hits, duration, waveformPointCount);
      if (token !== playbackTokenRef.current || engine !== engineRef.current) return;
      const exactPlayback = playPreparedOrFallback(engine, prepared, IDs[0], hits, token);
      const renderedWaveform = exactPlayback ? prepared.waveform : unavailableWaveform;
      setPlaybackKind("comparison");
      setActivePlaybackWaveform(renderedWaveform);
      setActivePlaybackExact(exactPlayback);
      setActivePlaybackDurationMS(prepared.durationMilliseconds);
      setSelectedProfileID(IDs[0]);
      setPlayingProfileID(IDs[0]);
      isPlayingRef.current = true;
      playingProfileRef.current = IDs[0];
      setIsPlaying(true);
      setPlayerVisible(true);

      IDs.forEach((profileID, profileIndex) => {
        const selectionTimer = window.setTimeout(() => {
          if (token !== playbackTokenRef.current) return;
          setSelectedProfileID(profileID);
          setPlayingProfileID(profileID);
          playingProfileRef.current = profileID;
        }, profileIndex * comparisonSegmentDurationMS);
        timerIDsRef.current.push(selectionTimer);
      });

      const comparisonStartedAt = performance.now();
      const update = () => {
        if (token !== playbackTokenRef.current) return;
        const nextProgress = Math.min(
          1,
          (performance.now() - comparisonStartedAt) / prepared.durationMilliseconds,
        );
        setProgress(nextProgress);
        if (nextProgress < 1) {
          animationFrameRef.current = requestAnimationFrame(update);
        } else if (loopRef.current) {
          clearPlayback();
          void runComparisonPreview();
        } else {
          clearPlayback(false, true);
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
  }, [clearPlayback, compareIDs, playPreparedOrFallback, profiles]);

  const handleTypingKey = useCallback((event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.repeat || event.metaKey || event.ctrlKey || event.altKey) return;
    if (!event.code || event.code === "Process" || event.code === "Unidentified") return;
    const profile = selectedProfile;
    if (profile) void triggerSample(profile.id, event.code);
  }, [selectedProfile, triggerSample]);

  const heroSection = (
    <section
      key="community-hero"
      className="community-library-hero"
      aria-labelledby="sound-atlas-title"
    >
      <BattutaHeroVisual locale={locale} />
      <div className="community-library-inner community-library-hero-layout">
        <header className="community-library-title-block">
          <p className="community-library-hero-kicker">{content.title}</p>
          <h1 id="sound-atlas-title">{content.heroHeadline}</h1>
          <p className="community-library-hero-description">{content.heroBody}</p>
          <div className="community-library-hero-actions">
            <label className="community-library-search">
              <MagnifyingGlassIcon size={21} weight="bold" aria-hidden />
              <span className="community-library-visually-hidden">{content.search}</span>
              <input
                type="search"
                value={query}
                onChange={(event) => { setQuery(event.target.value); }}
                placeholder={content.search}
              />
            </label>
            <div className="community-library-hero-buttons">
              <button
                className="community-library-random-button"
                type="button"
                onClick={() => {
                  playRandom();
                  document.getElementById("community-catalog-title")?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
              >
                <span>{content.startListening}</span>
                <ArrowRightIcon size={20} weight="bold" aria-hidden />
              </button>
              <button className="community-library-submit-button" type="button" onClick={() => setSubmissionOpen(true)}>
                <UploadSimpleIcon size={19} weight="bold" aria-hidden />
                <span>{content.submit}</span>
              </button>
            </div>
          </div>
        </header>
      </div>
    </section>
  );

  if (loadState === "loading") {
    return (
      <main className="community-library-shell">
        {heroSection}
        <section className="community-library-status" aria-live="polite">
          <WaveformIcon size={28} weight="duotone" />
          <p>{content.loading}</p>
        </section>
      </main>
    );
  }

  if (loadState === "error" || !selectedProfile) {
    return (
      <main className="community-library-shell">
        {heroSection}
        <section className="community-library-status is-error" role="alert">
          <WaveformIcon size={28} weight="duotone" />
          <p>{content.loadError}</p>
        </section>
      </main>
    );
  }

  const selectedWaveform = waveforms[selectedProfile.id];
  const selectedPresentation = presentationFor(selectedProfile);
  const selectedAuthor = profileAuthor(selectedProfile, content.bundled);
  const selectedBrand = localizedBrand(selectedProfile, locale);
  const selectedSourceLabel = selectedPresentation.sourceKind === "community"
    ? content.communitySource
    : selectedPresentation.sourceKind === "official"
      ? content.officialSource
      : content.bundled;
  const playbackDurationMS = activePlaybackWaveform
    ? activePlaybackDurationMS
    : sequenceDurationMS;
  const currentElapsed = progress * playbackDurationMS;
  const playerWaveform = activePlaybackWaveform ?? selectedWaveform;
  const playerWaveformSource = activePlaybackWaveform
    ? waveformSource(activePlaybackExact)
    : waveformSource(waveformExact[selectedProfile.id]);
  const sampleRateLabel = Math.round(sampleRate / 1000) + " kHz";
  const familyFilters: FamilyFilter[] = ["all", "线性", "段落", "点击", "静电容", "屈曲弹簧"];
  const selectedIsCompared = compareIDs.includes(selectedProfile.id);
  const activeCatalogTitle = brandFilter === "all"
    ? content.catalogAll
    : brandFilter === "community-upload"
      ? content.catalogCommunity
      : brandFilter === "more"
        ? content.moreBrands + content.browseSuffix
        : brandNames[brandFilter][locale] + content.browseSuffix;
  const activeCatalogMasthead = brandFilter === "all"
    ? (locale === "en" ? "ALL SOUNDS" : "全部声音")
    : brandFilter === "community-upload"
      ? (locale === "en" ? "COMMUNITY" : "社区投稿")
      : brandFilter === "more"
        ? (locale === "en" ? "MORE BRANDS" : "更多品牌")
        : brandNames[brandFilter][locale];
  const submissionHref = "mailto:team@wormforce.net?subject=Battuta%20Community%20Sound%20Submission";
  const brandFilterLabel = (filter: BrandFilter) => {
    if (filter === "all") return content.allBrands;
    if (filter === "community-upload") return content.communityUploads;
    if (filter === "more") return content.moreBrands;
    return brandNames[filter][locale];
  };

  const miniPlayer = (
    <section className="community-library-mini-player" aria-label={content.playing}>
      {audioError ? <p className="community-library-mini-error" role="status">{content.audioError}</p> : null}
      <div className="community-library-mini-identity" aria-live="polite">
        <figure>
          <Image
            src={switchVisualFor(selectedProfile)}
            alt={switchVisualAlt(selectedProfile, locale)}
            fill
            sizes="72px"
          />
        </figure>
        <div>
          <strong>{selectedProfile.displayName}</strong>
          <span>{selectedBrand} · {selectedPresentation.sourceKind === "community" ? selectedAuthor : selectedSourceLabel}</span>
        </div>
      </div>
      <div className="community-library-mini-playback">
        <div className="community-library-mini-transport">
          <button type="button" aria-label={content.previous} onClick={() => moveProfile(-1)}><SkipBackIcon size={20} weight="fill" aria-hidden /></button>
          <button
            className="is-primary"
            type="button"
            aria-label={isPlaying ? content.stop : content.play}
            onClick={() => isPlaying ? clearPlayback() : void playProfile(selectedProfile.id)}
          >
            {isPlaying ? <PauseIcon size={24} weight="fill" aria-hidden /> : <PlayIcon size={24} weight="fill" aria-hidden />}
          </button>
          <button type="button" aria-label={content.next} onClick={() => moveProfile(1)}><SkipForwardIcon size={20} weight="fill" aria-hidden /></button>
        </div>
        <div className="community-library-mini-progress">
          <AudioWaveform
            points={playerWaveform}
            active={progress > 0}
            progress={progress}
            light
            markers={playbackKind === "comparison"
              ? undefined
              : activePlaybackWaveform
                ? typingMarkers
                : inspectorMarkers}
            showPlayhead
            source={playerWaveformSource}
            onVisible={() => ensureProfileWaveform(selectedProfile.id)}
            label={waveformLabel(selectedProfile.displayName, locale)}
            pendingLabel={content.waveformLoading}
            unavailableLabel={content.waveformUnavailable}
            className="community-library-mini-waveform"
          />
          <small>{formatTime(currentElapsed)} / {formatDuration(playbackDurationMS)}</small>
        </div>
      </div>
      <div className="community-library-mini-options">
        <button type="button" aria-label={content.loop} aria-pressed={loop} onClick={() => setLoop((current) => !current)}>
          <ArrowsClockwiseIcon size={18} weight="bold" aria-hidden />
        </button>
        <div className="community-library-volume">
          <button type="button" aria-label={muted ? content.unmute : content.mute} onClick={() => setMuted((current) => !current)}>
            {muted ? <SpeakerSlashIcon size={19} weight="bold" aria-hidden /> : <SpeakerHighIcon size={19} weight="bold" aria-hidden />}
          </button>
          <input type="range" min="0" max="100" value={volume} onChange={(event) => setVolume(Number(event.target.value))} aria-label={locale === "en" ? "Preview volume" : "试听音量"} />
        </div>
        <button
          className="community-library-mini-compare"
          type="button"
          disabled={!selectedIsCompared && compareIDs.length >= 3}
          aria-label={compareIDs.length ? content.openComparison : content.addCompare}
          aria-controls="community-comparison-drawer"
          aria-expanded={comparisonOpen && compareIDs.length > 0}
          onClick={(event) => compareIDs.length
            ? openComparisonDrawer(event.detail === 0)
            : toggleCompare(selectedProfile.id, event.detail === 0)}
        >
          {selectedIsCompared ? <CheckIcon size={16} weight="bold" aria-hidden /> : <PlusIcon size={16} weight="bold" aria-hidden />}
          <span className="community-library-mini-compare-label">
            {compareIDs.length ? content.openComparison : content.addCompare}
          </span>
          <span>{compareIDs.length}/3</span>
        </button>
        <a className="community-library-mini-install" href={productPath + "#install"} aria-label={content.install}>
          <DownloadSimpleIcon size={18} weight="bold" aria-hidden />
          <span>{content.installShort}</span>
        </a>
        <button
          type="button"
          aria-label={locale === "en" ? "Close player" : "关闭播放器"}
          onClick={(event) => {
            clearPlayback();
            setPlayerVisible(false);
            setAudioError(false);
            if (event.detail === 0) {
              const target = document.getElementById("sound-" + selectedProfile.id)
                ?.querySelector<HTMLButtonElement>(".community-library-card-play")
                ?? document.querySelector<HTMLButtonElement>(".community-library-card-play");
              target?.focus({ preventScroll: true });
            }
          }}
        >
          <XIcon size={18} weight="bold" aria-hidden />
        </button>
      </div>
    </section>
  );

  return (
    <main className="community-library-shell" data-player-visible={playerVisible}>
      <p className="community-library-visually-hidden" aria-live="polite" aria-atomic="true">
        {compareIDs.length ? `${content.selected} ${compareIDs.length}/3` : ""}
      </p>
      {heroSection}

      <section className="community-library-discovery" aria-labelledby="community-discovery-title">
        <div className="community-library-inner">
          <header className="community-library-discovery-heading">
            <div><p className="community-library-eyebrow">{locale === "en" ? "SOUND DISCOVERY / A NEW MIX" : "声音发现 / 此刻的新鲜感"}</p>
              <h2 id="community-discovery-title">{locale === "en" ? <>Follow your ears.<br />Find your next favourite.</> : <>不急着寻找。<br />先听见喜欢。</>}</h2>
              <p>{locale === "en" ? "Three different perspectives on keyboard sound. A fresh mix, without personal tracking." : "从不同品牌与玩家录音中，遇见三种声音。不妨从没听过的开始。"}</p>
            </div>
            <button className="community-library-refresh-mix" onClick={() => setRecommendationSeed(seed => (seed + 2654435761) >>> 0)}><ArrowsClockwiseIcon size={18} aria-hidden />{locale === "en" ? "Another mix" : "换一组灵感"}</button>
          </header>
          <div className="community-library-editorial-grid">
            {recommendedProfiles.map((profile, index) => {
              const playing = isPlaying && playbackKind === "profile" && playingProfileID === profile.id;
              return <article key={profile.id} className="community-library-editorial-card" data-featured={index === 0}>
                <div className="community-library-editorial-copy">
                  <p className="community-library-editorial-kicker">{index === 0 ? (locale === "en" ? "01 / IN THE SPOTLIGHT" : "01 / 本次主推") : index === 1 ? (locale === "en" ? "02 / ANOTHER TEXTURE" : "02 / 换一种触感") : (locale === "en" ? "03 / SOMETHING DIFFERENT" : "03 / 听点不一样的")}</p>
                  <span>{localizedBrand(profile, locale)}</span>
                  <h3>{profile.displayName}</h3>
                  <p>{localizedFamily(profile, locale)} · {localizedTone(profile, locale)}</p>
                </div>
                <figure className="community-library-editorial-image">
                  <Image src={switchVisualFor(profile)} alt={switchVisualAlt(profile, locale)} fill sizes={index === 0 ? "(max-width: 760px) 85vw, 45vw" : "(max-width: 760px) 45vw, 23vw"} />
                  <figcaption>{content.visualNote}</figcaption>
                </figure>
                <footer>
                  <div><small>{presentationFor(profile).sourceKind === "community" ? content.communityUploads : content.bundled}</small><span>{profileAuthor(profile, content.bundled)}</span></div>
                  <button aria-label={(playing ? (locale === "en" ? "Pause recommendation: " : "暂停推荐: ") : (locale === "en" ? "Play recommendation: " : "试听推荐: ")) + profile.displayName} onClick={() => playing ? clearPlayback() : void playProfile(profile.id)}>
                    {playing ? <PauseIcon size={22} weight="fill" aria-hidden /> : <PlayIcon size={22} weight="fill" aria-hidden />}
                    {locale === "en" ? (playing ? "Pause" : "Listen") : (playing ? "暂停" : "听一听")}
                  </button>
                </footer>
              </article>;
            })}
          </div>
          <a className="community-library-discovery-next" href="#community-catalog-title"><span>{locale === "en" ? "Keep exploring · All sounds" : "继续往下，探索全部音色"}</span><ArrowRightIcon size={20} aria-hidden /></a>
        </div>
      </section>

      <section className="community-library-catalog" aria-labelledby="community-catalog-title">
        <div className="community-library-inner">
          <div className="community-library-brand-strip" role="group" aria-label={locale === "en" ? "Browse by brand or source" : "按品牌或来源浏览"}>
            {featuredBrandFilters.slice(0, 5).map((filter) => (
              <button
                key={filter}
                type="button"
                aria-pressed={brandFilter === filter}
                onClick={() => setBrandFilter(filter)}
              >
                <strong>{brandFilterLabel(filter)}</strong>
                <small>{brandFilterCounts[filter]} {content.profileCount}</small>
              </button>
            ))}
          </div>
          <button className="community-library-all-brands" aria-expanded={brandPanelOpen} aria-controls="community-brands-panel" onClick={() => setBrandPanelOpen(value => !value)}>{locale === "en" ? "All brands" : "全部品牌"} · {brandFilterLabel(brandFilter)}</button>
          {brandPanelOpen && <div id="community-brands-panel" className="community-library-brands-panel">
            <label>{locale === "en" ? "Find a brand" : "查找品牌"}<input type="search" value={brandQuery} onChange={event => setBrandQuery(event.target.value)} placeholder={locale === "en" ? "Brand name…" : "输入品牌名称…"} /></label>
            <div>{brandSortOrder.filter(brand => brandNames[brand][locale].toLowerCase().includes(brandQuery.toLowerCase()) && profiles.some(profile => presentationFor(profile).brand === brand)).map(brand => <button key={brand} aria-pressed={brandFilter === brand} onClick={() => { setBrandFilter(brand); setBrandPanelOpen(false); }} >{brandNames[brand][locale]} <small>{profiles.filter(profile => presentationFor(profile).brand === brand).length}</small></button>)}</div>
            {!brandSortOrder.some(brand => brandNames[brand][locale].toLowerCase().includes(brandQuery.toLowerCase()) && profiles.some(profile => presentationFor(profile).brand === brand)) && <p>{locale === "en" ? "No matching brands." : "没有找到匹配品牌。"}</p>}
          </div>}
          <header className="community-library-catalog-header community-library-compact-header">
            <div>
              <p className="community-library-eyebrow">{content.catalogEyebrow + " · " + activeCatalogTitle}</p>
              <h2 id="community-catalog-title">{activeCatalogMasthead}</h2>
              <p className="community-library-catalog-note">
                <WaveformIcon size={17} weight="bold" aria-hidden />
                {`${visibleProfiles.length} ${content.sounds} · ${content.catalogNote}`}
              </p>
            </div>
            <div className="community-library-catalog-tools">
              <label><span className="community-library-visually-hidden">{locale === "en" ? "Source" : "音色来源"}</span><select value={sourceFilter} onChange={event => setSourceFilter(event.target.value as typeof sourceFilter)}>
                <option value="all">{locale === "en" ? "All sources" : "全部来源"}</option>
                <option value="bundled">{content.bundled}</option>
                <option value="community">{content.communityUploads}</option>
                {profiles.some(profile => presentationFor(profile).sourceKind === "official") && <option value="official">{locale === "en" ? "Official" : "官方提供"}</option>}
              </select></label>
              <label>
                <span className="community-library-visually-hidden">{content.familyLabel}</span>
                <select value={family} onChange={(event) => setFamily(event.target.value as FamilyFilter)}>
                  {familyFilters.map((filter) => (
                    <option key={filter} value={filter}>{content.filters[filter]}</option>
                  ))}
                </select>
              </label>
              <label>
                <span className="community-library-visually-hidden">{content.sortLabel}</span>
                <select value={sort} onChange={(event) => setSort(event.target.value as SortMode)}>
                  <option value="curated">{content.sortCurated}</option>
                  <option value="name">{content.sortName}</option>
                  <option value="samples">{content.sortSamples}</option>
                </select>
              </label>
              <button
                className="community-library-audition-toggle"
                type="button"
                aria-expanded={auditionOpen}
                aria-controls="community-audition"
                onClick={() => setAuditionOpen((current) => !current)}
              >
                <KeyboardIcon size={19} weight="bold" aria-hidden />
                {content.typeTest}
              </button>
            </div>
          </header>

          {(brandFilter !== "all" || sourceFilter !== "all" || family !== "all" || query) && <div className="community-library-active-filters">
            {brandFilter !== "all" && <button onClick={() => setBrandFilter("all")}>{brandFilterLabel(brandFilter)} ×</button>}
            {sourceFilter !== "all" && <button onClick={() => setSourceFilter("all")}>{sourceFilter === "community" ? content.communityUploads : content.bundled} ×</button>}
            {family !== "all" && <button onClick={() => setFamily("all")}>{content.filters[family]} ×</button>}
            {query && <button onClick={() => setQuery("")}>{query} ×</button>}
            <button onClick={() => { setBrandFilter("all"); setSourceFilter("all"); setFamily("all"); setQuery(""); }}>{locale === "en" ? "Clear filters" : "清除筛选"}</button>
          </div>}
          {auditionOpen ? (
            <section className="community-library-audition-panel" id="community-audition" aria-labelledby="community-audition-title">
              <div className="community-library-audition-copy">
                <span>{content.quickListen}</span>
                <h3 id="community-audition-title">{selectedProfile.displayName}</h3>
                <p>{selectedBrand} · {content.typeTestHint}</p>
              </div>
              <div className="community-library-key-grid">
                {[
                  { label: content.normalKey, keyLabel: "A", code: "KeyA" },
                  { label: "Space", keyLabel: "Space", code: "Space" },
                  { label: "Enter", keyLabel: "Enter", code: "Enter" },
                  { label: "Backspace", keyLabel: <BackspaceIcon size={21} weight="regular" aria-hidden />, code: "Backspace" },
                ].map((sample) => (
                  <button type="button" key={sample.code} onClick={() => void triggerSample(selectedProfile.id, sample.code)}>
                    <span>{sample.label}</span>
                    <kbd>{sample.keyLabel}</kbd>
                  </button>
                ))}
              </div>
              <label className="community-library-type-test">
                <span><KeyboardIcon size={17} weight="bold" aria-hidden /> {content.typeTest}</span>
                <input
                  type="text"
                  maxLength={120}
                  placeholder={content.typePlaceholder}
                  onKeyDown={handleTypingKey}
                  onFocus={() => void engineRef.current?.activate(selectedProfile.id).catch(() => setAudioError(true))}
                />
              </label>
            </section>
          ) : null}

          {sourceFilter === "community" ? (
            <aside className="community-library-community-note">
              <span className="community-library-community-icon"><UsersThreeIcon size={25} weight="duotone" aria-hidden /></span>
              <div>
                <h3>{content.communityTitle}</h3>
                <p>{content.communityBody}</p>
              </div>
              <button type="button" onClick={() => setSubmissionOpen(true)}>
                {content.communityAction}
                <ArrowRightIcon size={18} weight="bold" aria-hidden />
              </button>
            </aside>
          ) : null}

          {visibleProfiles.length ? (
            <section className="community-library-sound-grid" aria-label={content.title}>
              {visibleProfiles.map((profile, index) => {
                const presentation = presentationFor(profile);
                const isSelected = selectedProfileID === profile.id;
                const profileIsPlaying = playbackKind === "profile"
                  && playingProfileID === profile.id
                  && isPlaying;
                const isCompared = compareIDs.includes(profile.id);
                const profileSamples = Object.keys(profile.samples).length;
                const metrics = waveformMetrics[profile.id];
                const author = profileAuthor(profile, content.bundled);
                const license = profile.attribution?.licenseName || content.sourceRecorded;
                const sourceLabel = presentation.sourceKind === "community"
                  ? content.communitySource
                  : presentation.sourceKind === "official"
                    ? content.officialSource
                    : content.bundled;
                return (
                  <Fragment key={profile.id}>
                  <article
                    className="community-library-sound-card"
                    data-selected={isSelected}
                    data-playing={profileIsPlaying}
                    data-source={presentation.sourceKind}
                    id={"sound-" + profile.id}
                  >
                    <div className="community-library-card-body">
                      <div className="community-library-card-product">
                        <header className="community-library-sound-header">
                          <span className="community-library-brand-name">{localizedBrand(profile, locale)}</span>
                          <h3>{profile.displayName}</h3>
                          <p>{localizedFamily(profile, locale)} <i /> {localizedTone(profile, locale)}</p>
                        </header>
                        <figure className="community-library-switch-visual">
                          <Image
                            src={switchVisualFor(profile)}
                            alt={switchVisualAlt(profile, locale)}
                            fill
                            preload={index === 0}
                            loading={index === 0 ? undefined : index < catalogColumns ? "eager" : "lazy"}
                            sizes="(max-width: 450px) calc(100vw - 54px), (max-width: 900px) 235px, (max-width: 1360px) 270px, 225px"
                          />
                          <figcaption>{content.visualNote}</figcaption>
                        </figure>
                      </div>

                      <section className="community-library-waveform-inspector" aria-label={`${content.inspector}: ${profile.displayName}`}>
                        <header>
                          <strong>{content.inspector}</strong>
                          <span>PCM {sampleRateLabel} / 16-bit</span>
                        </header>
                        <div className="community-library-inspector-ruler" aria-hidden>
                          <span>0s</span>
                          <span>0.08s</span>
                          <span>0.16s</span>
                          <span>0.25s</span>
                        </div>
                        <AudioWaveform
                          points={waveforms[profile.id]}
                          active
                          progress={0.18}
                          markers={inspectorMarkers}
                          source={waveformSource(waveformExact[profile.id])}
                          onVisible={() => ensureProfileWaveform(profile.id)}
                          label={waveformLabel(profile.displayName, locale)}
                          pendingLabel={content.waveformLoading}
                          unavailableLabel={content.waveformUnavailable}
                        />
                        <dl className="community-library-signal-metrics">
                          <div>
                            <dt>{content.peakMetric}</dt>
                            <dd>{formatDecibels(metrics?.peakDecibels)}</dd>
                          </div>
                          <div>
                            <dt>{content.rmsMetric}</dt>
                            <dd>{formatDecibels(metrics?.rmsDecibels)}</dd>
                          </div>
                          <div>
                            <dt>{content.durationMetric}</dt>
                            <dd>{formatSeconds(inspectorDurationMS)}</dd>
                          </div>
                        </dl>
                      </section>
                    </div>

                    <footer className="community-library-sound-meta">
                      <div className="community-library-provenance">
                        <span className="community-library-author-mark">
                          {presentation.sourceKind === "community" ? <UserCircleIcon size={16} weight="fill" aria-hidden /> : <WaveformIcon size={15} weight="bold" aria-hidden />}
                        </span>
                        <span>
                          <strong>{presentation.sourceKind === "community" ? author : sourceLabel}</strong>
                          <small>{presentation.sourceKind === "community" ? license : `${profileSamples} ${content.samples} · ${sampleRateLabel}`}</small>
                        </span>
                      </div>
                      <div className="community-library-card-actions">
                        <button
                          type="button"
                          className="community-library-card-play"
                          aria-label={(profileIsPlaying ? content.stop : content.play) + ": " + profile.displayName}
                          onClick={() => void playProfile(profile.id)}
                        >
                          {profileIsPlaying ? <PauseIcon size={20} weight="fill" aria-hidden /> : <PlayIcon size={20} weight="fill" aria-hidden />}
                        </button>
                        <button
                          type="button"
                          className="community-library-compare-toggle"
                          disabled={!isCompared && compareIDs.length >= 3}
                          aria-label={(isCompared ? content.removeCompare : content.addCompare) + ": " + profile.displayName}
                          aria-pressed={isCompared}
                          aria-controls="community-comparison-drawer"
                          aria-expanded={comparisonOpen && isCompared}
                          onClick={(event) => toggleCompare(profile.id, !isCompared && event.detail === 0)}
                        >
                          {isCompared ? <CheckIcon size={16} weight="bold" aria-hidden /> : <PlusIcon size={16} weight="bold" aria-hidden />}
                          <span>{isCompared ? content.selected : content.addCompare}</span>
                        </button>
                      </div>
                    </footer>
                  </article>
                  </Fragment>
                );
              })}
            </section>
          ) : (
            <Fragment>
              <div className="community-library-empty-state">
                <MagnifyingGlassIcon size={30} weight="duotone" aria-hidden />
                <h2>{content.noResults}</h2>
                <p>{content.noResultsHint}</p>
                <button type="button" onClick={() => { setQuery(""); setFamily("all"); setBrandFilter("all"); setSourceFilter("all"); }}>{content.filters.all}</button>
              </div>
            </Fragment>
          )}

        </div>
      </section>

      {playerVisible ? miniPlayer : null}
      {audioError && !playerVisible ? <p className="community-library-mini-error community-library-floating-error" role="status">{content.audioError}</p> : null}

      {comparisonOpen && compareIDs.length ? (
        <section
          ref={comparisonDrawerRef}
          className="community-library-compare-drawer"
          id="community-comparison-drawer"
          aria-label={content.compare}
          tabIndex={-1}
        >
          <div className="community-library-compare-heading">
            <span>
              <strong>{content.selected} {compareIDs.length}/3</strong>
              <small>{content.compareHint}</small>
            </span>
            <button type="button" aria-label={content.close} onClick={() => closeComparisonDrawer()}>
              <XIcon size={18} weight="bold" aria-hidden />
            </button>
          </div>
          <div className="community-library-compare-list">
            {compareIDs.map((profileID) => {
              const profile = profiles.find((candidate) => candidate.id === profileID);
              if (!profile) return null;
              return (
                <div className="community-library-compare-item" key={profile.id}>
                  <button type="button" className="community-library-compare-preview" onClick={() => void triggerSample(profile.id, "KeyA")}>
                    <span>
                      <strong>{profile.displayName}</strong>
                      <small>{localizedBrand(profile, locale)}</small>
                    </span>
                    <AudioWaveform
                      points={waveforms[profile.id]}
                      light
                      source={waveformSource(waveformExact[profile.id])}
                      onVisible={() => ensureProfileWaveform(profile.id)}
                      label={waveformLabel(profile.displayName, locale)}
                      pendingLabel={content.waveformLoading}
                      unavailableLabel={content.waveformUnavailable}
                    />
                  </button>
                  <button type="button" className="community-library-compare-remove" aria-label={content.removeCompare + ": " + profile.displayName} onClick={() => toggleCompare(profile.id)}>
                    <XIcon size={14} weight="bold" aria-hidden />
                  </button>
                </div>
              );
            })}
          </div>
          <div className="community-library-compare-actions">
            <button type="button" className="is-clear" onClick={clearComparison}>{content.clear}</button>
            <button type="button" className="is-compare" onClick={() => comparisonRunning ? clearPlayback() : void runComparison()} disabled={compareIDs.length < 2}>
              {comparisonRunning ? <PauseIcon size={18} weight="fill" aria-hidden /> : <PlayIcon size={18} weight="fill" aria-hidden />}
              {comparisonRunning ? content.comparing : content.compare}
            </button>
          </div>
        </section>
      ) : null}

      {submissionOpen ? (
        <div
          className="community-library-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSubmissionOpen(false);
          }}
        >
          <section ref={submissionModalRef} className="community-library-submission-modal" role="dialog" aria-modal="true" aria-labelledby="community-submit-title">
            <button ref={submissionCloseRef} className="community-library-modal-close" type="button" aria-label={content.close} onClick={() => setSubmissionOpen(false)}>
              <XIcon size={19} weight="bold" aria-hidden />
            </button>
            <p className="community-library-eyebrow">{content.submitEyebrow}</p>
            <h2 id="community-submit-title">{content.submitTitle}</h2>
            <p className="community-library-modal-body">{content.submitBody}</p>
            <ol>
              {content.submitSteps.map((step, index) => (
                <li key={step}>
                  <span>{index + 1}</span>
                  <strong>{step}</strong>
                </li>
              ))}
            </ol>
            <p className="community-library-modal-note"><SealCheckIcon size={18} weight="fill" aria-hidden /> {content.submitNote}</p>
            <div className="community-library-modal-actions">
              <a href={productPath + "#sound"}>{content.learnPack}</a>
              <a className="is-primary" href={submissionHref}>
                <UploadSimpleIcon size={18} weight="bold" aria-hidden />
                {content.submitEmail}
                <ArrowRightIcon size={17} weight="bold" aria-hidden />
              </a>
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
}
