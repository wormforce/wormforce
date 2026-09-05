import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import { ContactSection } from "@/components/contact-section";
import { HeroSection } from "@/components/hero-section";
import { MembersSection } from "@/components/members-section";
import { ProjectsPreview } from "@/components/projects-preview";
import { TeamSection } from "@/components/team-section";
import { members } from "@/content/members";
import { teamProfile } from "@/content/site";
import { absoluteUrl } from "@/lib/utils";
import { homeStructuredData } from "@/lib/structured-data";

const homeTitle = "Wormforce — Applied AI and Open-Source Software";
const homeDescription = teamProfile.seoDescription;

export const metadata: Metadata = {
  title: { absolute: homeTitle },
  description: homeDescription,
  alternates: {
    canonical: absoluteUrl("/"),
  },
  openGraph: {
    title: homeTitle,
    description: homeDescription,
    url: absoluteUrl("/"),
    siteName: teamProfile.name,
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
    title: homeTitle,
    description: homeDescription,
    images: [absoluteUrl("/brand/wormforce-app-icon-1024.png")],
  },
};

export default function Home() {
  return (
    <>
      <JsonLd data={homeStructuredData(members)} />
      <HeroSection team={teamProfile} memberCount={members.length} />
      <ProjectsPreview />
      <MembersSection members={members} />
      <TeamSection team={teamProfile} />
      <ContactSection team={teamProfile} />
    </>
  );
}
