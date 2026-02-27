import Link from "next/link";
import type { TeamProfile } from "@/content/site";

type HeroSectionProps = {
  team: TeamProfile;
  memberCount: number;
};

export function HeroSection({ team, memberCount }: HeroSectionProps) {
  return (
    <section id="home" className="section-shell pt-20 md:pt-24">
      <div className="content-shell grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:gap-10">
        <div className="reveal">
          <p className="mono-label">Independent Engineering Team</p>
          <h1 className="mt-4 text-balance text-4xl font-semibold leading-tight tracking-tight text-white md:text-5xl">
            {team.name}
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-[var(--color-text)] md:text-xl">
            {team.tagline}
          </p>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-[var(--color-muted)] md:text-base">
            {team.description}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/#members"
              className="inline-flex items-center rounded-full border border-[#3a3a3a] bg-[#1a1a1a] px-5 py-2.5 text-sm font-semibold text-white transition hover:border-[var(--color-brand)] hover:bg-[var(--color-brand)] hover:text-black"
            >
              Meet the Team
            </Link>
            <Link
              href="/projects"
              className="inline-flex items-center rounded-full border border-[var(--color-border)] px-5 py-2.5 text-sm font-semibold text-[var(--color-text)] transition hover:border-[var(--color-text)] hover:text-white"
            >
              View Projects
            </Link>
          </div>
        </div>

        <aside className="card-surface reveal rounded-3xl p-6 md:p-7">
          <p className="mono-label">Snapshot</p>
          <dl className="mt-5 grid gap-6">
            <div>
              <dt className="text-xs uppercase tracking-[0.12em] text-[var(--color-muted)]">
                Team Size
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-white">
                {memberCount}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.12em] text-[var(--color-muted)]">
                Core Focus
              </dt>
              <dd className="mt-1 text-base text-[var(--color-text)]">
                Applied AI, Product Systems, Web Engineering
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.12em] text-[var(--color-muted)]">
                Contact
              </dt>
              <dd className="mt-1 text-sm text-[var(--color-text)]">
                {team.contactEmail}
              </dd>
            </div>
          </dl>
        </aside>
      </div>
    </section>
  );
}
