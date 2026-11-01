try {
  const query = typeof location === 'undefined' ? null : new URLSearchParams(location.search).get('theme')
  let saved
  try {
    saved = localStorage.getItem('md-website-appearance')
  }
  catch {
    // Query overrides remain available even when storage is blocked.
  }
  const appearance = query === 'light' || query === 'dark' ? query : saved
  if (appearance === 'light' || appearance === 'dark')
    document.documentElement.dataset.theme = appearance
}
catch {
  // Browsers can block storage; keep the default dark appearance.
}
