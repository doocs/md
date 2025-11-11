/**
 * CSS 选择器映射表
 * 将旧的自定义选择器映射到新的规范类名（kebab-case）
 * 实现向后兼容
 */

/**
 * 选择器映射表
 * 旧选择器 → 新类名
 */
export const SELECTOR_MAPPING: Record<string, string> = {
  // GFM Alert 相关
  blockquote_note: `markdown-alert-note`,
  blockquote_tip: `markdown-alert-tip`,
  blockquote_info: `markdown-alert-info`,
  blockquote_important: `markdown-alert-important`,
  blockquote_warning: `markdown-alert-warning`,
  blockquote_caution: `markdown-alert-caution`,

  blockquote_title: `alert-title`,
  blockquote_title_note: `alert-title-note`,
  blockquote_title_tip: `alert-title-tip`,
  blockquote_title_info: `alert-title-info`,
  blockquote_title_important: `alert-title-important`,
  blockquote_title_warning: `alert-title-warning`,
  blockquote_title_caution: `alert-title-caution`,

  blockquote_p: `alert-content`,
  blockquote_p_note: `alert-content-note`,
  blockquote_p_tip: `alert-content-tip`,
  blockquote_p_info: `alert-content-info`,
  blockquote_p_important: `alert-content-important`,
  blockquote_p_warning: `alert-content-warning`,
  blockquote_p_caution: `alert-content-caution`,

  // 代码相关
  code_pre: `code-block`,
  codespan: `code-inline`,

  // KaTeX 公式
  inline_katex: `katex-inline`,
  block_katex: `katex-block`,

  // Markup 标记
  markup_highlight: `markup-highlight`,
  markup_underline: `markup-underline`,
  markup_wavyline: `markup-wavyline`,

  listitem: `listitem`,
}
