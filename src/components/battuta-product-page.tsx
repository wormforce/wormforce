import Image from "next/image";
import Link from "next/link";
import { BattutaTypingDemo } from "@/components/battuta-typing-demo";
import {
  battutaGuidePaths,
  battutaPaths,
  battutaRelease,
  type BattutaLocale,
} from "@/content/battuta";
import { getLatestBattutaVersion } from "@/lib/battuta-releases";
import { battutaCommunityPacks } from "@/lib/battuta-community";

const repositoryHref = battutaRelease.repositoryUrl;
const latestReleaseHref = repositoryHref + "/releases/latest";
const macDownloadHref = "/downloads/battuta/macos";
const windowsStoreHref = battutaRelease.windowsStoreUrl;
const windowsPortableDownloadHref = "/downloads/battuta/windows";

const localizedCopy = {
  "zh-CN": {
    navigation: {
      label: "Battuta 产品导航",
      homeLabel: "Battuta 首页",
      try: "试打",
      sound: "音效",
      stats: "统计",
      community: "社区",
      privacy: "隐私",
      install: "安装",
      source: "GitHub",
      download: "下载",
      activeLocale: "ZH",
      targetLocale: "EN",
      targetHref: battutaPaths.en,
      switchLabel: "切换为英文",
    },
    hero: {
      eyebrow: "适用于 macOS 与 Windows 的键盘音效应用",
      title: "Battuta，把喜欢的键盘声音",
      titleAccent: "装进你的电脑。",
      lede:
        "一款常驻菜单栏或系统托盘的键盘与点击音效应用。从浏览器、编辑器到聊天软件，在 Mac 和 Windows 上，每一次输入都有清晰、自然的机械反馈。",
      macDownload: "下载 macOS 版",
      storeDownload: "前往 Microsoft Store ↗",
      windowsDownload: "下载 Windows 便携版",
      source: "在 GitHub 查看源码 ↗",
      compatibilityPrefix: "macOS 13+ · Windows 10/11 x64 · 最新版本 ",
      tryLink: "先不下载，在线试打",
      visualLabel: "Battuta 应用图标",
      iconAlt: "Battuta 荧光绿机械键帽图标",
      metricsLabel: "Battuta 功能概览",
      metrics: [
        ["21", "种键盘音色"],
        ["5", "种点击风格"],
        ["265", "段本地录音"],
      ],
      metricsNote: "macOS + Windows · 本地处理 · 不记录输入内容",
    },
    manifesto: {
      kicker: "一把不存在于桌面的键盘",
      title: "你不需要换键盘，",
      titleAccent: "也能换一种手感。",
      body:
        "Battuta 把真实的按下、回弹与大键录音，映射到你的每一次输入。写代码时来一点清脆反馈，长文写作用更柔和的声音，深夜则换成低调的静音风格。",
    },
    sound: {
      kicker: "真实输入，真实响应",
      title: "按下有声音。抬起也有。",
      body:
        "不只是循环播放一段录音。键盘行、空格、回车和退格会匹配不同样本；开启自然变化后，相同声音会在四种轻微配方之间均衡轮换，连续输入不再像“机关枪”。",
      badge: "打开声音，听实际效果",
      comparison: "三组音色对比 · 约 24 秒",
      fallback: "你的浏览器不支持视频播放。",
      videoLabel: "Battuta 不同键盘音色的实际录屏演示",
      cards: [
        ["01", "声音提前就绪", "启动时预热音频引擎，切换音色时把样本预载到内存。真正打字时不临时读磁盘。"],
        ["02", "自然，而非随机噪声", "轻微的音量与速率变化采用均衡轮换，相邻两次不会重复同一配方。"],
        ["03", "从键盘到触控板", "键盘音量与点击音量分别控制，鼠标左右键、中键和触控板都能拥有自己的反馈。"],
      ],
    },
    palette: {
      kicker: "21 种键盘音色",
      title: "从轻薄到厚重，",
      titleSecondLine: "总有一种适合今天。",
      body:
        "内置音色覆盖段落、点击、线性、静电容和屈曲弹簧等不同结构。新加入的 BCP (Suit80) 带来 28 段逐行、大小键与交替小键录音；每一种都不只是换一个滤镜。",
      families: [
        ["段落", "明确反馈，不必大声。", "Holy Panda · MX Brown · BCP (Suit80) · G915 Brown"],
        ["点击", "清脆、利落、颗粒分明。", "MX Blue · BOX Navy · BOX White · Blue Alps"],
        ["线性", "顺滑连续，适合长时间输入。", "Cream · Alpaca · Black Ink · Keychron Red"],
        ["经典结构", "不一样的触感记忆。", "Topre · IBM Buckling Spring"],
      ],
    },
    community: {
      kicker: "社区音色",
      title: "不止内置的 21 种。",
      titleAccent: "下一种声音，来自社区。",
      body:
        "浏览由创作者录制、经 Wormforce 审核的键盘音色。每个发布版本都固定作者、许可证、大小与 SHA-256，再由 Battuta 在本地完成下载和校验。",
      bodyComing:
        "审核目录与安装协议正在准备中。支持社区安装的 macOS 与 Windows 新版 Battuta 会和首批通过录音来源、许可与包格式审核的音色一同发布。",
      action: "浏览社区音色",
      actionComing: "查看社区预告",
      note: "公开目录 · 许可先展示 · macOS 与 Windows 安全安装",
      noteComing: "即将推出 · 审核后发布 · 不影响现有 1.2.1 功能",
      visualLabel: "Battuta 社区音色",
    },
    stats: {
      kicker: "不只听见，也能看见",
      title: "你的打字习惯，",
      titleAccent: "留下一张地图。",
      bodyBeforeVersion:
        "查看今日输入量、峰值速度、常用应用、七日趋势、年度热力图与逐键分布。",
      bodyAfterVersion:
        " 保留经典荧光绿与青色配色，并依据当前数据自动调整连续色阶；悬停或点击格子即可立即查看时段与输入量。统计只保留聚合数量、物理键码、时间和前台应用，不保存你写下的内容。",
      badge: "本地输入统计",
      loop: "静音循环展示",
      videoLabel: "Battuta 本地输入统计功能录屏",
      features: [
        ["今天", "输入总量、峰值速度与最常使用的应用"],
        ["历史", "七日趋势、年度热力图和活跃时段"],
        ["键盘", "逐键热力图，看见真实的物理按键分布"],
      ],
    },
    capabilities: {
      kicker: "让它真正属于你",
      title: "不止选择。",
      titleAccent: "还可以自己制作。",
      diyLabel: "DIY 音色编辑器",
      diyTitle: "一段录音，自动拆成按下与抬起。",
      diyBody:
        "导入 WAV、AIFF、CAF、M4A 等常见音频；让 Battuta 自动建议切点，再用波形进行试听和微调。你可以覆盖整把键盘、某一排、大键，或某一个具体按键。",
      diyLink: "查看原图 ↗",
      diyLinkLabel: "查看 Battuta DIY 音色编辑器完整截图",
      diyImageAlt: "Battuta DIY 音色编辑器，展示完整键盘映射、按下与回弹音频以及音色包检视器",
      clickLabel: "鼠标与触控板",
      clickTitle: "5 种点击风格。",
      clickBody: "经典微动、静音微动、电竞脆响、厚重办公与玻璃触控板，键盘和点击音量互不影响。",
      press: "按下",
      release: "回弹",
      startupLabel: "日常使用",
      startupTitle: "登录启动。更新也很轻松。",
      startupBody:
        "从 1.1.1 升级的 macOS 用户需手动覆盖安装一次；1.1.2 及后续版本可继续使用应用内更新。Windows Store 版由商店自动更新，ZIP 版从 GitHub 发布页手动更新。",
      running: "Battuta 正在运行",
    },
    privacy: {
      kicker: "隐私不是开关，而是边界",
      title: "它知道你按了键。",
      titleAccent: "不知道你写了什么。",
      paragraphs: [
        "Battuta 只识别用于播放声音和生成聚合统计所需的硬件事件：物理键码、鼠标按钮、按下或抬起、时间以及前台应用。",
        "字符内容、密码、鼠标位置不会被读取、保存或上传。声音、DIY 音色包和输入统计都留在你的设备上。",
      ],
      points: ["不读取字符内容", "不上传输入统计", "MIT 开源可审查"],
      policy: "查看完整隐私政策",
    },
    install: {
      kicker: "开始使用",
      title: "三步，让电脑发出",
      titleAccent: "你喜欢的声音。",
      body: "macOS 提供 DMG；Windows 推荐通过 Microsoft Store 安装，同时保留 ZIP 便携版供离线或免安装使用。",
      steps: [
        ["01", "选择安装方式", "macOS 下载 DMG 并拖入“应用程序”；Windows 推荐从 Microsoft Store 安装，也保留可完整解压后运行的 ZIP 便携版。"],
        ["02", "完成首次系统允许", "macOS 需手动允许打开并开启“输入监控”；Windows Store 版由商店签名安装，ZIP 便携版可能触发 SmartScreen。"],
        ["03", "让它常驻后台", "Battuta 会常驻 macOS 菜单栏或 Windows 系统托盘，也可以设置为登录后自动启动。"],
      ],
      versionSuffix: " · macOS + Windows",
      downloadTitle: "现在，给下一次敲击一个声音。",
      meta: "macOS 通用应用约 9 MB · Windows 10/11 x64 · MIT 开源许可",
      note: "macOS 提供通用 DMG；Windows 可选商店安装，或直接下载同版本 ZIP 便携版。",
      macDownload: "下载 macOS DMG",
      storeDownload: "前往 Microsoft Store ↗",
      windowsDownload: "下载 Windows ZIP",
      releaseNotes: "查看最新发布说明 ↗",
      source: "在 GitHub 查看源码 ↗",
    },
    faq: {
      kicker: "常见问题",
      title: "安装之前，",
      titleAccent: "你可能还想知道。",
      items: [
        ["Battuta 会读取我输入的文字吗？", "不会。Battuta 只用硬件键码、按下与抬起状态来选择声音，不读取字符内容，也不会保存或上传密码、输入文本或指针位置。"],
        ["为什么需要系统输入权限？", "Battuta 需要接收全局的物理按键与鼠标事件，才能跨浏览器、编辑器和聊天软件持续工作。macOS 会要求“输入监控”授权；Windows 使用系统输入接口，但两端都不会读取字符内容。"],
        ["声音会不会跟不上打字？", "应用启动时会预热音频引擎，并把选中的样本预载为 48 kHz PCM。真正按键时只做内存查找和播放，不在输入路径上读取磁盘或转换格式。"],
        ["我可以制作自己的音色吗？", "可以。DIY 编辑器支持通用按下与回弹音、键盘行、大键和逐键覆盖，也可以把完整的一次击键录音自动拆成按下与抬起两段。"],
      ],
    },
    footer: {
      label: "Battuta 页脚",
      tagline: "给每一次输入，配上你喜欢的声音。",
      privacy: "隐私政策",
      license: "MIT 开源许可",
    },
  },
  en: {
    navigation: {
      label: "Battuta product navigation",
      homeLabel: "Battuta home",
      try: "Try",
      sound: "Sound",
      stats: "Stats",
      community: "Community",
      privacy: "Privacy",
      install: "Install",
      source: "GitHub",
      download: "Download",
      activeLocale: "EN",
      targetLocale: "ZH",
      targetHref: battutaPaths.zh,
      switchLabel: "Switch to Chinese",
    },
    hero: {
      eyebrow: "Keyboard sound app for macOS and Windows",
      title: "Bring the keyboard sounds you love",
      titleAccent: "to every keystroke.",
      lede:
        "A keyboard and pointer-sound app that lives in the menu bar or system tray. From browsers and editors to chat apps, it gives every keystroke clear, natural mechanical feedback on Mac and Windows.",
      macDownload: "Download for macOS",
      storeDownload: "Get it from Microsoft Store ↗",
      windowsDownload: "Download Windows portable ZIP",
      source: "View source on GitHub ↗",
      compatibilityPrefix: "macOS 13+ · Windows 10/11 x64 · Latest version ",
      tryLink: "Try it online first",
      visualLabel: "Battuta app icon",
      iconAlt: "Battuta neon-green mechanical keycap icon",
      metricsLabel: "Battuta feature overview",
      metrics: [
        ["21", "keyboard sound profiles"],
        ["5", "click styles"],
        ["265", "local recordings"],
      ],
      metricsNote: "macOS + Windows · Local processing · No typed text recorded",
    },
    manifesto: {
      kicker: "A keyboard that is not on your desk",
      title: "You do not need a new keyboard",
      titleAccent: "to find a new feel.",
      body:
        "Battuta maps real press, release, and large-key recordings to every keystroke. Add crisp feedback while coding, use a softer voice for long-form writing, or choose something quieter late at night.",
    },
    sound: {
      kicker: "Real input, real response",
      title: "A sound on press. Another on release.",
      body:
        "It is more than one recording on loop. Rows, space, return, and backspace use different samples. With natural variation enabled, each sound rotates evenly through four subtle recipes so continuous typing never turns into a machine gun.",
      badge: "Turn on sound to hear it",
      comparison: "Three sound profiles · about 24 seconds",
      fallback: "Your browser does not support video playback.",
      videoLabel: "Screen recording that compares Battuta keyboard sound profiles",
      cards: [
        ["01", "Sound is ready before you type", "Battuta warms the audio engine on launch and preloads samples when you choose a profile. Typing never waits for a disk read."],
        ["02", "Natural, not random noise", "Small gain and playback-rate changes rotate evenly, so adjacent keystrokes do not repeat the same recipe."],
        ["03", "From keyboard to trackpad", "Keyboard and click volume are controlled independently, so left, right, middle, and trackpad clicks can all have their own feedback."],
      ],
    },
    palette: {
      kicker: "21 keyboard sound profiles",
      title: "From light and crisp",
      titleSecondLine: "to deep and weighty.",
      body:
        "Built-in profiles cover tactile, clicky, linear, electro-capacitive, and buckling-spring switches. The new BCP (Suit80) profile adds 28 recordings across rows, large keys, and alternating small keys; none of them is simply a filter.",
      families: [
        ["Tactile", "Clear feedback without excessive volume.", "Holy Panda · MX Brown · BCP (Suit80) · G915 Brown"],
        ["Clicky", "Crisp, decisive, and articulate.", "MX Blue · BOX Navy · BOX White · Blue Alps"],
        ["Linear", "Smooth and continuous for longer sessions.", "Cream · Alpaca · Black Ink · Keychron Red"],
        ["Classic mechanisms", "A different kind of tactile memory.", "Topre · IBM Buckling Spring"],
      ],
    },
    community: {
      kicker: "Community sounds",
      title: "More than the 21 built in.",
      titleAccent: "The next sound comes from the community.",
      body:
        "Browse keyboard recordings made by creators and reviewed by Wormforce. Every release pins its creator, license, byte count, and SHA-256 before Battuta downloads and verifies it locally.",
      bodyComing:
        "The curated catalog and install contract are being prepared. Community-capable macOS and Windows builds will ship with the first sounds that pass provenance, license, and package review.",
      action: "Explore community sounds",
      actionComing: "Preview the community",
      note: "Public catalog · License shown first · Safe install on macOS and Windows",
      noteComing: "Coming soon · Reviewed releases · Existing 1.2.1 features are unchanged",
      visualLabel: "Battuta community sounds",
    },
    stats: {
      kicker: "Hear it, then see it",
      title: "Your typing habits",
      titleAccent: "become a map.",
      bodyBeforeVersion:
        "Review today’s total, peak speed, active apps, seven-day trends, annual heatmaps, and per-key distribution. ",
      bodyAfterVersion:
        " keeps the classic neon-green and cyan palette and adjusts its continuous scale from current data; hover or select a cell to see its time and count. Statistics retain only aggregates, physical key codes, time, and the foreground app—never the text you write.",
      badge: "Local typing statistics",
      loop: "Muted looping preview",
      videoLabel: "Screen recording of Battuta local typing statistics",
      features: [
        ["Today", "Total input, peak speed, and the apps you use most"],
        ["History", "Seven-day trends, an annual heatmap, and active hours"],
        ["Keyboard", "A per-key heatmap that shows physical key use"],
      ],
    },
    capabilities: {
      kicker: "Make it your own",
      title: "Choose a sound.",
      titleAccent: "Then make one.",
      diyLabel: "DIY sound editor",
      diyTitle: "One recording, split into press and release.",
      diyBody:
        "Import WAV, AIFF, CAF, M4A, and other common audio formats. Let Battuta suggest cut points, then preview and fine-tune the waveform. You can cover a whole keyboard, a row, large keys, or one specific key.",
      diyLink: "View full image ↗",
      diyLinkLabel: "View the full Battuta DIY sound-editor screenshot",
      diyImageAlt: "Battuta DIY sound editor with full keyboard mapping, press and release audio, and sound-pack inspector",
      clickLabel: "Mouse and trackpad",
      clickTitle: "Five click styles.",
      clickBody: "Classic microswitch, silent microswitch, sharp gaming click, heavy office click, and glass trackpad feedback stay independent of keyboard volume.",
      press: "press",
      release: "release",
      startupLabel: "Everyday use",
      startupTitle: "Launch at login. Update with ease.",
      startupBody:
        "macOS users upgrading from 1.1.1 need one manual replacement install. Version 1.1.2 and later can keep using in-app updates. The Windows Store edition updates through the Store; the portable ZIP updates from GitHub releases.",
      running: "Battuta is running",
    },
    privacy: {
      kicker: "Privacy is a boundary, not a switch",
      title: "It knows a key was pressed.",
      titleAccent: "It never knows what you wrote.",
      paragraphs: [
        "Battuta recognizes only the hardware events needed for sound playback and aggregate statistics: physical key codes, pointer buttons, press or release state, time, and the foreground app.",
        "Characters, passwords, and pointer locations are never read, saved, or uploaded. Sounds, DIY sound packs, and typing statistics stay on your device.",
      ],
      points: ["Never reads typed text", "Never uploads typing statistics", "MIT-licensed source available to inspect"],
      policy: "Read the full privacy policy",
    },
    install: {
      kicker: "Get started",
      title: "Three steps to give your computer",
      titleAccent: "a sound you love.",
      body: "macOS is available as a DMG. For Windows, Microsoft Store is recommended, with a portable ZIP for offline or no-install use.",
      steps: [
        ["01", "Choose how to install", "Download the DMG for macOS and move it to Applications. On Windows, Microsoft Store is recommended, with a portable ZIP that runs after full extraction."],
        ["02", "Complete first-run approval", "macOS requires a manual first-open approval and Input Monitoring. The Windows Store edition uses Store signing; the portable ZIP can prompt SmartScreen."],
        ["03", "Keep it close at hand", "Battuta lives in the macOS menu bar or Windows system tray, and it can launch automatically when you sign in."],
      ],
      versionSuffix: " · macOS + Windows",
      downloadTitle: "Give the next keystroke a sound.",
      meta: "macOS Universal app, about 9 MB · Windows 10/11 x64 · MIT license",
      note: "macOS is available as a Universal DMG. On Windows, install from the Store or download a portable ZIP for the same release.",
      macDownload: "Download macOS DMG",
      storeDownload: "Get it from Microsoft Store ↗",
      windowsDownload: "Download Windows ZIP",
      releaseNotes: "Read the latest release notes ↗",
      source: "View source on GitHub ↗",
    },
    faq: {
      kicker: "Frequently asked questions",
      title: "Before you install,",
      titleAccent: "you may want to know.",
      items: [
        ["Does Battuta read what I type?", "No. Battuta uses only hardware key codes and press/release state to choose sounds. It never reads characters or saves or uploads passwords, typed text, or pointer locations."],
        ["Why does it need system input access?", "Battuta needs global physical keyboard and pointer events to work across browsers, editors, and chat apps. macOS asks for Input Monitoring; Windows uses system input APIs. Neither implementation reads characters."],
        ["Will the sound keep up with typing?", "The app warms the audio engine on launch and preloads selected samples as 48 kHz PCM. A real keystroke only looks up and plays audio in memory, without disk reads or format conversion on the input path."],
        ["Can I make my own sounds?", "Yes. The DIY editor supports general press and release sounds, rows, large keys, and per-key overrides. It can also split one complete keystroke recording into separate press and release sounds."],
      ],
    },
    footer: {
      label: "Battuta footer",
      tagline: "Give every keystroke a sound you love.",
      privacy: "Privacy policy",
      license: "MIT license",
    },
  },
} as const;

type BattutaProductPageProps = {
  locale?: BattutaLocale;
};

export async function BattutaProductPage({
  locale = "zh-CN",
}: BattutaProductPageProps) {
  const copy = localizedCopy[locale];
  const latestVersion = await getLatestBattutaVersion();
  const isEnglish = locale === "en";
  const hasCommunityPacks = battutaCommunityPacks.length > 0;

  return (
    <div className="battuta-product" lang={locale}>
      <nav className="battuta-subnav" aria-label={copy.navigation.label}>
        <div className="battuta-subnav-inner">
          <a className="brand-lockup" href="#top" aria-label={copy.navigation.homeLabel}>
            <Image src="/battuta/battuta-icon.png" alt="" width={68} height={68} />
            <span>Battuta</span>
          </a>
          <div className="nav-links">
            <a href="#try">{copy.navigation.try}</a>
            <a href="#sound">{copy.navigation.sound}</a>
            <a href="#stats">{copy.navigation.stats}</a>
            <Link href={isEnglish ? battutaPaths.community.en : battutaPaths.community.zh}>
              {copy.navigation.community}
            </Link>
            <a href="#privacy">{copy.navigation.privacy}</a>
            <a href="#install">{copy.navigation.install}</a>
            <a href={repositoryHref} target="_blank" rel="noreferrer">
              {copy.navigation.source} ↗
            </a>
            <span className="locale-switcher" aria-label={copy.navigation.switchLabel}>
              <span aria-current="page">{copy.navigation.activeLocale}</span>
              <Link
                href={copy.navigation.targetHref}
                lang={isEnglish ? "zh-CN" : "en"}
                aria-label={copy.navigation.switchLabel}
              >
                {copy.navigation.targetLocale}
              </Link>
            </span>
            <a className="nav-download" href="#install">
              {copy.navigation.download}
            </a>
          </div>
        </div>
      </nav>

      <header className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">{copy.hero.eyebrow}</p>
          <h1>
            {copy.hero.title}
            <span>{copy.hero.titleAccent}</span>
          </h1>
          <p className="hero-lede">{copy.hero.lede}</p>
          <div className="hero-actions">
            <a className="button button-primary" href={macDownloadHref}>
              {copy.hero.macDownload}
            </a>
            <a className="button button-secondary" href={windowsStoreHref} target="_blank" rel="noreferrer">
              {copy.hero.storeDownload}
            </a>
            <a className="button button-secondary" href={windowsPortableDownloadHref}>
              {copy.hero.windowsDownload}
            </a>
            <a className="button button-github" href={repositoryHref} target="_blank" rel="noreferrer">
              {copy.hero.source}
            </a>
          </div>
          <p className="compatibility">
            {copy.hero.compatibilityPrefix}
            {latestVersion}
          </p>
          <a className="hero-try-link" href="#try">
            {copy.hero.tryLink} <span aria-hidden="true">↓</span>
          </a>
        </div>

        <div className="hero-visual" aria-label={copy.hero.visualLabel}>
          <div className="sound-ring sound-ring-one" />
          <div className="sound-ring sound-ring-two" />
          <Image
            src="/battuta/battuta-icon.png"
            alt={copy.hero.iconAlt}
            width={1236}
            height={1236}
            sizes="(max-width: 850px) 70vw, 42vw"
            priority
          />
        </div>

        <div className="hero-metrics" aria-label={copy.hero.metricsLabel}>
          {copy.hero.metrics.map(([value, label]) => (
            <div key={label}>
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          ))}
          <div className="metrics-note">{copy.hero.metricsNote}</div>
        </div>
      </header>

      <BattutaTypingDemo locale={locale} />

      <section className="manifesto light-section">
        <div className="section-inner manifesto-grid">
          <p className="section-kicker">{copy.manifesto.kicker}</p>
          <div>
            <h2>
              {copy.manifesto.title}
              <span>{copy.manifesto.titleAccent}</span>
            </h2>
            <p>{copy.manifesto.body}</p>
          </div>
        </div>
      </section>

      <section className="sound-section dark-section" id="sound">
        <div className="section-inner">
          <div className="section-heading section-heading-centered">
            <p className="section-kicker lime">{copy.sound.kicker}</p>
            <h2>{copy.sound.title}</h2>
            <p>{copy.sound.body}</p>
          </div>

          <div className="media-shell media-shell-dark">
            <div className="media-topbar">
              <span className="media-badge"><i />{copy.sound.badge}</span>
              <span>{copy.sound.comparison}</span>
            </div>
            <video
              controls
              playsInline
              preload="metadata"
              poster="/battuta/media/battuta-sound-poster.jpg"
              aria-label={copy.sound.videoLabel}
            >
              <source src="/battuta/media/battuta-sound-demo-polished.mp4" type="video/mp4" />
              {copy.sound.fallback}
            </video>
          </div>

          <div className="detail-grid three-columns">
            {copy.sound.cards.map(([number, title, body]) => (
              <article key={number}>
                <span className="detail-number">{number}</span>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="palette-section">
        <div className="section-inner">
          <div className="split-heading">
            <div>
              <p className="section-kicker">{copy.palette.kicker}</p>
              <h2>
                {copy.palette.title}
                <br />
                {copy.palette.titleSecondLine}
              </h2>
            </div>
            <p>{copy.palette.body}</p>
          </div>

          <div className="sound-family-grid">
            {copy.palette.families.map(([name, description, examples]) => (
              <article key={name}>
                <span>{name}</span>
                <h3>{description}</h3>
                <p>{examples}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="community-spotlight dark-section">
        <div className="section-inner community-spotlight-grid">
          <div>
            <p className="section-kicker lime">{copy.community.kicker}</p>
            <h2>
              <span className="headline-line">{copy.community.title}</span>
              <span className="headline-line lime-copy">{copy.community.titleAccent}</span>
            </h2>
            <p className="community-spotlight-body">
              {hasCommunityPacks ? copy.community.body : copy.community.bodyComing}
            </p>
            <Link
              className="button button-primary"
              href={isEnglish ? battutaPaths.community.en : battutaPaths.community.zh}
            >
              {hasCommunityPacks ? copy.community.action : copy.community.actionComing} →
            </Link>
            <p className="community-spotlight-note">
              {hasCommunityPacks ? copy.community.note : copy.community.noteComing}
            </p>
          </div>
          <div className="community-spotlight-visual" role="img" aria-label={copy.community.visualLabel}>
            <span className="community-spotlight-key community-spotlight-key-one">B</span>
            <span className="community-spotlight-key community-spotlight-key-two">C</span>
            <span className="community-spotlight-key community-spotlight-key-three">↗</span>
          </div>
        </div>
      </section>

      <section className="stats-section light-section" id="stats">
        <div className="section-inner">
          <div className="section-heading section-heading-centered dark-copy">
            <p className="section-kicker green">{copy.stats.kicker}</p>
            <h2>
              <span className="headline-line">{copy.stats.title}</span>
              <span className="headline-line">{copy.stats.titleAccent}</span>
            </h2>
            <p>
              {copy.stats.bodyBeforeVersion}
              {battutaRelease.version}
              {copy.stats.bodyAfterVersion}
            </p>
          </div>

          <div className="media-shell media-shell-light">
            <div className="media-topbar">
              <span className="media-badge dark"><i />{copy.stats.badge}</span>
              <span>{copy.stats.loop}</span>
            </div>
            <video
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster="/battuta/media/battuta-stats-poster.jpg"
              aria-label={copy.stats.videoLabel}
            >
              <source src="/battuta/media/battuta-stats-demo-polished-v2.mp4" type="video/mp4" />
              {copy.sound.fallback}
            </video>
          </div>

          <div className="stats-feature-row">
            {copy.stats.features.map(([title, body]) => (
              <article key={title}>
                <strong>{title}</strong>
                <span>{body}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="capabilities-section dark-section">
        <div className="section-inner">
          <div className="section-heading">
            <p className="section-kicker lime">{copy.capabilities.kicker}</p>
            <h2>
              <span className="headline-line">{copy.capabilities.title}</span>
              <span className="headline-line">{copy.capabilities.titleAccent}</span>
            </h2>
          </div>

          <div className="bento-grid">
            <article className="bento-card bento-large bento-diy">
              <p className="card-label">{copy.capabilities.diyLabel}</p>
              <h3>{copy.capabilities.diyTitle}</h3>
              <p>{copy.capabilities.diyBody}</p>
              <a
                className="diy-editor-figure"
                href="/battuta/media/battuta-diy-editor.png"
                target="_blank"
                rel="noreferrer"
                aria-label={copy.capabilities.diyLinkLabel}
              >
                <Image
                  src="/battuta/media/battuta-diy-editor.png"
                  alt={copy.capabilities.diyImageAlt}
                  width={2592}
                  height={1642}
                  sizes="(max-width: 850px) calc(100vw - 96px), 1188px"
                />
                <span>{copy.capabilities.diyLink}</span>
              </a>
            </article>

            <article className="bento-card bento-clicks">
              <p className="card-label">{copy.capabilities.clickLabel}</p>
              <h3>{copy.capabilities.clickTitle}</h3>
              <p>{copy.capabilities.clickBody}</p>
              <div className="click-pills" aria-hidden="true">
                <span>{copy.capabilities.press}</span><i /><span>{copy.capabilities.release}</span>
              </div>
            </article>

            <article className="bento-card bento-startup">
              <p className="card-label">{copy.capabilities.startupLabel}</p>
              <h3>{copy.capabilities.startupTitle}</h3>
              <p>{copy.capabilities.startupBody}</p>
              <div className="status-line"><i />{copy.capabilities.running}</div>
            </article>
          </div>
        </div>
      </section>

      <section className="privacy-section" id="privacy">
        <div className="section-inner privacy-grid">
          <div>
            <p className="section-kicker">{copy.privacy.kicker}</p>
            <h2>
              {copy.privacy.title}
              <br />
              {copy.privacy.titleAccent}
            </h2>
          </div>
          <div className="privacy-copy">
            {copy.privacy.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            <div className="privacy-points">
              {copy.privacy.points.map((point) => (
                <span key={point}>{point}</span>
              ))}
            </div>
            <Link className="privacy-policy-link" href={isEnglish ? battutaPaths.privacy.en : battutaPaths.privacy.zh}>
              {copy.privacy.policy} <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="install-section light-section" id="install">
        <div className="section-inner">
          <div className="section-heading section-heading-centered dark-copy">
            <p className="section-kicker green">{copy.install.kicker}</p>
            <h2>
              <span className="headline-line">{copy.install.title}</span>
              <span className="headline-line">{copy.install.titleAccent}</span>
            </h2>
            <p>{copy.install.body}</p>
          </div>

          <div className="install-grid">
            {copy.install.steps.map(([number, title, body]) => (
              <article key={number}>
                <span>{number}</span>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>

          {isEnglish ? (
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <Link
                href={battutaGuidePaths.macos}
                className="rounded-3xl border border-black/15 bg-white/35 p-6 text-left transition hover:-translate-y-0.5 hover:border-black/35 hover:bg-white/55"
              >
                <span className="text-xs font-semibold tracking-[0.12em] text-[#607f15] uppercase">
                  macOS installation guide
                </span>
                <h3 className="mt-3 text-xl font-semibold text-[#171914]">
                  Add mechanical keyboard sounds on a Mac
                </h3>
                <p className="mt-3 text-sm leading-7 text-[#61655c]">
                  Install the DMG, pass Gatekeeper safely, enable Input Monitoring,
                  and confirm that Battuta is receiving hardware events.
                </p>
              </Link>
              <Link
                href={battutaGuidePaths.windows}
                className="rounded-3xl border border-black/15 bg-white/35 p-6 text-left transition hover:-translate-y-0.5 hover:border-black/35 hover:bg-white/55"
              >
                <span className="text-xs font-semibold tracking-[0.12em] text-[#607f15] uppercase">
                  Windows installation guide
                </span>
                <h3 className="mt-3 text-xl font-semibold text-[#171914]">
                  Add mechanical keyboard sounds on Windows
                </h3>
                <p className="mt-3 text-sm leading-7 text-[#61655c]">
                  Choose Microsoft Store or the portable ZIP, then keep Battuta in
                  the notification area for system-wide sound.
                </p>
              </Link>
            </div>
          ) : null}

          <div className="download-panel">
            <Image src="/battuta/battuta-icon.png" alt="" width={204} height={204} />
            <div>
              <p className="download-version">
                Battuta {latestVersion}{copy.install.versionSuffix}
              </p>
              <h3>{copy.install.downloadTitle}</h3>
              <p className="download-meta">{copy.install.meta}</p>
              <p className="download-note">{copy.install.note}</p>
            </div>
            <div className="download-actions">
              <a className="button button-dark" href={macDownloadHref}>{copy.install.macDownload}</a>
              <a className="button button-dark" href={windowsStoreHref} target="_blank" rel="noreferrer">{copy.install.storeDownload}</a>
              <a className="button button-outline-dark" href={windowsPortableDownloadHref}>{copy.install.windowsDownload}</a>
              <a className="text-link" href={latestReleaseHref} target="_blank" rel="noreferrer">{copy.install.releaseNotes}</a>
              <a className="text-link" href={repositoryHref} target="_blank" rel="noreferrer">{copy.install.source}</a>
            </div>
          </div>
        </div>
      </section>

      <section className="faq-section light-section">
        <div className="section-inner faq-grid">
          <div>
            <p className="section-kicker green">{copy.faq.kicker}</p>
            <h2>
              {copy.faq.title}
              <br />
              {copy.faq.titleAccent}
            </h2>
          </div>
          <div className="faq-list">
            {copy.faq.items.map(([question, answer]) => (
              <details key={question}>
                <summary>{question}<span>＋</span></summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="battuta-product-footer" aria-label={copy.footer.label}>
        <div className="footer-inner">
          <a className="brand-lockup" href="#top">
            <Image src="/battuta/battuta-icon.png" alt="" width={68} height={68} />
            <span>Battuta</span>
          </a>
          <p>{copy.footer.tagline}</p>
          <div>
            <a href={repositoryHref} target="_blank" rel="noreferrer">GitHub</a>
            <Link href={isEnglish ? battutaPaths.community.en : battutaPaths.community.zh}>
              {copy.navigation.community}
            </Link>
            {isEnglish ? (
              <>
                <Link href={battutaGuidePaths.macos}>macOS guide</Link>
                <Link href={battutaGuidePaths.windows}>Windows guide</Link>
              </>
            ) : null}
            <Link href={isEnglish ? battutaPaths.privacy.en : battutaPaths.privacy.zh}>
              {copy.footer.privacy}
            </Link>
            <a href={battutaRelease.licenseUrl} target="_blank" rel="noreferrer">
              {copy.footer.license}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
