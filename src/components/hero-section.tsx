import Link from "next/link";
import { ArrowRightIcon } from "@phosphor-icons/react/ssr";
import type { TeamProfile } from "@/content/site";

type HeroSectionProps = {
  team: TeamProfile;
  memberCount: number;
};

export function HeroSection({ team, memberCount }: HeroSectionProps) {
  const facts = [
    { label: "Team", value: `${memberCount} builders` },
    { label: "Focus", value: "Applied AI, product systems, web engineering" },
    {
      label: "Contact",
      value: team.contactEmail,
      href: `mailto:${team.contactEmail}`,
    },
  ];

  return (
    <section id="home" className="scroll-mt-16 pt-16 pb-20 md:pt-32 md:pb-28">
      <div className="content-shell">
        <div className="reveal">
          <p className="mono-label">
            <span className="status-dot" aria-hidden />
            Independent engineering team
          </p>
          <h1 className="display-heading mt-8 max-w-[20ch]">
            <span className="sr-only">{team.name}: </span>
            {team.tagline}
          </h1>
          <p className="mt-8 max-w-xl text-base leading-7 text-[var(--color-muted)] md:text-lg md:leading-8">
            {team.description}
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link href="/#projects" className="btn-primary">
              View projects
              <ArrowRightIcon size={15} aria-hidden />
            </Link>
            <Link href="/#members" className="btn-secondary">
              Meet the team
            </Link>
          </div>
        </div>

        <dl className="reveal mt-20 grid border-t border-[var(--color-border)] sm:grid-cols-3 md:mt-28">
          {facts.map((fact) => (
            <div
              key={fact.label}
              className="flex justify-between gap-6 border-b border-[var(--color-border)] py-5 sm:block sm:border-b-0 sm:pr-6"
            >
              <dt className="mono-label">{fact.label}</dt>
              <dd className="text-right text-sm text-white sm:mt-3 sm:text-left sm:text-base">
                {fact.href ? (
                  <a href={fact.href} className="link-underline">
                    {fact.value}
                  </a>
                ) : (
                  fact.value
                )}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
