export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://unrelativity-mentor.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { id, type, slug } = req.body;
    if (!id && !slug) return res.status(400).json({ error: 'ID or slug required' });
    const base = 'https://public-api.wordpress.com/wp/v2/sites/unrelativity.xyz';
    const endpoint = type === 'post' ? 'posts' : 'pages';
    const url = slug
      ? `${base}/${endpoint}?slug=${encodeURIComponent(slug)}&_fields=title,content`
      : `${base}/${endpoint}/${id}?_fields=title,content`;
    const response = await fetch(url);
    if (!response.ok) return res.status(404).json({ error: 'Not found' });
    const data = await response.json();
    const item = Array.isArray(data) ? data[0] : data;
    if (!item) return res.status(404).json({ error: 'Not found' });
    const title = item.title?.rendered || '';
    const content = item.content?.rendered
      ? item.content.rendered.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
      : '';
    return res.status(200).json({ title, content });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
