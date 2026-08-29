import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import type { BattutaGuide } from "@/content/battuta-guides";
import { battutaRelease } from "@/content/battuta";

type BattutaGuidePageProps = {
  guide: BattutaGuide;
};

function ActionLink({
  href,
  children,
  primary = false,
}: {
  href: string;
  children: ReactNode;
  primary?: boolean;
}) {
  const className = primary
    ? "inline-flex min-h-11 items-center justify-center rounded-full bg-[#c9ff3f] px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-[#dcff83]"
    : "inline-flex min-h-11 items-center justify-center rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-white transition hover:border-white/50 hover:bg-white/5";

  if (href.startsWith("http")) {
    return (
      <a href={href} className={className} target="_blank" rel="noreferrer">
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

export function BattutaGuidePage({ guide }: BattutaGuidePageProps) {
  return (
    <article className="section-shell pt-20 md:pt-24" lang="en">
      <div className="content-shell">
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-2 text-xs text-[var(--color-muted)]"
        >
          <Link href="/" className="transition hover:text-white">
            Wormforce
          </Link>
          <span aria-hidden="true">/</span>
          <Link href="/projects/battuta" className="transition hover:text-white">
            Battuta
          </Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{guide.platform} setup</span>
        </nav>

        <header className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
          <div className="reveal">
            <p className="mono-label text-[#c9ff3f]">{guide.eyebrow}</p>
            <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-[-0.035em] text-white md:text-6xl md:leading-[1.05]">
              {guide.title}
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-[var(--color-muted)] md:text-lg">
              {guide.introduction}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <ActionLink href={guide.primaryAction.href} primary>
                {guide.primaryAction.label}
              </ActionLink>
              <ActionLink href={guide.secondaryAction.href}>
                {guide.secondaryAction.label}
              </ActionLink>
            </div>
            <p className="mt-4 text-xs text-[var(--color-muted)]">
              Free and open source · MIT License · Updated {guide.updatedAt}
            </p>
          </div>

          <aside className="card-surface reveal rounded-3xl p-5 md:p-6">
            <div className="flex items-center gap-4">
              <Image
                src="/battuta/battuta-icon.png"
                alt="Battuta app icon"
                width={72}
                height={72}
                className="rounded-2xl"
              />
              <div>
                <p className="text-lg font-semibold text-white">At a glance</p>
                <p className="mt-1 text-xs text-[var(--color-muted)]">
                  Current release {battutaRelease.version}
                </p>
              </div>
            </div>
            <dl className="mt-5 divide-y divide-white/10 border-y border-white/10">
              {guide.requirements.map((requirement, index) => (
                <div
                  key={requirement}
                  className="grid grid-cols-[80px_1fr] gap-3 py-3 text-sm"
                >
                  <dt className="text-[var(--color-muted)]">
                    {index === 0
                      ? "System"
                      : index === 1
                        ? "Device"
                        : index === 2
                          ? "Version"
                          : "Setup"}
                  </dt>
                  <dd className="text-white">{requirement}</dd>
                </div>
              ))}
            </dl>
            <a
              href={battutaRelease.repositoryUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex text-sm font-medium text-white underline decoration-white/35 underline-offset-4 transition hover:decoration-white"
            >
              Inspect the source on GitHub ↗
            </a>
          </aside>
        </header>

        <section className="mt-16 border-t border-white/10 pt-12 md:mt-24 md:pt-16">
          <div className="max-w-3xl">
            <p className="mono-label">Step-by-step setup</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-4xl">
              Install Battuta on {guide.platform}
            </h2>
          </div>
          <ol className="mt-8 grid gap-4 lg:grid-cols-2">
            {guide.steps.map((step, index) => (
              <li
                key={step.title}
                className="card-surface rounded-2xl p-5 md:p-6"
              >
                <span className="font-mono text-xs text-[#c9ff3f]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 text-xl font-semibold text-white">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <div className="mx-auto mt-16 max-w-4xl space-y-16 md:mt-24">
          {guide.sections.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-24">
              <h2 className="text-3xl font-semibold tracking-tight text-white">
                {section.title}
              </h2>
              <div className="mt-5 space-y-4 text-base leading-8 text-[var(--color-muted)]">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              {section.bullets ? (
                <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                  {section.bullets.map((bullet) => (
                    <li
                      key={bullet}
                      className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm leading-6 text-[var(--color-text)]"
                    >
                      <span className="mr-2 text-[#c9ff3f]" aria-hidden="true">
                        •
                      </span>
                      {bullet}
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}

          <section>
            <p className="mono-label">Troubleshooting</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">
              Common {guide.platform} questions
            </h2>
            <div className="mt-6 divide-y divide-white/10 border-y border-white/10">
              {guide.troubleshooting.map((item) => (
                <details key={item.question} className="group py-5">
                  <summary className="cursor-pointer list-none pr-8 text-lg font-semibold text-white marker:hidden">
                    {item.question}
                    <span
                      className="float-right text-[#c9ff3f] transition group-open:rotate-45"
                      aria-hidden="true"
                    >
                      +
                    </span>
                  </summary>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--color-muted)]">
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          </section>
        </div>

        <aside className="mt-16 overflow-hidden rounded-3xl border border-[#c9ff3f]/40 bg-[linear-gradient(135deg,rgba(201,255,63,0.14),rgba(255,255,255,0.03))] p-6 md:mt-24 md:p-10">
          <div className="grid gap-7 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <p className="mono-label text-[#c9ff3f]">Ready to try it?</p>
              <h2 className="mt-3 max-w-2xl text-2xl font-semibold text-white md:text-3xl">
                Add responsive keyboard sounds to {guide.platform}.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--color-muted)]">
                Battuta is free, open source, and keeps input processing on your
                computer.
              </p>
            </div>
            <ActionLink href={guide.primaryAction.href} primary>
              {guide.primaryAction.label}
            </ActionLink>
          </div>
        </aside>

        <nav className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-7 text-sm">
          <Link
            href="/projects/battuta"
            className="text-[var(--color-muted)] transition hover:text-white"
          >
            ← Back to Battuta
          </Link>
          <Link
            href={guide.relatedGuide.href}
            className="font-medium text-white transition hover:text-[#c9ff3f]"
          >
            {guide.relatedGuide.label} →
          </Link>
        </nav>
      </div>
    </article>
  );
}
