import { marked } from 'marked';
import hljs from 'highlight.js';
import frontMatter from 'front-matter';
import readingTime from 'reading-time';
import juice from 'juice';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

// Helper: Load Theme CSS
function loadThemeCss(themeName) {
  try {
    // Determine path relative to this file
    // renderer.js is in packages/md-cli/
    // themes are in packages/shared/src/configs/theme-css/
    const themePath = path.resolve(__dirname, '../shared/src/configs/theme-css', `${themeName}.css`);
    if (fs.existsSync(themePath)) {
      return fs.readFileSync(themePath, 'utf-8');
    }
    // Fallback to default
    return fs.readFileSync(path.resolve(__dirname, '../shared/src/configs/theme-css/default.css'), 'utf-8');
  } catch (e) {
    console.error(`Failed to load theme CSS for ${themeName}:`, e);
    return '';
  }
}

// Helper: Load Highlight CSS
function loadHighlightCss(themeName) {
  try {
    // Determine path to node_modules/highlight.js/styles
    // Since we are in packages/md-cli/, node_modules is likely in root or packages/md-cli/node_modules
    // Let's try resolution via require.resolve logic essentially
    let highlightPath;
    try {
        const highlightBase = path.dirname(require.resolve('highlight.js/package.json'));
        highlightPath = path.join(highlightBase, 'styles', `${themeName}.css`);
    } catch {
         // Fallback manual resolution if require.resolve fails (ESM context)
         highlightPath = path.resolve(__dirname, '../../node_modules/highlight.js/styles', `${themeName}.css`);
         if (!fs.existsSync(highlightPath)) {
             // Try local node_modules
             highlightPath = path.resolve(__dirname, 'node_modules/highlight.js/styles', `${themeName}.css`);
         }
    }

    if (fs.existsSync(highlightPath)) {
      return fs.readFileSync(highlightPath, 'utf-8');
    }
    // Fallback to github
    return ''; // Return empty if not found, let default styles handle it or try 'github.css' explicitly if needed
  } catch (e) {
    console.warn(`Failed to load highlight CSS for ${themeName}`, e);
    return '';
  }
}

// Helper: Process CSS for Variables
function processCss(css, options) {
    if (!css) return '';
    let processed = css;

    // Replace known variables
    // Note: We perform simple string replacement.
    // This assumes the CSS uses var(--name) format.

    // Primary Color
    if (options.primaryColor) {
        processed = processed.replace(/var\(--md-primary-color\)/g, options.primaryColor);
    }

    // Font Size
    if (options.fontSize) {
        processed = processed.replace(/var\(--md-font-size\)/g, options.fontSize);
    }

    // Font Family - Note: theme CSS might use --font-family or just font-family property
    if (options.fontFamily) {
         processed = processed.replace(/var\(--font-family\)/g, options.fontFamily);
    }

    // Handle defaults for things we don't have inputs for, to ensure valid CSS
    // Foreground - default to dark grey
    processed = processed.replace(/hsl\(var\(--foreground\)\)/g, '#333');
    processed = processed.replace(/var\(--foreground\)/g, '#333');

    // Blockquote background
    processed = processed.replace(/var\(--blockquote-background\)/g, '#f8f8f8');

    return processed;
}


// Mac code block style
const macCodeSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" version="1.1" x="0px" y="0px" width="45px" height="13px" viewBox="0 0 450 130">
    <ellipse cx="50" cy="65" rx="50" ry="52" stroke="rgb(220,60,54)" stroke-width="2" fill="rgb(237,108,96)" />
    <ellipse cx="225" cy="65" rx="50" ry="52" stroke="rgb(218,151,33)" stroke-width="2" fill="rgb(247,193,81)" />
    <ellipse cx="400" cy="65" rx="50" ry="52" stroke="rgb(27,161,37)" stroke-width="2" fill="rgb(100,200,86)" />
  </svg>
`.trim();

// Format highlighted code (handle spaces and tabs)
function formatHighlightedCode(html, preserveNewlines = false) {
  let formatted = html;
  formatted = formatted.replace(/(<span[^>]*>[^<]*<\/span>)(\s+)(<span[^>]*>[^<]*<\/span>)/g, (_, span1, spaces, span2) => span1 + span2.replace(/^(<span[^>]*>)/, `$1${spaces}`));
  formatted = formatted.replace(/(\s+)(<span[^>]*>)/g, (_, spaces, span) => span.replace(/^(<span[^>]*>)/, `$1${spaces}`));
  formatted = formatted.replace(/\t/g, `    `);

  if (preserveNewlines) {
    formatted = formatted.replace(/\r\n/g, `<br/>`).replace(/\n/g, `<br/>`).replace(/(>[^<]+)|(^[^<]+)/g, (str) => str.replace(/\s/g, `&nbsp;`));
  } else {
    formatted = formatted.replace(/(>[^<]+)|(^[^<]+)/g, (str) => str.replace(/\s/g, `&nbsp;`));
  }
  return formatted;
}

// Highlight and format code
function highlightAndFormatCode(text, language, showLineNumber) {
  let highlighted = '';

  // Register language if exists in hljs, otherwise use plaintext
  const validLanguage = hljs.getLanguage(language) ? language : 'plaintext';

  if (showLineNumber) {
    const rawLines = text.replace(/\r\n/g, `\n`).split(`\n`);
    const highlightedLines = rawLines.map((lineRaw) => {
      const lineHtml = hljs.highlight(lineRaw, { language: validLanguage }).value;
      const formatted = formatHighlightedCode(lineHtml, false);
      return formatted === `` ? `&nbsp;` : formatted;
    });

    const lineNumbersHtml = highlightedLines.map((_, idx) => `<section style="padding:0 10px 0 0;line-height:1.75">${idx + 1}</section>`).join(``);
    const codeInnerHtml = highlightedLines.join(`<br/>`);
    const codeLinesHtml = `<div style="white-space:pre;min-width:max-content;line-height:1.75">${codeInnerHtml}</div>`;
    const lineNumberColumnStyles = `text-align:right;padding:8px 0;border-right:1px solid rgba(0,0,0,0.04);user-select:none;background:var(--code-bg,transparent);`;

    highlighted = `
      <section style="display:flex;align-items:flex-start;overflow-x:hidden;overflow-y:auto;width:100%;max-width:100%;padding:0;box-sizing:border-box">
        <section class="line-numbers" style="${lineNumberColumnStyles}">${lineNumbersHtml}</section>
        <section class="code-scroll" style="flex:1 1 auto;overflow-x:auto;overflow-y:visible;padding:8px;min-width:0;box-sizing:border-box">${codeLinesHtml}</section>
      </section>
    `;
  } else {
    const rawHighlighted = hljs.highlight(text, { language: validLanguage }).value;
    highlighted = formatHighlightedCode(rawHighlighted, true);
  }

  return highlighted;
}

// Generate styled HTML tag
function styledContent(styleLabel, content, tagName) {
  const tag = tagName ?? styleLabel;
  const className = `${styleLabel.replace(/_/g, `-`)}`;
  const headingAttr = /^h\d$/.test(tag) ? ` data-heading="true"` : ``;
  return `<${tag} class="${className}"${headingAttr}>${content}</${tag}>`;
}

// Main render function
export function renderMarkdown(markdown, options = {}) {
  const {
    theme = 'default',
    primaryColor = '#0F4C81',
    fontFamily = "-apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif",
    fontSize = '16px',
    isMacCodeBlock = true,
    isShowLineNumber = true,
    legend = '',
    isCiteStatus = false,
    highlightTheme = 'github' // New Option
  } = options;

  // 1. Front-matter parsing
  const { attributes, body } = frontMatter(markdown);
  const readingTimeResult = readingTime(body);

  // 2. Configure marked
  const footnotes = [];
  let footnoteIndex = 0;
  const listOrderedStack = [];
  const listCounters = [];

  const renderer = {
    heading({ tokens, depth }) {
      const text = this.parser.parseInline(tokens);
      return styledContent(`h${depth}`, text);
    },
    paragraph({ tokens }) {
      const text = this.parser.parseInline(tokens);
      const isFigureImage = text.includes(`<figure`) && text.includes(`<img`);
      if (isFigureImage || text.trim() === ``) return text;
      return styledContent(`p`, text);
    },
    blockquote({ tokens }) {
      const text = this.parser.parse(tokens);
      return styledContent(`blockquote`, text);
    },
    code({ text, lang = '' }) {
      const langText = lang.split(' ')[0] || 'plaintext';
      const highlighted = highlightAndFormatCode(text, langText, isShowLineNumber);

      const span = isMacCodeBlock
        ? `<span class="mac-sign" style="padding: 10px 14px 0;">${macCodeSvg}</span>`
        : '';

      const code = `<code class="language-${langText}">${highlighted}</code>`;
      return `<pre class="hljs code__pre">${span}${code}</pre>`;
    },
    codespan({ text }) {
      // Simple escape
      const escaped = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
      return styledContent(`codespan`, escaped, `code`);
    },
    list({ ordered, items, start = 1 }) {
      listOrderedStack.push(ordered);
      listCounters.push(Number(start));
      const html = items.map(item => this.listitem(item)).join('');
      listOrderedStack.pop();
      listCounters.pop();
      return styledContent(ordered ? `ol` : `ul`, html);
    },
    listitem(token) {
      const ordered = listOrderedStack[listOrderedStack.length - 1];
      const idx = listCounters[listCounters.length - 1]++;
      const prefix = ordered ? `${idx}. ` : `• `;

      let content;
      try {
        content = this.parser.parseInline(token.tokens);
      } catch {
        content = this.parser.parse(token.tokens).replace(/^<p(?:\s[^>]*)?>([\s\S]*?)<\/p>/, `$1`);
      }
      return styledContent(`listitem`, `${prefix}${content}`, `li`);
    },
    image({ href, title, text }) {
        let subText = '';
        if (legend) {
           // Simple legend logic replacement
           if (legend.includes('alt') && text) subText = text;
           else if (legend.includes('title') && title) subText = title;
        }
        const subHtml = subText ? styledContent(`figcaption`, subText) : ``;
        const titleAttr = title ? ` title="${title}"` : ``;
        return `<figure><img src="${href}"${titleAttr} alt="${text}"/>${subHtml}</figure>`;
    },
    link({ href, title, text, tokens }) {
        const parsedText = this.parser.parseInline(tokens);
        if (/^https?:\/\/mp\.weixin\.qq\.com/.test(href)) {
            return `<a href="${href}" title="${title || text}">${parsedText}</a>`;
        }
        if (href === text) return parsedText;

        if (isCiteStatus) {
            let existing = footnotes.find(([,,l]) => l === href);
            let ref = existing ? existing[0] : (footnotes.push([++footnoteIndex, title || text, href]), footnoteIndex);
            return `<a href="${href}" title="${title || text}">${parsedText}<sup>[${ref}]</sup></a>`;
        }
        return `<a href="${href}" title="${title || text}">${parsedText}</a>`;
    },
    strong({ tokens }) {
      return styledContent(`strong`, this.parser.parseInline(tokens));
    },
    em({ tokens }) {
      return styledContent(`em`, this.parser.parseInline(tokens));
    },
    table({ header, rows }) {
        const headerRow = header.map(cell => styledContent(`th`, this.parser.parseInline(cell.tokens))).join('');
        const body = rows.map(row => styledContent(`tr`, row.map(cell => styledContent(`td`, this.parser.parseInline(cell.tokens))).join(''))).join('');
        return `<section style="max-width: 100%; overflow: auto"><table class="preview-table"><thead>${headerRow}</thead><tbody>${body}</tbody></table></section>`;
    },
    hr() {
      return styledContent(`hr`, ``);
    }
  };

  marked.use({ renderer });

  // Parse
  const htmlContent = marked.parse(body);

  // 3. Post-processing (Footnotes + Wrapper + CSS Variables)
  let footer = '';
  if (footnotes.length > 0) {
      const footnoteList = footnotes.map(([idx, title, link]) =>
          link === title
          ? `<code style="font-size: 90%; opacity: 0.6;">[${idx}]</code>: <i style="word-break: break-all">${title}</i><br/>`
          : `<code style="font-size: 90%; opacity: 0.6;">[${idx}]</code> ${title}: <i style="word-break: break-all">${link}</i><br/>`
      ).join('\n');
      footer = styledContent(`h4`, `引用链接`) + styledContent(`footnotes`, footnoteList, `p`);
  }

  // Styles processing
  const themeCss = loadThemeCss(theme);
  const highlightCss = loadHighlightCss(highlightTheme);
  const combinedCss = processCss(themeCss + '\n' + highlightCss, options);

  const baseHtml = `
    <div class="preview-wrapper" id="preview-wrapper" style="font-family: ${fontFamily}; font-size: ${fontSize};">
      <section class="preview-content">
        ${htmlContent}
        ${footer}
      </section>
    </div>
  `;

  // Use juice to inline styles
  const inlinedHtml = juice.inlineContent(baseHtml, combinedCss, {
    inlinePseudoElements: true,
    preserveImportant: true
  });

  return {
    html: inlinedHtml,
    readingTime: readingTimeResult
  };
}
