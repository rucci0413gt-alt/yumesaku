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

    const prompt = `ガジェット好きの在宅ワーカーが、実際に使って感じたことをそのまま書いたような口コミ記事を作ってください。

カテゴリ：${category}
商品：
${productList}

【書き手のキャラクター設定】
・在宅歴3年以上のデスクワーカー
・ガジェットにお金をかけすぎた経験あり（失敗も知ってる）
・正直に「良い点」も「気になる点」も言える人
・友達に話しかけるような距離感で書く
・XやSNSのリアルな口コミを参考にする人

【文体のルール】
・語尾は「〜だ」「〜だね」「〜かな」「〜だと思う」を自然に混ぜる
・「正直」「ちょっと」「やっぱ」「なんか」を時々使う
・体験談風に「〜してみたら」「実際に使うと」を入れる
・テンションは落ち着いてるけど熱量がある感じ
・押しつけがましくない・でも芯がある
・XやSNSで話題になっている視点を自然に織り込む
・「Xで話題」「SNSで評判」などの表現を使って旬感を出す

【禁止事項（絶対守る）】
・「〜について」「〜することが大切」「〜となっています」は使わない
・冒頭の挨拶・前置きは禁止
・「いかがでしょうか」「ぜひチェック」「ぜひご検討」禁止
・「高品質」「おすすめ」だけの薄い表現は禁止
・同じ語尾を2回以上連続で使わない
・「まず〜、次に〜、最後に〜」の三段構成禁止
・<cite>タグや引用マークは絶対に使わない・出力しない

JSONのみ出力（説明文・マークダウン不要）：

{
  "title": "30文字以内タイトル",
  "intro": "150文字リード文",
  "xTrend": "XやSNSで話題になっているポイントを50文字で",
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
        'anthropic-beta': 'web-search-2025-03-05',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2000,
        tools: [
          {
            type: 'web_search_20250305',
            name: 'web_search',
            max_uses: 3,
          }
        ],
        messages: [
          {
            role: 'user',
            content: `以下の2つを順番に検索してから記事を作成してください。

【検索1】「${xKeyword}」
→ XやSNSで話題になっている${category}の最新トレンドや口コミを確認する

【検索2】「${items[0].name} レビュー 口コミ」
→ 1位商品の実際の評判を確認する

検索結果を踏まえて、以下の指示で記事を作成してください。

${prompt}`
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
    const text = rawText.replace(/<cite[^>]*>|<\/cite>/g, '');

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

