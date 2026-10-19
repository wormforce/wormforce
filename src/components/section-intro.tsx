import type { ReactNode } from "react";

type SectionIntroProps = {
  label: string;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  as?: "h1" | "h2";
};

export function SectionIntro({
  label,
  title,
  description,
  action,
  as: Heading = "h2",
}: SectionIntroProps) {
  return (
    <div className="reveal grid gap-6 border-t border-[var(--color-border)] pt-6 md:grid-cols-[1fr_2fr] md:gap-10">
      <p className="mono-label self-start">{label}</p>
      <div>
        <Heading className="wf-section-heading">{title}</Heading>
        {description || action ? (
          <div className="mt-5 flex flex-col items-start gap-6 md:flex-row md:items-end md:justify-between">
            {description ? (
              <p className="max-w-xl text-base leading-7 text-[var(--color-muted)] md:text-lg md:leading-8">
                {description}
              </p>
            ) : null}
            {action}
          </div>
        ) : null}
      </div>
    </div>
  );
}
