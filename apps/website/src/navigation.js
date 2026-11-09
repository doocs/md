export function getActiveSection(sections, offset, atEnd) {
  if (atEnd)
    return sections.at(-1)?.id

  return sections.findLast(section => section.getBoundingClientRect().top <= offset)?.id
}
