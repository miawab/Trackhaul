export default async function handler(req, res) {
  const { url } = req.query
  if (!url) return res.status(400).json({ error: 'Missing url' })
  try {
    const r = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`)
    const shortUrl = (await r.text()).trim()
    if (shortUrl.startsWith('https://tinyurl.com/')) return res.json({ shortUrl })
  } catch {}
  res.json({ shortUrl: url })
}
