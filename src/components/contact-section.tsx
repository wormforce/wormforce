import { ArrowUpRightIcon } from "@phosphor-icons/react/ssr";
import type { TeamProfile } from "@/content/site";

type ContactSectionProps = {
  team: TeamProfile;
};

export function ContactSection({ team }: ContactSectionProps) {
  const socialLinks = team.socialLinks.filter((link) => !link.url.startsWith("mailto:"));

  return (
    <section id="contact" className="section-shell">
      <div className="content-shell">
        <div className="reveal grid gap-6 border-t border-[var(--color-border)] pt-6 md:grid-cols-[1fr_2fr] md:gap-10">
          <p className="mono-label self-start">Contact</p>
          <div>
            <h2 className="wf-section-heading">Let&apos;s build something useful.</h2>
            <p className="mt-6 max-w-xl text-base leading-7 text-[var(--color-muted)] md:text-lg md:leading-8">
              For collaborations, consulting, or product partnership inquiries,
              reach out through email or our social channels.
            </p>

            <a
              href={`mailto:${team.contactEmail}`}
              className="group mt-12 inline-flex items-center gap-3 text-[clamp(1.6rem,4.6vw,3.25rem)] font-medium tracking-[-0.035em] text-white"
            >
              <span className="link-underline">{team.contactEmail}</span>
              <ArrowUpRightIcon className="arrow-nudge shrink-0" size="0.8em" aria-hidden />
            </a>

            <ul className="mt-10 flex flex-wrap gap-3">
              {socialLinks.map((link) => (
                <li key={`contact-${link.label}`}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary"
                  >
                    {link.label}
                    <ArrowUpRightIcon className="arrow-nudge" size={14} aria-hidden />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
