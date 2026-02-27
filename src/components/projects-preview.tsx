import Link from "next/link";
import { projects } from "@/content/projects";

export function ProjectsPreview() {
  const featuredProject = projects[0];

  return (
    <section id="projects" className="section-shell">
      <div className="content-shell">
        <article className="card-surface reveal rounded-3xl p-6 md:p-8">
          <p className="mono-label">Projects</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white md:text-3xl">
            Product Directory Is Live
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-8 text-[var(--color-muted)] md:text-base">
            Browse our projects as a structured list and open each product page
            for details. The first listed project is now live in preview.
          </p>

          {featuredProject && (
            <div className="mt-5 rounded-2xl border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-brand-soft)_55%,transparent)] px-4 py-3">
              <p className="text-sm font-semibold text-[var(--color-text)]">
                Featured: {featuredProject.name}
              </p>
              <p className="mt-1 text-sm text-[var(--color-muted)]">
                {featuredProject.shortDescription}
              </p>
            </div>
          )}

          <div className="mt-6">
            <Link
              href="/projects"
              className="inline-flex items-center rounded-full border border-[var(--color-border)] px-5 py-2 text-sm font-medium text-[var(--color-text)] transition hover:border-[var(--color-text)] hover:text-white"
            >
              Open Project Directory
            </Link>
          </div>
        </article>
      </div>
    </section>
  );
}
