"use client";

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
      <div className="content-shell flex flex-col gap-4 py-8 text-sm text-[var(--color-muted)] md:flex-row md:items-center md:justify-between">
        <p>
          {isChineseBattutaPage
            ? currentYear + " Wormforce。由 Next.js 构建并部署于 Vercel。"
            : currentYear + " Wormforce. Built with Next.js and deployed on Vercel."}
        </p>
        <div className="flex flex-wrap gap-4">
          {teamProfile.socialLinks.map((link) => {
            const label =
              isChineseBattutaPage && link.label === "Email" ? "邮箱" : link.label;

            return (
              <a
                key={`footer-${link.label}`}
                href={link.url}
                target={link.url.startsWith("mailto:") ? undefined : "_blank"}
                rel={
                  link.url.startsWith("mailto:")
                    ? undefined
                    : "noopener noreferrer"
                }
                className="transition hover:text-white"
              >
                {label}
              </a>
            );
          })}
        </div>
      </div>
    </footer>
  );
}
