import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
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
    description: member.profileShortBio ?? member.shortBio,
    alternates: {
      canonical: profileUrl,
    },
    openGraph: {
      title: `${member.name} | Wormforce`,
      description: member.profileShortBio ?? member.shortBio,
      url: profileUrl,
      type: "profile",
    },
  };
}

function renderInlineLinks(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const linkPattern = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
  let lastIndex = 0;
  let match = linkPattern.exec(text);

  while (match) {
    const [fullMatch, label, url] = match;
    const matchIndex = match.index;

    if (matchIndex > lastIndex) {
      nodes.push(text.slice(lastIndex, matchIndex));
    }

    nodes.push(
      <a
        key={`${url}-${matchIndex}`}
        href={url}
        className="mx-0.5 inline-flex items-center rounded-md border border-white/20 bg-white/10 px-1.5 py-0.5 font-semibold text-white transition hover:border-white hover:bg-white hover:text-black"
        target="_blank"
        rel="noopener noreferrer"
      >
        {label}
      </a>,
    );

    lastIndex = matchIndex + fullMatch.length;
    match = linkPattern.exec(text);
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

export default async function MemberPage({ params }: MemberPageProps) {
  const { slug } = await params;
  const member = getMemberBySlug(slug);

  if (!member) {
    notFound();
  }

  const profileRole = member.profileRole ?? member.role;
  const profileShortBio = member.profileShortBio ?? member.shortBio;

  return (
    <section className="section-shell pt-24">
      <div className="content-shell">
        <Link
          href="/#members"
          className="mono-label inline-flex items-center transition hover:text-white"
        >
          {"<-"} Back to members
        </Link>

        <article className="mt-6 grid items-start gap-8 lg:grid-cols-[320px_1fr]">
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
            <p className="mt-2 whitespace-pre-line text-sm text-[var(--color-muted)]">
              {profileRole}
            </p>
            <p className="mt-4 whitespace-pre-line text-sm leading-7 text-[var(--color-muted)]">
              {profileShortBio}
            </p>
          </div>

          <div className="card-surface reveal rounded-3xl p-6 md:p-8">
            <h2 className="text-2xl font-semibold text-white">Profile</h2>
            <div className="mt-4 space-y-4 text-sm leading-8 text-[var(--color-muted)] md:text-base">
              {member.fullBio.split(/\n{2,}/).map((paragraph, index) => (
                <p key={`${member.slug}-bio-${index}`}>
                  {renderInlineLinks(paragraph)}
                </p>
              ))}
            </div>

            <h3 className="mt-8 text-lg font-semibold text-white">Core Skills</h3>
            <ul className="mt-4 flex flex-wrap gap-2">
              {member.skills.map((skill) => (
                <li
                  key={skill}
                  className="rounded-full border border-[var(--color-border)] bg-[var(--color-brand-soft)] px-3 py-1.5 text-xs font-medium text-[var(--color-text)]"
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
                  className="rounded-full border border-[var(--color-border)] px-4 py-2 text-sm text-[var(--color-muted)] transition hover:border-[var(--color-text)] hover:text-white"
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

            {member.publications?.length ? (
              <>
                <h3 className="mt-8 text-lg font-semibold text-white">
                  Publications
                </h3>
                <ul className="mt-4 space-y-3">
                  {member.publications.map((publication) => (
                    <li
                      key={`${member.slug}-${publication.title}`}
                      className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-brand-soft)] p-4"
                    >
                      {publication.url ? (
                        <a
                          href={publication.url}
                          className="text-sm font-semibold text-white transition hover:underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {publication.title}
                        </a>
                      ) : (
                        <p className="text-sm font-semibold text-white">
                          {publication.title}
                        </p>
                      )}
                      {publication.authors ? (
                        <p className="mt-1 text-xs leading-6 text-[var(--color-muted)]">
                          {publication.authors}
                        </p>
                      ) : null}
                      <p className="mt-1 text-xs leading-6 text-[var(--color-muted)]">
                        {publication.year
                          ? `${publication.venue} (${publication.year})`
                          : publication.venue}
                      </p>
                      {publication.pdfUrl ? (
                        <a
                          href={publication.pdfUrl}
                          className="mt-2 inline-flex text-xs text-[var(--color-muted)] transition hover:text-white"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          PDF
                        </a>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </div>
        </article>
      </div>
    </section>
  );
}
