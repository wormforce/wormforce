import { teamProfile } from "@/content/site";

export function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--color-border)]">
      <div className="content-shell flex flex-col gap-4 py-8 text-sm text-[var(--color-muted)] md:flex-row md:items-center md:justify-between">
        <p>
          {currentYear} Wormforce. Built with Next.js and deployed on Vercel.
        </p>
        <div className="flex flex-wrap gap-4">
          {teamProfile.socialLinks.map((link) => (
            <a
              key={`footer-${link.label}`}
              href={link.url}
              target={link.url.startsWith("mailto:") ? undefined : "_blank"}
              rel={
                link.url.startsWith("mailto:") ? undefined : "noopener noreferrer"
              }
              className="transition hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
