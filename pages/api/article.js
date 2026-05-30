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
      `${i + 1}. ${item.name} - ¥${item.price.toLocaleString()}`
    ).join('\n');

    const prompt = `在宅ワーカー・クリエイター向け商品レビュー記事を書いてください。

カテゴリ：${category}
商品：
${productList}

JSONのみ出力（説明文・マークダウン不要）：

{
  "title": "30文字以内タイトル",
  "intro": "150文字リード文",
  "reviews": [
    {"rank":1,"headline":"20文字魅力","description":"150文字特徴","recommendFor":"30文字対象"},
    {"rank":2,"headline":"20文字魅力","description":"150文字特徴","recommendFor":"30文字対象"},
    {"rank":3,"headline":"20文字魅力","description":"150文字特徴","recommendFor":"30文字対象"},
    {"rank":4,"headline":"20文字魅力","description":"150文字特徴","recommendFor":"30文字対象"},
    {"rank":5,"headline":"20文字魅力","description":"150文字特徴","recommendFor":"30文字対象"}
  ],
  "conclusion": "100文字まとめ"
}`;

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
        messages: [{ role: 'user', content: prompt }],
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
    const text = claudeData.content?.[0]?.text || '';

    let article;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('JSON not found');
      article = JSON.parse(jsonMatch[0]);
    } catch (e) {
      return res.status(500).json({
        error: 'JSON解析エラー',
        raw: text.substring(0, 500),
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
