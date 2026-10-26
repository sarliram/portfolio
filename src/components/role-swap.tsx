import { useEffect, useState } from "react";

type Props = { words: string[]; interval?: number };

export default function RoleSwap({ words, interval = 2600 }: Props) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (words.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(
      () => setIndex((current) => (current + 1) % words.length),
      interval,
    );
    return () => window.clearInterval(timer);
  }, [words.length, interval]);

  const current = words[index] ?? "";
  const previous = words[(index - 1 + words.length) % words.length] ?? "";

  return (
    <span className="block h-[2em] overflow-hidden leading-none" aria-live="polite">
      <span key={index} className="animate-role-roll block motion-reduce:animate-none">
        <span aria-hidden className="text-role-faded block h-[1em]">
          {previous}
        </span>
        <span className="block h-[1em] text-paper">{current}</span>
      </span>
      <span aria-hidden className="invisible block h-0 overflow-hidden">
        {words.map((word) => (
          <span key={word} className="block">
            {word}
          </span>
        ))}
      </span>
    </span>
  );
}
