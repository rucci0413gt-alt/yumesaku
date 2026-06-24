{
  "crons": [
    {
      "path": "/api/cron-article",
      "schedule": "0 21 * * *"
    }
  ]
}
// pages/api/cron-article.js
// 毎朝6時（UTC 21時）に自動実行されるCronジョブ

export const config = {
  maxDuration: 60,
};

const CATEGORIES = ['ガジェット', 'PC周辺', 'オーディオ', 'スマホ', 'カメラ'];

export default async function handler(req, res) {
  // Vercel Cronからのリクエストのみ許可
  const authHeader = req.headers['authorization'];
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'GET only' });
  }

  try {
    // ランダムにカテゴリを1つ選ぶ
    const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];

    // article APIを内部呼び出し
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000';

    const articleRes = await fetch(`${baseUrl}/api/article`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category }),
    });

    if (!articleRes.ok) {
      throw new Error(`article API失敗: ${articleRes.status}`);
    }

    const articleData = await articleRes.json();

    // 成功ログ
    console.log(`[Cron] ${new Date().toISOString()} - ${category}の記事生成完了`);
    console.log(`[Cron] タイトル: ${articleData.article?.title}`);

    return res.status(200).json({
      success: true,
      category,
      title: articleData.article?.title,
      generatedAt: new Date().toISOString(),
      message: `${category}カテゴリの記事を自動生成しました`,
    });

  } catch (error) {
    console.error('[Cron] エラー:', error.message);
    return res.status(500).json({
      error: 'Cron実行エラー',
      message: error.message,
    });
  }
}
