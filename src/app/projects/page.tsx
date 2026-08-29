import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { projects } from "@/content/projects";
import { absoluteUrl } from "@/lib/utils";

const projectsTitle =
  "Wormforce Projects — Battuta, sustech cli and Developer Tools";
const projectsDescription =
  "Explore Wormforce projects: Battuta, an open-source keyboard sound app for macOS and Windows, and sustech cli, a toolkit for SUSTech services.";

export const metadata: Metadata = {
  title: { absolute: projectsTitle },
  description: projectsDescription,
  alternates: {
    canonical: absoluteUrl("/projects"),
  },
  openGraph: {
    title: projectsTitle,
    description: projectsDescription,
    url: absoluteUrl("/projects"),
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: projectsTitle,
    description: projectsDescription,
  },
};

export default function ProjectsPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "@id": `${absoluteUrl("/projects")}#collection`,
          url: absoluteUrl("/projects"),
          name: projectsTitle,
          description: projectsDescription,
          mainEntity: {
            "@type": "ItemList",
            itemListElement: projects.map((project, index) => ({
              "@type": "ListItem",
              position: index + 1,
              name: project.name,
              url: absoluteUrl(`/projects/${project.slug}`),
            })),
          },
        }}
      />
      <section className="section-shell pt-24">
        <div className="content-shell">
          <header className="reveal max-w-3xl">
            <p className="mono-label">Projects</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-4xl">
              Software and AI Projects
            </h1>
            <p className="mt-4 text-sm leading-8 text-[var(--color-muted)] md:text-base">
              Open-source desktop software and developer tools built by
              Wormforce, with dedicated pages for features, installation, and
              project documentation.
            </p>
          </header>

          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((project, index) => (
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
                  priority={index < 2}
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
                  Explore {project.name} for {project.platform} {"->"}
                </Link>
              </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
