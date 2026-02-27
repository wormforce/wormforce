import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MemberAvatar } from "@/components/member-avatar";
import { getMemberBySlug, members } from "@/content/members";
import { absoluteUrl } from "@/lib/utils";

type MemberPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return members.map((member) => ({ slug: member.slug }));
}

export async function generateMetadata({
  params,
}: MemberPageProps): Promise<Metadata> {
  const { slug } = await params;
  const member = getMemberBySlug(slug);

  if (!member) {
    return {
      title: "Member Not Found",
      description: "The requested member profile does not exist.",
    };
  }

  const profileUrl = absoluteUrl(`/members/${member.slug}`);

  return {
    title: member.name,
    description: member.shortBio,
    alternates: {
      canonical: profileUrl,
    },
    openGraph: {
      title: `${member.name} | Wormforce`,
      description: member.shortBio,
      url: profileUrl,
      type: "profile",
    },
  };
}

export default async function MemberPage({ params }: MemberPageProps) {
  const { slug } = await params;
  const member = getMemberBySlug(slug);

  if (!member) {
    notFound();
  }

  return (
    <section className="section-shell pt-24">
      <div className="content-shell">
        <Link
          href="/#members"
          className="mono-label inline-flex items-center transition hover:text-[var(--color-brand)]"
        >
          {"<-"} Back to members
        </Link>

        <article className="mt-6 grid gap-8 lg:grid-cols-[320px_1fr]">
          <div className="card-surface reveal rounded-3xl p-5">
            <MemberAvatar
              src={member.avatar}
              alt={member.name}
              initials={member.name
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)}
              className="h-[280px] w-full rounded-2xl border border-[var(--color-border)]"
              priority
            />
            <h1 className="mt-5 text-2xl font-semibold text-white">
              {member.name}
            </h1>
            <p className="mt-2 text-sm text-[var(--color-brand)]">{member.role}</p>
            <p className="mt-4 text-sm leading-7 text-[var(--color-muted)]">
              {member.shortBio}
            </p>
          </div>

          <div className="card-surface reveal rounded-3xl p-6 md:p-8">
            <h2 className="text-2xl font-semibold text-white">Profile</h2>
            <p className="mt-4 text-sm leading-8 text-[var(--color-muted)] md:text-base">
              {member.fullBio}
            </p>

            <h3 className="mt-8 text-lg font-semibold text-white">Core Skills</h3>
            <ul className="mt-4 flex flex-wrap gap-2">
              {member.skills.map((skill) => (
                <li
                  key={skill}
                  className="rounded-full border border-[var(--color-border)] bg-[var(--color-brand-soft)] px-3 py-1.5 text-xs font-medium text-[var(--color-brand)]"
                >
                  {skill}
                </li>
              ))}
            </ul>

            <h3 className="mt-8 text-lg font-semibold text-white">Links</h3>
            <div className="mt-4 flex flex-wrap gap-3">
              {member.links.map((link) => (
                <a
                  key={`${member.slug}-${link.label}`}
                  href={link.url}
                  className="rounded-full border border-[var(--color-border)] px-4 py-2 text-sm text-[var(--color-muted)] transition hover:border-[var(--color-brand)] hover:text-[var(--color-brand)]"
                  target={link.url.startsWith("mailto:") ? undefined : "_blank"}
                  rel={
                    link.url.startsWith("mailto:")
                      ? undefined
                      : "noopener noreferrer"
                  }
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
