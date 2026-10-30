try {
  const appearance = localStorage.getItem('md-website-appearance')
  if (appearance === 'light' || appearance === 'dark')
    document.documentElement.dataset.theme = appearance
}
catch {
  // Browsers can block storage; keep the default dark appearance.
}
