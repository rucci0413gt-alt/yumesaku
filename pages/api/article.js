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

  const xSearchKeywords = {
    'ガジェット': 'site:x.com ガジェット おすすめ 買って良かった',
    'PC周辺': 'site:x.com PC周辺機器 在宅ワーク おすすめ',
    'オーディオ': 'site:x.com ワイヤレスイヤホン 買って良かった',
    'スマホ': 'site:x.com スマホアクセサリー おすすめ',
    'カメラ': 'site:x.com カメラ ガジェット おすすめ',
  };

  const keyword = keywords[category] || keywords['PC周辺'];
  const xKeyword = xSearchKeywords[category] || xSearchKeywords['PC周辺'];

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

    const prompt = `ガジェット好きの在宅ワーカーが書いた口コミ記事を作成してください。

カテゴリ：${category}
商品：
${productList}

【文体のルール】
・語尾は「〜だ」「〜だね」「〜かな」「〜だと思う」を自然に混ぜる
・「正直」「ちょっと」「やっぱ」「なんか」を時々使う
・体験談風に「〜してみたら」「実際に使うと」を入れる
・XやSNSで話題のポイントを自然に織り込む

【絶対禁止】
・<cite>タグや引用マーク・括弧内の出典は一切出力しない
・「いかがでしょうか」「ぜひ」禁止
・JSON以外の文字を出力しない

必ず以下のJSON形式のみで出力してください。
前後に説明文・マークダウン・コードブロックは一切不要です：

{"title":"30文字以内タイトル","intro":"150文字リード文","xTrend":"SNSで話題のポイント50文字","reviews":[{"rank":1,"headline":"20文字魅力","description":"150文字特徴","recommendFor":"30文字対象"},{"rank":2,"headline":"20文字魅力","description":"150文字特徴","recommendFor":"30文字対象"},{"rank":3,"headline":"20文字魅力","description":"150文字特徴","recommendFor":"30文字対象"},{"rank":4,"headline":"20文字魅力","description":"150文字特徴","recommendFor":"30文字対象"},{"rank":5,"headline":"20文字魅力","description":"150文字特徴","recommendFor":"30文字対象"}],"conclusion":"100文字まとめ"}`;

    const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'web-search-2025-03-05',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2000,
        tools: [
          {
            type: 'web_search_20250305',
            name: 'web_search',
            max_uses: 2,
          }
        ],
        messages: [
          {
            role: 'user',
            content: `「${xKeyword}」で検索してSNSのトレンドを確認してから、以下の指示で記事をJSON形式のみで作成してください。\n\n${prompt}`
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

    // 不要タグ・記号を除去
    const cleanText = rawText
      .replace(/<cite[^>]*>[\s\S]*?<\/cite>/g, '')
      .replace(/<[^>]+>/g, '')
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    let article;
    try {
      const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('JSON not found');
      article = JSON.parse(jsonMatch[0]);
    } catch (e) {
      // JSON修復を試みる
      try {
        const startIdx = cleanText.indexOf('{');
        const endIdx = cleanText.lastIndexOf('}');
        if (startIdx !== -1 && endIdx !== -1) {
          article = JSON.parse(cleanText.substring(startIdx, endIdx + 1));
        } else {
          throw new Error('JSON範囲不明');
        }
      } catch (e2) {
        return res.status(500).json({
          error: 'JSON解析エラー',
          raw: cleanText.substring(0, 500),
        });
      }
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

