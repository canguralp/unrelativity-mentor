export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://unrelativity-mentor.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { id, type } = req.body;
    if (!id) return res.status(400).json({ error: 'ID required' });
    const base = 'https://public-api.wordpress.com/wp/v2/sites/unrelativity.xyz';
    const endpoint = type === 'post' ? 'posts' : 'pages';
    const response = await fetch(`${base}/${endpoint}/${id}?_fields=title,content,slug`);
    if (!response.ok) return res.status(404).json({ error: 'Not found' });
    const data = await response.json();
    const title = data.title?.rendered || '';
    const content = data.content?.rendered
      ? data.content.rendered.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
      : '';
    return res.status(200).json({ title, content, slug: data.slug });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
