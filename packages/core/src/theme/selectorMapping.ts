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

  // Obsidian-style Callouts
  blockquote_abstract: `markdown-alert-abstract`,
  blockquote_summary: `markdown-alert-summary`,
  blockquote_tldr: `markdown-alert-tldr`,
  blockquote_todo: `markdown-alert-todo`,
  blockquote_success: `markdown-alert-success`,
  blockquote_done: `markdown-alert-done`,
  blockquote_question: `markdown-alert-question`,
  blockquote_help: `markdown-alert-help`,
  blockquote_faq: `markdown-alert-faq`,
  blockquote_failure: `markdown-alert-failure`,
  blockquote_fail: `markdown-alert-fail`,
  blockquote_missing: `markdown-alert-missing`,
  blockquote_danger: `markdown-alert-danger`,
  blockquote_error: `markdown-alert-error`,
  blockquote_bug: `markdown-alert-bug`,
  blockquote_example: `markdown-alert-example`,
  blockquote_quote: `markdown-alert-quote`,
  blockquote_cite: `markdown-alert-cite`,

  blockquote_title: `alert-title`,
  blockquote_title_note: `alert-title-note`,
  blockquote_title_tip: `alert-title-tip`,
  blockquote_title_info: `alert-title-info`,
  blockquote_title_important: `alert-title-important`,
  blockquote_title_warning: `alert-title-warning`,
  blockquote_title_caution: `alert-title-caution`,

  // Obsidian-style Callout titles
  blockquote_title_abstract: `alert-title-abstract`,
  blockquote_title_summary: `alert-title-summary`,
  blockquote_title_tldr: `alert-title-tldr`,
  blockquote_title_todo: `alert-title-todo`,
  blockquote_title_success: `alert-title-success`,
  blockquote_title_done: `alert-title-done`,
  blockquote_title_question: `alert-title-question`,
  blockquote_title_help: `alert-title-help`,
  blockquote_title_faq: `alert-title-faq`,
  blockquote_title_failure: `alert-title-failure`,
  blockquote_title_fail: `alert-title-fail`,
  blockquote_title_missing: `alert-title-missing`,
  blockquote_title_danger: `alert-title-danger`,
  blockquote_title_error: `alert-title-error`,
  blockquote_title_bug: `alert-title-bug`,
  blockquote_title_example: `alert-title-example`,
  blockquote_title_quote: `alert-title-quote`,
  blockquote_title_cite: `alert-title-cite`,

  blockquote_p: `alert-content`,
  blockquote_p_note: `alert-content-note`,
  blockquote_p_tip: `alert-content-tip`,
  blockquote_p_info: `alert-content-info`,
  blockquote_p_important: `alert-content-important`,
  blockquote_p_warning: `alert-content-warning`,
  blockquote_p_caution: `alert-content-caution`,

  // Obsidian-style Callout content
  blockquote_p_abstract: `alert-content-abstract`,
  blockquote_p_summary: `alert-content-summary`,
  blockquote_p_tldr: `alert-content-tldr`,
  blockquote_p_todo: `alert-content-todo`,
  blockquote_p_success: `alert-content-success`,
  blockquote_p_done: `alert-content-done`,
  blockquote_p_question: `alert-content-question`,
  blockquote_p_help: `alert-content-help`,
  blockquote_p_faq: `alert-content-faq`,
  blockquote_p_failure: `alert-content-failure`,
  blockquote_p_fail: `alert-content-fail`,
  blockquote_p_missing: `alert-content-missing`,
  blockquote_p_danger: `alert-content-danger`,
  blockquote_p_error: `alert-content-error`,
  blockquote_p_bug: `alert-content-bug`,
  blockquote_p_example: `alert-content-example`,
  blockquote_p_quote: `alert-content-quote`,
  blockquote_p_cite: `alert-content-cite`,

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
