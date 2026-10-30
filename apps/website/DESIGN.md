---
name: md official website
description: Tabularis visual language adapted for the md Markdown editor.
colors:
  accent-blue: "#3169ec"
  accent-blue-hover: "#2259d6"
  accent-teal: "#35d0c0"
  star: "#f5c451"
  bg: "#080b11"
  surface: "#11151e"
  surface-raised: "#161c27"
  border: "rgb(148 163 184 / 16%)"
  text-primary: "#eef0f3"
  text-secondary: "#a2aaba"
  light-bg: "#fff"
  light-surface: "#f6f7f9"
  light-surface-raised: "#eef0f4"
  light-border: "rgb(15 23 42 / 14%)"
  light-text-primary: "#0b1220"
  light-text-secondary: "#4b5563"
  light-accent-teal: "#087f76"
  light-star: "#946100"
  demo-bg: "#0e141e"
  demo-chrome: "#141d29"
  demo-line: "#29364a"
  demo-text: "#b8c5d8"
  demo-muted: "#9aabc1"
  demo-code-bg: "#0a1019"
  article-bg: "#141e2c"
  article-text: "#c5d0df"
  article-muted: "#9eafc5"
  article-blue: "#93baff"
  article-teal: "#6ed6c3"
  article-purple: "#c6adf3"
  light-demo-bg: "#f7f9fc"
  light-demo-chrome: "#edf1f7"
  light-demo-line: "#d5deeb"
  light-demo-text: "#38465c"
  light-demo-muted: "#53657c"
  light-demo-code-bg: "#e9eff6"
  light-article-bg: "#fff"
  light-article-text: "#354155"
  light-article-muted: "#637188"
  light-article-blue: "#2455af"
  light-article-teal: "#0a7667"
  light-article-purple: "#7449a8"
typography:
  display:
    fontFamily: "Urbanist, PingFang SC, Microsoft YaHei, sans-serif"
    fontSize: "clamp(40px, 4.5vw, 62px)"
    fontWeight: 500
    lineHeight: 1.35
    letterSpacing: "-0.03em"
  headline:
    fontSize: "clamp(29px, 3.1vw, 40px)"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "-0.025em"
  title:
    fontSize: "18px"
    fontWeight: 500
  body:
    fontSize: "15px"
    lineHeight: 1.7
  label:
    fontSize: "14px"
  code:
    fontFamily: "SFMono-Regular, Consolas, Liberation Mono, monospace"
    fontSize: "12px"
    lineHeight: 1.95
rounded:
  article: "5px"
  article-sample: "8px"
  theme-control: "6px"
  button: "9px"
  menu: "10px"
  product-window: "12px"
spacing:
  action-gap: "12px"
  desktop-gutter: "32px"
  mobile-gutter: "20px"
  section: "100px"
  section-mobile: "65px"
components:
  button-primary:
    backgroundColor: "{colors.accent-blue}"
    textColor: "{colors.light-bg}"
    rounded: "{rounded.button}"
    padding: "12px 23px"
  button-primary-hover:
    backgroundColor: "{colors.accent-blue-hover}"
    textColor: "{colors.light-bg}"
  button-secondary:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.button}"
    padding: "12px 23px"
  appearance-control:
    textColor: "{colors.text-secondary}"
    rounded: "{rounded.button}"
    height: "40px"
    width: "40px"
---

# Design System: md official website

## Overview

**Creative North Star: "Tabularis visual language, adapted for md"**

The existing Tabularis world supplies the dark canvas, blue actions, teal accents, restrained borders and generous space. md branding and direct Chinese writing guidance sit within that established language. Both appearances carry through the page, source pane, article preview and theme samples.

**Key Characteristics:**

- Quiet neutral surfaces with blue actions and teal emphasis.
- Medium-weight typography, generous section spacing and thin dividers.
- Product demonstrations use paired article and source palettes, with no bright panels in dark appearance.

## Colors

### Primary

Action blue marks primary destinations and darkens on hover. It is shared by both appearances.

### Secondary

Teal highlights selected words, brand details, icons and keyboard focus. Light appearance substitutes the darker teal token. Warm gold is reserved for the GitHub star indicator, with a darker gold in light appearance.

### Neutral

The background, surface, raised surface, border and two text roles form a paired dark/light system. Source of truth is `src/style.css`; each `light-*` token replaces its unprefixed role under the light theme. The demo and article token families follow the same pairing: dark source, preview and sample surfaces in dark appearance; pale source and white article surfaces in light appearance.

## Typography

Urbanist is locally hosted; PingFang SC and Microsoft YaHei provide Chinese glyphs. Display and section headings use medium weight and slightly tightened tracking. Body and navigation use the same stack; code uses the separate monospace stack.

The display role becomes (44px) at the mobile-navigation breakpoint and scales from (30px) to (38px) on narrow phones. Workflow and feature descriptions use (15px), spacious line-height (1.9) and a maximum line length of (65ch); mobile workflow text uses (14px). Demo code and article body use (12px), reduced to (11px) at their responsive breakpoints. Purple article previews and samples use Songti SC, Noto Serif CJK SC and serif fallbacks.

## Layout

Content is centered in a maximum width of (1160px), with desktop gutters from the spacing tokens. Header content has its own maximum width of (1280px), and remains sticky with a thin bottom border. Sections use the established vertical spacing scale.

At (1050px), secondary header details disappear and wide gaps contract. At (900px), feature columns stack and native disclosure navigation replaces desktop links. At (760px), gutters become the mobile token and documentation columns stack. The product demo keeps equal source and preview columns until (480px); then a source/result selector shows one pane at a time, initially the article result. Narrow phones also show two article samples and single-column workflow and ecosystem grids. Action labels remain on one line; the header editor action becomes an accessible icon at (480px), while its GitHub count stays visible.

## Elevation & Depth

The implementation uses no box shadows. Tonal surfaces, one-pixel borders and clipped corners separate layers. The mobile navigation panel uses a surface fill and border. The product window enters over (700ms) with `cubic-bezier(0.16, 1, 0.3, 1)` only when reduced motion is not requested; links and buttons use (160ms) color transitions.

## Shapes

Controls use the button radius, the mobile menu is slightly rounder, and the product window has the largest recurring radius. Code blocks use the article radius; theme samples use the article-sample radius. Dots and color swatches are circular. Border treatment is thin and subdued in both appearances.

## Components

### Buttons

Primary actions are solid blue with white text; secondary actions use the page background and a border. Both have medium-weight (15px) labels and minimum height (49px). The header CTA is compact at (36px) minimum height. Secondary and icon controls hover to the raised surface; links turn teal. Keyboard focus uses a teal (2px) outline offset by (5px).

### Navigation

Desktop links use the label typography role and secondary text, with a compact (13px) variant below (1050px). The comparison section is included in both navigation variants. The mobile menu uses native `details` and `summary`, a right-aligned bordered panel and padded links. Escape closes it and returns focus to the trigger; outside clicks and link selections also close it. Appearance switching is a (40px) bordered square with sun/moon icons, an accessible destination label and pressed state. A saved preference is restored before the page renders, with dark appearance as the fallback.

### GitHub signals

Repository links use the GitHub mark and a compact star count instead of a visible GitHub label. The hero variant adds a thin divider and gold outlined star; counts use tabular numerals. Accessible names and titles retain the destination and full count. One public API request per page updates both counts, with a (5s) timeout and a dated snapshot retained on failure. Footer icon destinations retain accessible names and titles.

### Comparison table

A bordered, rounded table compares md, the mdnice open-source edition and the Quaily Markdown-to-WeChat tool across six capabilities. The md column uses a (7%) blue tint and teal checks; other checks and undocumented-state dashes use secondary text. Icons have explicit accessible meanings: undocumented never means unsupported. Row labels stay fixed at the left edge of a focusable horizontal scrolling region. The table retains a minimum width of (640px), reduced to (490px) at (480px) and below, where the sticky row-label column is fixed at (160px). A visible swipe hint appears at (760px) and below. An expandable source list provides scope and verification date beneath the legend.

### Product demonstration

The framed showcase pairs source text and an article result beneath a simple title row and a real editor link. It is labeled as a layout demonstration. Three theme buttons expose pressed state and use a minimum height of (44px); the mobile source/result controls share that target size. Blue uses a left-aligned title with a bottom rule; teal centers the title and tints subheadings; purple centers the title, underlines subheadings and uses serif type. Selection updates the theme name in a polite live region. The selected button has a visible border, primary text and a raised semantic fill. The source is illustrative, with no simulated editing tools.

### Content groups

Workflow items are unboxed. Feature, ecosystem and documentation groups use open layouts and dividers rather than floating cards. Article theme samples use appearance-aware panels with blue, teal and purple accents; their purple variant uses serif type.

## Do's and Don'ts

### Do:

- Do preserve paired dark/light semantic colors, including demo and article surfaces, and the shared action blue.
- Do retain visible keyboard focus, labeled controls and reduced-motion behavior.
- Do keep both source and article result reachable when the demonstration collapses to one pane.

### Don't:

- Don't present the demonstration as a functioning local editor.
- Don't introduce bright article or sample panels into dark appearance.
- Don't replace the established thin-border and tonal-surface treatment with shadows.
