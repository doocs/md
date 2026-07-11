// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { modifyHtmlStructure, solveWeChatImage } from './clipboard-dom'

describe(`modifyHtmlStructure`, () => {
  it(`moves nested lists out of their parent li`, () => {
    const input = `<ul><li>Item<ul><li>Nested</li></ul></li></ul>`
    const output = modifyHtmlStructure(input)

    const root = document.createElement(`div`)
    root.innerHTML = output

    const outerUl = root.querySelector(`ul`)
    expect(outerUl).not.toBeNull()
    expect(outerUl?.children).toHaveLength(2)
    expect(outerUl?.children[0].tagName).toBe(`LI`)
    expect(outerUl?.children[0].querySelector(`ul`)).toBeNull()
    expect(outerUl?.children[1].tagName).toBe(`UL`)
    expect(outerUl?.children[1].textContent).toContain(`Nested`)
  })

  it(`moves nested ordered lists the same way`, () => {
    const input = `<ol><li>One<ol><li>Two</li></ol></li></ol>`
    const output = modifyHtmlStructure(input)

    const root = document.createElement(`div`)
    root.innerHTML = output
    const outerOl = root.querySelector(`ol`)
    expect(outerOl?.children[1].tagName).toBe(`OL`)
  })
})

describe(`solveWeChatImage`, () => {
  it(`converts numeric width/height attributes into px styles`, () => {
    const container = document.createElement(`div`)
    container.innerHTML = `<img width="120" height="80" src="https://example.com/a.png">`
    document.body.appendChild(container)

    solveWeChatImage(container)

    const img = container.querySelector(`img`)!
    expect(img.getAttribute(`width`)).toBeNull()
    expect(img.getAttribute(`height`)).toBeNull()
    expect(img.style.width).toBe(`120px`)
    expect(img.style.height).toBe(`80px`)

    container.remove()
  })

  it(`keeps non-numeric dimension values as-is in style`, () => {
    const container = document.createElement(`div`)
    container.innerHTML = `<img width="50%" height="auto" src="https://example.com/a.png">`
    document.body.appendChild(container)

    solveWeChatImage(container)

    const img = container.querySelector(`img`)!
    expect(img.style.width).toBe(`50%`)
    expect(img.style.height).toBe(`auto`)

    container.remove()
  })
})
