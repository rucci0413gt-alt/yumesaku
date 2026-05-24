// pages/api/ranking.js
// Yahoo!ショッピング ランキングAPI

export default async function handler(req, res) {
  const { category } = req.query;

  // ガジェット×クリエイター向けカテゴリID
  // Yahoo!ショッピングの主要カテゴリ
  const categoryMap = {
    'gadget': '2502',      // 家電・AV・カメラ
    'pc': '2504',          // パソコン・周辺機器
    'audio': '36807',      // オーディオ
    'mobile': '36811',     // スマートフォン・携帯電話
    'camera': '23976',     // カメラ・ビデオカメラ
    'all': '2502',         // デフォルト：家電
  };

  const categoryId = categoryMap[category] || categoryMap['all'];

  const YAHOO_RANKING_API = 'https://shopping.yahooapis.jp/ShoppingWebService/V1/json/categoryRanking';
  
  const params = new URLSearchParams({
    appid: process.env.YAHOO_APP_ID,
    category_id: categoryId,
  });

  try {
    const response = await fetch(`${YAHOO_RANKING_API}?${params.toString()}`);
    const data = await response.json();

    if (data.Error || data.error) {
      return res.status(400).json({
        error: 'Yahoo!ランキングAPIエラー',
        detail: data.Error?.Message || data.error_description
      });
    }

    const items = (data.ResultSet?.[0]?.Result || []).slice(0, 20).map((item, index) => ({
      rank: index + 1,
      name: item.Name,
      price: parseInt(item.Price?.[0]?._value || 0),
      url: item.Url?.[0]?.Medium || '',
      image: item.Image?.[0]?.Medium || item.Image?.[0]?.Small || '',
      shop: item.Store?.[0]?.Name || '',
      review: parseFloat(item.Review?.[0]?.Rate || 0),
      reviewCount: parseInt(item.Review?.[0]?.Count || 0),
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
