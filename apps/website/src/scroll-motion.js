export function scrollProgress(top, viewportHeight) {
  if (viewportHeight <= 0)
    return 1
  return Math.max(0, Math.min(1, (viewportHeight * 0.9 - top) / (viewportHeight * 0.65)))
}

export function setupScrollMotion() {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)')
  const desktop = matchMedia('(min-width: 901px)')
  const hero = document.querySelector('.hero-media')
  const features = [...document.querySelectorAll('#features .feature')]
  let tracks = []

  function update() {
    // Read stable wrappers before writing animation times to avoid layout feedback.
    const progress = tracks.map(({ anchor }) => scrollProgress(anchor.getBoundingClientRect().top, innerHeight))
    tracks.forEach((track, index) => {
      if (track.progress !== progress[index]) {
        track.animation.currentTime = progress[index] * 1000
        track.progress = progress[index]
      }
    })
  }

  function add(anchor, target, transform, delay = 0) {
    if (!target)
      return
    const animation = target.animate([{ transform }, { transform: 'none' }], {
      duration: 1000 - delay,
      delay,
      fill: 'both',
      easing: 'linear',
    })
    animation.pause()
    tracks.push({ anchor, animation })
  }

  function configure() {
    tracks.forEach(({ animation }) => animation.cancel())
    tracks = []
    if (reduced.matches)
      return

    if (hero) {
      add(hero, hero.querySelector('.heroDemo'), desktop.matches
        ? 'perspective(1400px) translateY(36px) rotateX(5deg) scale(.94)'
        : 'translateY(16px) scale(.98)')
    }
    for (const feature of features) {
      const visual = feature.querySelector('.visualCol')
      const text = feature.querySelector('.textCol')
      const direction = feature.querySelector('.reversed') ? 1 : -1
      add(visual, feature.querySelector('.feature-stage'), desktop.matches
        ? `translate(${direction * 24}px, 24px) scale(.96)`
        : 'translateY(16px) scale(.985)')
      add(feature, text, `translateY(${desktop.matches ? 20 : 10}px)`, 100)
    }
    update()
  }

  reduced.addEventListener('change', configure)
  desktop.addEventListener('change', configure)
  configure()
  return update
}
