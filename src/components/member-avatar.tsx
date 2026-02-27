"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

type MemberAvatarProps = {
  src: string;
  alt: string;
  initials: string;
  className?: string;
  priority?: boolean;
  /** "top" = top-center crop, "center" = default */
  objectPosition?: "top" | "center";
};

export function MemberAvatar({
  src,
  alt,
  initials,
  className,
  priority = false,
  objectPosition = "center",
}: MemberAvatarProps) {
  const [failed, setFailed] = useState(false);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {failed ? (
        <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(140deg,#262626,#101010)] text-3xl font-semibold text-[var(--color-text)]">
          {initials}
        </div>
      ) : (
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 320px, (min-width: 768px) 40vw, 100vw"
          className={cn(
            "object-cover",
            objectPosition === "top" && "object-top",
          )}
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
