export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://unrelativity-mentor.vercel.app');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: 'Query required' });
    const base = 'https://unrelativity.xyz/wp-json/wp/v2';
    const params = `search=${encodeURIComponent(query)}&per_page=3&_fields=title,excerpt,content`;
    const postsRes = await fetch(`${base}/posts?${params}`);
    const postsText = await postsRes.text();
    return res.status(200).json({ debug: postsText });
  } catch (e) {
    return res.status(500).json({ error: e.message, stack: e.stack });
  }
}
