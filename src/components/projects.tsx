import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type PointerEvent,
} from "react";
import { projects, sectionNumber, sections, type Project } from "@data";

const text = sections.work;
import Reveal from "@components/reveal";

const gutter = "px-5 md:px-[max(2rem,calc((100vw-72rem)/2+2rem))]";
const snapGutter = "scroll-px-5 md:scroll-px-[max(2rem,calc((100vw-72rem)/2+2rem))]";

function Cover({ project, index }: { project: Project; index: number }) {
  if (project.image) {
    return (
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-line bg-ink-2 sm:aspect-[16/10]">
        <img
          src={project.image}
          alt={`${project.title} ${text.previewLabel}`}
          loading="lazy"
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>
    );
  }

  const { hue, title } = project;
  return (
    <div
      className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-line sm:aspect-[16/10]"
      style={{
        background: `radial-gradient(120% 90% at 20% 10%, hsl(${hue} 90% 60% / 0.55), transparent 60%),
                     radial-gradient(90% 90% at 90% 100%, hsl(${(hue + 60) % 360} 80% 55% / 0.45), transparent 60%),
                     #121217`,
      }}
    >
      <div
        className="absolute inset-0 opacity-30 transition-transform duration-700 group-hover:scale-110"
        style={{
          backgroundImage:
            "linear-gradient(#ffffff14 1px, transparent 1px), linear-gradient(90deg, #ffffff14 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      <span className="absolute top-5 left-6 font-mono text-xs tracking-widest text-paper/70">
        {String(index + 1).padStart(2, "0")}
      </span>
      <span className="absolute bottom-5 left-6 font-serif text-5xl text-paper/95 italic md:text-7xl">
        {title}
      </span>
    </div>
  );
}

function Slide({
  project,
  index,
  active,
  total,
}: {
  project: Project;
  index: number;
  active: boolean;
  total: number;
}) {
  return (
    <article
      aria-roledescription="slide"
      aria-label={`${index + 1} ${text.slideOfLabel} ${total}: ${project.title}`}
      className={`group w-[85vw] shrink-0 snap-start transition-opacity duration-500 sm:w-[70vw] lg:w-[min(56rem,64vw)] ${
        active ? "opacity-100" : "opacity-40"
      }`}
    >
      <Cover project={project} index={index} />
      <div className="mt-6 grid gap-6 md:grid-cols-[1.4fr_1fr]">
        <div>
          <div className="flex items-baseline gap-4">
            <h3 className="text-2xl font-medium">{project.title}</h3>
            <span className="font-mono text-xs text-mute">{project.year}</span>
          </div>
          <p className="mt-3 max-w-xl leading-relaxed text-paper/70">{project.description}</p>
        </div>
        <div className="flex flex-col gap-5 md:items-end">
          <ul className="flex flex-wrap gap-2 md:justify-end">
            {project.tags.map((tag) => (
              <li
                key={tag}
                className="rounded-full border border-line px-3 py-1 font-mono text-[11px] text-mute"
              >
                {tag}
              </li>
            ))}
          </ul>
          <div className="flex gap-5 text-sm">
            {project.href && (
              <a
                href={project.href}
                className="text-accent underline-offset-4 hover:underline"
                draggable={false}
              >
                {text.liveLabel} ↗
              </a>
            )}
            {project.repo && (
              <a
                href={project.repo}
                className="text-mute underline-offset-4 hover:text-paper hover:underline"
                draggable={false}
              >
                {text.sourceLabel} ↗
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

function ArrowButton({
  direction,
  disabled,
  onClick,
}: {
  direction: "prev" | "next";
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === "prev" ? text.previousLabel : text.nextLabel}
      className="flex h-12 w-12 items-center justify-center rounded-full border border-line transition-colors hover:border-accent hover:text-accent disabled:pointer-events-none disabled:opacity-30"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden
      >
        {direction === "prev" ? <path d="M15 5l-7 7 7 7" /> : <path d="M9 5l7 7-7 7" />}
      </svg>
    </button>
  );
}

export default function Projects() {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragState = useRef({ active: false, moved: false, startX: 0, startScroll: 0 });
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const total = projects.length;

  const slideElements = () =>
    Array.from(trackRef.current?.querySelectorAll<HTMLElement>("article") ?? []);

  const updateActiveIndex = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const slides = slideElements();
    const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
    if (atEnd) {
      setActiveIndex(slides.length - 1);
      return;
    }
    const firstOffset = slides[0]?.offsetLeft ?? 0;
    let nearest = 0;
    let nearestDistance = Infinity;
    slides.forEach((slide, index) => {
      const distance = Math.abs(slide.offsetLeft - firstOffset - track.scrollLeft);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearest = index;
      }
    });
    setActiveIndex(nearest);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    track.addEventListener("scroll", updateActiveIndex, { passive: true });
    window.addEventListener("resize", updateActiveIndex);
    return () => {
      track.removeEventListener("scroll", updateActiveIndex);
      window.removeEventListener("resize", updateActiveIndex);
    };
  }, [updateActiveIndex]);

  const goTo = (index: number) => {
    const track = trackRef.current;
    const slides = slideElements();
    const target = slides[Math.max(0, Math.min(index, slides.length - 1))];
    if (!track || !target) return;
    const firstOffset = slides[0].offsetLeft;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    track.scrollTo({
      left: target.offsetLeft - firstOffset,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || !trackRef.current) return;
    dragState.current = {
      active: true,
      moved: false,
      startX: event.clientX,
      startScroll: trackRef.current.scrollLeft,
    };
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragState.current;
    if (!drag.active || !trackRef.current) return;
    const deltaX = event.clientX - drag.startX;
    if (!drag.moved && Math.abs(deltaX) > 5) {
      drag.moved = true;
      setIsDragging(true);
      trackRef.current.setPointerCapture(event.pointerId);
    }
    if (drag.moved) trackRef.current.scrollLeft = drag.startScroll - deltaX;
  };

  const endDrag = () => {
    const drag = dragState.current;
    if (!drag.active) return;
    drag.active = false;
    if (drag.moved) {
      setIsDragging(false);
      requestAnimationFrame(() => goTo(activeIndexFromScroll()));
    }
  };

  const activeIndexFromScroll = () => {
    const track = trackRef.current;
    const slides = slideElements();
    if (!track || slides.length === 0) return 0;
    const firstOffset = slides[0].offsetLeft;
    return slides.reduce(
      (best, slide, index) =>
        Math.abs(slide.offsetLeft - firstOffset - track.scrollLeft) <
        Math.abs(slides[best].offsetLeft - firstOffset - track.scrollLeft)
          ? index
          : best,
      0,
    );
  };

  const swallowClickAfterDrag = (event: MouseEvent) => {
    if (dragState.current.moved) {
      event.preventDefault();
      event.stopPropagation();
      dragState.current.moved = false;
    }
  };

  return (
    <section
      id="work"
      className="py-24 md:py-32"
      aria-roledescription="carousel"
      aria-label={text.title}
    >
      <Reveal className="mx-auto max-w-6xl px-5 md:px-8">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6 border-b border-line pb-6">
          <div className="flex items-end gap-6">
            <h2 className="font-serif text-5xl md:text-6xl">{text.title}</h2>
            <span className="eyebrow mb-2">{sectionNumber("work")}</span>
          </div>
          <div className="flex items-center gap-5">
            <p className="font-mono text-sm text-mute" aria-live="polite">
              <span className="text-paper">{String(activeIndex + 1).padStart(2, "0")}</span> /{" "}
              {String(total).padStart(2, "0")}
            </p>
            <div className="flex gap-2">
              <ArrowButton
                direction="prev"
                disabled={activeIndex === 0}
                onClick={() => goTo(activeIndex - 1)}
              />
              <ArrowButton
                direction="next"
                disabled={activeIndex === total - 1}
                onClick={() => goTo(activeIndex + 1)}
              />
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal delay={120}>
        <div
          ref={trackRef}
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "ArrowRight") {
              event.preventDefault();
              goTo(activeIndex + 1);
            }
            if (event.key === "ArrowLeft") {
              event.preventDefault();
              goTo(activeIndex - 1);
            }
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onPointerLeave={endDrag}
          onClickCapture={swallowClickAfterDrag}
          className={`no-scrollbar flex gap-6 overflow-x-auto pb-2 outline-none select-none md:gap-10 ${gutter} ${snapGutter} ${
            isDragging ? "cursor-grabbing snap-none" : "cursor-grab snap-x snap-mandatory"
          }`}
        >
          {projects.map((project, index) => (
            <Slide
              key={project.title}
              project={project}
              index={index}
              active={index === activeIndex}
              total={total}
            />
          ))}
          <div aria-hidden className="w-px shrink-0" />
        </div>
      </Reveal>

      <div className="mx-auto mt-10 max-w-6xl px-5 md:px-8">
        <div className="flex gap-2">
          {projects.map((project, index) => (
            <button
              key={project.title}
              type="button"
              onClick={() => goTo(index)}
              aria-label={`${text.goToLabel} ${project.title}`}
              aria-current={index === activeIndex}
              className="group h-6 flex-1"
            >
              <span
                className={`block h-0.5 w-full rounded-full transition-colors duration-500 ${
                  index <= activeIndex ? "bg-accent" : "bg-line group-hover:bg-mute"
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
