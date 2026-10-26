import { profile, sectionNumber, sections, skills } from "@data";
import Reveal from "@components/reveal";
import Section from "@components/section";

export default function About() {
  return (
    <Section id="about" index={sectionNumber("about")} title={sections.about.title}>
      <div className="grid gap-14 md:grid-cols-[1.3fr_1fr]">
        <Reveal className="space-y-6 text-lg leading-relaxed text-paper/80">
          {profile.about.map((para) => (
            <p key={para}>{para}</p>
          ))}
          <dl className="grid grid-cols-3 gap-6 pt-6">
            {profile.stats.map((s) => (
              <div key={s.label} className="border-t border-line pt-4">
                <dt className="sr-only">{s.label}</dt>
                <dd className="font-serif text-5xl text-accent">{s.value}</dd>
                <dd className="mt-1 text-sm text-mute">{s.label}</dd>
              </div>
            ))}
          </dl>
        </Reveal>

        <Reveal delay={120} className="space-y-8">
          {skills.map((g) => (
            <div key={g.group}>
              <h3 className="eyebrow mb-3">{g.group}</h3>
              <ul className="flex flex-wrap gap-2">
                {g.items.map((s) => (
                  <li key={s} className="rounded-md bg-ink-2 px-3 py-1.5 text-sm ring-1 ring-line">
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </Reveal>
      </div>
    </Section>
  );
}
