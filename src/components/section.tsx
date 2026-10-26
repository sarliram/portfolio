import type { ReactNode } from "react";
import Reveal from "@components/reveal";

type Props = { id: string; index: string; title: string; children: ReactNode };

export default function Section({ id, index, title, children }: Props) {
  return (
    <section id={id} className="mx-auto max-w-6xl px-5 py-24 md:px-8 md:py-32">
      <Reveal className="mb-14 flex items-end justify-between gap-6 border-b border-line pb-6">
        <h2 className="font-serif text-5xl md:text-6xl">{title}</h2>
        <span className="eyebrow">{index}</span>
      </Reveal>
      {children}
    </section>
  );
}
