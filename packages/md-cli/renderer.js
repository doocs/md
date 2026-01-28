import { marked } from 'marked';
import hljs from 'highlight.js';
import frontMatter from 'front-matter';
import readingTime from 'reading-time';
import juice from 'juice';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import postcss from 'postcss';
import postcssCalc from 'postcss-calc';
import postcssCustomProperties from 'postcss-custom-properties';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

// ============================================================================
// CSS 加载和处理工具
// ============================================================================

/**
 * 加载主题 CSS
 * @param {string} themeName - 主题名称
 * @returns {string} CSS 内容
 */
function loadThemeCss(themeName) {
  try {
    const themeCssDir = path.resolve(__dirname, '../shared/src/configs/theme-css');

    // 1. 加载基础样式
    const basePath = path.join(themeCssDir, 'base.css');
    let cssContent = fs.existsSync(basePath) ? fs.readFileSync(basePath, 'utf-8') : '';

    // 2. 加载 default 主题作为基础
    const defaultPath = path.join(themeCssDir, 'default.css');
    if (fs.existsSync(defaultPath)) {
      cssContent += '\n' + fs.readFileSync(defaultPath, 'utf-8');
    }

    // 3. 如果请求的不是 default 主题，叠加主题特定样式
    if (themeName && themeName !== 'default') {
      const themePath = path.join(themeCssDir, `${themeName}.css`);
      if (fs.existsSync(themePath)) {
        cssContent += '\n' + fs.readFileSync(themePath, 'utf-8');
      }
    }

    return cssContent;
  } catch (e) {
    console.error(`Failed to load theme CSS for ${themeName}:`, e);
    return '';
  }
}

/**
 * 加载代码高亮主题 CSS
 * @param {string} themeName - 高亮主题名称
 * @returns {string} CSS 内容
 */
function loadHighlightCss(themeName) {
  try {
    let highlightPath;
    try {
      const highlightBase = path.dirname(require.resolve('highlight.js/package.json'));
      highlightPath = path.join(highlightBase, 'styles', `${themeName}.css`);
    } catch {
      highlightPath = path.resolve(__dirname, '../../node_modules/highlight.js/styles', `${themeName}.css`);
      if (!fs.existsSync(highlightPath)) {
        highlightPath = path.resolve(__dirname, 'node_modules/highlight.js/styles', `${themeName}.css`);
      }
    }

    if (fs.existsSync(highlightPath)) {
      return fs.readFileSync(highlightPath, 'utf-8');
    }
    return '';
  } catch (e) {
    console.warn(`Failed to load highlight CSS for ${themeName}`, e);
    return '';
  }
}

/**
 * 生成 CSS 变量（与页面端 generateCSSVariables 一致）
 * @param {object} config - 配置对象
 * @returns {string} CSS 变量字符串
 */
function generateCSSVariables(config) {
  return `
:root {
  /* 动态配置变量 */
  --md-primary-color: ${config.primaryColor};
  --md-font-family: ${config.fontFamily};
  --md-font-size: ${config.fontSize};
}

/* 段落缩进和对齐 */
.preview-wrapper p {
  ${config.isUseIndent ? 'text-indent: 2em;' : ''}
  ${config.isUseJustify ? 'text-align: justify;' : ''}
}
  `.trim();
}

/**
 * 使用 PostCSS 处理 CSS（与页面端 processCSS 一致）
 * @param {string} css - CSS 字符串
 * @returns {Promise<string>} 处理后的 CSS
 */
async function processCSS(css) {
  try {
    const result = await postcss([
      postcssCustomProperties({
        preserve: false,
      }),
      postcssCalc({
        preserve: false,
        mediaQueries: false,
        selectors: false,
      }),
    ]).process(css, {
      from: undefined,
    });

    return result.css;
  } catch (error) {
    console.warn(`[processCSS] CSS 处理失败，使用原始 CSS:`, error);
    return css;
  }
}

/**
 * 后处理 CSS - 替换未被 PostCSS 处理的变量
 * @param {string} css - CSS 字符串
 * @param {object} options - 配置选项
 * @returns {string} 处理后的 CSS
 */
function postProcessCss(css, options) {
  if (!css) return '';
  let processed = css;

  // 替换可能残留的 CSS 变量
  if (options.primaryColor) {
    processed = processed.replace(/var\(--md-primary-color\)/g, options.primaryColor);
  }
  if (options.fontSize) {
    processed = processed.replace(/var\(--md-font-size\)/g, options.fontSize);
  }
  if (options.fontFamily) {
    processed = processed.replace(/var\(--font-family\)/g, options.fontFamily);
    processed = processed.replace(/var\(--md-font-family\)/g, options.fontFamily);
  }

  // 处理 hsl 变量和其他默认值
  processed = processed.replace(/hsl\(var\(--foreground\)\)/g, '#333');
  processed = processed.replace(/var\(--foreground\)/g, '#333');
  processed = processed.replace(/var\(--blockquote-background\)/g, '#f8f8f8');

  return processed;
}

// ============================================================================
// HTML 渲染工具
// ============================================================================

// Mac 代码块 SVG
const macCodeSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" version="1.1" x="0px" y="0px" width="45px" height="13px" viewBox="0 0 450 130">
    <ellipse cx="50" cy="65" rx="50" ry="52" stroke="rgb(220,60,54)" stroke-width="2" fill="rgb(237,108,96)" />
    <ellipse cx="225" cy="65" rx="50" ry="52" stroke="rgb(218,151,33)" stroke-width="2" fill="rgb(247,193,81)" />
    <ellipse cx="400" cy="65" rx="50" ry="52" stroke="rgb(27,161,37)" stroke-width="2" fill="rgb(100,200,86)" />
  </svg>
`.trim();

/**
 * 转义 HTML 特殊字符
 * @param {string} text - 原始文本
 * @returns {string} 转义后的文本
 */
function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/`/g, '&#96;');
}

/**
 * 格式化高亮代码
 * @param {string} html - 高亮后的 HTML
 * @param {boolean} preserveNewlines - 是否保留换行
 * @returns {string} 格式化后的 HTML
 */
function formatHighlightedCode(html, preserveNewlines = false) {
  let formatted = html;
  formatted = formatted.replace(/(<span[^>]*>[^<]*<\/span>)(\s+)(<span[^>]*>[^<]*<\/span>)/g, (_, span1, spaces, span2) => span1 + span2.replace(/^(<span[^>]*>)/, `$1${spaces}`));
  formatted = formatted.replace(/(\s+)(<span[^>]*>)/g, (_, spaces, span) => span.replace(/^(<span[^>]*>)/, `$1${spaces}`));
  formatted = formatted.replace(/\t/g, '    ');

  if (preserveNewlines) {
    formatted = formatted.replace(/\r\n/g, '<br/>').replace(/\n/g, '<br/>').replace(/(>[^<]+)|(^[^<]+)/g, (str) => str.replace(/\s/g, '&nbsp;'));
  } else {
    formatted = formatted.replace(/(>[^<]+)|(^[^<]+)/g, (str) => str.replace(/\s/g, '&nbsp;'));
  }
  return formatted;
}

/**
 * 高亮并格式化代码（与页面端 highlightAndFormatCode 一致）
 * @param {string} text - 代码文本
 * @param {string} language - 语言
 * @param {boolean} showLineNumber - 是否显示行号
 * @returns {string} 高亮后的 HTML
 */
function highlightAndFormatCode(text, language, showLineNumber) {
  let highlighted = '';
  const validLanguage = hljs.getLanguage(language) ? language : 'plaintext';

  if (showLineNumber) {
    const rawLines = text.replace(/\r\n/g, '\n').split('\n');
    const highlightedLines = rawLines.map((lineRaw) => {
      const lineHtml = hljs.highlight(lineRaw, { language: validLanguage }).value;
      const formatted = formatHighlightedCode(lineHtml, false);
      return formatted === '' ? '&nbsp;' : formatted;
    });

    const lineNumbersHtml = highlightedLines.map((_, idx) => `<section style="padding:0 10px 0 0;line-height:1.75">${idx + 1}</section>`).join('');
    const codeInnerHtml = highlightedLines.join('<br/>');
    const codeLinesHtml = `<div style="white-space:pre;min-width:max-content;line-height:1.75">${codeInnerHtml}</div>`;
    const lineNumberColumnStyles = 'text-align:right;padding:8px 0;border-right:1px solid rgba(0,0,0,0.04);user-select:none;background:var(--code-bg,transparent);';

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

/**
 * 生成带 CSS 类的内容（与页面端 styledContent 一致）
 * @param {string} styleLabel - CSS 类名标识
 * @param {string} content - 内容
 * @param {string} [tagName] - HTML 标签名
 * @returns {string} HTML 字符串
 */
function styledContent(styleLabel, content, tagName) {
  const tag = tagName ?? styleLabel;
  const className = `${styleLabel.replace(/_/g, '-')}`;
  const headingAttr = /^h\d$/.test(tag) ? ' data-heading="true"' : '';
  return `<${tag} class="${className}"${headingAttr}>${content}</${tag}>`;
}

/**
 * 构建脚注数组 HTML
 * @param {Array} footnotes - 脚注数组
 * @returns {string} HTML 字符串
 */
function buildFootnoteArray(footnotes) {
  return footnotes
    .map(([index, title, link]) =>
      link === title
        ? `<code style="font-size: 90%; opacity: 0.6;">[${index}]</code>: <i style="word-break: break-all">${title}</i><br/>`
        : `<code style="font-size: 90%; opacity: 0.6;">[${index}]</code> ${title}: <i style="word-break: break-all">${link}</i><br/>`
    )
    .join('\n');
}

/**
 * 转换图注格式
 * @param {string} legend - 图注格式配置
 * @param {string|null} text - alt 文本
 * @param {string|null} title - title 文本
 * @returns {string} 图注文本
 */
function transformLegend(legend, text, title) {
  if (!legend || legend === 'none') return '';
  const options = legend.split('-');
  for (const option of options) {
    if (option === 'alt' && text) return text;
    if (option === 'title' && title) return title;
  }
  return '';
}

// ============================================================================
// 主渲染函数
// ============================================================================

/**
 * 渲染 Markdown 为 HTML（与页面端逻辑对齐）
 * @param {string} markdown - Markdown 内容
 * @param {object} options - 渲染选项
 * @returns {Promise<{html: string, readingTime: object}>} 渲染结果
 */
export async function renderMarkdown(markdown, options = {}) {
  const {
    theme = 'default',
    primaryColor = '#0F4C81',
    fontFamily = "-apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif",
    fontSize = '16px',
    isMacCodeBlock = true,
    isShowLineNumber = false,
    legend = 'alt',
    isCiteStatus = false,
    isCountStatus = false,
    isUseIndent = false,
    isUseJustify = false,
    highlightTheme = 'github',
    themeMode = 'light'
  } = options;

  // 1. Front-matter 解析
  const { attributes, body } = frontMatter(markdown);
  const readingTimeResult = readingTime(body);

  // 2. 配置渲染器状态
  const footnotes = [];
  let footnoteIndex = 0;
  const listOrderedStack = [];
  const listCounters = [];

  // 辅助函数：添加脚注
  function addFootnote(title, link) {
    const existing = footnotes.find(([, , l]) => l === link);
    if (existing) return existing[0];
    footnotes.push([++footnoteIndex, title, link]);
    return footnoteIndex;
  }

  // 3. 配置 marked 渲染器（与页面端 renderer-impl.ts 对齐）
  const renderer = {
    heading({ tokens, depth }) {
      const text = this.parser.parseInline(tokens);
      return styledContent(`h${depth}`, text);
    },

    paragraph({ tokens }) {
      const text = this.parser.parseInline(tokens);
      const isFigureImage = text.includes('<figure') && text.includes('<img');
      if (isFigureImage || text.trim() === '') return text;
      return styledContent('p', text);
    },

    blockquote({ tokens }) {
      const text = this.parser.parse(tokens);
      return styledContent('blockquote', text);
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
      const escaped = escapeHtml(text);
      return styledContent('codespan', escaped, 'code');
    },

    list({ ordered, items, start = 1 }) {
      listOrderedStack.push(ordered);
      listCounters.push(Number(start));
      const html = items.map(item => this.listitem(item)).join('');
      listOrderedStack.pop();
      listCounters.pop();
      return styledContent(ordered ? 'ol' : 'ul', html);
    },

    listitem(token) {
      const ordered = listOrderedStack[listOrderedStack.length - 1];
      const idx = listCounters[listCounters.length - 1]++;
      const prefix = ordered ? `${idx}. ` : '• ';

      let content;
      try {
        content = this.parser.parseInline(token.tokens);
      } catch {
        content = this.parser.parse(token.tokens).replace(/^<p(?:\s[^>]*)?>([\\s\\S]*?)<\/p>/, '$1');
      }
      return styledContent('listitem', `${prefix}${content}`, 'li');
    },

    image({ href, title, text }) {
      const subText = transformLegend(legend, text, title);
      const subHtml = subText ? styledContent('figcaption', subText) : '';
      const titleAttr = title ? ` title="${title}"` : '';
      return `<figure><img src="${href}"${titleAttr} alt="${text}"/>${subHtml}</figure>`;
    },

    link({ href, title, text, tokens }) {
      const parsedText = this.parser.parseInline(tokens);
      if (/^https?:\/\/mp\.weixin\.qq\.com/.test(href)) {
        return `<a href="${href}" title="${title || text}">${parsedText}</a>`;
      }
      if (href === text) return parsedText;

      if (isCiteStatus) {
        const ref = addFootnote(title || text, href);
        return `<a href="${href}" title="${title || text}">${parsedText}<sup>[${ref}]</sup></a>`;
      }
      return `<a href="${href}" title="${title || text}">${parsedText}</a>`;
    },

    strong({ tokens }) {
      return styledContent('strong', this.parser.parseInline(tokens));
    },

    em({ tokens }) {
      return styledContent('em', this.parser.parseInline(tokens));
    },

    table({ header, rows }) {
      const headerRow = header.map(cell => styledContent('th', this.parser.parseInline(cell.tokens))).join('');
      const body = rows.map(row => styledContent('tr', row.map(cell => styledContent('td', this.parser.parseInline(cell.tokens))).join(''))).join('');
      return `<section style="max-width: 100%; overflow: auto"><table class="preview-table"><thead>${headerRow}</thead><tbody>${body}</tbody></table></section>`;
    },

    hr() {
      return styledContent('hr', '');
    }
  };

  marked.use({ renderer, breaks: true });

  // 4. 解析 Markdown
  const htmlContent = marked.parse(body);

  // 5. 后处理：阅读时间统计
  let readingTimeHtml = '';
  if (isCountStatus && readingTimeResult.words) {
    readingTimeHtml = `
      <blockquote class="md-blockquote">
        <p class="md-blockquote-p">字数 ${readingTimeResult.words}，阅读大约需 ${Math.ceil(readingTimeResult.minutes)} 分钟</p>
      </blockquote>
    `;
  }

  // 6. 后处理：脚注
  let footnotesHtml = '';
  if (footnotes.length > 0) {
    footnotesHtml = styledContent('h4', '引用链接') + styledContent('footnotes', buildFootnoteArray(footnotes), 'p');
  }

  // 7. 后处理：附加样式
  const additionStyle = `
    <style>
      .preview-wrapper pre::before {
        position: absolute;
        top: 0;
        right: 0;
        color: #ccc;
        text-align: center;
        font-size: 0.8em;
        padding: 5px 10px 0;
        line-height: 15px;
        height: 15px;
        font-weight: 600;
      }
    </style>
  `;

  const macSignStyle = `
    <style>
      .hljs.code__pre > .mac-sign {
        display: ${isMacCodeBlock ? 'flex' : 'none'};
      }
    </style>
  `;

  const h2StrongStyle = `
    <style>
      h2 strong {
        color: inherit !important;
      }
    </style>
  `;

  // 8. 组装 HTML
  const innerHtml = readingTimeHtml + htmlContent + footnotesHtml + additionStyle + macSignStyle + h2StrongStyle;
  const wrappedHtml = styledContent('container', innerHtml, 'section');

  // 9. 加载并处理 CSS
  const themeCss = loadThemeCss(theme);
  const highlightCss = loadHighlightCss(highlightTheme);

  // 生成 CSS 变量
  const variablesCss = generateCSSVariables({
    primaryColor,
    fontFamily,
    fontSize,
    isUseIndent,
    isUseJustify
  });

  // 合并 CSS
  let combinedCss = [variablesCss, themeCss, highlightCss].filter(Boolean).join('\n');

  // 使用 PostCSS 处理 CSS 变量
  combinedCss = await processCSS(combinedCss);

  // 后处理残留的 CSS 变量
  combinedCss = postProcessCss(combinedCss, { primaryColor, fontSize, fontFamily });

  // 10. 构建最终 HTML
  const baseHtml = `
    <div class="preview-wrapper" id="preview-wrapper" style="font-family: ${fontFamily}; font-size: ${fontSize};">
      <section class="preview-content">
        ${wrappedHtml}
      </section>
    </div>
  `;

  // 11. 使用 juice 内联样式
  const inlinedHtml = juice.inlineContent(baseHtml, combinedCss, {
    inlinePseudoElements: true,
    preserveImportant: true,
    resolveCSSVariables: false
  });

  return {
    html: inlinedHtml,
    readingTime: readingTimeResult
  };
}
