import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BattutaProductPage } from "@/components/battuta-product-page";
import { getProjectBySlug, projects } from "@/content/projects";
import { absoluteUrl } from "@/lib/utils";

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    return {
      title: "Project Not Found",
      description: "The requested project page does not exist.",
    };
  }

  const projectUrl = absoluteUrl(`/projects/${project.slug}`);

  return {
    title: `${project.name}`,
    description: project.shortDescription,
    alternates: {
      canonical: projectUrl,
    },
    openGraph: {
      title: `${project.name} | Wormforce`,
      description: project.shortDescription,
      url: projectUrl,
      type: "website",
      images:
        project.slug === "battuta"
          ? [
              {
                url: absoluteUrl("/battuta/og-v1.1.1.png"),
                width: 1920,
                height: 1080,
                alt: "Battuta 1.1.1 keyboard sound app for macOS and Windows",
              },
            ]
          : undefined,
    },
    twitter:
      project.slug === "battuta"
        ? {
            card: "summary_large_image",
            title: "Battuta | Wormforce",
            description: project.shortDescription,
            images: [absoluteUrl("/battuta/og-v1.1.1.png")],
          }
        : undefined,
  };
}

export default async function ProjectDetailPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  if (project.slug === "battuta") {
    return <BattutaProductPage />;
  }

  return (
    <section className="section-shell pt-24">
      <div className="content-shell">
        <Link
          href="/projects"
          className="mono-label inline-flex items-center transition hover:text-white"
        >
          {"<-"} Back to projects
        </Link>

        <article className="mt-6 space-y-6">
          <div className="reveal overflow-hidden rounded-[36px] border border-[#2f2f2f] bg-[linear-gradient(155deg,#f5f5f5_0%,#e2e2e2_45%,#d4d4d4_100%)] p-7 text-[#101010] shadow-[0_30px_80px_rgba(0,0,0,0.45)] md:p-10">
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <p className="text-xs font-medium tracking-[0.16em] text-[#4c4c4c] uppercase">
                  {project.platform} · {project.status}
                </p>
                <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
                  {project.name}
                </h1>
                <p className="mt-4 max-w-xl text-base leading-8 text-[#2f2f2f] md:text-lg">
                  {project.tagline}
                </p>
                <p className="mt-4 max-w-xl text-sm leading-7 text-[#454545] md:text-base">
                  {project.fullDescription}
                </p>
              </div>

              <div className="mx-auto w-full max-w-[320px]">
                <div className="relative mx-auto h-[440px] w-[220px] rounded-[42px] border border-[#303030] bg-black p-2 shadow-[0_20px_45px_rgba(0,0,0,0.35)]">
                  <div className="relative h-full overflow-hidden rounded-[34px] border border-[#2d2d2d] bg-[#111]">
                    <Image
                      src={project.coverImage}
                      alt={project.coverImageAlt}
                      fill
                      className="object-cover"
                      sizes="220px"
                    />
                    <div className="absolute inset-x-3 bottom-3 rounded-xl bg-black/55 px-3 py-2 text-[11px] text-white/90 backdrop-blur">
                      Replace this placeholder with product screenshot.
                    </div>
                  </div>
                  <div className="absolute left-1/2 top-3 h-1 w-16 -translate-x-1/2 rounded-full bg-[#4b4b4b]" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {project.featureBlocks.map((block) => (
              <article
                key={block.title}
                className="card-surface reveal rounded-2xl p-5 md:p-6"
              >
                <h2 className="text-xl font-semibold text-white">
                  {block.title}
                </h2>
                <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">
                  {block.description}
                </p>
              </article>
            ))}
          </div>

          <div className="card-surface reveal rounded-3xl p-6 md:p-8">
            <p className="mono-label">Product Highlights</p>
            <ul className="mt-4 grid gap-3 text-sm leading-7 text-[var(--color-text)] md:text-base">
              {project.highlights.map((item) => (
                <li key={item} className="rounded-xl border border-[var(--color-border)] p-3">
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/#contact"
                className="inline-flex items-center rounded-full border border-[var(--color-border)] px-5 py-2 text-sm font-medium text-[var(--color-text)] transition hover:border-[var(--color-text)] hover:text-white"
              >
                Contact Wormforce
              </Link>
              <Link
                href="/projects"
                className="inline-flex items-center rounded-full border border-[var(--color-border)] bg-[var(--color-brand-soft)] px-5 py-2 text-sm font-medium text-[var(--color-text)] transition hover:border-[var(--color-text)] hover:text-white"
              >
                Back to directory
              </Link>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
