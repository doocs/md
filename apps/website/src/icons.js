const icons = {
  'play': '<path d="m9 5 11 7-11 7Z"/>',
  'pause': '<path d="M9 5v14M15 5v14"/>',
  'expand': '<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/>',
  'arrow': '<path d="M5 12h14m-6-6 6 6-6 6"/>',
  'arrow-up': '<path d="M7 17 17 7M7 7h10v10"/>',
  'chevron': '<path d="m6 9 6 6 6-6"/>',
  'sun': '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
  'moon': '<path d="M20 14a8.5 8.5 0 0 1-10-10 8.5 8.5 0 1 0 10 10Z"/>',
  'menu': '<path d="M4 6h16M4 12h16M4 18h16"/>',
  'github': '<path d="M9 19c-4 1-4-2-6-2m12 5v-4a3.5 3.5 0 0 0-1-2.7c3-.4 6-1.5 6-6a4.7 4.7 0 0 0-1.3-3.3c.2-1 .2-2-.4-3 0 0-1.1-.3-3.4 1a11.8 11.8 0 0 0-6 0C6.6 2.7 5.5 3 5.5 3c-.6 1-.6 2-.4 3A4.7 4.7 0 0 0 3.8 9.3c0 4.5 3 5.6 6 6A3.5 3.5 0 0 0 9 18v4"/>',
  'file': '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8ZM14 2v6h6M8 13h8M8 17h5"/>',
  'image': '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8" cy="8" r="1.5"/><path d="m21 15-5-5L5 21"/>',
  'history': '<path d="M3 11a9 9 0 1 1 2 7M3 4v7h7m2-4v6l4 2"/>',
  'cloud': '<path d="M7 18H6a4 4 0 0 1-.7-7.9 7 7 0 0 1 13.5 1.6A3.2 3.2 0 0 1 18 18h-1M12 12v10m-3-7 3-3 3 3"/>',
  'share': '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.5 10.5 7-4m-7 7 7 4"/>',
  'code': '<path d="m8 7-5 5 5 5m8-10 5 5-5 5m-3-14-2 18"/>',
  'terminal': '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m6 8 4 4-4 4m7 0h5"/>',
  'globe': '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c5 5 5 13 0 18-5-5-5-13 0-18"/>',
  'monitor': '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8m-4-4v4"/>',
  'extension': '<path d="M8 3h3a3 3 0 1 0 6 0h3v7a3 3 0 1 1 0 6v5h-7a3 3 0 1 0-6 0H3v-7a3 3 0 1 0 0-6V3Z"/>',
  'message': '<path d="M21 11a8 8 0 0 1-8 8H5l-3 3V5a3 3 0 0 1 3-3h8a8 8 0 0 1 8 9Z"/><path d="M7 8h9M7 12h6"/>',
  'layout': '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 9v12"/>',
  'spark': '<path d="m12 3 2.4 6.6L21 12l-6.6 2.4L12 21l-2.4-6.6L3 12l6.6-2.4Z"/>',
}
export function icon(name) {
  const path = icons[name]
  if (!path)
    throw new Error(`Unknown icon: ${name}`)
  return `<i data-icon="${name}" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${path}</svg></i>`
}
