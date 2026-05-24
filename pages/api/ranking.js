// pages/api/ranking.js
// Yahoo!ショッピング ランキングAPI（ガジェット×クリエイター特化版）

export default async function handler(req, res) {
  const { category } = req.query;

  // ガジェット×クリエイター向け精度UPキーワード
  const categoryQueries = {
    'gadget': 'デスク周り 在宅ワーク 便利グッズ',
    'pc': 'パソコン スタンド アクセサリー',
    'audio': 'ワイヤレスイヤホン ノイズキャンセリング',
    'mobile': 'スマホスタンド モバイルバッテリー',
    'camera': 'ウェブカメラ 配信機材',
    'all': '在宅ワーク ガジェット',
  };

  const query = categoryQueries[category] || categoryQueries['all'];

  const YAHOO_API = 'https://shopping.yahooapis.jp/ShoppingWebService/V3/itemSearch';
  
  const params = new URLSearchParams({
    appid: process.env.YAHOO_APP_ID,
    query: query,
    sort: '-score',
    results: 20
  });

  try {
    const response = await fetch(`${YAHOO_API}?${params.toString()}`);
    const data = await response.json();

    if (data.Error || data.error) {
      return res.status(400).json({
        error: 'Yahoo!ランキングAPIエラー',
        detail: data.Error?.Message || data.error_description || JSON.stringify(data.Error || data.error)
      });
    }

    const items = (data.hits || []).map((item, index) => ({
      rank: index + 1,
      name: item.name,
      price: item.price,
      url: item.url,
      image: item.image?.medium || item.image?.small || '',
      shop: item.seller?.name || '',
      review: item.review?.rate || 0,
      reviewCount: item.review?.count || 0,
    }));

    return res.status(200).json({
      success: true,
      category: category || 'all',
      query: query,
      count: items.length,
      items: items
    });

  } catch (error) {
    return res.status(500).json({
      error: 'サーバーエラー',
      message: error.message
    });
  }
}
