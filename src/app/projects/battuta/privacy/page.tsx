import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { teamProfile } from "@/content/site";
import { absoluteUrl } from "@/lib/utils";

const policyUrl = absoluteUrl("/projects/battuta/privacy");
const effectiveDate = "2026-08-25";

export const metadata: Metadata = {
  title: "Battuta 隐私政策 / Privacy Policy",
  description:
    "了解 Battuta 如何在设备本地处理键盘与鼠标事件、输入统计、DIY 音色和更新请求。",
  alternates: {
    canonical: policyUrl,
  },
  openGraph: {
    title: "Battuta 隐私政策 / Privacy Policy",
    description:
      "Battuta 的数据处理、设备本地存储、用户控制和第三方服务说明。",
    url: policyUrl,
    type: "article",
    images: [
      {
        url: absoluteUrl("/battuta/og-v1.2.0.png"),
        width: 1672,
        height: 941,
        alt: "Battuta 1.2.0 keyboard sound app for macOS and Windows",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Battuta 隐私政策 / Privacy Policy",
    description: "Battuta 如何处理和保护你的数据。",
    images: [absoluteUrl("/battuta/og-v1.2.0.png")],
  },
  robots: {
    index: true,
    follow: true,
  },
};

type PolicySectionProps = {
  number: string;
  title: string;
  children: ReactNode;
};

function PolicySection({ number, title, children }: PolicySectionProps) {
  return (
    <section className="privacy-policy-section">
      <div className="privacy-policy-section-heading">
        <span>{number}</span>
        <h3>{title}</h3>
      </div>
      <div className="privacy-policy-section-body">{children}</div>
    </section>
  );
}

export default function BattutaPrivacyPage() {
  return (
    <div className="battuta-product battuta-privacy-page" lang="zh-CN">
      <nav className="battuta-subnav" aria-label="Battuta 隐私政策导航">
        <div className="battuta-subnav-inner">
          <Link
            className="brand-lockup"
            href="/projects/battuta"
            aria-label="返回 Battuta 产品页"
          >
            <Image src="/battuta/battuta-icon.png" alt="" width={68} height={68} />
            <span>Battuta</span>
          </Link>
          <div className="nav-links">
            <Link href="/projects/battuta">产品页</Link>
            <a href="#chinese">中文</a>
            <a href="#english">English</a>
            <a className="nav-download" href={`mailto:${teamProfile.contactEmail}`}>
              联系我们
            </a>
          </div>
        </div>
      </nav>

      <header className="privacy-policy-hero">
        <div className="section-inner privacy-policy-hero-grid">
          <div>
            <p className="section-kicker lime">Privacy by boundary</p>
            <h1>
              隐私不是一句承诺，
              <span>而是一条清楚的边界。</span>
            </h1>
            <p className="privacy-policy-lede">
              Battuta 需要知道某个物理按键或鼠标按钮发生了动作，才能及时播放声音；
              它不会把这些事件转换成你输入的文字，也不会把本地输入统计或 DIY 音频上传给 Wormforce。
            </p>
            <div className="privacy-policy-meta">
              <span>生效日期</span>
              <time dateTime={effectiveDate}>2026 年 8 月 25 日</time>
              <span>版本</span>
              <strong>1.0</strong>
            </div>
          </div>

          <div className="privacy-policy-summary" aria-label="隐私要点">
            <Image src="/battuta/battuta-icon.png" alt="" width={180} height={180} />
            <div>
              <span>01</span>
              <p>输入事件与统计在设备本地处理。</p>
            </div>
            <div>
              <span>02</span>
              <p>不读取文字、密码、窗口标题或剪贴板。</p>
            </div>
            <div>
              <span>03</span>
              <p>不出售输入数据，不使用广告追踪 SDK。</p>
            </div>
          </div>
        </div>
      </header>

      <nav className="privacy-policy-language-nav" aria-label="选择隐私政策语言">
        <div className="section-inner">
          <a href="#chinese">中文政策</a>
          <a href="#english" lang="en">English policy</a>
          <span>同一页面 · Same page</span>
        </div>
      </nav>

      <article className="privacy-policy-document" id="chinese" aria-labelledby="chinese-title">
        <div className="section-inner privacy-policy-reading-width">
          <header className="privacy-policy-document-header">
            <p className="section-kicker green">中文</p>
            <h2 id="chinese-title">Battuta 隐私政策</h2>
            <p>
              本政策说明 Wormforce 提供的 Battuta 应用如何处理信息，适用于通过 Microsoft Store
              分发的 Windows 版本及 Wormforce 直接提供的其他平台版本。不同平台或版本可能不包含本文列出的全部可选功能；
              相应条款仅在功能可用并被使用时适用。
            </p>
          </header>

          <PolicySection number="01" title="Battuta 处理哪些信息">
            <p>Battuta 只处理实现键鼠音效、可选本地统计和 DIY 音色所必需的信息：</p>
            <div className="privacy-policy-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>类别</th>
                    <th>具体信息</th>
                    <th>用途与保存</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>物理输入事件</td>
                    <td>物理按键标识、按下/抬起、自动重复、修饰键状态，以及鼠标按钮和按下/抬起状态。</td>
                    <td>用于即时选择并播放声音。声音功能本身不需要保存连续事件流水。</td>
                  </tr>
                  <tr>
                    <td>本地输入统计</td>
                    <td>物理按键累计、近似字符键计数、时间桶、输入速度、活跃日期和逐键分布。</td>
                    <td>仅在用户开启统计后，保存在当前设备的应用数据中。</td>
                  </tr>
                  <tr>
                    <td>前台应用身份</td>
                    <td>应用显示名、进程名，以及可用时的包或应用标识。</td>
                    <td>仅用于把本地聚合输入量归属到正在使用的应用。</td>
                  </tr>
                  <tr>
                    <td>设置与 DIY 音色</td>
                    <td>音色、音量、功能开关、更新偏好，以及用户主动选择的音频和音色包元数据。</td>
                    <td>保存在设备本地，以恢复设置和用户创建的音色。</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              “字符数”是允许列表内物理字符键事件的计数，不是对实际文字的读取或分析。
              Battuta 不保存能够按照发生顺序还原输入内容的按键记录。
            </p>
          </PolicySection>

          <PolicySection number="02" title="Battuta 明确不读取或使用什么">
            <ul>
              <li>不把物理按键事件转换为输入文字，不读取或保存密码文本。</li>
              <li>不读取剪贴板、窗口标题、文档名、标签页标题、文件内容或完整可执行文件路径。</li>
              <li>不使用或保留鼠标坐标、光标移动轨迹、拖动路径或滚轮内容。</li>
              <li>不访问联系人、精确位置、摄像头或麦克风。</li>
              <li>除非用户主动选择导入音频，否则不扫描或分析个人文件。</li>
            </ul>
            <p>
              由于 Battuta 的核心功能需要系统范围的输入事件，在应用运行并启用相关功能期间，
              用户在普通应用（包括密码输入框）中的物理按键动作也可能产生事件。
              Battuta 不识别输入框内容，不读取或保存密码，也不重建用户输入的字符。完全退出 Battuta 后，系统范围监听会停止。
            </p>
          </PolicySection>

          <PolicySection number="03" title="为什么需要系统范围的键盘与鼠标监听">
            <p>
              Battuta 需要在浏览器、编辑器、聊天软件和其他桌面应用处于前台时仍能响应物理操作，
              因此会使用 Windows 或 macOS 提供的系统输入接口。监听的目的仅限于播放键鼠声音、生成用户主动开启的本地统计，
              以及响应用户在 DIY 编辑器中的按键映射操作。
            </p>
            <p>
              关闭“输入统计”只会停止新增统计，不会自动删除既有记录；声音功能仍需要输入事件。
              用户可从 Battuta 菜单中完全退出应用，以停止监听。
            </p>
          </PolicySection>

          <PolicySection number="04" title="本地存储、保留与删除">
            <ul>
              <li>输入统计默认关闭，只有用户主动开启后才会记录。</li>
              <li>统计数据库位于当前用户的应用专用数据目录，并由操作系统的用户权限和应用包隔离机制保护。</li>
              <li>为展示近期趋势，部分细粒度时间桶最多保留约 31 天；每日、每小时、应用和逐键汇总会保留至用户清除统计。</li>
              <li>设置与 DIY 音色保留至用户更改、删除、重置应用数据或卸载相应应用版本。</li>
              <li>用户手动导出到文档、桌面或其他位置的音色包由用户自行管理，不会因卸载 Battuta 而自动删除。</li>
            </ul>
            <p>
              用户可以关闭统计、使用“清除全部统计”删除统计记录，并在 DIY 编辑器中删除自定义音色。
              若准备卸载且希望确保移除应用内数据，建议先在 Battuta 中执行清除操作，再使用 Windows 或 macOS 的卸载/删除功能。
              因为这些数据不存放在 Wormforce 服务器上，Wormforce 无法远程查看、导出或替用户删除本地数据。
            </p>
          </PolicySection>

          <PolicySection number="05" title="网络请求、Microsoft Store 与第三方服务">
            <p>
              Battuta 自身不会把本地按键事件、输入统计、设置或 DIY 音频上传给 Wormforce，也不会出售这些信息，
              不包含广告 SDK 或跨应用追踪 SDK。以下服务可能因分发、更新或网页访问处理必要的技术信息：
            </p>
            <ul>
              <li>
                <strong>Microsoft Store 与 Windows：</strong>Microsoft 可能根据其自身政策处理应用获取、许可、安装、更新、崩溃和 Store 使用信息，
                并向发布者提供获取量、活跃设备或会话以及应用健康等报告。这些报告不包含 Battuta 的本地输入统计或 DIY 音频。
                参见 <a href="https://privacy.microsoft.com/privacystatement" target="_blank" rel="noreferrer">Microsoft 隐私声明 ↗</a>。
              </li>
              <li>
                <strong>GitHub：</strong>非 Store 版本可能通过 HTTPS 访问 GitHub Releases 检查更新。
                GitHub 会自然收到 IP 地址、请求时间和 User-Agent 等标准网络元数据，但请求不包含本地按键或统计数据。
                参见 <a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement" target="_blank" rel="noreferrer">GitHub 隐私声明 ↗</a>。
              </li>
              <li>
                <strong>用户主动分享：</strong>用户自行导出并发送的音色包只会发送到用户选择的目的地；Wormforce 不参与该传输。
              </li>
            </ul>
          </PolicySection>

          <PolicySection number="06" title="访问 Wormforce 网站">
            <p>
              Wormforce 网站托管在 Vercel，并使用 Vercel Web Analytics 了解聚合页面访问情况。
              访问本页面时，Vercel 可能处理页面路径、来源页面、时间、国家或地区、操作系统、浏览器和设备类型等技术信息。
              根据 Vercel 的说明，Web Analytics 不使用第三方 Cookie，页面访问以匿名聚合方式记录，
              不会与 Battuta 应用中的输入统计合并。
            </p>
            <p>
              参见 <a href="https://vercel.com/docs/analytics/privacy-policy" target="_blank" rel="noreferrer">Vercel Web Analytics 隐私与合规说明 ↗</a>
              及 <a href="https://vercel.com/legal/privacy-notice" target="_blank" rel="noreferrer">Vercel 隐私声明 ↗</a>。
            </p>
          </PolicySection>

          <PolicySection number="07" title="安全、儿童与政策更新">
            <p>
              Battuta 尽量减少处理的数据，并依赖操作系统的用户权限、应用数据隔离和 HTTPS 保护必要的网络请求。
              任何本地软件和存储方式都无法保证绝对安全，用户也应使用系统密码、磁盘保护和及时更新来保护设备。
            </p>
            <p>
              Battuta 不以儿童为目标，也不会故意收集儿童的输入内容。若功能、数据处理方式或服务提供商发生实质变化，
              Wormforce 会更新本政策、生效日期，并在适当位置提示用户。
            </p>
          </PolicySection>

          <PolicySection number="08" title="联系 Wormforce">
            <p>
              如对本政策、Battuta 的数据处理方式或本地数据删除有疑问，请发送邮件至
              {" "}<a href={`mailto:${teamProfile.contactEmail}`}>{teamProfile.contactEmail}</a>。
            </p>
            <p className="privacy-policy-updated">
              生效及最后更新：<time dateTime={effectiveDate}>2026 年 8 月 25 日</time>
            </p>
          </PolicySection>
        </div>
      </article>

      <article
        className="privacy-policy-document privacy-policy-document-english"
        id="english"
        aria-labelledby="english-title"
        lang="en"
      >
        <div className="section-inner privacy-policy-reading-width">
          <header className="privacy-policy-document-header">
            <p className="section-kicker green">English</p>
            <h2 id="english-title">Battuta Privacy Policy</h2>
            <p>
              This policy explains how the Battuta application provided by Wormforce processes
              information. It applies to the Windows edition distributed through Microsoft Store
              and to editions for other platforms distributed directly by Wormforce. Some optional
              features described below may not be present in every platform or version; the related
              terms apply only when those features are available and used.
            </p>
          </header>

          <PolicySection number="01" title="Information Battuta processes">
            <p>
              Battuta processes only the information needed to provide keyboard and pointer sounds,
              optional local statistics, and custom sound packs:
            </p>
            <div className="privacy-policy-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Information</th>
                    <th>Purpose and storage</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Physical input events</td>
                    <td>Physical key identifier, press/release, repeat and modifier state, and mouse button press/release state.</td>
                    <td>Used to select and play a sound immediately. Sound playback does not require a persistent event stream.</td>
                  </tr>
                  <tr>
                    <td>Local typing statistics</td>
                    <td>Physical-key totals, approximate character-key counts, time buckets, speed, active dates, and per-key distribution.</td>
                    <td>Stored in application data on the current device only after the user enables statistics.</td>
                  </tr>
                  <tr>
                    <td>Foreground application identity</td>
                    <td>Application display name, process name, and an available package or application identifier.</td>
                    <td>Used only to attribute local aggregate activity to the application in use.</td>
                  </tr>
                  <tr>
                    <td>Settings and custom sounds</td>
                    <td>Sound profile, volume, feature toggles, update preference, user-selected audio, and sound-pack metadata.</td>
                    <td>Stored locally to restore settings and user-created sounds.</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              A “character count” is a count of events from an allow-list of physical character
              keys. It is not a reading or analysis of the actual text. Battuta does not retain an
              ordered keystroke log that could be used to reconstruct what a user typed.
            </p>
          </PolicySection>

          <PolicySection number="02" title="Information Battuta explicitly does not use">
            <ul>
              <li>It does not convert physical key events into typed text or read or store password text.</li>
              <li>It does not read the clipboard, window titles, document names, tab titles, file contents, or full executable paths.</li>
              <li>It does not use or retain mouse coordinates, pointer movement, drag paths, or scrolling content.</li>
              <li>It does not access contacts, precise location, the camera, or the microphone.</li>
              <li>It does not scan or analyze personal files unless the user explicitly selects an audio file to import.</li>
            </ul>
            <p>
              Because Battuta needs system-wide input events for its core function, a physical key
              action in an ordinary application, including a password field, may still generate an
              event while Battuta is running and the relevant feature is enabled. Battuta does not
              identify the input field, read or store the password, or reconstruct the characters.
              System-wide monitoring stops when the user fully exits Battuta.
            </p>
          </PolicySection>

          <PolicySection number="03" title="Why system-wide keyboard and mouse access is needed">
            <p>
              Battuta must respond while a browser, editor, messaging client, or another desktop app
              is in the foreground. It therefore uses system input interfaces supplied by Windows or
              macOS. This access is limited to sound playback, optional local statistics enabled by
              the user, and key-mapping interactions in the custom sound editor.
            </p>
            <p>
              Turning off typing statistics stops new statistics from being added but does not erase
              existing records, and sound playback still requires input events. Users can fully quit
              Battuta from its menu to stop monitoring.
            </p>
          </PolicySection>

          <PolicySection number="04" title="Local storage, retention, and deletion">
            <ul>
              <li>Typing statistics are off by default and are recorded only after the user enables them.</li>
              <li>The statistics database is stored in the current user&apos;s app-specific data area and is protected by operating-system user permissions and package isolation.</li>
              <li>Some fine-grained time buckets used for recent trends are retained for up to approximately 31 days. Daily, hourly, application, and per-key summaries remain until the user clears statistics.</li>
              <li>Settings and custom sounds remain until the user changes or deletes them, resets application data, or removes the applicable app installation.</li>
              <li>Sound packs manually exported to Documents, Desktop, or another location are controlled by the user and are not automatically deleted when Battuta is uninstalled.</li>
            </ul>
            <p>
              Users can disable statistics, use “Clear All Statistics” to remove statistical records,
              and delete custom sounds in the editor. Before uninstalling, users who want to ensure
              removal of in-app data should clear it in Battuta and then use the Windows or macOS
              removal controls. Because this information is not stored on Wormforce servers,
              Wormforce cannot remotely view, export, or delete a user&apos;s local data.
            </p>
          </PolicySection>

          <PolicySection number="05" title="Network requests, Microsoft Store, and third parties">
            <p>
              Battuta itself does not upload local key events, typing statistics, settings, or custom
              audio to Wormforce. Wormforce does not sell this information, and Battuta contains no
              advertising SDK or cross-application tracking SDK. The following services may process
              necessary technical information for distribution, updates, or website access:
            </p>
            <ul>
              <li>
                <strong>Microsoft Store and Windows:</strong> Microsoft may process acquisition,
                licensing, installation, update, crash, health, and Store usage information under its
                own policies and may provide the publisher with acquisition, active-device or session,
                and application-health reports. Those reports do not contain Battuta&apos;s local input
                statistics or custom audio. See the {" "}
                <a href="https://privacy.microsoft.com/privacystatement" target="_blank" rel="noreferrer">Microsoft Privacy Statement ↗</a>.
              </li>
              <li>
                <strong>GitHub:</strong> Non-Store editions may use HTTPS to contact GitHub Releases
                for update checks. GitHub naturally receives standard network metadata such as an IP
                address, request time, and User-Agent, but the request does not contain local key or
                statistics data. See the {" "}
                <a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement" target="_blank" rel="noreferrer">GitHub Privacy Statement ↗</a>.
              </li>
              <li>
                <strong>User-directed sharing:</strong> A sound pack exported and sent by a user goes
                only to the destination selected by that user. Wormforce is not involved in that transfer.
              </li>
            </ul>
          </PolicySection>

          <PolicySection number="06" title="Visiting the Wormforce website">
            <p>
              The Wormforce website is hosted by Vercel and uses Vercel Web Analytics for aggregate
              page-traffic information. When this page is visited, Vercel may process technical data
              such as the page path, referrer, time, country or region, operating system, browser, and
              device type. According to Vercel, Web Analytics does not use third-party cookies and
              records page views in an anonymous, aggregated form. Website analytics are not combined
              with Battuta&apos;s local input statistics.
            </p>
            <p>
              See {" "}<a href="https://vercel.com/docs/analytics/privacy-policy" target="_blank" rel="noreferrer">Vercel Web Analytics Privacy and Compliance ↗</a>
              {" "}and {" "}<a href="https://vercel.com/legal/privacy-notice" target="_blank" rel="noreferrer">Vercel&apos;s Privacy Notice ↗</a>.
            </p>
          </PolicySection>

          <PolicySection number="07" title="Security, children, and policy updates">
            <p>
              Battuta minimizes the information it processes and relies on operating-system user
              permissions, application-data isolation, and HTTPS for necessary network requests.
              No local software or storage method can guarantee absolute security; users should also
              protect their devices with system passwords, device security, and timely updates.
            </p>
            <p>
              Battuta is not directed to children and does not knowingly collect the content of a
              child&apos;s input. If features, data practices, or service providers materially change,
              Wormforce will update this policy and its effective date and provide notice where appropriate.
            </p>
          </PolicySection>

          <PolicySection number="08" title="Contact Wormforce">
            <p>
              For questions about this policy, Battuta&apos;s data practices, or deleting local data,
              email <a href={`mailto:${teamProfile.contactEmail}`}>{teamProfile.contactEmail}</a>.
            </p>
            <p className="privacy-policy-updated">
              Effective and last updated: <time dateTime={effectiveDate}>August 25, 2026</time>
            </p>
          </PolicySection>
        </div>
      </article>

      <section className="privacy-policy-contact" aria-label="隐私政策联系方式">
        <div className="section-inner">
          <div>
            <p className="section-kicker">还有问题？</p>
            <h2>我们愿意把边界讲清楚。</h2>
          </div>
          <a className="button button-dark" href={`mailto:${teamProfile.contactEmail}`}>
            {teamProfile.contactEmail}
          </a>
        </div>
      </section>

      <section className="battuta-product-footer" aria-label="Battuta 页脚">
        <div className="footer-inner">
          <Link className="brand-lockup" href="/projects/battuta">
            <Image src="/battuta/battuta-icon.png" alt="" width={68} height={68} />
            <span>Battuta</span>
          </Link>
          <p>给每一次输入，配上你喜欢的声音。</p>
          <div>
            <Link href="/projects/battuta">产品页</Link>
            <a href="#chinese">中文</a>
            <a href="#english" lang="en">English</a>
          </div>
        </div>
      </section>
    </div>
  );
}
