import Link from "next/link";

export function ProjectsPreview() {
  return (
    <section id="projects" className="section-shell">
      <div className="content-shell">
        <article className="card-surface reveal rounded-3xl p-6 md:p-8">
          <p className="mono-label">Projects</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white md:text-3xl">
            Project Hub Is In Progress
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-8 text-[var(--color-muted)] md:text-base">
            We are preparing a curated list of public work, experiments, and
            engineering notes. The dedicated projects page is reserved and ready
            for the next release cycle.
          </p>
          <div className="mt-6">
            <Link
              href="/projects"
              className="inline-flex items-center rounded-full border border-[var(--color-border)] px-5 py-2 text-sm font-medium text-[var(--color-brand)] transition hover:border-[var(--color-brand)] hover:text-white"
            >
              Open Projects Page
            </Link>
          </div>
        </article>
      </div>
    </section>
  );
}
