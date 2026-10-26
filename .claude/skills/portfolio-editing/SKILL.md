---
name: portfolio-editing
description: Use whenever editing or adding code in this portfolio project. Enforces the no-comments rule and where site content lives.
---

# Editing this portfolio

## No comments, ever

Never add comments to any file in this project.

- No `//` or `/* */` comments in `.ts`, `.tsx`, `.js` or config files.
- No JSDoc (`/** */`) on functions, components, types or fields.
- No `{/* */}` comments inside JSX.
- No `/* */` comments in `.css` files.
- No `<!-- -->` comments in `.html` files.
- JSON cannot hold comments, so do not add fake `"_comment"` keys either.

If code needs explaining, make it explain itself with clear names for variables, components and types. Explanations for the person go in the chat reply or in `README.md`, never in the code.

Before finishing any edit, search the files you touched for `//`, `/*` and `<!--` and remove any comment you added. URLs such as `https://` are not comments.

## File names

Name every new file and folder in lowercase kebab-case, for example `hero-scene.tsx`, `side-rails.tsx` or `tech-stack.tsx`. Never use capital letters in file names. Component names inside the code stay PascalCase (`export default function HeroScene`), and imports use the lowercase path (`import HeroScene from "./hero-scene"`). `README.md`, `AGENTS.md`, `CLAUDE.md` and `SKILL.md` keep their conventional names.

## Imports

Import project files through the aliases, never with relative paths like `./` or `../`:

- `@components/...` points at `src/components/`, for example `import Reveal from "@components/reveal"`.
- `@data` points at `src/data/`, for example `import { profile } from "@data"`.
- `@/...` points at `src/` for everything else, for example `import "@/index.css"`.

The aliases are set in `vite.config.ts` (`resolve.alias`) and `tsconfig.app.json` (`paths`). When adding a new alias, add it to both.

## Where content lives

Site text and data are in JSON files in `src/data/`:

- `site.json`: page title, description and theme colour (filled into `index.html` by the `site-meta` plugin in `vite.config.ts`), logo, skip link, nav links and menu labels, footer copyright and credit
- `sections.json`: section order (numbers are derived from it) and every section title, label and hint
- `avatar.json`: hero avatar colours
- `profile.json`: greeting, name, role, intro and rotating roles, tagline, location, email, about, stats
- `links.json`: social links (label, href, icon) and the résumé link shown in the side rails and footer
- `projects/projects.json`: project cards (`hue` 0–360 is the fallback colour)
- `projects/1.jpg`, `projects/2.jpg`, …: cover image for the project at that position in `projects.json`; keep the numbering in sync when adding, removing or reordering projects
- `experience.json`: work history
- `skills.json`: skill groups

`src/data/index.ts` holds the TypeScript types and exports. Button labels, aria labels and alt text are content too, so they also go in the JSON files. When adding a new field, add it to the JSON and to the matching type in `index.ts`. Never hard-code content in components.

## Stack and commands

Vite+ (`vp`), React + TypeScript, Tailwind CSS v4, Three.js via React Three Fiber and drei.

- `vp dev` to run, `vp check` to format, lint and type-check, `vp build` to build.
- Run `vp check` after every change.
