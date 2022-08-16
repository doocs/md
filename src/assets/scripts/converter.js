import juice from 'juice'

export function solveWeChatImage() {
  const clipboardDiv = document.getElementById(`output`)
  const images = clipboardDiv.getElementsByTagName(`img`)
  for (let i = 0; i < images.length; i++) {
    const image = images[i]
    const width = image.getAttribute(`width`)
    const height = image.getAttribute(`height`)
    image.removeAttribute(`width`)
    image.removeAttribute(`height`)
    image.style.width = width
    image.style.height = height
  }
}

export function mergeCss(html) {
  return juice(html, {
    inlinePseudoElements: true,
    preserveImportant: true,
  })
}
