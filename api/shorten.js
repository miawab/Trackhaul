export default async function handler(req, res) {
  const { url } = req.query
  if (!url) return res.status(400).json({ error: 'Missing url' })
  try {
    const r = await fetch(`https://is.gd/create.php?format=json&url=${encodeURIComponent(url)}`)
    const data = await r.json()
    if (data.shorturl) return res.json({ shortUrl: data.shorturl })
  } catch {}
  res.json({ shortUrl: url })
}
