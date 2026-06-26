// pages/api/article.js
export const config = {
  maxDuration: 60,
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST only' });
  }

  const { category = 'PC周辺' } = req.body;

  const keywords = {
    'ガジェット': 'ガジェット 便利',
    'PC周辺': 'PC周辺機器',
    'オーディオ': 'ワイヤレスイヤホン',
    'スマホ': 'スマホアクセサリー',
    'カメラ': 'カメラ',
  };

  const keyword = keywords[category] || keywords['PC周辺'];

  try {
    const yahooRes = await fetch(
      `https://shopping.yahooapis.jp/ShoppingWebService/V3/itemSearch?` +
      new URLSearchParams({
        appid: process.env.YAHOO_APP_ID,
        query: keyword,
        results: 5,
        sort: '-score',
      })
    );

    if (!yahooRes.ok) {
      return res.status(500).json({ error: 'Yahoo!API失敗', status: yahooRes.status });
    }

    const yahooData = await yahooRes.json();
    const items = (yahooData.hits || []).map(item => ({
      name: item.name,
      price: item.price,
      url: item.url,
      image: item.exImage?.url || item.image?.medium || item.image?.small || '',
      shop: item.seller?.name || '',
      review: item.review?.rate || 0,
      reviewCount: item.review?.count || 0,
    }));

    if (items.length === 0) {
      return res.status(400).json({ error: '商品なし' });
    }

    const productList = items.map((item, i) =>
      `${i + 1}. ${item.name} - ¥${item.price.toLocaleString()} (レビュー:${item.review}点 ${item.reviewCount}件)`
    ).join('\n');

    const prompt = `以下の商品リストをもとに、在宅ワーカー向けのガジェットレビュー記事をJSON形式で作成してください。

カテゴリ：${category}
商品リスト：
${productList}

ルール：
・友達に話すような自然な口調
・体験談風（「実際に使うと」「やっぱ」など）
・押しつけがましくない
・JSONのみ出力・前後に余分な文字不要

{"title":"タイトル30文字以内","intro":"リード文150文字","reviews":[{"rank":1,"headline":"魅力20文字","description":"特徴150文字","recommendFor":"対象30文字"},{"rank":2,"headline":"魅力20文字","description":"特徴150文字","recommendFor":"対象30文字"},{"rank":3,"headline":"魅力20文字","description":"特徴150文字","recommendFor":"対象30文字"},{"rank":4,"headline":"魅力20文字","description":"特徴150文字","recommendFor":"対象30文字"},{"rank":5,"headline":"魅力20文字","description":"特徴150文字","recommendFor":"対象30文字"}],"conclusion":"まとめ100文字"}`;

    const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: prompt,
          }
        ],
      }),
    });

    if (!claudeRes.ok) {
      const errorText = await claudeRes.text();
      return res.status(500).json({
        error: 'Claude API失敗',
        status: claudeRes.status,
        detail: errorText.substring(0, 500),
      });
    }

    const claudeData = await claudeRes.json();

    const rawText = (claudeData.content || [])
      .filter(block => block.type === 'text')
      .map(block => block.text)
      .join('');

    const cleanText = rawText
      .replace(/<[^>]+>/g, '')
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    let article;
    try {
      const startIdx = cleanText.indexOf('{');
      const endIdx = cleanText.lastIndexOf('}');
      if (startIdx === -1 || endIdx === -1) throw new Error('JSON not found');
      article = JSON.parse(cleanText.substring(startIdx, endIdx + 1));
    } catch (e) {
      return res.status(500).json({
        error: 'JSON解析エラー',
        raw: cleanText.substring(0, 500),
      });
    }

    return res.status(200).json({
      success: true,
      category,
      article,
      items,
      generatedAt: new Date().toISOString(),
    });

  } catch (error) {
    return res.status(500).json({
      error: 'サーバーエラー',
      message: error.message,
    });
  }
}

