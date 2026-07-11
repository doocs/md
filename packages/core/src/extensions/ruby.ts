import type { MarkedExtension } from 'marked'
import type { RubyToken } from '../types/marked-tokens'
import { asTextTokenRenderer } from '../types/marked-tokens'

/**
 * Ruby / pinyin annotation extension
 * https://talk.commonmark.org/t/proper-ruby-text-rb-syntax-support-in-markdown/2279
 * https://www.w3.org/TR/ruby/
 *
 * Syntax: [text]{ruby} or [text]^(ruby)
 * Separators in ruby part: `・` `．` `。` `-`
 */
export function markedRuby(): MarkedExtension {
  return {
    extensions: [
      {
        name: `ruby`,
        level: `inline`,
        start(src: string) {
          return src.match(/\[/)?.index
        },
        tokenizer(src: string) {
          const rule1 = /^\[([^\]]+)\]\{([^}]+)\}/
          let match = rule1.exec(src)
          if (match) {
            return {
              type: `ruby`,
              raw: match[0],
              text: match[1].trim(),
              ruby: match[2].trim(),
              format: `basic`,
            }
          }

          const rule2 = /^\[([^\]]+)\]\^\(([^)]+)\)/
          match = rule2.exec(src)
          if (match) {
            return {
              type: `ruby`,
              raw: match[0],
              text: match[1].trim(),
              ruby: match[2].trim(),
              format: `basic-hat`,
            }
          }

          return undefined
        },
        renderer: asTextTokenRenderer((token: RubyToken) => {
          const { text, ruby, format } = token

          const separatorRegex = /[・．。-]/g
          const hasSeparators = separatorRegex.test(ruby)

          if (hasSeparators) {
            const rubyParts = ruby.split(separatorRegex).filter((part: string) => part.trim() !== ``)

            const textChars = text.split(``)
            const result = []

            if (textChars.length >= rubyParts.length) {
              let currentIndex = 0

              for (let i = 0; i < rubyParts.length; i++) {
                const rubyPart = rubyParts[i]
                const remainingChars = textChars.length - currentIndex
                const remainingParts = rubyParts.length - i

                let charCount = 1
                if (remainingParts === 1) {
                  charCount = remainingChars
                }

                const currentText = textChars.slice(currentIndex, currentIndex + charCount).join(``)

                result.push(`<ruby data-text="${currentText}" data-ruby="${rubyPart}" data-format="${format}">${currentText}<rp>(</rp><rt>${rubyPart}</rt><rp>)</rp></ruby>`)

                currentIndex += charCount
              }

              if (currentIndex < textChars.length) {
                result.push(textChars.slice(currentIndex).join(``))
              }
            }
            else {
              for (let i = 0; i < textChars.length; i++) {
                const char = textChars[i]
                const rubyPart = rubyParts[i] || ``

                if (rubyPart) {
                  result.push(`<ruby data-text="${char}" data-ruby="${rubyPart}" data-format="${format}">${char}<rp>(</rp><rt>${rubyPart}</rt><rp>)</rp></ruby>`)
                }
                else {
                  result.push(char)
                }
              }
            }

            return result.join(``)
          }

          return `<ruby data-text="${text}" data-ruby="${ruby}" data-format="${format}">${text}<rp>(</rp><rt>${ruby}</rt><rp>)</rp></ruby>`
        }),
      },
    ],
  }
}
