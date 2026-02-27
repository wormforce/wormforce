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
};

export function MemberAvatar({
  src,
  alt,
  initials,
  className,
  priority = false,
}: MemberAvatarProps) {
  const [failed, setFailed] = useState(false);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {failed ? (
        <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(140deg,#10253f,#0b1729)] text-3xl font-semibold text-[var(--color-brand)]">
          {initials}
        </div>
      ) : (
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 320px, (min-width: 768px) 40vw, 100vw"
          className="object-cover"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
