// Pure text layout utilities shared between the browser preview (Canvas API) and
// server-side PNG/PDF generation (opentype.js). No runtime-specific imports.

// Find the word-boundary split that produces the two most visually balanced lines.
// measureFn(word) → width in any consistent unit.
export function splitToTwoLines(text, measureFn) {
  const words = text.split(' ')
  if (words.length <= 1) return [text]

  const spaceW = measureFn(' ')
  const wordWidths = words.map(w => measureFn(w))
  const totalW = wordWidths.reduce((a, b) => a + b, 0) + spaceW * (words.length - 1)

  let bestSplit = Math.ceil(words.length / 2)
  let bestDiff = Infinity
  let line1W = 0

  for (let i = 1; i < words.length; i++) {
    line1W += wordWidths[i - 1] + (i > 1 ? spaceW : 0)
    const line2W = totalW - line1W - spaceW
    const diff = Math.abs(line1W - line2W)
    if (diff < bestDiff) { bestDiff = diff; bestSplit = i }
  }

  return [words.slice(0, bestSplit).join(' '), words.slice(bestSplit).join(' ')]
}

// Fit text into at most 2 lines, reducing font size until both lines fit within maxW.
// measureAtFn(text, size) → number — width in the same unit as maxW.
export function fitAndWrapText(text, maxW, initialSize, minSize, measureAtFn) {
  let size = initialSize

  while (size >= minSize) {
    const textW = measureAtFn(text, size)

    if (textW <= maxW) return { lines: [text], size }

    const lines = splitToTwoLines(text, w => measureAtFn(w, size))
    const maxLineW = Math.max(...lines.map(l => measureAtFn(l, size)))

    if (maxLineW <= maxW) return { lines, size }

    const nextSize = Math.max(minSize, Math.floor(size * 0.85))
    if (nextSize === size) break
    size = nextSize
  }

  return { lines: splitToTwoLines(text, w => measureAtFn(w, minSize)), size: minSize }
}
