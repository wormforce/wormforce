"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const englishNavItems = [
  { label: "Projects", href: "/#projects" },
  { label: "Members", href: "/#members" },
  { label: "About", href: "/#team" },
  { label: "Contact", href: "/#contact" },
];

const chineseNavItems = [
  { label: "项目", href: "/#projects" },
  { label: "成员", href: "/#members" },
  { label: "关于", href: "/#team" },
  { label: "联系", href: "/#contact" },
];

export function SiteHeader() {
  const pathname = usePathname();
  // The menu belongs to the path it was opened on, so navigating closes it.
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const menuOpen = menuPath === pathname;
  const setMenuOpen = (open: boolean) => setMenuPath(open ? pathname : null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isBattutaCommunityPage =
    pathname === "/projects/battuta/community"
    || pathname.startsWith("/projects/battuta/community/")
    || pathname === "/en/projects/battuta/community"
    || pathname.startsWith("/en/projects/battuta/community/");
  const isChineseBattutaPage =
    pathname === "/projects/battuta"
    || (pathname.startsWith("/projects/battuta/")
      && !pathname.startsWith("/projects/battuta/guides/"));
  const navItems = isChineseBattutaPage ? chineseNavItems : englishNavItems;
  // Product pages pin their own sub-navigation to the top below the lg breakpoint.
  const hasProductSubnav =
    pathname.startsWith("/projects/battuta")
    || pathname.startsWith("/en/projects/battuta")
    || pathname.startsWith("/projects/sustech-cli");

  if (isBattutaCommunityPage) return null;

  return (
    <header
      className={cn(
        "top-0 z-50 border-b transition-colors duration-300",
        hasProductSubnav ? "relative lg:sticky" : "sticky",
        scrolled || menuOpen
          ? "border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-bg)_80%,transparent)] backdrop-blur-xl"
          : "border-transparent",
      )}
      lang={isChineseBattutaPage ? "zh-CN" : "en"}
    >
      <div className="content-shell flex h-16 items-center justify-between gap-6">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center gap-3 transition-opacity hover:opacity-70"
          aria-label="Wormforce home"
        >
          <Image
            src="/icon.svg"
            alt=""
            className="h-6 w-auto shrink-0 invert"
            width={152}
            height={116}
            aria-hidden
          />
          <Image
            src="/handwrite.svg"
            alt=""
            className="h-5 w-auto"
            width={385}
            height={81}
            aria-hidden
          />
        </Link>

        <nav className="hidden items-center gap-8 text-sm md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-[var(--color-muted)] transition-colors hover:text-white"
            >
              {item.label}
            </Link>
          ))}
          <a
            href="mailto:team@wormforce.net"
            className="inline-flex items-center rounded-full bg-white px-3.5 py-1.5 font-medium text-black transition-colors hover:bg-[#d9d9d9]"
          >
            {isChineseBattutaPage ? "联系我们" : "Get in touch"}
          </a>
        </nav>

        <button
          type="button"
          className="inline-flex min-h-11 items-center gap-2 text-sm text-[var(--color-text)] md:hidden"
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen
            ? (isChineseBattutaPage ? "关闭" : "Close")
            : (isChineseBattutaPage ? "菜单" : "Menu")}
          <span className="relative block h-2.5 w-4" aria-hidden>
            <span
              className={cn(
                "absolute left-0 h-px w-4 bg-current transition-transform duration-300",
                menuOpen ? "top-1 rotate-45" : "top-0",
              )}
            />
            <span
              className={cn(
                "absolute left-0 h-px w-4 bg-current transition-transform duration-300",
                menuOpen ? "top-1 -rotate-45" : "top-2",
              )}
            />
          </span>
        </button>
      </div>

      {menuOpen ? (
        <nav
          id="mobile-nav"
          className="content-shell border-t border-[var(--color-border)] pt-2 pb-6 md:hidden"
        >
          <ul>
            {navItems.map((item) => (
              <li key={`mobile-${item.href}`} className="border-b border-[var(--color-border)]">
                <Link
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex min-h-14 items-center text-2xl tracking-tight text-white"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <a
            href="mailto:team@wormforce.net"
            className="btn-primary mt-6 w-full"
          >
            team@wormforce.net
          </a>
        </nav>
      ) : null}
    </header>
  );
}
