// pages/api/rakuten.js
// 楽天市場 商品検索API（シンプル版）

export default async function handler(req, res) {
  const { keyword } = req.query;

  // キーワードチェック
  if (!keyword) {
    return res.status(400).json({
      error: 'キーワードを指定してください',
      example: '/api/rakuten?keyword=iPhone'
    });
  }

  // 楽天APIのURL
  const RAKUTEN_API = 'https://app.rakuten.co.jp/services/api/IchibaItem/Search/20220601';
  
  // パラメータ組み立て
  const params = new URLSearchParams({
    applicationId: process.env.RAKUTEN_APPLICATION_ID,
    affiliateId: process.env.RAKUTEN_AFFILIATE_ID,
    keyword: keyword,
    hits: 10,
    format: 'json'
  });

  try {
    // 楽天APIを呼び出す
    const response = await fetch(`${RAKUTEN_API}?${params.toString()}`);
    const data = await response.json();

    // エラーチェック
    if (data.error) {
      return res.status(400).json({
        error: '楽天APIエラー',
        detail: data.error_description || data.error
      });
    }

    // 必要な情報だけ整形して返す
    const items = (data.Items || []).map(({ Item }) => ({
      name: Item.itemName,
      price: Item.itemPrice,
      url: Item.affiliateUrl || Item.itemUrl,
      image: Item.mediumImageUrls?.[0]?.imageUrl || '',
      shop: Item.shopName,
      review: Item.reviewAverage,
      reviewCount: Item.reviewCount
    }));

    return res.status(200).json({
      success: true,
      count: items.length,
      keyword: keyword,
      items: items
    });

  } catch (error) {
    return res.status(500).json({
      error: 'サーバーエラー',
      message: error.message
    });
  }
}
