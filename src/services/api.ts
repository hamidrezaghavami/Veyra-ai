export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`/api${path}`, {
    ...options,
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', 'X-Veyra-Request': '1', ...options.headers },
  })
  let result
  try { result = await response.json() }
  catch { throw new Error('The service is unavailable. Please try again later.') }
  if (!response.ok || !result.success) throw new Error(result.error || 'The request failed. Please try again.')
  return result.data
}
