import type { Metadata } from "next";
import Link from "next/link";
import { absoluteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Projects",
  description: "Upcoming projects from the Wormforce team.",
  alternates: {
    canonical: absoluteUrl("/projects"),
  },
  openGraph: {
    title: "Projects | Wormforce",
    description: "Upcoming projects from the Wormforce team.",
    url: absoluteUrl("/projects"),
    type: "website",
  },
};

export default function ProjectsPage() {
  return (
    <section className="section-shell pt-24">
      <div className="content-shell">
        <div className="card-surface reveal rounded-3xl p-8 md:p-12">
          <p className="mono-label">Projects</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-4xl">
            Coming Soon
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--color-muted)] md:text-base">
            We are preparing a dedicated page for selected works, experiments,
            and internal tools. This section will be expanded in the next
            release.
          </p>
          <div className="mt-8">
            <Link
              href="/#contact"
              className="inline-flex items-center rounded-full border border-[var(--color-border)] px-5 py-2 text-sm font-medium text-[var(--color-text)] transition hover:border-[var(--color-text)] hover:text-white"
            >
              Contact the Team
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
