import { useEffect, useRef, useState } from "react";
import { experience, sectionNumber, sections } from "@data";
import Section from "@components/section";

const lineOffset = "left-2 md:left-[calc(50%+6rem+1.5rem)]";

export default function Experience() {
  const listRef = useRef<HTMLOListElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const [reachedCount, setReachedCount] = useState(0);

  useEffect(() => {
    const update = () => {
      const list = listRef.current;
      if (!list) return;
      const rect = list.getBoundingClientRect();
      const focusLine = window.innerHeight * 0.6;
      const progress = Math.min(Math.max((focusLine - rect.top) / rect.height, 0), 1);
      if (fillRef.current) fillRef.current.style.transform = `scaleY(${progress})`;
      if (dotRef.current) {
        dotRef.current.style.top = `${progress * 100}%`;
        dotRef.current.style.opacity = progress > 0 ? "1" : "0";
      }
      const items = Array.from(list.querySelectorAll<HTMLElement>("[data-timeline-item]"));
      setReachedCount(
        items.filter((item) => item.getBoundingClientRect().top + 24 < focusLine).length,
      );
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <Section id="experience" index={sectionNumber("experience")} title={sections.experience.title}>
      <ol ref={listRef} className="relative">
        <div aria-hidden className={`absolute top-0 bottom-0 w-px bg-line ${lineOffset}`}>
          <div
            ref={fillRef}
            className="absolute inset-0 origin-top bg-gradient-to-b from-accent-2 via-accent-2 to-accent"
            style={{ transform: "scaleY(0)" }}
          />
          <div
            ref={dotRef}
            className="absolute left-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent opacity-0 shadow-[0_0_20px_6px_rgba(212,255,79,0.45)] transition-opacity"
          />
        </div>

        {experience.map((item, index) => {
          const reached = index < reachedCount;
          return (
            <li
              key={item.role + item.company}
              data-timeline-item
              className="grid gap-3 py-10 pl-10 md:grid-cols-[1fr_12rem_1fr] md:items-start md:gap-x-12 md:pl-0"
            >
              <div
                className={`transition-all duration-700 md:text-right ${reached ? "opacity-100" : "opacity-40 md:translate-x-4"}`}
              >
                <h3 className="text-2xl font-medium">{item.role}</h3>
                <p className="mt-1 text-mute">{item.company}</p>
              </div>
              <p
                className={`font-serif text-3xl leading-none whitespace-nowrap transition-colors duration-700 md:text-center ${
                  reached ? "text-paper" : "text-mute/50"
                }`}
              >
                {item.period}
              </p>
              <p
                className={`leading-relaxed text-paper/70 transition-all duration-700 md:pl-6 ${
                  reached ? "opacity-100" : "opacity-40 md:-translate-x-4"
                }`}
              >
                {item.summary}
              </p>
            </li>
          );
        })}
      </ol>
    </Section>
  );
}
