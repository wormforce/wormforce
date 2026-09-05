"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const englishNavItems = [
  { label: "Home", href: "/#home" },
  { label: "Projects", href: "/#projects" },
  { label: "Members", href: "/#members" },
  { label: "Team", href: "/#team" },
  { label: "Contact", href: "/#contact" },
];

const chineseNavItems = [
  { label: "首页", href: "/#home" },
  { label: "项目", href: "/#projects" },
  { label: "成员", href: "/#members" },
  { label: "团队", href: "/#team" },
  { label: "联系", href: "/#contact" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const isChineseBattutaPage =
    pathname === "/projects/battuta" || pathname === "/projects/battuta/privacy";
  const navItems = isChineseBattutaPage ? chineseNavItems : englishNavItems;

  return (
    <header
      className="relative top-0 z-50 border-b border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-bg)_78%,transparent)] backdrop-blur-xl lg:sticky"
      lang={isChineseBattutaPage ? "zh-CN" : "en"}
    >
      <div className="content-shell flex h-14 items-center justify-between gap-4 lg:h-16">
        <Link href="/#home" className="inline-flex min-h-11 items-center gap-5">
          <Image
            src="/icon.svg"
            alt=""
            className="h-8 w-auto shrink-0 invert"
            width={152}
            height={116}
            aria-hidden
          />
          <Image
            src="/handwrite.svg"
            alt="Wormforce"
            className="h-7 w-auto"
            width={385}
            height={81}
          />
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-[var(--color-muted)] lg:flex">
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
          className="hidden items-center rounded-full border border-[var(--color-border)] px-4 py-1.5 text-sm text-[var(--color-text)] transition hover:border-[var(--color-text)] hover:text-white lg:inline-flex"
        >
          team@wormforce.net
        </a>
      </div>
      <div className="content-shell pb-2 lg:hidden">
        <nav className="no-scrollbar flex gap-2 overflow-x-auto text-[11px] text-[var(--color-muted)]">
          {navItems.map((item) => (
            <Link
              key={`mobile-${item.href}`}
              href={item.href}
              className="inline-flex min-h-11 items-center rounded-full border border-[var(--color-border)] px-2.5 py-1 whitespace-nowrap transition hover:border-[var(--color-text)] hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
