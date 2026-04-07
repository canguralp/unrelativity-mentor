export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://unrelativity-mentor.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: 'Query required' });
    const base = 'https://public-api.wordpress.com/wp/v2/sites/unrelativity.xyz';
    const params = `search=${encodeURIComponent(query)}&per_page=3&_fields=title,excerpt,content`;
    const [postsRes, pagesRes] = await Promise.all([
      fetch(`${base}/posts?${params}`),
      fetch(`${base}/pages?${params}`)
    ]);
    const [posts, pages] = await Promise.all([
      postsRes.json(),
      pagesRes.json()
    ]);
    const results = [...(Array.isArray(posts) ? posts : []), ...(Array.isArray(pages) ? pages : [])]
      .slice(0, 3)
      .map(item => {
        const title = item.title?.rendered || '';
        const content = item.content?.rendered
          ? item.content.rendered.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 800)
          : '';
        return `### ${title}\n${content}`;
      })
      .join('\n\n');
    return res.status(200).json({ context: results });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
