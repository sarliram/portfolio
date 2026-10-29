import type { Ref } from "react";
import { profile } from "@data";
import RoleSwap from "@components/role-swap";

type HeroCopyProps = {
  ref?: Ref<HTMLDivElement>;
  className?: string;
};

export default function HeroCopy({ ref, className }: HeroCopyProps) {
  return (
    <div ref={ref} className={className}>
      <p className="font-sans text-lg font-light tracking-wide text-mute md:text-xl">
        {profile.greeting}
      </p>
      <h1 className="mt-1 font-sans text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
        {profile.name}
        <span className="sr-only">, {profile.role}</span>
      </h1>
      <div className="mt-10 font-sans uppercase md:mt-14">
        <p className="text-2xl font-light tracking-tight text-paper/80 normal-case sm:text-3xl md:text-4xl">
          {profile.intro}
        </p>
        <p className="mt-2 text-5xl font-semibold tracking-tight sm:text-6xl md:text-6xl xl:text-8xl">
          <RoleSwap words={profile.roles} />
        </p>
      </div>
    </div>
  );
}
