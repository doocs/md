# Design System: md official website

## Overview

The website uses a restrained product presentation: a centered hero, alternating feature text and real operation videos, and clear routes to the editor. Preserve the existing layout, product copy, dot patterns behind headings and grid patterns behind feature descriptions.

Urbanist and the existing Chinese system font stack carry the typography. Actions use black and white in both appearances; color stays in product imagery and supporting links. Refinements should reduce visual weight without shrinking mobile hit areas.

Product facts remain in `PRODUCT.md`.

## Confirmed interface details

- Primary actions use near-black backgrounds with white text in the light appearance, and near-white backgrounds with dark text in the dark appearance. Secondary actions keep fine borders; ghost actions use neutral text.
- The release link has a single-pixel outer border. Its “更新” tag uses a neutral outline and text, without a solid fill.
- Desktop action sizes are 36px for regular buttons and approximately 40px for hero/footer actions, with 14px and 15px labels respectively. Buttons use 8px corners and 16px icons. At widths up to 900px, button targets remain at least 44px high and icon buttons at least 44px wide.
- Desktop sections use 96px vertical padding and 40px content gaps; tablet and phone spacing follows the existing 80px and 64px scale. Keep secondary copy readable, with 13px conditions and 12px source notes.
- Release feedback uses short border/background transitions. Hero copy has no entrance animation: the release link, title, description, actions and note render immediately in their final positions.
