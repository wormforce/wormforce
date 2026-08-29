"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { sustechCliRelease } from "@/content/sustech-cli";

const repositoryHref = sustechCliRelease.repositoryUrl;
const npmHref = sustechCliRelease.npmUrl;
const installCommand = sustechCliRelease.installCommand;

type IconName = "book" | "blackboard" | "campus" | "research" | "transit";

const capabilities: { icon: IconName; title: string; description: string }[] = [
  {
    icon: "book",
    title: "教务与学业",
    description: "课表、成绩、考试、培养方案与选课计划。",
  },
  {
    icon: "blackboard",
    title: "Blackboard",
    description: "课程、截止日期、附件、作业与日历。",
  },
  {
    icon: "campus",
    title: "校园服务",
    description: "场馆、图书馆、预约与计算平台。",
  },
  {
    icon: "research",
    title: "科研与课程",
    description: "教师、论文、开放获取与课程资源。",
  },
  {
    icon: "transit",
    title: "设备与出行",
    description: "校园交通、线路信息与本机网络状态。",
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
  return (
    <div className="sustech-cli-product" lang="zh-CN">
      <nav className="sc-nav" aria-label="sustech cli 产品导航">
        <div className="sc-container sc-nav-inner">
          <a className="sc-brand" href="#sc-top" aria-label="sustech cli 首页">
            <Image src="/sustech-cli/sustech-cli-wordmark.png" alt="sustech cli" width={270} height={54} priority />
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
          <h2>校园服务，统一成一种语言<span>。</span></h2>
          <div className="sc-capability-rail">
            {capabilities.map((item, index) => (
              <article key={item.title}>
                <div className={`sc-icon sc-icon-${index}`}><ProductIcon name={item.icon} /></div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
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
