import { fillTemplate, links, profile, sectionNumber, sections, site } from "@data";
import Reveal from "@components/reveal";

const headlineParts = sections.contact.headline.split(/\*([^*]+)\*/);

export default function Contact() {
  const year = new Date().getFullYear();
  const { credit } = site.footer;
  return (
    <footer id="contact" className="border-t border-line">
      <div className="mx-auto max-w-6xl px-5 py-24 md:px-8 md:py-32">
        <Reveal>
          <p className="eyebrow mb-6">
            {sectionNumber("contact")} — {sections.contact.eyebrow}
          </p>
          <h2 className="font-serif text-5xl leading-tight sm:text-7xl md:text-8xl">
            {headlineParts.map((part, index) =>
              index % 2 === 1 ? (
                <span key={index} className="italic text-accent">
                  {part}
                </span>
              ) : (
                part
              ),
            )}
          </h2>
          <a
            href={`mailto:${profile.email}`}
            className="mt-10 inline-block break-all border-b border-paper/40 pb-1 text-2xl transition-colors hover:border-accent hover:text-accent md:text-3xl"
          >
            {profile.email}
          </a>
        </Reveal>

        <div className="mt-24 flex flex-col gap-6 border-t border-line pt-8 text-sm text-mute md:flex-row md:items-center md:justify-between">
          <ul className="flex flex-wrap gap-x-6 gap-y-3 xl:hidden">
            {links.socials.map((s) => (
              <li key={s.label}>
                <a href={s.href} target="_blank" rel="noreferrer" className="hover:text-paper">
                  {s.label} ↗
                </a>
              </li>
            ))}
            {links.resume && (
              <li>
                <a
                  href={links.resume.href}
                  target="_blank"
                  rel="noreferrer"
                  download
                  className="hover:text-paper"
                >
                  {links.resume.label} ↗
                </a>
              </li>
            )}
          </ul>
          <p className="font-mono text-xs">
            {fillTemplate(site.footer.copyright, { year, name: profile.name })}{" "}
            {credit.href ? (
              <a href={credit.href} target="_blank" rel="noreferrer" className="hover:text-paper">
                {credit.label}
              </a>
            ) : (
              credit.label
            )}
          </p>
        </div>
      </div>
    </footer>
  );
}
