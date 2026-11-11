const amountFormats = ['en-US', 'tr-TR', 'fr-FR'].map(locale => new Intl.NumberFormat(locale, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
}))
const removeGroupingSpaces = (value: string) => value.replace(/[\s\u202f']/g, '')

export function documentValueMatcher(value: string | number): (text: string) => boolean {
  if (typeof value === 'string') {
    const expected = value.trim().toLowerCase()
    return text => !!expected && text.trim().toLowerCase() === expected
  }
  const expected = new Set([String(value), value.toFixed(2), ...amountFormats.map(format => removeGroupingSpaces(format.format(value)))])
  return text => {
    const token = text.trim()
      .replace(/^(?:[A-Z]{3}\s+|[$€£₺¥]\s*)/, '')
      .replace(/(?:\s+[A-Z]{3}|\s*[$€£₺¥])$/, '')
    return expected.has(removeGroupingSpaces(token))
  }
}
