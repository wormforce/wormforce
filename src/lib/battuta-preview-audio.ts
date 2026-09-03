type AudioPhase = "press" | "release";
type KeyboardRow = "R0" | "R1" | "R2" | "R3" | "R4";
type SpecialKey = "space" | "enter" | "backspace";

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

export type DemoProfile = {
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
    notice?: string;
    sourceURL?: string | null;
    title?: string;
  } | null;
};

export type DemoManifest = {
  version: number;
  sampleRate: number;
  generatedFrom?: string;
  profiles: DemoProfile[];
};

export type BattutaSequenceHit = {
  code: string;
  atMilliseconds: number;
  profileID?: string;
};

export type BattutaPreparedSequence = {
  buffer: AudioBuffer | null;
  waveform: number[];
  durationMilliseconds: number;
  eventCount: number;
  pointCount: number;
  exact: boolean;
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

type PendingTap = {
  profileID: string;
  code: string;
  requestedAt: number;
};

type NormalizedSequenceHit = {
  profileID: string;
  code: string;
  atMilliseconds: number;
  order: number;
};

type OfflineVoice = {
  source: AudioBufferSourceNode;
  endsAt: number;
};

type PendingOfflineRender = {
  render: () => Promise<AudioBuffer>;
  resolve: (buffer: AudioBuffer) => void;
  reject: (error: unknown) => void;
};

const maximumVoiceCount = 16;
const maximumPreparedSequenceCount = 8;
const maximumConcurrentOfflineRenders = 2;
const tapReleaseDelay = 0.055;
const maximumPendingTapDelayMS = 500;

const playbackRecipes = [
  { gain: 1, rate: 1 },
  { gain: 0.975, rate: 0.978 },
  { gain: 0.99, rate: 1.018 },
  { gain: 1.02, rate: 0.992 },
] as const;

const playbackOrder = [0, 2, 1, 3, 1, 0, 3, 2, 3, 1, 2, 0, 2, 3, 0, 1] as const;

const row0Codes = new Set([
  "Backquote", "Digit1", "Digit2", "Digit3", "Digit4", "Digit5", "Digit6",
  "Digit7", "Digit8", "Digit9", "Digit0", "Minus", "Equal",
]);

const row1Codes = new Set([
  "KeyQ", "KeyW", "KeyE", "KeyR", "KeyT", "KeyY", "KeyU", "KeyI", "KeyO",
  "KeyP", "BracketLeft", "BracketRight", "Backslash",
]);

const row2Codes = new Set([
  "KeyA", "KeyS", "KeyD", "KeyF", "KeyG", "KeyH", "KeyJ", "KeyK", "KeyL",
  "Semicolon", "Quote",
]);

const row3Codes = new Set([
  "KeyZ", "KeyX", "KeyC", "KeyV", "KeyB", "KeyN", "KeyM", "Comma", "Period",
  "Slash",
]);

const legacyCodeNames: Record<string, string> = {
  Backquote: "backquote",
  Minus: "minus",
  Equal: "equal",
  BracketLeft: "leftBracket",
  BracketRight: "rightBracket",
  Backslash: "backslash",
  Semicolon: "semicolon",
  Quote: "quote",
  Comma: "comma",
  Period: "period",
  Slash: "slash",
  ShiftLeft: "leftShift",
  ShiftRight: "rightShift",
  ArrowLeft: "leftArrow",
  ArrowRight: "rightArrow",
  ArrowUp: "upArrow",
  ArrowDown: "downArrow",
  Space: "space",
  Enter: "enter",
  NumpadEnter: "keypadEnter",
  Backspace: "backspace",
  Delete: "forwardDelete",
};

function rowForCode(code: string): KeyboardRow {
  if (row0Codes.has(code)) return "R0";
  if (row1Codes.has(code)) return "R1";
  if (row2Codes.has(code)) return "R2";
  if (row3Codes.has(code)) return "R3";
  return "R4";
}

function specialForCode(code: string): SpecialKey | undefined {
  if (code === "Space") return "space";
  if (code === "Enter" || code === "NumpadEnter") return "enter";
  if (code === "Backspace" || code === "Delete") return "backspace";
  return undefined;
}

function legacyIDForCode(code: string): string | undefined {
  if (/^Key[A-Z]$/.test(code)) return code.slice(3).toLowerCase();
  if (/^Digit[0-9]$/.test(code)) return `digit${code.slice(5)}`;
  if (/^F(?:[1-9]|1[0-9]|20)$/.test(code)) return code.toLowerCase();
  return legacyCodeNames[code];
}

function resolveSampleID(profile: DemoProfile, code: string, phase: AudioPhase) {
  const map = profile[phase];
  const legacyID = legacyIDForCode(code);
  if (legacyID && map.keyOverrides?.[legacyID]) return map.keyOverrides[legacyID];

  const special = specialForCode(code);
  if (special && map.specials[special]) return map.specials[special];

  return map.rows[rowForCode(code)] ?? map.generic;
}

function normalizedPointCount(pointCount: number) {
  if (!Number.isFinite(pointCount)) return 96;
  return Math.max(1, Math.floor(pointCount));
}

function nowMilliseconds() {
  return typeof performance === "undefined" ? Date.now() : performance.now();
}

export class BattutaPreviewAudio {
  private readonly profiles = new Map<string, DemoProfile>();
  private readonly rawAudio = new Map<string, Promise<ArrayBuffer>>();
  private readonly banks = new Map<string, LoadedBank>();
  private readonly bankLoads = new Map<string, Promise<LoadedBank>>();
  private readonly waveforms = new Map<string, Map<number, number[]>>();
  private readonly preparedSequences = new Map<string, Promise<BattutaPreparedSequence>>();
  private readonly variationCursors = new Map<string, number>();
  private readonly fetchControllers = new Set<AbortController>();
  private readonly offlineRenderQueue: PendingOfflineRender[] = [];

  private context: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private voices: ActiveVoice[] = [];
  private resumePromise: Promise<void> | null = null;
  private pendingTap: PendingTap | null = null;
  private playbackResumeActive = false;
  private resumeAttempt = 0;
  private outputVolume = 0.66;
  private muted = false;
  private destroyed = false;
  private contextPoisoned = false;
  private activeOfflineRenderCount = 0;

  constructor(
    private readonly manifest: DemoManifest,
    private readonly onUnavailable?: () => void,
  ) {
    manifest.profiles.forEach((profile) => this.profiles.set(profile.id, profile));
  }

  prefetch(profileID: string): Promise<ArrayBuffer> {
    if (this.destroyed) {
      return Promise.reject(new Error("Battuta audio engine has been closed"));
    }
    const profile = this.profiles.get(profileID);
    if (!profile) {
      return Promise.reject(new Error(`Unknown Battuta profile: ${profileID}`));
    }
    const cached = this.rawAudio.get(profileID);
    if (cached) return cached;

    const controller = new AbortController();
    this.fetchControllers.add(controller);
    const request = fetch(profile.sprite, {
      cache: "force-cache",
      signal: controller.signal,
    }).then(async (response) => {
      if (!response.ok) throw new Error(`Unable to load ${profile.displayName}`);
      return response.arrayBuffer();
    }).catch((error: unknown) => {
      if (this.rawAudio.get(profileID) === request) this.rawAudio.delete(profileID);
      throw error;
    }).finally(() => {
      this.fetchControllers.delete(controller);
    });

    this.rawAudio.set(profileID, request);
    return request;
  }

  async loadProfile(profileID: string): Promise<void> {
    this.assertUsable();
    const profileIDs = this.profileChain(profileID);
    if (this.contextPoisoned || this.context?.state === "closed") this.rebuildContext();
    this.ensureContext();
    await Promise.all(profileIDs.map((id) => this.loadBank(id)));
  }

  async activate(profileID: string): Promise<void> {
    this.assertUsable();
    this.getProfile(profileID);
    if (this.contextPoisoned || this.context?.state === "closed") this.rebuildContext();
    this.configureAudioSession();
    this.ensureContext();
    this.primeOutput();
    await this.resume();
    if (this.context?.state !== "running") {
      throw new Error("Battuta audio output did not start");
    }
    await this.loadProfile(profileID);
  }

  tap(profileID: string, code = "KeyA"): boolean {
    if (this.destroyed || this.contextPoisoned) return false;
    const context = this.context;
    if (!context || context.state === "closed" || !this.banks.has(profileID)) return false;

    if (context.state !== "running") {
      this.pendingTap = { profileID, code, requestedAt: nowMilliseconds() };
      this.configureAudioSession();
      this.primeOutput();
      this.requestPlaybackResume();
      return true;
    }

    const startTime = context.currentTime;
    const played = this.play(profileID, code, "press", startTime);
    if (played) this.play(profileID, code, "release", startTime + tapReleaseDelay);
    return played;
  }

  async preloadWaveform(profileID: string, pointCount = 96): Promise<number[]> {
    const count = normalizedPointCount(pointCount);
    const cached = this.waveforms.get(profileID)?.get(count);
    if (cached) return cached;

    await this.loadProfile(profileID);
    const waveform = this.getWaveform(profileID, count);
    if (!waveform) throw new Error(`Unable to prepare a waveform for ${profileID}`);
    return waveform;
  }

  async preparePreviewSequence(
    defaultProfileID: string,
    hits: readonly BattutaSequenceHit[],
    durationMilliseconds: number,
    pointCount = 128,
  ): Promise<BattutaPreparedSequence> {
    this.assertUsable();
    this.getProfile(defaultProfileID);

    const duration = this.normalizedDuration(durationMilliseconds);
    const count = normalizedPointCount(pointCount);
    const normalizedHits = this.normalizeSequenceHits(defaultProfileID, hits, duration);
    const cacheKey = JSON.stringify([
      defaultProfileID,
      duration,
      count,
      normalizedHits.map(({ profileID, code, atMilliseconds }) => [
        profileID,
        code,
        atMilliseconds,
      ]),
    ]);
    const cached = this.preparedSequences.get(cacheKey);
    if (cached) {
      this.preparedSequences.delete(cacheKey);
      this.preparedSequences.set(cacheKey, cached);
      return cached;
    }

    const request = this.buildPreparedSequence(
      defaultProfileID,
      normalizedHits,
      duration,
      count,
    ).catch((error: unknown) => {
      if (this.preparedSequences.get(cacheKey) === request) {
        this.preparedSequences.delete(cacheKey);
      }
      throw error;
    });
    this.preparedSequences.set(cacheKey, request);
    this.trimPreparedSequenceCache();
    return request;
  }

  async preloadSequenceWaveform(
    profileID: string,
    hits: readonly BattutaSequenceHit[],
    durationMilliseconds: number,
    pointCount = 128,
  ): Promise<number[]> {
    const prepared = await this.preparePreviewSequence(
      profileID,
      hits,
      durationMilliseconds,
      pointCount,
    );
    return prepared.waveform;
  }

  playPreparedSequence(prepared: BattutaPreparedSequence): boolean {
    if (this.destroyed || this.contextPoisoned || !prepared.buffer) return false;
    const context = this.context;
    const masterGain = this.masterGain;
    if (!context || !masterGain || context.state !== "running") return false;

    while (this.voices.length >= maximumVoiceCount) {
      const oldest = this.voices.shift();
      if (oldest) this.releaseVoice(oldest, true);
    }

    const source = context.createBufferSource();
    const gain = context.createGain();
    source.buffer = prepared.buffer;
    source.connect(gain);
    gain.connect(masterGain);
    gain.gain.value = 1;

    const voice = { source, gain };
    this.voices.push(voice);
    source.onended = () => {
      const index = this.voices.indexOf(voice);
      if (index >= 0) this.voices.splice(index, 1);
      this.releaseVoice(voice, false);
    };

    try {
      source.start(context.currentTime);
      return true;
    } catch {
      const index = this.voices.indexOf(voice);
      if (index >= 0) this.voices.splice(index, 1);
      this.releaseVoice(voice, false);
      return false;
    }
  }

  resetVariations(profileID: string) {
    const profileIDs = new Set(this.profileChain(profileID));
    for (const key of this.variationCursors.keys()) {
      const separator = key.indexOf(":");
      const resolvedProfileID = separator < 0 ? key : key.slice(0, separator);
      if (profileIDs.has(resolvedProfileID)) this.variationCursors.delete(key);
    }
  }

  getWaveform(profileID: string, pointCount = 96): number[] | undefined {
    const count = normalizedPointCount(pointCount);
    const profileWaveforms = this.waveforms.get(profileID);
    const cached = profileWaveforms?.get(count);
    if (cached) return cached;

    const bank = this.banks.get(profileID);
    if (!bank) return undefined;

    const waveform = this.buildWaveform(bank.buffer, count);
    const cache = profileWaveforms ?? new Map<number, number[]>();
    cache.set(count, waveform);
    if (!profileWaveforms) this.waveforms.set(profileID, cache);
    return waveform;
  }

  setVolume(value: number) {
    const finiteValue = Number.isNaN(value) ? 0 : value;
    this.outputVolume = Math.min(1, Math.max(0, finiteValue));
    this.applyOutputLevel();
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    this.applyOutputLevel();
  }

  stopAll() {
    this.pendingTap = null;
    const voices = this.voices;
    this.voices = [];
    voices.forEach((voice) => this.releaseVoice(voice, true));
  }

  async destroy(): Promise<void> {
    if (this.destroyed) return;
    this.destroyed = true;
    const closeError = new Error("Battuta audio engine has been closed");
    const queuedRenders = this.offlineRenderQueue.splice(0);
    queuedRenders.forEach(({ reject }) => reject(closeError));
    this.fetchControllers.forEach((controller) => controller.abort());
    this.fetchControllers.clear();
    this.stopAll();

    const context = this.context;
    const masterGain = this.masterGain;
    this.context = null;
    this.masterGain = null;
    this.resumePromise = null;
    this.resumeAttempt += 1;
    this.playbackResumeActive = false;
    this.rawAudio.clear();
    this.banks.clear();
    this.bankLoads.clear();
    this.waveforms.clear();
    this.preparedSequences.clear();
    this.variationCursors.clear();

    try {
      masterGain?.disconnect();
      if (context && context.state !== "closed") await context.close();
    } catch {
      // Closing is best-effort; all local references have already been released.
    } finally {
      this.restoreAudioSession();
    }
  }

  private assertUsable() {
    if (this.destroyed) throw new Error("Battuta audio engine has been closed");
  }

  private getProfile(profileID: string) {
    const profile = this.profiles.get(profileID);
    if (!profile) throw new Error(`Unknown Battuta profile: ${profileID}`);
    return profile;
  }

  private profileChain(profileID: string) {
    const profileIDs: string[] = [];
    const visited = new Set<string>();
    let profile: DemoProfile | undefined = this.getProfile(profileID);

    while (profile && !visited.has(profile.id)) {
      visited.add(profile.id);
      profileIDs.push(profile.id);
      profile = profile.baseProfileID
        ? this.profiles.get(profile.baseProfileID)
        : undefined;
    }

    return profileIDs;
  }

  private normalizedDuration(durationMilliseconds: number) {
    if (!Number.isFinite(durationMilliseconds)) return 12_000;
    return Math.max(1, Math.round(durationMilliseconds));
  }

  private normalizeSequenceHits(
    defaultProfileID: string,
    hits: readonly BattutaSequenceHit[],
    durationMilliseconds: number,
  ): NormalizedSequenceHit[] {
    return hits.map((hit, order) => ({
      profileID: hit.profileID ?? defaultProfileID,
      code: hit.code,
      atMilliseconds: hit.atMilliseconds,
      order,
    })).filter((hit) => (
      Number.isFinite(hit.atMilliseconds)
      && hit.atMilliseconds >= 0
      && hit.atMilliseconds < durationMilliseconds
    )).map((hit) => {
      this.getProfile(hit.profileID);
      return hit;
    }).sort((left, right) => (
      left.atMilliseconds - right.atMilliseconds || left.order - right.order
    ));
  }

  private trimPreparedSequenceCache() {
    while (this.preparedSequences.size > maximumPreparedSequenceCount) {
      const oldest = this.preparedSequences.keys().next().value;
      if (oldest === undefined) break;
      this.preparedSequences.delete(oldest);
    }
  }

  private async buildPreparedSequence(
    defaultProfileID: string,
    hits: readonly NormalizedSequenceHit[],
    durationMilliseconds: number,
    pointCount: number,
  ): Promise<BattutaPreparedSequence> {
    const profileIDs = new Set([defaultProfileID]);
    hits.forEach((hit) => profileIDs.add(hit.profileID));
    await Promise.all(Array.from(profileIDs, (profileID) => this.loadProfile(profileID)));

    const OfflineAudioContextConstructor = this.offlineAudioContextConstructor();
    if (!OfflineAudioContextConstructor) {
      return {
        buffer: null,
        waveform: new Array<number>(pointCount).fill(0),
        durationMilliseconds,
        eventCount: hits.length,
        pointCount,
        exact: false,
      };
    }

    const banks = Array.from(profileIDs, (profileID) => this.profileChain(profileID))
      .flatMap((chain) => chain)
      .map((profileID) => this.banks.get(profileID))
      .filter((bank): bank is LoadedBank => bank !== undefined);
    const channelCount = Math.max(
      1,
      ...banks.map((bank) => bank.buffer.numberOfChannels),
    );
    const frameCount = Math.max(
      1,
      Math.ceil((durationMilliseconds * this.manifest.sampleRate) / 1000),
    );

    try {
      const buffer = await this.enqueueOfflineRender(async () => {
        this.assertUsable();
        const offlineContext = new OfflineAudioContextConstructor(
          channelCount,
          frameCount,
          this.manifest.sampleRate,
        );
        const cursors = new Map<string, number>();
        const voices: OfflineVoice[] = [];
        const renderDurationSeconds = frameCount / this.manifest.sampleRate;

        for (const hit of hits) {
          const callTime = hit.atMilliseconds / 1000;
          this.scheduleOfflineSample(
            offlineContext,
            voices,
            cursors,
            hit.profileID,
            hit.code,
            "press",
            callTime,
            callTime,
            renderDurationSeconds,
          );
          this.scheduleOfflineSample(
            offlineContext,
            voices,
            cursors,
            hit.profileID,
            hit.code,
            "release",
            callTime,
            callTime + tapReleaseDelay,
            renderDurationSeconds,
          );
        }

        return offlineContext.startRendering();
      });
      if (this.destroyed) {
        throw new Error("Battuta audio engine has been closed");
      }
      return {
        buffer,
        waveform: this.buildWaveform(buffer, pointCount),
        durationMilliseconds,
        eventCount: hits.length,
        pointCount,
        exact: true,
      };
    } catch (error) {
      if (this.destroyed) throw error;
      return {
        buffer: null,
        waveform: new Array<number>(pointCount).fill(0),
        durationMilliseconds,
        eventCount: hits.length,
        pointCount,
        exact: false,
      };
    }
  }

  private enqueueOfflineRender(render: () => Promise<AudioBuffer>) {
    if (this.destroyed) {
      return Promise.reject<AudioBuffer>(
        new Error("Battuta audio engine has been closed"),
      );
    }

    const request = new Promise<AudioBuffer>((resolve, reject) => {
      this.offlineRenderQueue.push({ render, resolve, reject });
    });
    this.drainOfflineRenderQueue();
    return request;
  }

  private drainOfflineRenderQueue() {
    if (this.destroyed) return;
    while (
      this.activeOfflineRenderCount < maximumConcurrentOfflineRenders
      && this.offlineRenderQueue.length > 0
    ) {
      const pending = this.offlineRenderQueue.shift();
      if (!pending) break;
      this.activeOfflineRenderCount += 1;
      Promise.resolve().then(pending.render).then(
        pending.resolve,
        pending.reject,
      ).finally(() => {
        this.activeOfflineRenderCount -= 1;
        this.drainOfflineRenderQueue();
      });
    }
  }

  private offlineAudioContextConstructor(): typeof OfflineAudioContext | undefined {
    if (typeof window === "undefined") return undefined;
    const browserWindow = window as typeof window & {
      webkitOfflineAudioContext?: typeof OfflineAudioContext;
    };
    return browserWindow.OfflineAudioContext
      ?? browserWindow.webkitOfflineAudioContext;
  }

  private scheduleOfflineSample(
    context: OfflineAudioContext,
    voices: OfflineVoice[],
    cursors: Map<string, number>,
    profileID: string,
    code: string,
    phase: AudioPhase,
    callTime: number,
    when: number,
    renderDuration: number,
  ) {
    const resolved = this.resolveSample(profileID, code, phase);
    if (!resolved) return;
    const { bank, sampleID, sample } = resolved;
    const recipe = this.takePlaybackRecipe(cursors, bank.profile.id, sampleID);

    for (let index = voices.length - 1; index >= 0; index -= 1) {
      if (voices[index].endsAt <= callTime) voices.splice(index, 1);
    }
    while (voices.length >= maximumVoiceCount) {
      const oldest = voices.shift();
      if (!oldest) break;
      try {
        oldest.source.stop(Math.min(renderDuration, Math.max(0, callTime)));
      } catch {
        // The source may already have naturally ended at this exact frame.
      }
    }

    const startTime = Math.max(callTime, when);
    if (startTime >= renderDuration) return;
    const source = context.createBufferSource();
    const gain = context.createGain();
    source.buffer = bank.buffer;
    source.playbackRate.value = recipe.rate;
    source.connect(gain);
    gain.connect(context.destination);

    const outputDuration = sample.durationSeconds / recipe.rate;
    const fadeDuration = Math.min(0.004, outputDuration * 0.2);
    gain.gain.setValueAtTime(recipe.gain, startTime);
    if (fadeDuration > 0) {
      gain.gain.setValueAtTime(recipe.gain, startTime + outputDuration - fadeDuration);
      gain.gain.linearRampToValueAtTime(0.0001, startTime + outputDuration);
    }

    source.start(startTime, sample.offsetSeconds, sample.durationSeconds);
    voices.push({ source, endsAt: startTime + outputDuration });
  }

  private takePlaybackRecipe(
    cursors: Map<string, number>,
    resolvedProfileID: string,
    sampleID: string,
  ) {
    const cursorKey = `${resolvedProfileID}:${sampleID}`;
    const cursor = cursors.get(cursorKey) ?? 0;
    const recipeIndex = playbackOrder[cursor] ?? playbackOrder[0];
    const recipe = playbackRecipes[recipeIndex];
    cursors.set(cursorKey, (cursor + 1) % playbackOrder.length);
    return recipe;
  }

  private async loadBank(profileID: string): Promise<LoadedBank> {
    const existing = this.banks.get(profileID);
    if (existing) return existing;
    const loading = this.bankLoads.get(profileID);
    if (loading) return loading;

    const profile = this.getProfile(profileID);
    const context = this.ensureContext();
    const request = (async () => {
      const raw = await this.prefetch(profileID);
      const buffer = await context.decodeAudioData(raw.slice(0));
      if (this.destroyed || context !== this.context) {
        throw new Error("Battuta audio engine has been closed");
      }
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

  private play(profileID: string, code: string, phase: AudioPhase, when: number) {
    const context = this.context;
    const masterGain = this.masterGain;
    if (!context || !masterGain || context.state !== "running") return false;

    const resolved = this.resolveSample(profileID, code, phase);
    if (!resolved) return false;
    const { bank, sampleID, sample } = resolved;
    const recipe = this.takePlaybackRecipe(
      this.variationCursors,
      bank.profile.id,
      sampleID,
    );

    while (this.voices.length >= maximumVoiceCount) {
      const oldest = this.voices.shift();
      if (oldest) this.releaseVoice(oldest, true);
    }

    const source = context.createBufferSource();
    const gain = context.createGain();
    source.buffer = bank.buffer;
    source.playbackRate.value = recipe.rate;
    source.connect(gain);
    gain.connect(masterGain);

    const startTime = Math.max(context.currentTime, when);
    const outputDuration = sample.durationSeconds / recipe.rate;
    const fadeDuration = Math.min(0.004, outputDuration * 0.2);
    gain.gain.setValueAtTime(recipe.gain, startTime);
    if (fadeDuration > 0) {
      gain.gain.setValueAtTime(recipe.gain, startTime + outputDuration - fadeDuration);
      gain.gain.linearRampToValueAtTime(0.0001, startTime + outputDuration);
    }

    const voice = { source, gain };
    this.voices.push(voice);
    source.onended = () => {
      const index = this.voices.indexOf(voice);
      if (index >= 0) this.voices.splice(index, 1);
      this.releaseVoice(voice, false);
    };

    try {
      source.start(startTime, sample.offsetSeconds, sample.durationSeconds);
      return true;
    } catch {
      const index = this.voices.indexOf(voice);
      if (index >= 0) this.voices.splice(index, 1);
      this.releaseVoice(voice, false);
      return false;
    }
  }

  private resolveSample(profileID: string, code: string, phase: AudioPhase) {
    const visited = new Set<string>();
    let bank = this.banks.get(profileID);

    while (bank && !visited.has(bank.profile.id)) {
      visited.add(bank.profile.id);
      const sampleID = resolveSampleID(bank.profile, code, phase);
      const sample = sampleID ? bank.samples.get(sampleID) : undefined;
      if (sampleID && sample) return { bank, sampleID, sample };
      bank = bank.profile.baseProfileID
        ? this.banks.get(bank.profile.baseProfileID)
        : undefined;
    }

    return undefined;
  }

  private releaseVoice(voice: ActiveVoice, stop: boolean) {
    voice.source.onended = null;
    if (stop) {
      try {
        voice.source.stop();
      } catch {
        // The source may already have naturally ended.
      }
    }
    try {
      voice.source.disconnect();
    } catch {
      // Already disconnected.
    }
    try {
      voice.gain.disconnect();
    } catch {
      // Already disconnected.
    }
  }

  private rebuildContext() {
    const previousContext = this.context;
    const previousGain = this.masterGain;
    this.stopAll();
    this.context = null;
    this.masterGain = null;
    this.resumePromise = null;
    this.resumeAttempt += 1;
    this.playbackResumeActive = false;
    this.banks.clear();
    this.bankLoads.clear();
    this.contextPoisoned = false;

    try {
      previousGain?.disconnect();
    } catch {
      // Already disconnected.
    }
    if (previousContext && previousContext.state !== "closed") {
      void previousContext.close().catch(() => undefined);
    }
    this.ensureContext();
  }

  private ensureContext(): AudioContext {
    this.assertUsable();
    if (this.context) return this.context;
    if (typeof window === "undefined") {
      this.notifyUnavailable();
      throw new Error("Web Audio is only available in a browser");
    }

    const browserWindow = window as typeof window & {
      webkitAudioContext?: typeof AudioContext;
    };
    const AudioContextConstructor = browserWindow.AudioContext
      ?? browserWindow.webkitAudioContext;
    if (!AudioContextConstructor) {
      this.notifyUnavailable();
      throw new Error("This browser does not support Web Audio");
    }

    try {
      try {
        this.context = new AudioContextConstructor({
          latencyHint: "interactive",
          sampleRate: this.manifest.sampleRate,
        });
      } catch {
        this.context = new AudioContextConstructor();
      }
      this.masterGain = this.context.createGain();
      this.masterGain.connect(this.context.destination);
      this.applyOutputLevel(true);
      return this.context;
    } catch (error) {
      this.context = null;
      this.masterGain = null;
      this.notifyUnavailable();
      throw error;
    }
  }

  private async resume() {
    if (this.contextPoisoned) {
      throw new Error("Battuta audio output needs to be restarted");
    }
    const context = this.context;
    if (!context) throw new Error("Battuta audio output is not initialized");
    if (context.state === "running") return;
    if (context.state === "closed") throw new Error("Battuta audio output has been closed");

    if (!this.resumePromise) {
      const attempt = this.resumeAttempt + 1;
      this.resumeAttempt = attempt;
      let timeoutID: number | undefined;
      this.resumePromise = new Promise<void>((resolve, reject) => {
        timeoutID = window.setTimeout(
          () => reject(new Error("Audio resume timed out")),
          1200,
        );
        context.resume().then(resolve, reject);
      }).then(() => {
        if (context !== this.context || context.state !== "running") {
          throw new Error("Audio output is still interrupted");
        }
      }).catch((error: unknown) => {
        if (!this.destroyed) {
          this.contextPoisoned = true;
          this.notifyUnavailable();
        }
        throw error;
      }).finally(() => {
        if (timeoutID !== undefined) window.clearTimeout(timeoutID);
        if (this.resumeAttempt === attempt) this.resumePromise = null;
      });
    }

    await this.resumePromise;
  }

  private requestPlaybackResume() {
    if (this.playbackResumeActive || this.destroyed) return;
    this.playbackResumeActive = true;
    void this.resume().then(() => {
      const pending = this.pendingTap;
      this.pendingTap = null;
      if (!pending || nowMilliseconds() - pending.requestedAt > maximumPendingTapDelayMS) return;

      const context = this.context;
      if (!context) return;
      const startTime = context.currentTime;
      const played = this.play(pending.profileID, pending.code, "press", startTime);
      if (played) {
        this.play(pending.profileID, pending.code, "release", startTime + tapReleaseDelay);
      }
    }).catch(() => {
      this.pendingTap = null;
    }).finally(() => {
      this.playbackResumeActive = false;
    });
  }

  private applyOutputLevel(immediate = false) {
    const context = this.context;
    const masterGain = this.masterGain;
    if (!context || !masterGain || context.state === "closed") return;
    const level = this.muted ? 0 : this.outputVolume;
    if (immediate) {
      masterGain.gain.value = level;
      return;
    }
    masterGain.gain.setTargetAtTime(level, context.currentTime, 0.008);
  }

  private configureAudioSession() {
    if (typeof navigator === "undefined") return;
    const audioSession = (navigator as Navigator & {
      audioSession?: { type: string };
    }).audioSession;
    if (!audioSession) return;
    try {
      audioSession.type = "playback";
    } catch {
      // Older WebKit builds expose a partial Audio Session implementation.
    }
  }

  private restoreAudioSession() {
    if (typeof navigator === "undefined") return;
    const audioSession = (navigator as Navigator & {
      audioSession?: { type: string };
    }).audioSession;
    if (!audioSession) return;
    try {
      audioSession.type = "auto";
    } catch {
      // Leave platform-managed audio routing unchanged when unsupported.
    }
  }

  private primeOutput() {
    const context = this.context;
    const masterGain = this.masterGain;
    if (!context || !masterGain || context.state === "closed") return;

    const source = context.createBufferSource();
    source.buffer = context.createBuffer(1, 1, context.sampleRate);
    source.connect(masterGain);
    source.onended = () => source.disconnect();
    try {
      source.start();
    } catch {
      source.disconnect();
    }
  }

  private prepareBank(profile: DemoProfile, buffer: AudioBuffer): LoadedBank {
    const samples = new Map<string, PreparedSample>();
    const channel = buffer.getChannelData(0);
    const frameScale = buffer.sampleRate / this.manifest.sampleRate;
    const maximumScanFrames = Math.ceil(buffer.sampleRate * 0.25);
    const prerollFrames = Math.ceil(buffer.sampleRate * 0.00015);
    const minimumTrimFrames = Math.ceil(buffer.sampleRate * 0.0005);

    Object.entries(profile.samples).forEach(([sampleID, segment]) => {
      const startFrame = Math.min(
        channel.length,
        Math.max(0, Math.round(segment.offsetFrames * frameScale)),
      );
      const endFrame = Math.min(
        channel.length,
        Math.max(startFrame, Math.round(
          (segment.offsetFrames + segment.frameCount) * frameScale,
        )),
      );
      if (endFrame <= startFrame) return;

      const frameCount = endFrame - startFrame;
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

  private buildWaveform(buffer: AudioBuffer, pointCount: number) {
    const points = new Array<number>(pointCount).fill(0);
    if (buffer.length === 0 || buffer.numberOfChannels === 0) return points;

    const channels = Array.from(
      { length: buffer.numberOfChannels },
      (_, index) => buffer.getChannelData(index),
    );
    let maximum = 0;

    for (let point = 0; point < pointCount; point += 1) {
      const start = Math.floor((point * buffer.length) / pointCount);
      const end = Math.min(
        buffer.length,
        Math.max(start + 1, Math.floor(((point + 1) * buffer.length) / pointCount)),
      );
      let peak = 0;
      for (const channel of channels) {
        for (let frame = start; frame < end; frame += 1) {
          peak = Math.max(peak, Math.abs(channel[frame]));
        }
      }
      points[point] = peak;
      maximum = Math.max(maximum, peak);
    }

    if (maximum === 0) return points;
    return points.map((point) => Math.min(1, point / maximum));
  }

  private notifyUnavailable() {
    try {
      this.onUnavailable?.();
    } catch {
      // UI error reporting must not replace the underlying audio error.
    }
  }
}
