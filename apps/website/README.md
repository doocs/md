# MD official website

The product website for doocs/md. Product navigation lists platform tools: Web, VS Code, browser extensions, uTools, CLI, MCP and Docker; themes, the marketplace and AI are features. The editor stays at <https://md.doocs.org>. Branding is temporarily plain text **MD**, with no new graphic logo.

## Develop and build

```sh
pnpm install
pnpm website dev
pnpm website test
pnpm website build
pnpm website preview
pnpm website data:update
```

Development uses `127.0.0.1:5174` and preview uses `127.0.0.1:4174`; Vite chooses the next port if occupied. Build output is `dist/`, served at a static host's root. No deployment is configured or performed.

`build` generates and verifies 11 static HTML pages: homepage, blog archive, five Markdown articles, changelog, community, ecosystem and 404. Counts grow with published content. Native links support direct visits, refresh and browser history. The content remains readable without JavaScript; filtering and appearance are progressive enhancements. Configure the static host to use `404.html` for missing routes; no SPA rewrite is required.

## Content

Posts live in `content/posts/*.md` with YAML frontmatter:

```yaml
---
title: A clear article title
summary: A short factual summary
author: MD 文档
category: tutorial # release, tutorial, community
date: 2026-10-31
cover: /images/editor-light.webp
coverAlt: Actual editor and article preview
sources:
  - https://github.com/doocs/md
draft: false
---
```

Slugs come from the filename or an explicit `slug`. Dates use quoted or plain `YYYY-MM-DD` values. `updated` is optional. Release posts require `channel: main` or `channel: cli`, and may include `version`. Drafts are excluded from output and listing. Invalid metadata and duplicate published slugs fail the build. Raw HTML is escaped, and executable URL schemes are rejected. Article headings provide a generated table of contents and related content.

New tutorials are dated when created. Historical release summaries state the original release date separately, rather than pretending to be historical website announcements. Public user articles and publication showcases are not hosted here; the footer links to GitHub Discussions.

## GitHub data and fallback

`content/data/github.json` is a checked-in public snapshot: repository Stars/Forks, contributors, stable releases and recent commits. Every section carries its own source URL and UTC fetch timestamp. Stars are never described as users, and a partial contributor list is never described as a contributor total.

Contributors are fetched across all API pages in GitHub order, including bot accounts, and displayed as an avatar wall. Anonymous commit authors without a GitHub profile are excluded. Avatars load from GitHub; profile links and initials remain available without them.

`data:update` forces a refresh. Starting the development server or running a build refreshes sections whose six-hour cache has expired. Successful refreshes write `content/data/github.json` in the current checkout; nothing runs periodically or commits the file automatically. Browser refreshes only write localStorage, not this file. Failed requests, invalid payloads, timeouts or rate limits keep each last valid section and its original timestamp; writes replace the snapshot atomically. A first build without usable data omits counts and retains source links. Set `WEBSITE_OFFLINE=1` for a deterministic build without requests. On page load, the browser refreshes public repository Stars/Forks once and shares a validated 30-minute localStorage cache across pages. Header and community counts and timestamps update together; failed or rate-limited requests leave the HTML snapshot intact. Blocked storage does not prevent a fresh request. There is no polling and no credential is sent.

Main project releases are selected by stable `v*` tags. CLI releases use `@doocs/md-cli@*` tags and are shown in their own channel. The script fetches the latest 100 GitHub release records and filters drafts/prereleases and unrelated package tags. Each visible version links to its original release. It does not treat `releases/latest` as the main project's version.

## Rendering and interaction

Vite's generated root (`.generated/`, ignored) contains the static pages; source remains in `index.html`, `src/`, and `content/`. The configuration regenerates content during development. The build emits shared client assets and copies public product imagery and the local font. `scripts/check-build.mjs` verifies page headings, IDs, assets, local links and anchors.

The four homepage feature previews use user-provided dark-mode operation recordings, exported at 1080p and optimized as silent 30 fps H.264 MP4s with fast-start metadata. The original widths (2028–2032 pixels), framing and edited zooms are preserved. They load on playback, run only while at least 35% visible, and pause offscreen or in a hidden tab. A manual pause persists when scrolling; reduced-motion preferences disable automatic playback while still allowing explicit play. Playback and an enlarged video viewer support keyboard use; Escape closes the viewer and restores focus. Native video controls remain available without JavaScript. `public/videos/SOURCES.md` records capture provenance and exactly what each clip demonstrates.

The homepage editor frame unfolds with scroll, followed by small, reversible movements that bring each feature's recording and text into place. Web Animations share navigation's requestAnimationFrame scheduling, use stable layout wrappers, and batch geometry reads before animation writes. Content stays visible without JavaScript; live reduced-motion changes cancel spatial effects. Mobile uses smaller distances without perspective. Header feedback uses CSS transitions. No animation dependency is added; the close-ups inside the videos remain encoded footage.

Homepage title lines, description and actions use a single CSS entrance sequence: a 12px rise and fade, staggered over 600ms. Reduced-motion preferences skip the entrance, and completed animations leave no persistent transforms or hidden content.

## Assets and provenance

Urbanist is self-hosted in `public/fonts/` under its SIL Open Font License. `public/images/SOURCES.md` records the real product screenshots. No generated logo artwork is used. `PRODUCT.md` records capability constraints, and `DESIGN.md` records the accepted visual system.
