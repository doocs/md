/** Trigger a browser download for the given content. */
export function downloadFile(content: string, filename: string, mimeType: string = `text/plain`) {
  if (typeof document === `undefined`) {
    throw new TypeError(`downloadFile can only be used in browser environment`)
  }

  const downLink = document.createElement(`a`)
  downLink.download = filename
  downLink.style.display = `none`
  let objectUrl: string | null = null

  if (content.startsWith(`data:`) || content.startsWith(`blob:`)) {
    downLink.href = content
  }
  else if (mimeType === `text/html`) {
    downLink.href = `data:text/html;charset=utf-8,${encodeURIComponent(content)}`
  }
  else {
    const blob = new Blob([content], { type: mimeType })
    objectUrl = URL.createObjectURL(blob)
    downLink.href = objectUrl
  }

  document.body.appendChild(downLink)
  downLink.click()
  document.body.removeChild(downLink)

  if (objectUrl) {
    URL.revokeObjectURL(objectUrl)
  }
}

/** Read a Blob as a Base64 string (data URL payload only). */
export function toBase64(file: Blob): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve((reader.result as string).split(`,`).pop()!)
    reader.onerror = error => reject(error)
  })
}

/** Build a Markdown table from keyed cell data. */
export function createTable({ data, rows, cols }: {
  data: { [k: string]: string }
  rows: number
  cols: number
}): string {
  let table = ``
  for (let i = 0; i < rows + 2; ++i) {
    table += `| `
    const currRow = []
    for (let j = 0; j < cols; ++j) {
      const rowIdx = i > 1 ? i - 1 : i
      currRow.push(i === 1 ? `---` : data[`k_${rowIdx}_${j}`] || `     `)
    }
    table += currRow.join(` | `)
    table += ` |\n`
  }

  return table
}
