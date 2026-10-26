# Portfolio

Personal portfolio built with **Vite+ (`vp`)**, **React + TypeScript**, **Tailwind CSS v4** and **Three.js** (via React Three Fiber + drei).

## Getting started

```bash
# install the Vite+ CLI once (see https://viteplus.dev/guide/)
npm i -g vite-plus

vp install      # install dependencies
vp dev          # start the dev server
vp check        # format, lint and type-check
vp build        # production build into dist/
vp preview      # preview the production build
```

## Make it yours

All content lives in JSON files in **`src/data/`**:

| File              | What it holds                                                                       |
| ----------------- | ----------------------------------------------------------------------------------- |
| `profile.json`    | `greeting`, name, role, `intro` + `roles` (rotating hero words), tagline, location, email, about, stats |
| `site.json`       | page `meta` (browser tab title, description, theme colour), `logo`, `skipLink`, `nav` links and menu labels, `footer` (`copyright` with `{year}` and `{name}`, `credit` label and optional href) |
| `sections.json`   | `order` of the main sections (remove a key to hide that section; numbers 01, 02 … follow the order), plus every section's titles, labels and hint text. Wrap a word in `*stars*` in the contact `headline` to highlight it |
| `avatar.json`     | hero avatar colours (skin, hair, eyes, lips, hoodie, laptop, desk, chair, accents) |
| `projects/projects.json` | project cards (`hue` 0–360 is the fallback colour when a project has no image) |
| `projects/1.jpg`, `2.jpg`, … | cover image for the 1st, 2nd, … project in `projects.json` (jpg, png, webp, avif, gif or svg) |
| `links.json` | side-rail and footer links: `socials` (label, href, icon) and `resume` (label, href). Icons: github, linkedin, x, instagram, dribbble, youtube, email, link |
| `experience.json` | work history                                                                        |
| `skills.json`     | skill groups (each skill also becomes a ball in the Tech stack section)             |

Colours and fonts are Tailwind theme tokens in `src/index.css` (`--color-accent`, `--font-serif`, …).

## Structure

```
src/
  data/
    site.json  sections.json  profile.json  links.json       ← your content
    experience.json  skills.json  avatar.json
    projects/projects.json  projects/1.jpg  projects/2.jpg …  ← project cards + cover images
    index.ts                                                ← types + exports
  components/
    hero-scene.tsx          ← Three.js scene (lazy-loaded)
    hero.tsx  nav.tsx  projects.tsx  about.tsx  experience.tsx  contact.tsx
    section.tsx  reveal.tsx (scroll-in animation)
```

The 3D scene follows the pointer, and motion is reduced automatically for visitors with `prefers-reduced-motion`.
