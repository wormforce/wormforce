import { MemberCard } from "@/components/member-card";
import { SectionIntro } from "@/components/section-intro";
import type { MemberProfile } from "@/content/members";

type MembersSectionProps = {
  members: MemberProfile[];
};

export function MembersSection({ members }: MembersSectionProps) {
  return (
    <section id="members" className="section-shell">
      <div className="content-shell">
        <SectionIntro
          label="Members"
          title="The people behind the work"
          description={`Wormforce is ${members.length} builders spanning research, product, and engineering.`}
        />

        <ul className="mt-14 grid gap-x-6 gap-y-12 sm:grid-cols-2 md:mt-20 lg:grid-cols-3">
          {members.map((member) => (
            <li key={member.slug}>
              <MemberCard member={member} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
