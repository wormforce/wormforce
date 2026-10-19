"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { teamProfile } from "@/content/site";

export function SiteFooter() {
  const pathname = usePathname();
  const isBattutaCommunityPage =
    pathname === "/projects/battuta/community"
    || pathname.startsWith("/projects/battuta/community/")
    || pathname === "/en/projects/battuta/community"
    || pathname.startsWith("/en/projects/battuta/community/");
  const currentYear = new Date().getFullYear();
  const isChineseBattutaPage =
    pathname === "/projects/battuta"
    || (pathname.startsWith("/projects/battuta/")
      && !pathname.startsWith("/projects/battuta/guides/"));

  if (isBattutaCommunityPage) return null;

  return (
    <footer
      className="border-t border-[var(--color-border)]"
      lang={isChineseBattutaPage ? "zh-CN" : "en"}
    >
      <div className="content-shell flex flex-col gap-8 py-10 text-sm text-[var(--color-muted)] md:flex-row md:items-end md:justify-between">
        <div>
          <Link href="/" className="inline-flex transition-opacity hover:opacity-70" aria-label="Wormforce home">
            <Image
              src="/handwrite.svg"
              alt=""
              className="h-5 w-auto"
              width={385}
              height={81}
              aria-hidden
            />
          </Link>
          <p className="mt-4">
            {isChineseBattutaPage
              ? `© ${currentYear} Wormforce。由 Next.js 构建并部署于 Vercel。`
              : `© ${currentYear} Wormforce. Built with Next.js, deployed on Vercel.`}
          </p>
        </div>
        <ul className="flex flex-wrap gap-x-6 gap-y-2">
          {teamProfile.socialLinks.map((link) => {
            const label =
              isChineseBattutaPage && link.label === "Email" ? "邮箱" : link.label;
            const isMail = link.url.startsWith("mailto:");

            return (
              <li key={`footer-${link.label}`}>
                <a
                  href={link.url}
                  target={isMail ? undefined : "_blank"}
                  rel={isMail ? undefined : "noopener noreferrer"}
                  className="transition-colors hover:text-white"
                >
                  {label}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </footer>
  );
}
