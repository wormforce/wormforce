import { SectionIntro } from "@/components/section-intro";
import type { TeamProfile } from "@/content/site";

type TeamSectionProps = {
  team: TeamProfile;
};

const principles = [
  "Fast iteration with stable code quality.",
  "Readable systems over fragile shortcuts.",
  "Product decisions backed by measurable outcomes.",
];

export function TeamSection({ team }: TeamSectionProps) {
  return (
    <section id="team" className="section-shell">
      <div className="content-shell">
        <SectionIntro label="About" title="How the team works" />

        <div className="mt-8 grid gap-10 md:grid-cols-[1fr_2fr]">
          <div aria-hidden className="hidden md:block" />
          <div className="reveal">
            <p className="text-xl leading-snug tracking-[-0.015em] text-[var(--color-text)] md:text-2xl md:leading-[1.45]">
              {team.mission}
            </p>

            <h3 className="mono-label mt-16">What we optimize for</h3>
            <ol className="mt-5 border-t border-[var(--color-border)]">
              {principles.map((principle, index) => (
                <li
                  key={principle}
                  className="grid grid-cols-[3rem_1fr] items-baseline border-b border-[var(--color-border)] py-5 text-base text-[var(--color-text)] md:text-lg"
                >
                  <span className="font-[family-name:var(--font-mono-stack)] text-xs text-[var(--color-subtle)]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {principle}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
