import type { Metadata } from "next";
import { ContactSection } from "@/components/contact-section";
import { HeroSection } from "@/components/hero-section";
import { MembersSection } from "@/components/members-section";
import { ProjectsPreview } from "@/components/projects-preview";
import { TeamSection } from "@/components/team-section";
import { members } from "@/content/members";
import { teamProfile } from "@/content/site";
import { absoluteUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Home",
  description: teamProfile.tagline,
  alternates: {
    canonical: absoluteUrl("/"),
  },
  openGraph: {
    title: teamProfile.name,
    description: teamProfile.tagline,
    url: absoluteUrl("/"),
    type: "website",
  },
};

export default function Home() {
  return (
    <>
      <HeroSection team={teamProfile} memberCount={members.length} />
      <TeamSection team={teamProfile} />
      <MembersSection members={members} />
      <ProjectsPreview />
      <ContactSection team={teamProfile} />
    </>
  );
}
