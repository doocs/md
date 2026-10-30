# md official homepage

Independent static homepage for doocs/md. The existing editor remains at https://md.doocs.org.

```sh
pnpm install
pnpm website dev
pnpm website test
pnpm website build
pnpm website preview
```

Development: http://127.0.0.1:5174. Production files: `apps/website/dist/`, deployable to a static host at its root. No deployment is configured yet.

## Source and modifications

Adapted from [TabularisDB/website](https://github.com/TabularisDB/website), commit `ec27046fdcde677a8439c8a02402f9fe482502d2` (Apache-2.0). Its dark/light theme tokens, centered hero composition, navigation, spacing and product showcase inform this implementation. See [LICENSE.tabularis](./LICENSE.tabularis) and [NOTICE](./NOTICE).

To obtain a separate reference checkout of the original site:

```sh
git clone --depth 1 --filter=blob:none --sparse https://github.com/TabularisDB/website.git
git -C website sparse-checkout set src content
```

This homepage adapts the source into HTML/CSS and Vite, reusing the monorepo's build tool rather than importing the complete Next.js application. Database-specific pages, downloads, analytics and data-fetch scripts are excluded. Documentation migration is deferred; the documentation section links to existing md documentation. The preview article is a labeled, static demonstration with color, heading-style and typography controls; the actual writing experience is available through “打开编辑器”. Appearance is remembered locally, and narrow screens can switch between source and output views.

Urbanist is self-hosted from the [Google Fonts source](https://github.com/google/fonts/tree/main/ofl/urbanist); its SIL Open Font License is in `public/fonts/OFL.txt`.

`DESIGN.md` and `PRODUCT.md` document the shared design and product context. Impeccable's `.impeccable/` helper metadata stays local and is ignored by Git; it is not required to build or run the homepage.

## GitHub Stars and comparison evidence

The icon-only GitHub links start with a verified snapshot: 13,487 Stars on 2026-10-30, from `https://api.github.com/repos/doocs/md`. The browser requests the public API once per page load, validates the count and updates both labels. A timeout, blocked network, invalid response or rate limit keeps the dated snapshot; no credential is required.

The feature comparison was checked on 2026-10-30. It covers md, the public **mdnice open-source edition**, and the specific **Quaily Markdown-to-WeChat tool**, not their entire commercial product offerings. A dash means **not documented in the cited material**, never a claim that a feature is unsupported.

- md: [repository features](https://github.com/doocs/md#功能特性), plus the local CLI and MCP package READMEs.
- mdnice: [README](https://github.com/mdnice/markdown-nice) confirms WeChat and custom styling; [official formula example](https://github.com/mdnice/markdown-nice/blob/master/src/template/content.md) confirms formulas; [image-hosting configuration](https://github.com/mdnice/markdown-nice/blob/master/src/store/imageHosting.js) confirms multiple configurable hosts. Own-model AI and CLI/MCP are not established by these sources.
- Quaily: the [tool's official help](https://quaily.com/tools/markdown-to-wx/) confirms Markdown conversion and copying to WeChat. The other compared capabilities are not specified there.

Keep source links, verification date and feature scope aligned when updating this comparison.
