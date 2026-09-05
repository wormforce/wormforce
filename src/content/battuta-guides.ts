import { battutaGuidePaths, battutaPaths, battutaRelease } from "@/content/battuta";

export type BattutaGuide = {
  slug: string;
  path: string;
  platform: "macOS" | "Windows";
  title: string;
  seoTitle: string;
  description: string;
  eyebrow: string;
  introduction: string;
  updatedAt: string;
  requirements: string[];
  steps: {
    title: string;
    description: string;
  }[];
  sections: {
    id: string;
    title: string;
    paragraphs: string[];
    bullets?: string[];
  }[];
  troubleshooting: {
    question: string;
    answer: string;
  }[];
  primaryAction: {
    label: string;
    href: string;
  };
  secondaryAction: {
    label: string;
    href: string;
  };
  relatedGuide: {
    label: string;
    href: string;
  };
};

export const battutaGuides: BattutaGuide[] = [
  {
    slug: "keyboard-sounds-macos",
    path: battutaGuidePaths.macos,
    platform: "macOS",
    title: "How to Add Mechanical Keyboard Sounds on Mac",
    seoTitle: "Mechanical Keyboard Sounds on Mac — Battuta Setup Guide",
    description:
      "Add mechanical keyboard sounds to any Mac app with Battuta. Follow this setup guide for installation, Input Monitoring permission, privacy, and troubleshooting.",
    eyebrow: "Battuta for macOS",
    introduction:
      "Want mechanical keyboard sounds on your Mac without changing your physical keyboard? Battuta is a free, open-source menu bar app that adds responsive press and release sounds across browsers, editors, chat apps, and other macOS software.",
    updatedAt: battutaRelease.updatedAt,
    requirements: [
      "macOS 13 or later",
      "Apple silicon or Intel Mac",
      `Battuta ${battutaRelease.version}`,
      "Input Monitoring permission",
    ],
    steps: [
      {
        title: "Download the current DMG",
        description:
          "Download Battuta from the official Wormforce GitHub release. The macOS build is a Universal app for Apple silicon and Intel Macs.",
      },
      {
        title: "Move Battuta to Applications",
        description:
          "Open the DMG, drag Battuta into the Applications folder, and launch it from Applications rather than from the disk image.",
      },
      {
        title: "Allow the first launch",
        description:
          "The current build is self-signed and not notarized. Control-click Battuta, choose Open, and confirm. If macOS still blocks it, use System Settings → Privacy & Security → Open Anyway.",
      },
      {
        title: "Enable Input Monitoring",
        description:
          "Open System Settings → Privacy & Security → Input Monitoring and enable Battuta. Quit and reopen the app if macOS asks you to do so.",
      },
      {
        title: "Choose a sound profile",
        description:
          "Open Battuta from the menu bar, select one of the 21 keyboard profiles, and adjust keyboard and pointer volume independently.",
      },
    ],
    sections: [
      {
        id: "what-it-does",
        title: "A keyboard sound app that works across macOS",
        paragraphs: [
          "Battuta listens for physical key-down and key-up events, then plays matching recordings with low latency. It runs from the menu bar, so the same keyboard profile works while you type in Safari, Chrome, VS Code, Terminal, Notes, or a chat app.",
          "The selected samples are preloaded as 48 kHz PCM audio. A keystroke therefore triggers an in-memory lookup and playback instead of reading or converting a file in the input path.",
        ],
        bullets: [
          "21 keyboard profiles and five separate pointer-click styles",
          "Distinct press, release, keyboard-row, and large-key samples",
          "DIY editor for per-key recordings and reusable sound packs",
          "Local typing trends without storing the text you type",
        ],
      },
      {
        id: "permission",
        title: "Why Battuta needs Input Monitoring",
        paragraphs: [
          "macOS only lets an app receive system-wide keyboard events after you grant Input Monitoring permission. Battuta needs those events so a key can make a sound even when another app is in front.",
          "That permission is broad at the operating-system level, but Battuta uses only hardware key codes, button identifiers, and down/up state. It does not read characters, passwords, pointer location, or the contents of the active window. Aggregated typing statistics stay on the device, and the source code is public for inspection.",
        ],
      },
      {
        id: "sound-packs",
        title: "Choose a profile or make your own",
        paragraphs: [
          "Start with a built-in mechanical profile, then tune the volume and natural variation. Press and release recordings are handled separately, which makes the result feel less like a single sound pasted onto every key.",
          "The DIY editor accepts common audio formats and lets you assign a general sound, keyboard rows, large keys, or an individual key. Completed packs can be exported as a .simuboardpack file and moved to another computer.",
        ],
      },
    ],
    troubleshooting: [
      {
        question: "Battuta opens, but typing makes no sound",
        answer:
          "Confirm that Battuta is enabled under Input Monitoring, then quit and reopen it. Also check the app's keyboard volume, the selected macOS output device, and system volume.",
      },
      {
        question: "macOS says the app cannot be opened",
        answer:
          "Use the copy downloaded from the official GitHub release, Control-click it in Applications, and choose Open. If needed, approve that same app under Privacy & Security. This extra step is required because the current DMG is not notarized.",
      },
      {
        question: "Input Monitoring is on, but Battuta still asks for access",
        answer:
          "Toggle Battuta off and back on in Input Monitoring, then fully quit and relaunch it. macOS may not apply a newly granted permission to an already running process.",
      },
      {
        question: "Can Battuta start automatically?",
        answer:
          "Yes. Enable launch at login in Battuta after you have completed the first launch and permission setup.",
      },
    ],
    primaryAction: {
      label: `Download Battuta ${battutaRelease.version} for Mac`,
      href: battutaRelease.macDownloadUrl,
    },
    secondaryAction: {
      label: "View Battuta features",
      href: battutaPaths.en,
    },
    relatedGuide: {
      label: "Set up keyboard sounds on Windows",
      href: battutaGuidePaths.windows,
    },
  },
  {
    slug: "keyboard-sounds-windows",
    path: battutaGuidePaths.windows,
    platform: "Windows",
    title: "How to Add Mechanical Keyboard Sounds on Windows",
    seoTitle: "Mechanical Keyboard Sounds on Windows — Battuta Guide",
    description:
      "Add mechanical keyboard sounds to Windows 10 or 11 with Battuta. Compare Microsoft Store and portable installs, then configure sounds and fix common issues.",
    eyebrow: "Battuta for Windows",
    introduction:
      "Battuta is a free, open-source Windows keyboard sound app that adds responsive mechanical press and release sounds while you type in browsers, editors, or chat apps. Install it from Microsoft Store or use the portable ZIP.",
    updatedAt: battutaRelease.updatedAt,
    requirements: [
      "Windows 10 or 11",
      "64-bit x64 PC",
      `Battuta ${battutaRelease.version}`,
      "Microsoft Store or portable ZIP",
    ],
    steps: [
      {
        title: "Choose Store or portable",
        description:
          "Use Microsoft Store for a managed installation, or download the official ZIP if you prefer a portable copy.",
      },
      {
        title: "Install or extract the app",
        description:
          "For the ZIP version, extract the entire archive to a normal folder before opening Battuta. Do not run the executable from inside the compressed archive.",
      },
      {
        title: "Complete the first launch",
        description:
          "Open Battuta. Windows may show SmartScreen for the portable build; verify that it came from the official Wormforce GitHub release before continuing.",
      },
      {
        title: "Select a keyboard profile",
        description:
          "Open Battuta from the system tray, choose one of the 21 profiles, and set the keyboard and pointer volumes you want.",
      },
      {
        title: "Keep it available in the tray",
        description:
          "Battuta continues working when its window is closed to the system tray. Enable launch at login if you want keyboard sounds after every sign-in.",
      },
    ],
    sections: [
      {
        id: "install-options",
        title: "Microsoft Store or portable ZIP?",
        paragraphs: [
          "The Microsoft Store version is the simplest option for most Windows users because Windows manages the installation in the normal Store flow. The portable ZIP is useful when you want to keep Battuta in a folder of your choice or try it without a Store install.",
          "Both options provide the same core keyboard sounds, click styles, DIY editor, and local statistics. If you choose the portable version, keep all extracted files together so the app can find its packaged resources.",
        ],
      },
      {
        id: "what-it-does",
        title: "System-wide typing sounds with low-latency playback",
        paragraphs: [
          "Battuta receives low-level physical keyboard and pointer events, then maps them to press and release recordings. It stays in the Windows system tray and works while another desktop app is active.",
          "The selected audio is preloaded into memory as 48 kHz PCM. When you press a key, Battuta can play the matching sample without reading or converting an audio file at that moment.",
        ],
        bullets: [
          "21 keyboard sound profiles and five pointer-click styles",
          "Separate handling for press, release, rows, and large keys",
          "Per-key DIY sound editing and portable sound-pack export",
          "Independent keyboard and pointer volume controls",
        ],
      },
      {
        id: "privacy",
        title: "What Battuta can—and cannot—see",
        paragraphs: [
          "System-wide keyboard sounds require Battuta to receive physical key and button events outside its own window. On Windows, it uses low-level input hooks for hardware codes and down/up state.",
          "Battuta does not read the characters you type, record passwords, collect pointer coordinates, or upload raw input. Optional typing statistics are aggregated and stored locally. You can inspect the implementation in the public GitHub repository.",
        ],
      },
    ],
    troubleshooting: [
      {
        question: "The portable app does not start correctly",
        answer:
          "Extract the complete ZIP to a normal folder and launch Battuta from there. Running directly from the archive or moving only the executable can leave required packaged files behind.",
      },
      {
        question: "Windows SmartScreen appears",
        answer:
          "First confirm that the ZIP came from the official Wormforce GitHub release linked on this page. Only continue after checking the source. The Microsoft Store version is an alternative if you prefer the Store installation flow.",
      },
      {
        question: "Battuta is in the tray, but there is no sound",
        answer:
          "Open the tray app and confirm a profile is active and keyboard volume is above zero. Then check Windows system volume, the selected output device, and Battuta's level in Volume Mixer.",
      },
      {
        question: "Does closing the window stop keyboard sounds?",
        answer:
          "No. Closing the main window leaves Battuta running in the system tray. Use the tray menu's quit action when you want to stop it completely.",
      },
    ],
    primaryAction: {
      label: "Get Battuta from Microsoft Store",
      href: battutaRelease.windowsStoreUrl,
    },
    secondaryAction: {
      label: `Download portable ZIP ${battutaRelease.version}`,
      href: battutaRelease.windowsPortableDownloadUrl,
    },
    relatedGuide: {
      label: "Set up keyboard sounds on macOS",
      href: battutaGuidePaths.macos,
    },
  },
];

export function getBattutaGuideBySlug(slug: string) {
  return battutaGuides.find((guide) => guide.slug === slug);
}
