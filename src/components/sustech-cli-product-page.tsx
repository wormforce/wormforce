"use client";

import { useState, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { sustechCliRelease } from "@/content/sustech-cli";

const repositoryHref = sustechCliRelease.repositoryUrl;
const npmHref = sustechCliRelease.npmUrl;
const installCommand = sustechCliRelease.installCommand;

type IconName = "book" | "blackboard" | "campus" | "research" | "transit";

type CapabilityGroup = {
  id: string;
  icon: IconName;
  title: string;
  description: string;
  access: string;
  detail: string;
  highlights: string[];
  commands: {
    command: string;
    summary: string;
  }[];
};

const capabilityGroups: CapabilityGroup[] = [
  {
    id: "academic",
    icon: "book",
    title: "教务与学业",
    description: "课表、成绩、考试、培养方案与选课计划。",
    access: "公开数据 / 登录后读取",
    detail:
      "先查日历、课表和培养进度。需要改变选课状态时，命令会先显示预览。",
    highlights: ["学期日历与教学周", "个人课表、成绩和考试", "培养方案进度与选课规划"],
    commands: [
      {
        command: "calendar day",
        summary: "看某一天属于哪一教学周，是否是假期、调课日或考试日。",
      },
      {
        command: "tis schedule",
        summary: "按周或按学期读取个人课表。",
      },
      {
        command: "tis grades",
        summary: "查看成绩并计算 GPA。",
      },
      {
        command: "tis timetable",
        summary: "求解不冲突的课程组合，排课前先试一遍。",
      },
      {
        command: "tis degree progress",
        summary: "读取 TIS 里的培养方案进度、模块要求和学分缺口。",
      },
      {
        command: "tis selection preview",
        summary: "加退选、购物车和志愿变更先预览，再由用户确认提交。",
      },
    ],
  },
  {
    id: "blackboard",
    icon: "blackboard",
    title: "Blackboard",
    description: "课程、截止日期、附件、作业与日历。",
    access: "需要 Blackboard 登录",
    detail:
      "课程、附件和截止日期可以一起查。提交作业前会先做 preview，正式执行才用 apply。",
    highlights: ["课程与内容目录", "附件下载与同步", "截止日期与提交检查"],
    commands: [
      {
        command: "bb courses",
        summary: "列出当前账号可访问的 Blackboard 课程。",
      },
      {
        command: "bb content",
        summary: "查看课程或文件夹下的内容项。",
      },
      {
        command: "bb deadlines",
        summary: "聚合即将到期的作业和截止时间。",
      },
      {
        command: "bb search",
        summary: "跨课程搜索内容项和附件名，找资料很快。",
      },
      {
        command: "bb sync",
        summary: "把教师附件同步到本地目录，方便持续跟踪。",
      },
      {
        command: "bb submit preview",
        summary: "提交作业前先做只读校验，并把文件哈希绑定到正式提交。",
      },
    ],
  },
  {
    id: "campus",
    icon: "campus",
    title: "校园服务",
    description: "场馆、图书馆、预约与计算平台。",
    access: "变更前先预览、确认",
    detail:
      "查馆藏和预约记录不会改变状态。创建预约或上传文件前会先做 preview，提交时再要求确认。",
    highlights: ["eHall 场馆预约", "IC 图书馆预约", "SUSTech Global 与 PMS"],
    commands: [
      {
        command: "booking rooms",
        summary: "查 eHall 场馆和会议室，不直接占用资源。",
      },
      {
        command: "booking create preview",
        summary: "先做库存和冲突检查，再提交精确预约。",
      },
      {
        command: "lib-booking home-summary",
        summary: "看图书馆当前可预约房间和分类余量。",
      },
      {
        command: "library search",
        summary: "通过 Primo 查公开馆藏，拿到规范化结果。",
      },
      {
        command: "ws programs",
        summary: "查看 SUSTech Global 项目列表和详情。",
      },
      {
        command: "pms jobs",
        summary: "查看打印队列；上传文件前会先用 preview 校验目标。",
      },
    ],
  },
  {
    id: "research",
    icon: "research",
    title: "科研与课程",
    description: "教师、论文、开放获取与课程资源。",
    access: "公开数据为主",
    detail:
      "可以查教师、论文元数据、课程评价和公开校园内容。社区资料会保留来源说明。",
    highlights: ["教师与院系检索", "论文元数据与 OA 下载", "NCES 与公开校园资料"],
    commands: [
      {
        command: "faculty search",
        summary: "按姓名、研究方向或院系搜索教师资料。",
      },
      {
        command: "faculty render",
        summary: "把教师信息整理成更适合 Agent 继续消费的 Markdown。",
      },
      {
        command: "papers search",
        summary: "查 CrossRef 论文元数据，并可继续解析开放获取来源。",
      },
      {
        command: "papers fetch-oa",
        summary: "把一篇开放获取 PDF 下载到明确指定的本地位置。",
      },
      {
        command: "nces search",
        summary: "查 NCES 课程评价和评论样本。",
      },
      {
        command: "online talks search",
        summary: "搜索社区维护的讲座与公开校园内容。",
      },
    ],
  },
  {
    id: "transit",
    icon: "transit",
    title: "设备与出行",
    description: "校园交通、线路信息与本机网络状态。",
    access: "公开数据 / 本机状态",
    detail:
      "大部分不需要登录。查线路、看校车位置或检查当前 Mac 的 Wi‑Fi，不必在几个工具之间来回切换。",
    highlights: ["校园巴士与实时位置", "本机 Wi-Fi 状态", "服务连通性与登录检查"],
    commands: [
      {
        command: "transit lines",
        summary: "看工作日或节假日可用的校车线路。",
      },
      {
        command: "transit schedule",
        summary: "查看某条线路的发车时刻。",
      },
      {
        command: "transit live",
        summary: "读取校车实时位置，适合临出门时查一下。",
      },
      {
        command: "wifi status",
        summary: "检查本机当前的校园 Wi-Fi 连接状态。",
      },
      {
        command: "doctor",
        summary: "做运行环境与可选服务登录状态的只读检查。",
      },
      {
        command: "services status",
        summary: "看哪些服务已经实现、哪些仍需适配器或暂不可用。",
      },
    ],
  },
];

const outputModes = {
  Text: [
    `sustech-cli ${sustechCliRelease.version} (node v22.19.0)`,
    "",
    "输出模式",
    "  text   为人阅读的清晰文本",
    "  json   一个带版本的 JSON 响应",
    "  jsonl  列表命令每行一条记录",
  ],
  JSON: [
    "{",
    '  "schemaVersion": "1",',
    '  "ok": true,',
    '  "command": "version",',
    '  "data": {',
    `    "version": "${sustechCliRelease.version}",`,
    '    "runtime": "node v22.19.0"',
    "  }",
    "}",
  ],
  JSONL: [
    '{"schemaVersion":"1","ok":true,"command":"faculty search",',
    ' "data":{"name":"示例教师","department":"计算机科学与工程系"}}',
    '{"schemaVersion":"1","ok":true,"command":"faculty search",',
    ' "data":{"name":"示例教师","department":"电子与电气工程系"}}',
  ],
};

function ProductIcon({ name }: { name: IconName }) {
  const common = {
    width: 34,
    height: 34,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (name === "book") {
    return <svg {...common}><path d="M3.5 5.2c2.8-.8 5.6-.2 8.5 1.7v12c-2.9-1.9-5.7-2.5-8.5-1.7z" /><path d="M20.5 5.2c-2.8-.8-5.6-.2-8.5 1.7v12c2.9-1.9 5.7-2.5 8.5-1.7z" /></svg>;
  }
  if (name === "blackboard") {
    return <svg {...common}><rect x="3.5" y="3.5" width="17" height="15" rx="1.8" /><path d="M7 8h4.5M7 12h7M8 21h8M12 18.5V21" /></svg>;
  }
  if (name === "campus") {
    return <svg {...common}><path d="m3 9 9-5 9 5M5 9v8M9 9v8M15 9v8M19 9v8M3 17h18M2 20h20" /></svg>;
  }
  if (name === "research") {
    return <svg {...common}><path d="M9 3h6M10 3v5l-5.5 9.2A2.5 2.5 0 0 0 6.7 21h10.6a2.5 2.5 0 0 0 2.2-3.8L14 8V3" /><path d="M7.2 15h9.6M9 12h6" /></svg>;
  }
  return <svg {...common}><rect x="5" y="3" width="14" height="16" rx="3" /><path d="M8 6h8M8 14h8M8 19l-2 2M16 19l2 2" /><circle cx="8.5" cy="16.5" r=".7" fill="currentColor" stroke="none" /><circle cx="15.5" cy="16.5" r=".7" fill="currentColor" stroke="none" /></svg>;
}

function CapabilityChevron() {
  return <svg className="sc-capability-chevron" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m3 5.5 5 5 5-5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function CopyButton({ command = installCommand, compact = false }: { command?: string; compact?: boolean }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button className={compact ? "sc-copy sc-copy-compact" : "sc-copy"} type="button" onClick={copy} aria-label={`复制命令：${command}`}>
      <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="11" height="11" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></svg>
      {copied ? "已复制" : compact ? "复制" : "复制命令"}
    </button>
  );
}

function TerminalWindow() {
  return (
    <div className="sc-terminal" aria-label="sustech cli 终端演示">
      <div className="sc-terminal-bar">
        <div className="sc-window-controls" aria-hidden="true"><i /><i /><i /></div>
        <span>sustech — zsh</span>
        <span className="sc-terminal-shortcut">⌘1</span>
      </div>
      <div className="sc-terminal-body">
        <p><span className="sc-prompt">$</span> <span className="sc-command">npm install --global sustech-cli</span></p>
        <p className="sc-result">added sustech-cli@{sustechCliRelease.version}</p>
        <p><span className="sc-prompt">$</span> sustech version</p>
        <p className="sc-result">sustech-cli {sustechCliRelease.version} (node v22.19.0)</p>
        <p><span className="sc-prompt">$</span> sustech calendar day 2026-09-01</p>
        <div className="sc-output-block">
          <span>2026-09-01 · 星期二</span>
          <span>2026 秋季学期 · 第 1 教学周</span>
        </div>
        <p><span className="sc-prompt">$</span> sustech transit lines</p>
        <div className="sc-output-grid">
          <span>线路</span><span>方向</span><span>状态</span>
          <strong>校园巴士</strong><span>校内环线</span><em>可查询</em>
          <strong>地铁接驳</strong><span>塘朗站</span><em>可查询</em>
        </div>
        <p><span className="sc-prompt">$</span> <span className="sc-caret" /></p>
      </div>
    </div>
  );
}

function OutputDemo() {
  const [mode, setMode] = useState<keyof typeof outputModes>("Text");

  return (
    <div className="sc-output-demo">
      <div className="sc-output-toolbar">
        <code><span>$</span> sustech version --json --pretty</code>
        <div className="sc-tabs" aria-label="输出模式">
          {(Object.keys(outputModes) as (keyof typeof outputModes)[]).map((item) => (
            <button key={item} type="button" aria-pressed={mode === item} onClick={() => setMode(item)}>{item}</button>
          ))}
        </div>
      </div>
      <pre aria-live="polite">{outputModes[mode].join("\n")}</pre>
    </div>
  );
}

export function SustechCliProductPage() {
  const [expandedCapability, setExpandedCapability] = useState<string | null>(
    capabilityGroups[0]?.id ?? null,
  );
  const activeCapability = capabilityGroups.find((item) => item.id === expandedCapability);
  const activeCapabilityIndex = capabilityGroups.findIndex((item) => item.id === expandedCapability);

  return (
    <div className="sustech-cli-product" lang="zh-CN">
      <nav className="sc-nav" aria-label="sustech cli 产品导航">
        <div className="sc-container sc-nav-inner">
          <a className="sc-brand" href="#sc-top" aria-label="sustech cli 首页">
            <Image src="/sustech-cli/sustech-cli-frutiger.svg" alt="sustech cli" width={926} height={184} priority />
          </a>
          <div className="sc-nav-links">
            <a href="#capabilities">能力</a>
            <a href="#outputs">工作方式</a>
            <a href="#install">安装</a>
            <a href={repositoryHref} target="_blank" rel="noreferrer">GitHub <span aria-hidden="true">↗</span></a>
          </div>
        </div>
      </nav>

      <header className="sc-hero" id="sc-top">
        <div className="sc-container sc-hero-grid">
          <div className="sc-hero-copy">
            <h1>
              <span className="sc-title-line">一条命令，</span>
              <span className="sc-title-line">连接你的南科大<span className="sc-title-dot">。</span></span>
            </h1>
            <p>为人、脚本与智能体设计的南科大命令行工具。查询课表、课程、校车与更多校园服务，也提供稳定的结构化输出。</p>
            <div className="sc-hero-actions">
              <a className="sc-primary-action" href="#install"><span aria-hidden="true">&gt;_</span> 立即安装</a>
              <a className="sc-secondary-action" href={repositoryHref} target="_blank" rel="noreferrer">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 .8a11.4 11.4 0 0 0-3.6 22.2c.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.4-4-1.4-.5-1.4-1.3-1.8-1.3-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.4 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-6a4.7 4.7 0 0 1 1.2-3.2 4.4 4.4 0 0 1 .1-3.2s1-.3 3.3 1.2a11.3 11.3 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2a4.4 4.4 0 0 1 .1 3.2 4.7 4.7 0 0 1 1.2 3.2c0 4.7-2.8 5.7-5.5 6 .4.4.8 1.1.8 2.2v3.3c0 .4.2.7.8.6A11.4 11.4 0 0 0 12 .8Z" /></svg>
                GitHub <span aria-hidden="true">↗</span>
              </a>
            </div>
            <div className="sc-install-inline">
              <code><span>$</span> {installCommand}</code>
              <CopyButton compact />
            </div>
            <p className="sc-requirement">需要 Node.js 20.18+ · 独立社区项目，非南方科技大学官方服务</p>
          </div>
          <TerminalWindow />
        </div>
      </header>

      <section className="sc-capabilities" id="capabilities">
        <div className="sc-container">
          <h2>常用校园服务，都在终端里<span>。</span></h2>
          <p className="sc-capabilities-lede">点开卡片，就能看到常用命令，以及哪些操作需要登录或确认。</p>
          <div className="sc-capability-rail">
            {capabilityGroups.map((item, index) => {
              const isExpanded = expandedCapability === item.id;

              return (
                <article
                  key={item.id}
                  className={isExpanded ? "is-active" : undefined}
                  style={{ "--sc-capability-order": index * 2 } as CSSProperties}
                >
                  <button
                    className="sc-capability-trigger"
                    id={`capability-trigger-${item.id}`}
                    type="button"
                    aria-expanded={isExpanded}
                    aria-controls="capability-detail-panel"
                    onClick={() => setExpandedCapability((current) => current === item.id ? null : item.id)}
                  >
                    <span className="sc-capability-access">{item.access}</span>
                    <div className={`sc-icon sc-icon-${index}`}><ProductIcon name={item.icon} /></div>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                    <span className="sc-capability-disclosure">
                      {isExpanded ? "收起功能" : "查看功能"}
                      <CapabilityChevron />
                    </span>
                  </button>
                </article>
              );
            })}
            {activeCapability ? (
              <section
                className="sc-capability-detail"
                id="capability-detail-panel"
                aria-labelledby="capability-detail-heading"
                style={{ "--sc-capability-detail-order": activeCapabilityIndex * 2 + 1 } as CSSProperties}
              >
                <div className="sc-capability-detail-heading">
                  <div className={`sc-capability-detail-icon sc-icon sc-icon-${activeCapabilityIndex}`}>
                    <ProductIcon name={activeCapability.icon} />
                  </div>
                  <div className="sc-capability-detail-copy">
                    <p className="sc-capability-eyebrow">按场景展开</p>
                    <h3 id="capability-detail-heading">{activeCapability.title}</h3>
                    <p>{activeCapability.detail}</p>
                  </div>
                  <button
                    className="sc-capability-close"
                    type="button"
                    aria-label={`收起${activeCapability.title}功能`}
                    onClick={() => setExpandedCapability(null)}
                  >
                    收起
                    <CapabilityChevron />
                  </button>
                </div>
                <div className="sc-capability-highlight-list">
                  {activeCapability.highlights.map((highlight) => (
                    <span key={highlight}>{highlight}</span>
                  ))}
                </div>
                <ul className="sc-capability-command-grid">
                  {activeCapability.commands.map((command) => (
                    <li key={command.command}>
                      <code>sustech {command.command}</code>
                      <p>{command.summary}</p>
                    </li>
                  ))}
                </ul>
                <div className="sc-capability-detail-footer">
                  <p>这里只列出常用入口。安装后运行 <code>sustech capabilities</code>，可以查看当前版本的完整命令、登录方式和确认要求。</p>
                  <a href={`${repositoryHref}#what-it-covers`} target="_blank" rel="noreferrer">查看完整说明 <span aria-hidden="true">↗</span></a>
                </div>
              </section>
            ) : <div id="capability-detail-panel" hidden />}
          </div>
        </div>
      </section>

      <section className="sc-outputs" id="outputs">
        <div className="sc-container sc-output-grid-layout">
          <div className="sc-output-copy">
            <h2>对人清楚，<br />对机器稳定<span>。</span></h2>
            <p>sustech cli 默认输出适合直接阅读的文本，也提供带版本的 JSON 和逐行 JSONL，让脚本与智能体不必猜测终端文字。</p>
            <div className="sc-safety-note">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 4.5 6v5.5c0 4.8 3.2 8 7.5 9.5 4.3-1.5 7.5-4.7 7.5-9.5V6L12 3Z" /><path d="m8.8 12 2 2 4.5-4.5" /></svg>
              <span>会改变远程状态的命令必须先预览，并对精确目标显式确认。</span>
            </div>
          </div>
          <OutputDemo />
        </div>
      </section>

      <section className="sc-workflow">
        <div className="sc-container">
          <div className="sc-workflow-heading">
            <h2>从第一次查询，<br />到每天都在用。</h2>
            <p>公开数据无需登录；需要账户的服务使用本地命名配置，密码由操作系统凭据存储保管。</p>
          </div>
          <ol className="sc-steps">
            <li>
              <span>01</span>
              <div className="sc-step-content">
                <h3>安装并自检</h3>
                <div className="sc-step-commands"><code>npm install --global sustech-cli</code><code>sustech doctor</code></div>
              </div>
            </li>
            <li>
              <span>02</span>
              <div className="sc-step-content">
                <h3>从公开数据开始</h3>
                <div className="sc-step-commands"><code>sustech calendar day 2026-09-01</code><code>sustech transit lines</code></div>
              </div>
            </li>
            <li>
              <span>03</span>
              <div className="sc-step-content">
                <h3>需要时再登录</h3>
                <div className="sc-step-commands"><code>sustech auth login</code><code>sustech tis schedule</code></div>
              </div>
            </li>
          </ol>
        </div>
      </section>

      <section className="sc-install" id="install">
        <div className="sc-container sc-install-inner">
          <h2>现在，把校园放进终端<span>。</span></h2>
          <p>一条命令，开启你的南科大命令行体验。</p>
          <div className="sc-install-command">
            <code><span>$</span> {installCommand}</code>
            <CopyButton />
          </div>
          <p className="sc-node-note">需要 <a href="https://nodejs.org/" target="_blank" rel="noreferrer">Node.js 20.18</a> 或更新版本</p>
          <div className="sc-quick-start">
            <div>
              <h3>快速上手</h3>
              <p>试试这些无需登录的命令：</p>
            </div>
            <pre><span>$  sustech calendar day 2026-09-01</span>{"\n"}<span>$  sustech transit lines</span>{"\n"}<span>$  sustech faculty search <i>&quot;computer vision&quot;</i></span></pre>
            <a href={repositoryHref} target="_blank" rel="noreferrer">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 .8a11.4 11.4 0 0 0-3.6 22.2c.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.4-4-1.4-.5-1.4-1.3-1.8-1.3-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.4 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-6a4.7 4.7 0 0 1 1.2-3.2 4.4 4.4 0 0 1 .1-3.2s1-.3 3.3 1.2a11.3 11.3 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2a4.4 4.4 0 0 1 .1 3.2 4.7 4.7 0 0 1 1.2 3.2c0 4.7-2.8 5.7-5.5 6 .4.4.8 1.1.8 2.2v3.3c0 .4.2.7.8.6A11.4 11.4 0 0 0 12 .8Z" /></svg>
              在 GitHub 查看 <span aria-hidden="true">↗</span>
            </a>
          </div>
          <footer className="sc-product-footer">
            <div><strong>sustech cl<span>i</span></strong><p>独立社区项目，非南方科技大学官方服务。</p></div>
            <div><a href={npmHref} target="_blank" rel="noreferrer">npm</a><a href={repositoryHref} target="_blank" rel="noreferrer">GitHub</a><Link href="/">Wormforce</Link></div>
          </footer>
        </div>
      </section>
    </div>
  );
}
