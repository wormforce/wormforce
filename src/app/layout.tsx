import type { Metadata } from "next";
import { Geist, Geist_Mono, Space_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "@/styles/globals.css";
import "@/styles/battuta.css";
import "@/styles/battuta-community-library.css";
import "@/styles/battuta-community-published.css";
import "@/styles/sustech-cli.css";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { teamProfile } from "@/content/site";
import { absoluteUrl } from "@/lib/utils";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Battuta product styles still reference Space Mono.

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(absoluteUrl("/")),
  title: {
    default: "Wormforce — Applied AI and Open-Source Software",
    template: "%s | Wormforce",
  },
  description: teamProfile.seoDescription,
  alternates: {
    canonical: absoluteUrl("/"),
  },
  openGraph: {
    title: "Wormforce — Applied AI and Open-Source Software",
    description: teamProfile.seoDescription,
    url: absoluteUrl("/"),
    siteName: teamProfile.name,
    locale: "en_US",
    type: "website",
    images: [
      {
        url: absoluteUrl("/brand/wormforce-app-icon-1024.png"),
        width: 1024,
        height: 1024,
        alt: "Wormforce",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Wormforce — Applied AI and Open-Source Software",
    description: teamProfile.seoDescription,
    images: [absoluteUrl("/brand/wormforce-app-icon-1024.png")],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${spaceMono.variable} bg-[var(--color-bg)] text-[var(--color-text)] antialiased`}
      >
        <div className="relative flex min-h-screen flex-col">
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </div>
        {process.env.VERCEL ? <Analytics /> : null}
      </body>
    </html>
  );
}
