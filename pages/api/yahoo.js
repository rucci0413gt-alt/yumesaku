// pages/api/yahoo.js
// Yahoo!ショッピング 商品検索API（高画質版）

export default async function handler(req, res) {
  const { keyword } = req.query;

  if (!keyword) {
    return res.status(400).json({
      error: 'キーワードを指定してください',
      example: '/api/yahoo?keyword=iPhone'
    });
  }

  const YAHOO_API = 'https://shopping.yahooapis.jp/ShoppingWebService/V3/itemSearch';

  const params = new URLSearchParams({
    appid: process.env.YAHOO_APP_ID,
    query: keyword,
    results: 10
  });

  try {
    const response = await fetch(`${YAHOO_API}?${params.toString()}`);
    const data = await response.json();

    if (data.Error || data.error) {
      return res.status(400).json({
        error: 'Yahoo!APIエラー',
        detail: data.Error?.Message || data.error_description || JSON.stringify(data.Error || data.error)
      });
    }

    const items = (data.hits || []).map((item) => ({
      name: item.name,
      price: item.price,
      url: item.url,
      image: item.exImage?.url || item.image?.medium || item.image?.small || '',
      shop: item.seller?.name || '',
      review: item.review?.rate || 0,
      reviewCount: item.review?.count || 0,
      janCode: item.janCode || ''
    }));

    return res.status(200).json({
      success: true,
      count: items.length,
      keyword: keyword,
      totalResults: data.totalResultsAvailable || 0,
      items: items
    });

  } catch (error) {
    return res.status(500).json({
      error: 'サーバーエラー',
      message: error.message
    });
  }
}
