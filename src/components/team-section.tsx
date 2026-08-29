import type { TeamProfile } from "@/content/site";

type TeamSectionProps = {
  team: TeamProfile;
};

export function TeamSection({ team }: TeamSectionProps) {
  return (
    <section id="team" className="section-shell">
      <div className="content-shell">
        <div className="reveal max-w-2xl">
          <p className="mono-label">Team Direction</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-4xl">
            How the Team Works
          </h2>
          <p className="mt-4 text-sm leading-7 text-[var(--color-muted)] md:text-base">
            After the products and the people, this is the operating logic that
            shapes the work.
          </p>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <article className="card-surface reveal rounded-3xl p-6 md:p-8">
            <p className="mono-label">Team</p>
            <h3 className="mt-3 text-2xl font-semibold tracking-tight text-white md:text-3xl">
              Who We Are
            </h3>
            <p className="mt-4 text-sm leading-8 text-[var(--color-muted)] md:text-base">
              {team.description}
            </p>
          </article>

          <article className="card-surface reveal rounded-3xl p-6 md:p-8">
            <p className="mono-label">Mission</p>
            <h3 className="mt-3 text-2xl font-semibold tracking-tight text-white md:text-3xl">
              What We Optimize For
            </h3>
            <p className="mt-4 text-sm leading-8 text-[var(--color-muted)] md:text-base">
              {team.mission}
            </p>
            <ul className="mt-6 grid gap-3 text-sm text-[var(--color-text)]">
              <li className="rounded-2xl border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-brand-soft)_30%,transparent)] px-4 py-3">
                Fast iteration with stable code quality.
              </li>
              <li className="rounded-2xl border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-brand-soft)_30%,transparent)] px-4 py-3">
                Readable systems over fragile shortcuts.
              </li>
              <li className="rounded-2xl border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-brand-soft)_30%,transparent)] px-4 py-3">
                Product decisions backed by measurable outcomes.
              </li>
            </ul>
          </article>
        </div>
      </div>
    </section>
  );
}
