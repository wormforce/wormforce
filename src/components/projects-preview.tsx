import Image from "next/image";
import Link from "next/link";
import { projects } from "@/content/projects";

export function ProjectsPreview() {
  return (
    <section id="projects" className="section-shell">
      <div className="content-shell">
        <div className="reveal flex flex-col items-start justify-between gap-5 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <p className="mono-label">Projects</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-4xl">
              What We&apos;re Building
            </h2>
            <p className="mt-4 text-sm leading-7 text-[var(--color-muted)] md:text-base">
              Practical tools and native products shaped around real workflows,
              clear interfaces, and reliable engineering.
            </p>
          </div>

          <Link
            href="/projects"
            className="inline-flex min-h-11 items-center rounded-full border border-[var(--color-border)] px-5 py-2 text-sm font-medium text-[var(--color-text)] transition hover:border-[var(--color-text)] hover:text-white"
          >
            View all projects
          </Link>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {projects.slice(0, 2).map((project, index) => (
            <article
              key={project.slug}
              className="card-surface reveal group rounded-3xl p-4 transition hover:-translate-y-0.5 hover:border-[var(--color-text)] md:p-5"
            >
              <div className="relative overflow-hidden rounded-2xl border border-[var(--color-border)]">
                <Image
                  src={project.coverImage}
                  alt={project.coverImageAlt}
                  width={1600}
                  height={900}
                  priority={index < 2}
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="aspect-[16/10] w-full object-cover"
                />
              </div>

              <div className="mt-4 flex items-center justify-between gap-3">
                <p className="mono-label">{project.platform}</p>
                <span className="rounded-full border border-[var(--color-border)] px-2.5 py-1 text-[10px] uppercase tracking-[0.1em] text-[var(--color-muted)]">
                  {project.status}
                </span>
              </div>

              <h3 className="mt-2 text-xl font-semibold text-white">
                {project.name}
              </h3>
              <p className="mt-2 text-sm font-medium text-[var(--color-text)]">
                {project.tagline}
              </p>
              <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">
                {project.shortDescription}
              </p>

              <div className="mt-5">
                <Link
                  href={`/projects/${project.slug}`}
                  className="inline-flex min-h-11 items-center text-sm font-medium text-[var(--color-text)] transition group-hover:text-white"
                >
                  View {project.name} {"->"}
                </Link>
              </div>
            </article>
          ))}
        </div>

        {projects.length > 2 && (
          <div className="mt-6 flex justify-center">
            <Link
              href="/projects"
              className="inline-flex min-h-11 items-center rounded-full border border-[var(--color-border)] px-5 py-2 text-sm font-medium text-[var(--color-text)] transition hover:border-[var(--color-text)] hover:text-white"
            >
              Explore the full project directory
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
