import { lazy, Suspense, useCallback, useEffect, useRef } from "react";
import { profile } from "@data";
import RoleSwap from "@components/role-swap";
import { centeredHeroTextLeft, heroWideBreakpoint } from "@/lib/hero-layout";

const HeroScene = lazy(() => import("@components/hero-scene"));

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const textRef = useRef<HTMLDivElement>(null);
  const textLeftRef = useRef(0);
  const stageRef = useRef<HTMLDivElement>(null);

  const moveGlow = useCallback((centerPx: number) => {
    if (glowRef.current) glowRef.current.style.left = `${Math.round(centerPx)}px`;
  }, []);

  useEffect(() => {
    const measureText = () => {
      const text = textRef.current;
      const stage = stageRef.current;
      if (!text || !stage) return;
      const { width, height } = stage.getBoundingClientRect();
      text.style.marginLeft =
        width >= heroWideBreakpoint
          ? `${Math.round(centeredHeroTextLeft(width, height, text.offsetWidth))}px`
          : "";
      textLeftRef.current = text.getBoundingClientRect().left;
    };
    measureText();
    document.fonts?.ready.then(measureText);
    const observer = new ResizeObserver(measureText);
    if (textRef.current) observer.observe(textRef.current);
    window.addEventListener("resize", measureText);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measureText);
    };
  }, []);

  useEffect(() => {
    const updateProgress = () => {
      const section = sectionRef.current;
      if (!section) return;
      const scrollable = section.offsetHeight - window.innerHeight;
      const progress =
        scrollable > 0
          ? Math.min(Math.max(-section.getBoundingClientRect().top / scrollable, 0), 1)
          : 0;
      progressRef.current = progress;
      if (copyRef.current) {
        copyRef.current.style.opacity = String(Math.max(1 - progress * 1.8, 0));
        copyRef.current.style.transform = `translate3d(0, ${progress * -80}px, 0)`;
      }
      if (hintRef.current) hintRef.current.style.opacity = String(Math.max(1 - progress * 4, 0));
      if (glowRef.current) glowRef.current.style.opacity = String(Math.max(1 - progress * 1.4, 0));
      if (overlayRef.current)
        overlayRef.current.style.opacity = String(Math.max(1 - progress * 1.6, 0));
    };
    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
    };
  }, []);

  return (
    <section id="top" ref={sectionRef} className="relative h-[190svh]">
      <div className="sticky top-0 flex h-svh items-center overflow-hidden">
        <div
          ref={glowRef}
          aria-hidden
          className="pointer-events-none absolute top-[2%] left-1/2 h-[70%] w-[90%] -translate-x-1/2 bg-[radial-gradient(closest-side,rgba(124,108,255,0.42),rgba(124,108,255,0.12)_55%,transparent)] md:top-auto md:bottom-[-12%] md:h-[85%] md:w-[48%] md:max-w-[900px]"
        />
        <div ref={stageRef} className="absolute inset-0">
          <Suspense fallback={null}>
            <HeroScene
              progressRef={progressRef}
              textLeftRef={textLeftRef}
              onAvatarMove={moveGlow}
            />
          </Suspense>
        </div>
        <div
          ref={overlayRef}
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent from-20% via-ink/85 via-45% to-ink/90 md:bg-gradient-to-l md:from-ink md:from-0% md:via-ink/20 md:via-50% md:to-transparent"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink to-transparent" />

        <div
          ref={copyRef}
          className="pointer-events-none relative flex w-full items-center px-5 pt-24 will-change-transform md:px-0 md:pt-0"
        >
          <div ref={textRef} className="max-w-xl md:shrink-0">
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
        </div>

        <div
          ref={hintRef}
          className="pointer-events-none absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3"
        >
          <span className="relative h-10 w-px overflow-hidden bg-line">
            <span className="absolute inset-0 animate-scroll-hint bg-accent motion-reduce:animate-none" />
          </span>
        </div>
      </div>
    </section>
  );
}
