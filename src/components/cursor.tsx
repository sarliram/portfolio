import { useEffect, useRef } from "react";

const interactiveSelector = "a, button, [role='button'], input, textarea, select";

export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!finePointer || reduceMotion || !dot || !ring) return;

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const ringPosition = { ...target };
    let frame = 0;
    let visible = false;

    const setVisible = (next: boolean) => {
      if (visible === next) return;
      visible = next;
      dot.style.opacity = next ? "1" : "0";
      ring.style.opacity = next ? "1" : "0";
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      target.x = event.clientX;
      target.y = event.clientY;
      dot.style.transform = `translate3d(${target.x}px, ${target.y}px, 0) translate(-50%, -50%)`;
      setVisible(true);
      const hovering = event.target instanceof Element && event.target.closest(interactiveSelector);
      ring.dataset.hover = hovering ? "true" : "false";
    };

    const onLeave = () => setVisible(false);
    const onDown = () => (ring.dataset.pressed = "true");
    const onUp = () => (ring.dataset.pressed = "false");

    const tick = () => {
      ringPosition.x += (target.x - ringPosition.x) * 0.16;
      ringPosition.y += (target.y - ringPosition.y) * 0.16;
      ring.style.transform = `translate3d(${ringPosition.x}px, ${ringPosition.y}px, 0) translate(-50%, -50%)`;
      frame = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    document.documentElement.addEventListener("pointerleave", onLeave);
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[60] hidden [@media(pointer:fine)]:block"
    >
      <div
        ref={ringRef}
        data-hover="false"
        data-pressed="false"
        className="absolute top-0 left-0 h-9 w-9 rounded-full border border-accent-2/70 opacity-0 transition-[width,height,background-color,border-color,opacity] duration-300 data-[hover=true]:h-16 data-[hover=true]:w-16 data-[hover=true]:border-accent/60 data-[hover=true]:bg-accent/10 data-[pressed=true]:h-7 data-[pressed=true]:w-7 motion-reduce:hidden"
      />
      <div
        ref={dotRef}
        className="absolute top-0 left-0 h-2.5 w-2.5 rounded-full bg-accent-2 opacity-0 shadow-[0_0_16px_4px_rgba(124,108,255,0.7)] transition-opacity duration-300 motion-reduce:hidden"
      />
    </div>
  );
}
