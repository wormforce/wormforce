import Image from "next/image";
import Link from "next/link";
import { ArrowUpRightIcon } from "@phosphor-icons/react/ssr";
import type { ProjectProfile } from "@/content/projects";

type ProjectListProps = {
  projects: ProjectProfile[];
  headingLevel?: "h2" | "h3";
  /** How many leading covers sit above the fold and should be preloaded. */
  priorityCount?: number;
};

export function ProjectList({
  projects,
  headingLevel: Heading = "h3",
  priorityCount = 0,
}: ProjectListProps) {
  return (
    <ul className="border-t border-[var(--color-border)]">
      {projects.map((project, index) => (
        <li key={project.slug} className="reveal border-b border-[var(--color-border)]">
          <Link
            href={`/projects/${project.slug}`}
            aria-labelledby={`project-${project.slug}-name`}
            aria-describedby={`project-${project.slug}-tagline`}
            className="group grid gap-6 py-8 md:grid-cols-[1fr_2fr] md:gap-10 md:py-12"
          >
            <div className="flex flex-col">
              <p className="mono-label">
                <span className="text-[var(--color-subtle)]" aria-hidden>
                  {String(index + 1).padStart(2, "0")}
                </span>
                {project.platform}
              </p>
              <Heading
                id={`project-${project.slug}-name`}
                className="mt-5 flex items-center gap-2 text-3xl font-medium tracking-[-0.03em] text-white md:text-4xl">
                {project.name}
                <ArrowUpRightIcon
                  className="arrow-nudge shrink-0 text-[var(--color-muted)] transition-colors group-hover:text-white"
                  size={22}
                  aria-hidden
                />
              </Heading>
              <p
                id={`project-${project.slug}-tagline`}
                className="mt-4 text-base leading-7 text-[var(--color-text)]"
              >
                {project.tagline}
              </p>
              <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">
                {project.shortDescription}
              </p>
              <p className="mt-6 inline-flex items-center gap-2 text-sm text-[var(--color-muted)] md:mt-auto md:pt-8">
                {project.status === "Live" ? <span className="status-dot" aria-hidden /> : null}
                {project.status}
              </p>
            </div>

            <div className="order-first overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-soft)] md:order-none">
              <Image
                src={project.coverImage}
                alt={project.coverImageAlt}
                width={1600}
                height={900}
                priority={index < priorityCount}
                sizes="(min-width: 1200px) 780px, (min-width: 768px) 66vw, 100vw"
                className="media-zoom aspect-[16/10] w-full object-cover"
              />
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
