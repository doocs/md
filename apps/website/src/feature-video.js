export function shouldPlayPreview({ visible, hidden, reduced, preference }) {
  return visible && !hidden && preference !== 'pause' && (!reduced || preference === 'play')
}

export function setupFeatureVideos() {
  const root = document
  const motion = matchMedia('(prefers-reduced-motion: reduce)')
  for (const player of root.querySelectorAll('[data-feature-video]')) {
    const video = player.querySelector('video')
    const toggle = player.querySelector('[data-video-toggle]')
    const expand = player.querySelector('[data-video-expand]')
    let visible = false
    let preference = 'auto'

    function updateControl() {
      toggle.setAttribute('aria-label', video.paused ? '播放演示' : '暂停演示')
      toggle.setAttribute('aria-pressed', String(!video.paused))
      player.dataset.playing = String(!video.paused)
    }
    function sync() {
      if (shouldPlayPreview({ visible, hidden: root.hidden, reduced: motion.matches, preference }))
        video.play().catch(updateControl)
      else
        video.pause()
    }
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting && entry.intersectionRatio >= 0.35
      sync()
    }, { threshold: [0, 0.35] })
    observer.observe(player)
    root.addEventListener('visibilitychange', sync)
    motion.addEventListener('change', sync)
    toggle.addEventListener('click', () => {
      preference = video.paused ? 'play' : 'pause'
      sync()
    })
    expand.addEventListener('click', () => {
      const placeholder = root.createElement('div')
      placeholder.className = 'feature-placeholder'
      player.replaceWith(placeholder)
      const dialog = root.createElement('dialog')
      dialog.className = 'feature-viewer'
      dialog.setAttribute('aria-label', video.getAttribute('aria-label'))
      const close = root.createElement('button')
      close.type = 'button'
      close.className = 'feature-viewer-close'
      close.textContent = '关闭演示'
      close.addEventListener('click', () => dialog.close())
      dialog.append(close, player)
      root.body.append(dialog)
      dialog.addEventListener('close', () => {
        placeholder.replaceWith(player)
        dialog.remove()
        expand.focus()
      })
      dialog.addEventListener('click', (event) => {
        if (event.target === dialog)
          dialog.close()
      })
      dialog.showModal()
    })
    video.addEventListener('play', updateControl)
    video.addEventListener('pause', updateControl)
    video.controls = false
    player.querySelector('[data-video-controls]').hidden = false
    updateControl()
  }
}
