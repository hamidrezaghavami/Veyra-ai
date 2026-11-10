import turkish from './tr.json'
const dictionary: Record<string,string> = turkish
export function translate(text: string, language: 'en'|'tr', values?: Record<string,string|number>): string {
  const interpolate = (value: string) => value.replace(/\{(\w+)\}/g, (match, name) => values?.[name] === undefined ? match : String(values[name]))
  if (language === 'en' || !text.trim()) return interpolate(text)
  const key = text.trim().replace(/\s+/g,' ')
  let translated = dictionary[key]
  if (!translated) {
    const duplicate = key.match(/^Possible duplicate of (.+)\. Review the original before approval\.$/)
    const line = key.match(/^Line item “(.+)” does not equal quantity × unit price\.$/)
    const highValue = key.match(/^High-value invoice \(10,000\+ ([A-Z]{3})\)\. Review carefully before approving\.$/)
    if (duplicate) translated = `${duplicate[1]} numaralı faturanın kopyası olabilir. Onaylamadan önce aslını inceleyin.`
    else if (line) translated = `“${line[1]}” satırının toplamı, miktar × birim fiyat ile eşleşmiyor.`
    else if (highValue) translated = `Yüksek tutarlı fatura (10.000+ ${highValue[1]}). Onaylamadan önce dikkatle inceleyin.`
  }
  return interpolate(translated ? text.replace(text.trim(),translated) : text)
}
