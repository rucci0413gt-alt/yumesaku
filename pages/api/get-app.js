// pages/api/get-app.js
export default async function handler(req, res) {
  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'idが必要です' });

  try {
    const blobUrl = `https://${process.env.BLOB_STORE_HOSTNAME || 'public.blob.vercel-storage.com'}/apps/${id}.html`;
    const blobRes = await fetch(blobUrl);
    if (!blobRes.ok) return res.status(404).json({ error: '見つかりません' });
    const html = await blobRes.text();
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(html);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
