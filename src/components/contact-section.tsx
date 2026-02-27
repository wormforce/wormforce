import type { TeamProfile } from "@/content/site";

type ContactSectionProps = {
  team: TeamProfile;
};

export function ContactSection({ team }: ContactSectionProps) {
  return (
    <section id="contact" className="section-shell pb-14 md:pb-20">
      <div className="content-shell">
        <article className="card-surface reveal rounded-3xl p-6 md:p-8">
          <p className="mono-label">Contact</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white md:text-3xl">
            Let&apos;s Build Something Useful
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-8 text-[var(--color-muted)] md:text-base">
            For collaborations, consulting, or product partnership inquiries,
            reach out through email or our social channels.
          </p>

          <a
            href={`mailto:${team.contactEmail}`}
            className="mt-6 inline-flex items-center rounded-full bg-[var(--color-brand)] px-5 py-2.5 text-sm font-semibold text-[#0a0a0a] transition hover:brightness-105"
          >
            {team.contactEmail}
          </a>

          <div className="mt-5 flex flex-wrap gap-3">
            {team.socialLinks.map((link) => (
              <a
                key={`contact-${link.label}`}
                href={link.url}
                target={link.url.startsWith("mailto:") ? undefined : "_blank"}
                rel={
                  link.url.startsWith("mailto:")
                    ? undefined
                    : "noopener noreferrer"
                }
                className="rounded-full border border-[var(--color-border)] px-4 py-2 text-sm text-[var(--color-muted)] transition hover:border-[var(--color-text)] hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}
