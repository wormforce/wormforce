import Link from "next/link";
import { ArrowUpRightIcon } from "@phosphor-icons/react/ssr";
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
    <Link href={`/members/${member.slug}`} className="reveal group block">
      <div className="overflow-hidden rounded-xl bg-[var(--color-bg-soft)]">
        <MemberAvatar
          src={member.avatar}
          alt=""
          initials={initials}
          sizes="(min-width: 1232px) 384px, (min-width: 1024px) calc((100vw - 80px) / 3), (min-width: 640px) calc((100vw - 56px) / 2), calc(100vw - 32px)"
          className="media-zoom aspect-[4/3] w-full sm:aspect-[4/5]"
          objectPosition={member.avatarObjectPosition ?? "center"}
        />
      </div>

      <div className="mt-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-medium tracking-tight text-white">{member.name}</h3>
          <p className="mt-1 text-sm text-[var(--color-muted)]">{member.role}</p>
        </div>
        <ArrowUpRightIcon
          className="arrow-nudge mt-1 shrink-0 text-[var(--color-muted)] transition-colors group-hover:text-white"
          size={18}
          aria-hidden
        />
      </div>
      <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">
        {member.shortBio}
      </p>
    </Link>
  );
}
