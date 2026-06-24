export const config = { maxDuration: 60 };
const CATEGORIES = ['ガジェット', 'PC周辺', 'オーディオ', 'スマホ', 'カメラ'];
export default async function handler(req, res) {
  const authHeader = req.headers['authorization'];
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'GET only' });
  }
  try {
    const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    const baseUrl = `https://${process.env.VERCEL_URL}`;
    const articleRes = await fetch(`${baseUrl}/api/article`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category }),
    });
    const articleData = await articleRes.json();
    return res.status(200).json({ success: true, category, title: articleData.article?.title });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
