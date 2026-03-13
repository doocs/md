export interface ReadingTimeOptions {
  wordBound?: (char: string) => boolean
  wordsPerMinute?: number
}

export interface ReadTimeResults {
  text: string
  time: number
  words: number
  minutes: number
}

export type IOptions = ReadingTimeOptions
export type IReadTimeResults = ReadTimeResults

function codeIsInRanges(number: number, ranges: ReadonlyArray<readonly [number, number]>): boolean {
  return ranges.some(([lowerBound, upperBound]) => lowerBound <= number && number <= upperBound)
}

function isCJK(char: string | undefined): boolean {
  if (typeof char !== `string`) {
    return false
  }

  const charCode = char.charCodeAt(0)
  return codeIsInRanges(charCode, [
    [0x3040, 0x309F],
    [0x4E00, 0x9FFF],
    [0xAC00, 0xD7A3],
    [0x20000, 0x2EBE0],
  ])
}

function isAnsiWordBound(char: string | undefined): boolean {
  return typeof char === `string` && ` \n\r\t`.includes(char)
}

function isPunctuation(char: string | undefined): boolean {
  if (typeof char !== `string`) {
    return false
  }

  const charCode = char.charCodeAt(0)
  return codeIsInRanges(charCode, [
    [0x21, 0x2F],
    [0x3A, 0x40],
    [0x5B, 0x60],
    [0x7B, 0x7E],
    [0x3000, 0x303F],
    [0xFF00, 0xFFEF],
  ])
}

export default function readingTime(text: string, options: ReadingTimeOptions = {}): ReadTimeResults {
  let words = 0
  let start = 0
  let end = text.length - 1

  const wordsPerMinute = options.wordsPerMinute || 200
  const isWordBound = options.wordBound || isAnsiWordBound

  while (isWordBound(text[start])) start++
  while (isWordBound(text[end])) end--

  const normalizedText = `${text}\n`

  for (let index = start; index <= end; index++) {
    if (
      isCJK(normalizedText[index])
      || (!isWordBound(normalizedText[index])
        && (isWordBound(normalizedText[index + 1]) || isCJK(normalizedText[index + 1])))
    ) {
      words++
    }

    if (isCJK(normalizedText[index])) {
      while (
        index <= end
        && (isPunctuation(normalizedText[index + 1]) || isWordBound(normalizedText[index + 1]))
      ) {
        index++
      }
    }
  }

  const minutes = words / wordsPerMinute
  const time = Math.round(minutes * 60 * 1000)
  const displayed = Math.ceil(Number(minutes.toFixed(2)))

  return {
    text: `${displayed} min read`,
    minutes,
    time,
    words,
  }
}
