import { put } from '@vercel/blob';

export const config = { maxDuration: 60 };

const CATEGORIES = ['ガジェット', 'PC周辺', 'オーディオ', 'スマホ', 'カメラ'];

export default async function handler(req, res) {
  try {
    const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    const baseUrl = 'https://yumesaku-qxed.vercel.app';

    const articleRes = await fetch(`${baseUrl}/api/article`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category }),
    });

    if (!articleRes.ok) throw new Error(`article API失敗: ${articleRes.status}`);

    const articleData = await articleRes.json();
    const today = new Date().toISOString().slice(0, 10);
    const saveData = {
      date: today,
      category,
      article: articleData.article,
      items: articleData.items,
      generatedAt: new Date().toISOString(),
    };

    await put(`daily/${today}.json`, JSON.stringify(saveData), {
      access: 'public',
      contentType: 'application/json',
    });

    return res.status(200).json({
      success: true,
      category,
      title: articleData.article?.title,
      message: '生成・保存完了！',
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

