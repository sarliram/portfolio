import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { sectionNumber, sections, skills } from "@data";
import type { PointerState } from "@components/tech-stack-scene";
import Reveal from "@components/reveal";

const loadTechStackScene = () => import("@components/tech-stack-scene");
const TechStackScene = lazy(loadTechStackScene);

export default function TechStack() {
  const containerRef = useRef<HTMLDivElement>(null);
  const pointerState = useRef<PointerState>({ active: false, burst: 0 });
  const [nearView, setNearView] = useState(false);
  const [inView, setInView] = useState(false);
  const labels = useMemo(() => Array.from(new Set(skills.flatMap((group) => group.items))), []);

  useEffect(() => {
    const preload = () => void loadTechStackScene();
    if (typeof window.requestIdleCallback === "function") {
      const idleHandle = window.requestIdleCallback(preload, { timeout: 2500 });
      return () => window.cancelIdleCallback(idleHandle);
    }
    const timeoutHandle = window.setTimeout(preload, 1500);
    return () => window.clearTimeout(timeoutHandle);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const nearObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNearView(true);
          nearObserver.disconnect();
        }
      },
      { rootMargin: "100% 0px" },
    );
    const visibleObserver = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.1,
    });
    nearObserver.observe(container);
    visibleObserver.observe(container);
    return () => {
      nearObserver.disconnect();
      visibleObserver.disconnect();
    };
  }, []);

  return (
    <section id="stack" className="relative overflow-hidden py-24 md:py-32">
      <Reveal className="pointer-events-none relative z-10 mx-auto max-w-6xl px-5 text-center md:px-8">
        <p className="eyebrow mb-4">
          {sectionNumber("stack")} — {sections.stack.eyebrow}
        </p>
        <h2 className="font-serif text-5xl md:text-7xl">{sections.stack.title}</h2>
        <p className="mt-4 text-sm text-mute">{sections.stack.hint}</p>
      </Reveal>
      <div
        ref={containerRef}
        className="relative mt-6 h-[70svh] min-h-[420px] w-full cursor-pointer"
        onPointerEnter={() => (pointerState.current.active = true)}
        onPointerLeave={() => (pointerState.current.active = false)}
        onPointerDown={() => (pointerState.current.burst += 1)}
      >
        {nearView && (
          <Suspense fallback={null}>
            <TechStackScene labels={labels} pointerState={pointerState} active={inView} />
          </Suspense>
        )}
      </div>
      <ul className="sr-only">
        {labels.map((label) => (
          <li key={label}>{label}</li>
        ))}
      </ul>
    </section>
  );
}
