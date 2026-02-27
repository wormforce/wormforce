import Link from "next/link";
import { MemberAvatar } from "@/components/member-avatar";
import type { MemberProfile } from "@/content/members";

type MemberCardProps = {
  member: MemberProfile;
};

export function MemberCard({ member }: MemberCardProps) {
  const initials = member.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);

  return (
    <article className="card-surface reveal group rounded-3xl p-4 transition hover:-translate-y-0.5 hover:border-[var(--color-brand)] md:p-5">
      <MemberAvatar
        src={member.avatar}
        alt={member.name}
        initials={initials}
        className="aspect-[4/3] w-full rounded-2xl border border-[var(--color-border)]"
      />

      <div className="mt-4">
        <h3 className="text-xl font-semibold text-white">{member.name}</h3>
        <p className="mt-1 text-sm text-[var(--color-brand)]">{member.role}</p>
        <p className="mt-3 text-sm leading-7 text-[var(--color-muted)]">
          {member.shortBio}
        </p>
      </div>

      <div className="mt-5">
        <Link
          href={`/members/${member.slug}`}
          className="inline-flex items-center text-sm font-medium text-[var(--color-text)] transition group-hover:text-[var(--color-brand)]"
        >
          View profile {"->"}
        </Link>
      </div>
    </article>
  );
}
