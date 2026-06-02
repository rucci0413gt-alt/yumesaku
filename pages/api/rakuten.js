// pages/api/ranking.js
// Yahoo!ショッピング ランキングAPI（カテゴリ日本語対応版）

export default async function handler(req, res) {
const { category } = req.query;

const categoryQueries = {
'ガジェット': 'デスク周り 在宅ワーク 便利グッズ',
'PC周辺': 'パソコン スタンド アクセサリー',
'オーディオ': 'ワイヤレスイヤホン ノイズキャンセリング',
'スマホ': 'スマホスタンド モバイルバッテリー',
'カメラ': 'ウェブカメラ 配信機材',
};

const query = categoryQueries[category] || 'デスク周り 在宅ワーク ガジェット';

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
image: item.exImage?.url || item.image?.medium || item.image?.small || '',
shop: item.seller?.name || '',
review: item.review?.rate || 0,
reviewCount: item.review?.count || 0,
}));

return res.status(200).json({
success: true,
category: category || 'ガジェット',
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
