import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeftIcon, ArrowUpRightIcon } from "@phosphor-icons/react/ssr";
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
        className="text-white underline decoration-white/30 underline-offset-4 transition-colors hover:decoration-white"
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
      <section className="section-shell pt-10 md:pt-16">
        <div className="content-shell">
          <Link
            href="/#members"
            className="mono-label transition-colors hover:text-white"
          >
            <ArrowLeftIcon size={13} aria-hidden />
            Members
          </Link>

          <header className="reveal mt-12 md:mt-20">
            <h1 className="display-heading">{member.name}</h1>
            <p className="mt-6 whitespace-pre-line text-lg leading-8 text-[var(--color-text)] md:text-xl">
              {profileRole}
            </p>
            <p className="mt-3 whitespace-pre-line text-base leading-7 text-[var(--color-muted)]">
              {profileShortBio}
            </p>
          </header>

          <div className="mt-14 grid gap-12 border-t border-[var(--color-border)] pt-10 md:mt-20 md:grid-cols-[1fr_2fr] md:gap-10">
            <aside className="reveal">
              <div className="max-w-sm overflow-hidden rounded-xl bg-[var(--color-bg-soft)]">
                <MemberAvatar
                  src={member.avatar}
                  alt={member.name}
                  initials={member.name
                    .split(" ")
                    .map((part) => part[0])
                    .join("")
                    .slice(0, 2)}
                  className="aspect-[4/5] w-full"
                  sizes="(min-width: 1232px) 384px, (min-width: 768px) calc((100vw - 72px) / 3), (min-width: 416px) 384px, calc(100vw - 32px)"
                  priority
                  objectPosition={member.avatarObjectPosition ?? "center"}
                />
              </div>

              <h2 className="mono-label mt-10">Links</h2>
              <ul className="mt-4 max-w-sm border-t border-[var(--color-border)]">
                {member.links.map((link) => {
                  const isMail = link.url.startsWith("mailto:");

                  return (
                    <li key={`${member.slug}-${link.label}`} className="border-b border-[var(--color-border)]">
                      <a
                        href={link.url}
                        className="group flex min-h-12 items-center justify-between gap-4 text-sm text-[var(--color-text)] transition-colors hover:text-white"
                        target={isMail ? undefined : "_blank"}
                        rel={isMail ? undefined : "noopener noreferrer"}
                      >
                        {link.label}
                        <ArrowUpRightIcon
                          className="arrow-nudge text-[var(--color-muted)] group-hover:text-white"
                          size={14}
                          aria-hidden
                        />
                      </a>
                    </li>
                  );
                })}
              </ul>
            </aside>

            <div className="reveal min-w-0 space-y-16">
              {member.fullBio ? (
                <section aria-labelledby="profile-heading">
                  <h2 id="profile-heading" className="mono-label">Profile</h2>
                  <div className="mt-6 space-y-5 text-lg leading-8 text-[var(--color-text)] md:text-xl md:leading-9">
                    {member.fullBio.split(/\n{2,}/).map((paragraph, index) => (
                      <p key={`${member.slug}-bio-${index}`}>
                        {renderInlineLinks(paragraph)}
                      </p>
                    ))}
                  </div>
                </section>
              ) : null}

              <section aria-labelledby="skills-heading">
                <h2 id="skills-heading" className="mono-label">Core skills</h2>
                <ul className="mt-6 flex flex-wrap gap-2">
                  {member.skills.map((skill) => (
                    <li
                      key={skill}
                      className="rounded-full border border-[var(--color-border-strong)] px-3.5 py-1.5 text-sm text-[var(--color-text)]"
                    >
                      {skill}
                    </li>
                  ))}
                </ul>
              </section>

              {member.publications?.length ? (
                <section aria-labelledby="publications-heading">
                  <h2 id="publications-heading" className="mono-label">
                    Publications
                  </h2>
                  <ol className="mt-6 border-t border-[var(--color-border)]">
                    {member.publications.map((publication) => (
                      <li
                        key={`${member.slug}-${publication.title}`}
                        className="flex flex-col gap-3 border-b border-[var(--color-border)] py-6 sm:flex-row sm:items-start sm:justify-between sm:gap-8"
                      >
                        <div className="min-w-0">
                          {publication.url ? (
                            <a
                              href={publication.url}
                              className="text-base leading-7 font-medium text-white underline decoration-transparent underline-offset-4 transition-colors hover:decoration-white/60"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {publication.title}
                            </a>
                          ) : (
                            <p className="text-base leading-7 font-medium text-white">
                              {publication.title}
                            </p>
                          )}
                          <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
                            {publication.year
                              && !publication.venue.includes(String(publication.year))
                              ? `${publication.venue} · ${publication.year}`
                              : publication.venue}
                          </p>
                        </div>
                        {publication.pdfUrl ? (
                          <a
                            href={publication.pdfUrl}
                            className="mono-label shrink-0 transition-colors hover:text-white sm:pt-1.5"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            PDF
                            <ArrowUpRightIcon size={12} aria-hidden />
                          </a>
                        ) : null}
                      </li>
                    ))}
                  </ol>
                </section>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
