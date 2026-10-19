import Link from "next/link";
import { ArrowRightIcon } from "@phosphor-icons/react/ssr";
import { ProjectList } from "@/components/project-list";
import { SectionIntro } from "@/components/section-intro";
import { projects } from "@/content/projects";

export function ProjectsPreview() {
  return (
    <section id="projects" className="section-shell">
      <div className="content-shell">
        <SectionIntro
          label="Projects"
          title="What we're building"
          description="Practical tools and native products shaped around real workflows, clear interfaces, and reliable engineering."
          action={
            <Link href="/projects" className="btn-secondary">
              All projects
              <ArrowRightIcon size={15} aria-hidden />
            </Link>
          }
        />

        <div className="mt-14 md:mt-20">
          <ProjectList projects={projects.slice(0, 3)} />
        </div>
      </div>
    </section>
  );
}
