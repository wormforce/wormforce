import { MemberCard } from "@/components/member-card";
import type { MemberProfile } from "@/content/members";

type MembersSectionProps = {
  members: MemberProfile[];
};

export function MembersSection({ members }: MembersSectionProps) {
  return (
    <section id="members" className="section-shell">
      <div className="content-shell">
        <div className="reveal max-w-2xl">
          <p className="mono-label">Members</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-4xl">
            Core Team
          </h2>
          <p className="mt-4 text-sm leading-7 text-[var(--color-muted)] md:text-base">
            Meet the three builders currently behind Wormforce. Each profile
            includes role scope, skill focus, and direct links.
          </p>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {members.map((member) => (
            <MemberCard key={member.slug} member={member} />
          ))}
        </div>
      </div>
    </section>
  );
}
