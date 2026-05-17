export async function fetchOGData(url) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 4000)

  try {
    // Use jsonlink.io as a free OG proxy to avoid CORS
    const proxyUrl = `https://jsonlink.io/api/extract?url=${encodeURIComponent(url)}`
    const res = await fetch(proxyUrl, { signal: controller.signal })
    clearTimeout(timeout)

    if (!res.ok) return null
    const data = await res.json()

    return {
      name: data.title || '',
      imageUrl: data.images?.[0] || '',
      price: '',
    }
  } catch {
    clearTimeout(timeout)
    return null
  }
}
