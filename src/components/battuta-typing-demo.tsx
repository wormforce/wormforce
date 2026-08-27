'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
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
};

type AudioState = 'loading' | 'awaiting' | 'activating' | 'ready' | 'switching' | 'error';

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

const virtualKeys = [
  { code: 'KeyA', label: 'A' },
  { code: 'KeyS', label: 'S' },
  { code: 'KeyD', label: 'D' },
  { code: 'KeyF', label: 'F' },
  { code: 'Space', label: 'space', wide: true },
  { code: 'Enter', label: 'return', wide: true },
];

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
    this.ensureContext();
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
    if (!this.context) return;
    const now = this.context.currentTime;
    this.play(profileID, code, 'press', now);
    this.play(profileID, code, 'release', now + 0.055);
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

  private requestPlaybackResume() {
    if (this.playbackResumeActive || this.destroyed) return;
    this.playbackResumeActive = true;
    void this.resume().then(() => {
      const pending = this.pendingResumePress;
      this.pendingResumePress = null;
      if (pending && performance.now() - pending.requestedAt <= 120) {
        this.play(pending.profileID, pending.code, 'press');
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
  const [pressedCodes, setPressedCodes] = useState<Set<string>>(() => new Set());
  const [strikeCount, setStrikeCount] = useState(0);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const engineRef = useRef<TypingAudioEngine | null>(null);
  const activeProfileIDRef = useRef(defaultProfileID);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const pressedCodesRef = useRef(new Set<string>());
  const virtualPressedCodesRef = useRef(new Set<string>());
  const switchGenerationRef = useRef(0);
  const lastPhysicalEventRef = useRef(Number.NEGATIVE_INFINITY);
  const composingRef = useRef(false);
  const suppressComposedInputUntilRef = useRef(0);
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
    setPressedCodes(new Set([...pressedCodesRef.current, ...virtualPressedCodesRef.current]));
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
      virtualPressedCodesRef.current.clear();
      setPressedCodes(new Set());
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
  }, []);

  const registerStrike = useCallback(() => {
    setStrikeCount((count) => Math.min(20, count + 1));
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

  const playPress = useCallback((code: string) => {
    const engine = engineRef.current;
    if (!engine || audioState !== 'ready') return;
    if (engine.play(activeProfileIDRef.current, code, 'press')) registerStrike();
  }, [audioState, registerStrike]);

  const playRelease = useCallback((code: string) => {
    if (audioState !== 'ready') return;
    engineRef.current?.play(activeProfileIDRef.current, code, 'release');
  }, [audioState]);

  const handleKeyDown = useCallback((event: ReactKeyboardEvent<HTMLTextAreaElement>) => {
    const code = event.code;
    if (!code || code === 'Unidentified') return;
    lastPhysicalEventRef.current = performance.now();
    if (event.repeat || pressedCodesRef.current.has(code)) return;
    pressedCodesRef.current.add(code);
    const schedulingStart = performance.now();
    if (audioState === 'ready') {
      if (engineRef.current?.play(activeProfileIDRef.current, code, 'press')) registerStrike();
    } else if (audioState === 'awaiting' || audioState === 'error') {
      void activateAudio();
    }
    textareaRef.current?.setAttribute('data-last-schedule-ms', (performance.now() - schedulingStart).toFixed(3));
    syncPressedCodes();
  }, [activateAudio, audioState, registerStrike, syncPressedCodes]);

  const handleKeyUp = useCallback((event: ReactKeyboardEvent<HTMLTextAreaElement>) => {
    const code = event.code;
    if (!code || code === 'Unidentified' || !pressedCodesRef.current.delete(code)) return;
    lastPhysicalEventRef.current = performance.now();
    if (audioState === 'ready') engineRef.current?.play(activeProfileIDRef.current, code, 'release');
    syncPressedCodes();
  }, [audioState, syncPressedCodes]);

  const handleInput = useCallback(() => {
    if (composingRef.current || pressedCodesRef.current.size > 0 || audioState !== 'ready') return;
    const now = performance.now();
    if (now < suppressComposedInputUntilRef.current || now - lastPhysicalEventRef.current < 450) return;
    engineRef.current?.tap(activeProfileIDRef.current);
    registerStrike();
  }, [audioState, registerStrike]);

  const handleCompositionStart = useCallback(() => {
    composingRef.current = true;
  }, []);

  const handleCompositionEnd = useCallback(() => {
    composingRef.current = false;
    const now = performance.now();
    suppressComposedInputUntilRef.current = now + 250;
    if (audioState === 'ready' && now - lastPhysicalEventRef.current >= 450) {
      engineRef.current?.tap(activeProfileIDRef.current);
      registerStrike();
    }
  }, [audioState, registerStrike]);

  const handleInputBlur = useCallback(() => {
    if (audioState === 'ready') {
      pressedCodesRef.current.forEach((code) => {
        engineRef.current?.play(activeProfileIDRef.current, code, 'release');
      });
    }
    pressedCodesRef.current.clear();
    syncPressedCodes();
  }, [audioState, syncPressedCodes]);

  const handleVirtualDown = useCallback((event: ReactPointerEvent<HTMLButtonElement>, code: string) => {
    if (audioState !== 'ready') return;
    if (event.pointerType !== 'touch') event.currentTarget.setPointerCapture(event.pointerId);
    virtualPressedCodesRef.current.add(code);
    syncPressedCodes();
    playPress(code);
  }, [audioState, playPress, syncPressedCodes]);

  const handleVirtualUp = useCallback((code: string) => {
    if (!virtualPressedCodesRef.current.delete(code)) return;
    syncPressedCodes();
    playRelease(code);
  }, [playRelease, syncPressedCodes]);

  const handleAccessibleVirtualClick = useCallback((event: ReactMouseEvent<HTMLButtonElement>, code: string) => {
    if (event.detail !== 0 || audioState !== 'ready') return;
    engineRef.current?.tap(activeProfileIDRef.current, code);
    registerStrike();
  }, [audioState, registerStrike]);

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
  }, []);

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

          <div className={`typing-demo-input-shell${inputReady ? ' is-ready' : ''}`}>
            <label htmlFor="battuta-demo-input">在这里输入</label>
            <textarea
              ref={textareaRef}
              id="battuta-demo-input"
              rows={4}
              readOnly={!inputReady}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              placeholder="写一句今天想说的话，听听每一次按下与回弹……"
              tabIndex={inputReady ? 0 : -1}
              aria-describedby="battuta-demo-privacy battuta-demo-status"
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
            <div className="typing-demo-pulse" aria-hidden="true" data-active={pressedCodes.size > 0} />
          </div>

          <div className="typing-demo-virtual-keys" role="group" aria-label="可点击的试听键帽">
            {virtualKeys.map((key) => (
              <button
                key={key.code}
                type="button"
                className={`${key.wide ? 'is-wide ' : ''}${pressedCodes.has(key.code) ? 'is-pressed' : ''}`.trim()}
                disabled={!inputReady}
                onPointerDown={(event) => handleVirtualDown(event, key.code)}
                onPointerUp={() => handleVirtualUp(key.code)}
                onPointerCancel={() => handleVirtualUp(key.code)}
                onClick={(event) => handleAccessibleVirtualClick(event, key.code)}
              >
                {key.label}
              </button>
            ))}
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
              清空
            </button>
            <p id="battuta-demo-status" className="typing-demo-status" aria-live="polite">
              <i data-state={audioState} />{statusText}
            </p>
          </div>

          <div className="typing-demo-footer">
            <p id="battuta-demo-privacy">
              <span aria-hidden="true">⌁</span>
              文字只显示在当前输入框中；网页不读取、不上传、不保存输入内容，也不需要输入监控权限。
            </p>
            <div className="typing-demo-credits">
              {selectedProfile?.attribution?.author ? (
                <p className="typing-demo-attribution">
                  {selectedProfile.displayName} 录音：{selectedProfile.attribution.author}
                  {selectedProfile.attribution.licenseName ? ` · ${selectedProfile.attribution.licenseName}` : ''}
                </p>
              ) : null}
              <a
                href="/battuta/demo-audio/AUDIO-THIRD-PARTY-NOTICES.md"
                target="_blank"
                rel="noreferrer"
              >
                音频来源与许可 ↗
              </a>
            </div>
          </div>

          <div className={`typing-demo-conversion${strikeCount >= 8 ? ' is-visible' : ''}`} aria-hidden={strikeCount < 8}>
            <div>
              <span>喜欢这个声音？</span>
              <strong>让所有应用都这样响。</strong>
            </div>
            <a href="#install" tabIndex={strikeCount >= 8 ? 0 : -1}>查看安装方式</a>
          </div>
        </div>

        <p className="typing-demo-mobile-note">
          手机软键盘无法稳定提供物理键位和抬起事件，因此手机端为音色试听；电脑端可体验完整分行与回弹映射。
        </p>
      </div>
    </section>
  );
}
