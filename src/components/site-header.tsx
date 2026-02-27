import Link from "next/link";

const navItems = [
  { label: "Home", href: "/#home" },
  { label: "Team", href: "/#team" },
  { label: "Members", href: "/#members" },
  { label: "Projects", href: "/projects" },
  { label: "Contact", href: "/#contact" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-bg)_78%,transparent)] backdrop-blur-xl">
      <div className="content-shell flex h-16 items-center justify-between gap-4">
        <Link href="/#home" className="inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-text)]" />
          <span className="font-semibold tracking-[0.16em] text-white">
            WORMFORCE
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-[var(--color-muted)] md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <a
          href="mailto:team@wormforce.net"
          className="inline-flex items-center rounded-full border border-[var(--color-border)] px-4 py-1.5 text-sm text-[var(--color-text)] transition hover:border-[var(--color-text)] hover:text-white"
        >
          team@wormforce.net
        </a>
      </div>
      <div className="content-shell pb-3 md:hidden">
        <nav className="no-scrollbar flex gap-4 overflow-x-auto text-xs text-[var(--color-muted)]">
          {navItems.map((item) => (
            <Link
              key={`mobile-${item.href}`}
              href={item.href}
              className="rounded-full border border-[var(--color-border)] px-3 py-1.5 whitespace-nowrap transition hover:border-[var(--color-text)] hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
