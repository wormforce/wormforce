import type { TeamProfile } from "@/content/site";

type TeamSectionProps = {
  team: TeamProfile;
};

export function TeamSection({ team }: TeamSectionProps) {
  return (
    <section id="team" className="section-shell">
      <div className="content-shell grid gap-6 lg:grid-cols-2">
        <article className="card-surface reveal rounded-3xl p-6 md:p-8">
          <p className="mono-label">Team</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white md:text-3xl">
            Who We Are
          </h2>
          <p className="mt-4 text-sm leading-8 text-[var(--color-muted)] md:text-base">
            {team.description}
          </p>
        </article>

        <article className="card-surface reveal rounded-3xl p-6 md:p-8">
          <p className="mono-label">Mission</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white md:text-3xl">
            What We Optimize For
          </h2>
          <p className="mt-4 text-sm leading-8 text-[var(--color-muted)] md:text-base">
            {team.mission}
          </p>
          <ul className="mt-5 grid gap-2 text-sm text-[var(--color-text)]">
            <li>Fast iteration with stable code quality.</li>
            <li>Readable systems over fragile shortcuts.</li>
            <li>Product decisions backed by measurable outcomes.</li>
          </ul>
        </article>
      </div>
    </section>
  );
}
