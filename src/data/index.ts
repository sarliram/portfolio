import avatarData from "@data/avatar.json";
import experienceData from "@data/experience.json";
import linksData from "@data/links.json";
import profileData from "@data/profile.json";
import projectsData from "@data/projects/projects.json";
import sectionsData from "@data/sections.json";
import siteData from "@data/site.json";
import skillsData from "@data/skills.json";

export type Stat = { value: string; label: string };

export type Profile = {
  name: string;
  greeting: string;
  role: string;
  intro: string;
  roles: string[];
  location: string;
  tagline: string;
  available: boolean;
  email: string;
  about: string[];
  stats: Stat[];
};

export type Project = {
  title: string;
  year: string;
  description: string;
  tags: string[];
  href?: string;
  repo?: string;
  hue: number;
  image?: string;
};

export type Experience = {
  period: string;
  role: string;
  company: string;
  summary: string;
};

export const socialIcons = [
  "github",
  "linkedin",
  "x",
  "instagram",
  "dribbble",
  "youtube",
  "email",
  "link",
] as const;

export type SocialIcon = (typeof socialIcons)[number];

const isSocialIcon = (value: string): value is SocialIcon =>
  (socialIcons as readonly string[]).includes(value);

export type SocialLink = { label: string; href: string; icon: SocialIcon };

export type Links = {
  socials: SocialLink[];
  resume?: { label: string; href: string };
};

export type SkillGroup = { group: string; items: string[] };

export type LinkItem = { label: string; href: string };

export type Site = {
  meta: { title: string; description: string; themeColor: string };
  logo: { text: string; accent: string; href: string; label: string };
  skipLink: LinkItem;
  nav: { links: LinkItem[]; openMenuLabel: string; closeMenuLabel: string };
  footer: { copyright: string; credit: LinkItem };
};

export const sectionKeys = ["work", "about", "experience", "stack"] as const;

export type SectionKey = (typeof sectionKeys)[number];

const isSectionKey = (value: string): value is SectionKey =>
  (sectionKeys as readonly string[]).includes(value);

export type Sections = {
  order: string[];
  work: {
    title: string;
    liveLabel: string;
    sourceLabel: string;
    previousLabel: string;
    nextLabel: string;
    goToLabel: string;
    slideOfLabel: string;
    previewLabel: string;
  };
  about: { title: string };
  experience: { title: string };
  stack: { eyebrow: string; title: string; hint: string };
  contact: { eyebrow: string; headline: string };
};

export type AvatarColors = {
  skin: string;
  skinShade: string;
  blush: string;
  hair: string;
  iris: string;
  lips: string;
  hoodie: string;
  hoodieShade: string;
  accent: string;
  accentAlt: string;
  laptop: string;
  desk: string;
  chair: string;
};

export const site: Site = siteData satisfies Site;
export const sections: Sections = sectionsData satisfies Sections;
export const sectionOrder: SectionKey[] = sections.order.filter(isSectionKey);
export const sectionNumber = (key: SectionKey | "contact") => {
  const position = key === "contact" ? sectionOrder.length : sectionOrder.indexOf(key);
  return String(position + 1).padStart(2, "0");
};
export const avatarColors: AvatarColors = avatarData satisfies AvatarColors;
export const fillTemplate = (template: string, values: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );

export const profile: Profile = profileData satisfies Profile;
const portraits = import.meta.glob<string>("@data/portrait.{jpg,jpeg,png,webp,avif}", {
  eager: true,
  import: "default",
});
export const portrait: string | undefined = Object.values(portraits)[0];
const projectImages = import.meta.glob<string>(
  "@data/projects/*.{jpg,jpeg,png,webp,avif,gif,svg}",
  {
    eager: true,
    import: "default",
  },
);

const projectImageByNumber = new Map(
  Object.entries(projectImages).map(([path, url]) => [
    path.slice(path.lastIndexOf("/") + 1, path.lastIndexOf(".")),
    url,
  ]),
);

export const projects: Project[] = (projectsData satisfies Project[]).map((project, index) => ({
  ...project,
  image: projectImageByNumber.get(String(index + 1)),
}));
export const experience: Experience[] = experienceData satisfies Experience[];
const googleDriveFileId = (href: string) =>
  href.match(/drive\.google\.com\/file\/d\/([\w-]+)/)?.[1] ??
  href.match(/drive\.google\.com\/(?:open|uc)\?(?:.*&)?id=([\w-]+)/)?.[1];

export const toDownloadHref = (href: string) => {
  const fileId = googleDriveFileId(href);
  return fileId ? `https://drive.google.com/uc?export=download&id=${fileId}` : href;
};

export const links: Links = {
  socials: linksData.socials.map((social) => ({
    ...social,
    icon: isSocialIcon(social.icon) ? social.icon : "link",
  })),
  resume: linksData.resume && {
    ...linksData.resume,
    href: toDownloadHref(linksData.resume.href),
  },
};
export const skills: SkillGroup[] = skillsData satisfies SkillGroup[];
