import type { ComponentType } from "react";
import About from "@components/about";
import Contact from "@components/contact";
import Cursor from "@components/cursor";
import Experience from "@components/experience";
import Hero from "@components/hero";
import Nav from "@components/nav";
import Projects from "@components/projects";
import SideRails from "@components/side-rails";
import TechStack from "@components/tech-stack";
import { sectionOrder, site, type SectionKey } from "@data";

const sectionComponents: Record<SectionKey, ComponentType> = {
  work: Projects,
  about: About,
  experience: Experience,
  stack: TechStack,
};

export default function App() {
  return (
    <div className="grain">
      <a
        href={site.skipLink.href}
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-accent focus:px-4 focus:py-2 focus:text-ink"
      >
        {site.skipLink.label}
      </a>
      <Nav />
      <SideRails />
      <main>
        <Hero />
        {sectionOrder.map((key) => {
          const SectionComponent = sectionComponents[key];
          return <SectionComponent key={key} />;
        })}
      </main>
      <Contact />
      <Cursor />
    </div>
  );
}
