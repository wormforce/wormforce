import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { projects } from "@/content/projects";
import { absoluteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Projects",
  description: "Browse product and project work from the Wormforce team.",
  alternates: {
    canonical: absoluteUrl("/projects"),
  },
  openGraph: {
    title: "Projects | Wormforce",
    description: "Browse product and project work from the Wormforce team.",
    url: absoluteUrl("/projects"),
    type: "website",
  },
};

export default function ProjectsPage() {
  return (
    <section className="section-shell pt-24">
      <div className="content-shell">
        <header className="reveal max-w-3xl">
          <p className="mono-label">Projects</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-4xl">
            Product Directory
          </h1>
          <p className="mt-4 text-sm leading-8 text-[var(--color-muted)] md:text-base">
            Each entry leads to a dedicated product page with roadmap-friendly
            context, positioning, and feature details.
          </p>
        </header>

        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <article
              key={project.slug}
              className="card-surface reveal rounded-3xl p-4 transition hover:-translate-y-0.5 hover:border-[var(--color-text)] md:p-5"
            >
              <div className="relative overflow-hidden rounded-2xl border border-[var(--color-border)]">
                <Image
                  src={project.coverImage}
                  alt={project.coverImageAlt}
                  width={1600}
                  height={900}
                  className="aspect-[16/10] w-full object-cover"
                />
              </div>

              <div className="mt-4 flex items-center justify-between gap-3">
                <p className="mono-label">{project.platform}</p>
                <span className="rounded-full border border-[var(--color-border)] px-2.5 py-1 text-[10px] uppercase tracking-[0.1em] text-[var(--color-muted)]">
                  {project.status}
                </span>
              </div>

              <h2 className="mt-2 text-xl font-semibold text-white">
                {project.name}
              </h2>
              <p className="mt-2 text-sm leading-7 text-[var(--color-muted)]">
                {project.shortDescription}
              </p>

              <div className="mt-5">
                <Link
                  href={`/projects/${project.slug}`}
                  className="inline-flex items-center text-sm font-medium text-[var(--color-text)] transition hover:text-white"
                >
                  Open product page {"->"}
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
