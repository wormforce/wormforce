import type { Metadata } from "next";
import { Space_Grotesk, Space_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "@/styles/globals.css";
import "@/styles/battuta.css";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { teamProfile } from "@/content/site";
import { absoluteUrl } from "@/lib/utils";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(absoluteUrl("/")),
  title: {
    default: "Wormforce",
    template: "%s | Wormforce",
  },
  description: teamProfile.description,
  keywords: [
    "Wormforce",
    "team website",
    "engineering team",
    "AI",
    "product development",
  ],
  alternates: {
    canonical: absoluteUrl("/"),
  },
  openGraph: {
    title: teamProfile.name,
    description: teamProfile.tagline,
    url: absoluteUrl("/"),
    siteName: teamProfile.name,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: teamProfile.name,
    description: teamProfile.tagline,
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
        className={`${spaceGrotesk.variable} ${spaceMono.variable} bg-[var(--color-bg)] text-[var(--color-text)] antialiased`}
      >
        <div className="site-radial-bg" aria-hidden />
        <div className="relative min-h-screen">
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
        </div>
        <Analytics />
      </body>
    </html>
  );
}
