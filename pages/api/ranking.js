// pages/api/ranking.js
// Yahoo!ショッピング ランキングAPI（V3売れ筋ソート版）

export default async function handler(req, res) {
  const { category } = req.query;

  // ガジェット×クリエイター向けカテゴリID
  const categoryMap = {
    'gadget': '2502',      // 家電・AV・カメラ
    'pc': '2504',          // パソコン・周辺機器
    'audio': '36807',      // オーディオ
    'mobile': '36811',     // スマートフォン・携帯電話
    'camera': '23976',     // カメラ・ビデオカメラ
    'all': '2502',
  };

  const categoryId = categoryMap[category] || categoryMap['all'];

  // V3 itemSearch を売れ筋ソートで使用
  const YAHOO_API = 'https://shopping.yahooapis.jp/ShoppingWebService/V3/itemSearch';
  
  const params = new URLSearchParams({
    appid: process.env.YAHOO_APP_ID,
    category_id: categoryId,
    sort: '-score',  // 売れ筋・人気順
    results: 20,
    in_stock: 'true'  // 在庫ありのみ
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
