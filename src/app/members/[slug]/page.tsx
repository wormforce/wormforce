import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { JsonLd } from "@/components/json-ld";
import { MemberAvatar } from "@/components/member-avatar";
import { getMemberBySlug, members } from "@/content/members";
import { absoluteUrl } from "@/lib/utils";
import { memberStructuredData } from "@/lib/structured-data";

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
    title: `${member.name} — ${member.role}`,
    description: member.seoDescription,
    alternates: {
      canonical: profileUrl,
    },
    openGraph: {
      title: `${member.name} | Wormforce`,
      description: member.seoDescription,
      url: profileUrl,
      type: "profile",
      images: [
        {
          url: absoluteUrl(member.avatar),
          alt: member.name,
        },
      ],
    },
    twitter: {
      card: "summary",
      title: `${member.name} | Wormforce`,
      description: member.seoDescription,
      images: [absoluteUrl(member.avatar)],
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
        className="font-semibold text-white underline decoration-white/55 underline-offset-4 transition hover:text-[var(--color-brand)] hover:decoration-white"
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
    <>
      <JsonLd data={memberStructuredData(member)} />
      <section className="section-shell pt-24">
        <div className="content-shell">
          <Link
            href="/#members"
            className="mono-label inline-flex items-center transition hover:text-white"
          >
            {"<-"} Back to members
          </Link>

          <div className="mt-6 grid items-start gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
            <aside className="card-surface reveal rounded-3xl p-5">
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
                objectPosition={member.avatarObjectPosition ?? "center"}
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
            </aside>

            <article className="card-surface reveal rounded-3xl p-6 md:p-8">
              {member.fullBio ? (
                <>
                  <h2 className="text-2xl font-semibold text-white">Profile</h2>
                  <div className="mt-4 space-y-4 text-sm leading-8 text-[var(--color-muted)] md:text-base">
                    {member.fullBio.split(/\n{2,}/).map((paragraph, index) => (
                      <p key={`${member.slug}-bio-${index}`}>
                        {renderInlineLinks(paragraph)}
                      </p>
                    ))}
                  </div>
                </>
              ) : null}

              <h3
                className={
                  member.fullBio
                    ? "mt-8 text-lg font-semibold text-white"
                    : "text-lg font-semibold text-white"
                }
              >
                Core Skills
              </h3>
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
            </article>

            {member.publications?.length ? (
              <section
                aria-labelledby="publications-heading"
                className="card-surface reveal rounded-3xl p-6 md:p-8 lg:col-span-2"
              >
                <h2
                  id="publications-heading"
                  className="text-2xl font-semibold text-white"
                >
                  Publications
                </h2>
                <ul className="mt-6 grid gap-4 xl:grid-cols-2">
                  {member.publications.map((publication) => (
                    <li
                      key={`${member.slug}-${publication.title}`}
                      className="flex h-full flex-col justify-between rounded-2xl border border-[var(--color-border)] bg-[var(--color-brand-soft)] p-5"
                    >
                      <div>
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
                        <p className="mt-2 text-xs leading-6 text-[var(--color-muted)]">
                          {publication.year
                            ? `${publication.venue} (${publication.year})`
                            : publication.venue}
                        </p>
                      </div>
                      {publication.pdfUrl ? (
                        <a
                          href={publication.pdfUrl}
                          className="mt-4 inline-flex text-xs text-[var(--color-muted)] transition hover:text-white"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          PDF
                        </a>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </div>
        </div>
      </section>
    </>
  );
}
