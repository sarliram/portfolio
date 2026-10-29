import { profile } from "@data";
import HeroCopy from "@components/hero-copy";

type PortraitHeroProps = {
  portrait: string;
};

export default function PortraitHero({ portrait }: PortraitHeroProps) {
  return (
    <section id="top" className="relative flex min-h-svh items-center overflow-hidden">
      <div className="relative flex w-full flex-col items-start gap-6 px-5 pt-28 pb-28 lg:flex-row lg:items-center lg:justify-center lg:gap-x-[clamp(16px,3vw,64px)] lg:px-10 lg:py-24">
        <div className="relative self-center lg:self-auto">
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-[18%] bg-[radial-gradient(closest-side,rgba(124,108,255,0.38),rgba(124,108,255,0.1)_55%,transparent)]"
          />
          <img
            src={portrait}
            alt={profile.name}
            width={1024}
            height={1024}
            fetchPriority="high"
            className="relative aspect-square w-[clamp(340px,54vmin,580px)] object-cover mask-x-from-76% mask-t-from-86% mask-b-from-58%"
          />
        </div>
        <HeroCopy className="max-w-xl min-w-0" />
      </div>
      <div className="pointer-events-none absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3">
        <span className="relative h-10 w-px overflow-hidden bg-line">
          <span className="absolute inset-0 animate-scroll-hint bg-accent motion-reduce:animate-none" />
        </span>
      </div>
    </section>
  );
}
