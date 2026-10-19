import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import { ProjectList } from "@/components/project-list";
import { SectionIntro } from "@/components/section-intro";
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
      <section className="section-shell pt-16 md:pt-28">
        <div className="content-shell">
          <SectionIntro
            as="h1"
            label="Projects"
            title="Software and AI projects"
            description="Open-source desktop software and developer tools built by Wormforce, with dedicated pages for features, installation, and project documentation."
          />

          <div className="mt-14 md:mt-20">
            <ProjectList projects={projects} headingLevel="h2" />
          </div>
        </div>
      </section>
    </>
  );
}
