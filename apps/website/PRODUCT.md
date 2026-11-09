# MD official website

## Platform

web

## Purpose and audience

Introduce doocs/md to content creators and technical users, and direct the main action to the existing editor at <https://md.doocs.org>. Explain writing and publication benefits before technical depth. The website does not replace the editor.

## Implemented scope

Homepage; blog archive and Markdown article pages; main/CLI changelog; community and contributor page; ecosystem page. Static HTML, light/dark appearance, responsive layouts and progressive interactions. Plain text MD branding; logo design is deferred.

## Product constraints verified in source

- Markdown is rendered for WeChat, with CSS inlining and formula/SVG adaptation when copied. Publication is completed in WeChat's backend. Extension-assisted distribution requires the extension and a logged-in destination.
- Classic, grace and simple themes; fonts, colors, spacing, heading/link/quote/code settings and custom CSS. Theme and component markets support preview, install and use. Publishing requires login and moderation; exported CSS/component files can be shared. Do not call this a plugin market or promise unsupported item-sharing deep links.
- AI text assistance, conversation and image generation/insertion. Default-service availability depends on the service; external providers need configuration and may charge fees. Generated image URLs can expire.
- Multiple image hosts, upload/paste/drop/transfer and optional compression. Third-party hosts require credentials and sometimes proxies. Do not imply an image-cropping tool.
- Local article/folder management, auto-save and history. Login enables manual cloud synchronization of articles and allowed preferences. `apps/web/src/services/account/features.ts` disables automatic synchronization/upgrade entry; do not advertise automatic sync as active. AI and image-host secrets are not synchronized.
- Markdown, styled/unstyled HTML, PDF, PNG and segmented PNG export. Login-gated read-only snapshot sharing supports passwords/expiry. Free sharing creation/update quota is 2 per UTC day; effective Pro controls differ for management, revocation and quotas. Do not sell the disabled auto-sync upgrade UI.
- Web, VS Code, Chrome/Firefox extensions, uTools, CLI, MCP and self-hosting have different capabilities. CLI serves the editor locally; MCP is source-build stdio tooling, not an already published npm package. A desktop application is not announced or linked as shipped.
- Code highlighting, KaTeX/visual formula editing, Mermaid, PlantUML, Infographic, Ruby, TOC, footnotes, alerts, sliding images, templates, components, emoji, command palette and slash commands. Web UI supports zh-CN, zh-TW, en-US and ja-JP; do not claim every integration is localized.

## Evidence and content rules

Product source: README, packages/core, packages/shared, apps/web and apps/api. Stable releases: GitHub Releases; CLI also has packages/md-cli/CHANGELOG.md and Changesets. Keep historical release dates distinct from newly authored article dates.

Public data is fetched at build time into a six-hour cache with per-section failure fallback, sources and timestamps. Browser visits additionally refresh public repository Stars/Forks once, using a 30-minute local cache and retaining the HTML snapshot on failure; no polling or credentials are used. Never invent users, endorsements or usage counts. GitHub Stars are repository statistics. Markdown posts remain in the repository. No account, payment, CMS or deployment service is added to this website.

## Brand commitments

Preserve the approved proportions and clean product screenshots. Use fading dots behind every section heading and page title, and grids behind every feature description. Product navigation lists platform tools (Web, VS Code, browser extensions, uTools, CLI, MCP and Docker); themes, the marketplace and AI belong to features. User article showcases stay on GitHub Discussions, linked only in the footer. Use direct factual copy, image/text feature alternation, real product content and operation feedback. No screenshot badges, graphic logo, decorative scroll effects, full-screen panel collage or invented claims. The primary action opens the editor.
