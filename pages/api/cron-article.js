// pages/api/cron-article.js
import { put } from '@vercel/blob';

export const config = {
  maxDuration: 60,
};

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

    if (!articleRes.ok) throw new Error(`article API失敗: ${articleRes.status}`);

    const articleData = await articleRes.json();

    // 日付キーで保存
    const today = new Date().toISOString().slice(0, 10);
    const saveData = {
      date: today,
      category,
      article: articleData.article,
      items: articleData.items,
      generatedAt: new Date().toISOString(),
    };

    // Vercel Blobに保存
    await put(`daily/${today}.json`, JSON.stringify(saveData), {
      access: 'public',
      contentType: 'application/json',
    });

    return res.status(200).json({
      success: true,
      category,
      title: articleData.article?.title,
      date: today,
      message: `${category}の記事を生成・保存しました`,
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

