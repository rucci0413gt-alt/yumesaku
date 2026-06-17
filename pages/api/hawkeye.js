// pages/api/hawkeye.js
// 🦅 鷹眼 - 検索窓対応版
export const config = { maxDuration: 60 };

const GENRE_KEYWORDS = {
'エンジニア向け': [
'メカニカルキーボード',
'トラックボール マウス',
'モニターアーム',
'USB-C ドッキングステーション',
'ノートパソコン スタンド',
'ノイズキャンセリング イヤホン',
'オフィスチェア',
'ブルーライトカット メガネ',
'カフェイン サプリ 集中',
'デスクライト 目に優しい',
],
'ガジェット': [
'ガジェット 便利グッズ',
'スマートホーム デバイス',
'ポータブル バッテリー',
'ワイヤレス充電器',
'Bluetoothスピーカー',
'アクションカメラ',
'スマートウォッチ',
'ノイズキャンセリング イヤホン',
'モバイルプロジェクター',
'ドローン 小型',
],
'在宅ワーク': [
'WEBカメラ 高画質',
'リングライト 配信',
'マイク 配信用',
'デスク 昇降',
'チェア 腰痛 在宅',
'モニター 27インチ',
'キーボード 静音',
'マウス エルゴノミクス',
'ヘッドセット ノイズキャンセル',
'デスクマット 大型',
],
'ドリンク・サプリ': [
'カフェイン サプリ 集中',
'プロテイン ホエイ',
'ビタミン サプリ 疲労回復',
'エナジードリンク 健康',
'コーヒー スペシャルティ',
'緑茶 カテキン',
'マグネシウム サプリ',
'オメガ3 DHA EPA',
'マルチビタミン 男性',
'クレアチン パウダー',
],
'カメラ・撮影': [
'ミラーレス一眼 初心者',
'単焦点レンズ',
'カメラバッグ',
'SDカード 高速',
'ジンバル スマホ',
'ストロボ 撮影',
'グリーンバック 配信',
'レンズフィルター',
'カメラストラップ',
'三脚 軽量',
],
};

// カスタムキーワードからリストを生成
function buildKeywordsFromInput(genre, persona, productType) {
const baseKeywords = GENRE_KEYWORDS[genre] || GENRE_KEYWORDS['エンジニア向け'];

// ペルソナに合わせてキーワードを調整
if (persona && persona !== 'エンジニア') {
return baseKeywords.map(kw => {
if (persona === '20代') return kw;
if (persona === 'クリエイター') return kw.replace('エンジニア', 'クリエイター');
if (persona === '在宅ワーカー') return kw;
return kw;
});
}
return baseKeywords;
}

function pickRandom(arr, n) {
const copy = [...arr];
const out = [];
while (copy.length && out.length < n) {
const i = Math.floor(Math.random() * copy.length);
out.push(copy.splice(i, 1)[0]);
}
return out;
}

export default async function handler(req, res) {
const body = req.method === 'POST' ? req.body : req.query;
const genre = body?.genre || 'エンジニア向け';
const persona = body?.persona || 'エンジニア';
const productType = body?.productType || '鉄板';
const customKeyword = body?.customKeyword || '';

// カスタムキーワードがあればそれを優先
let keywords;
if (customKeyword.trim()) {
keywords = [customKeyword.trim()];
} else {
keywords = buildKeywordsFromInput(genre, persona, productType);
}

const selectedKeywords = pickRandom(keywords, 5);

try {
let products = [];
for (const kw of selectedKeywords) {
const r = await fetch('https://shopping.yahooapis.jp/ShoppingWebService/V3/itemSearch?' +
new URLSearchParams({ appid: process.env.YAHOO_APP_ID, query: kw, results: 3, sort: '-score' }));
const d = await r.json();
(d.hits || []).forEach(item => {
products.push({
keyword: kw,
name: item.name,
price: item.price,
url: item.url,
image: item.exImage?.url || item.image?.medium || '',
review: item.review?.rate || 0,
reviewCount: item.review?.count || 0,
});
});
}

if (products.length === 0) {
return res.status(400).json({ error: '商品が取得できませんでした' });
}

const list = products.map((p, i) =>
`商品番号${i}: ${p.name} / ¥${p.price} / ★${p.review}(${p.reviewCount}件) / キーワード:${p.keyword}`
).join('\n');

// productTypeに合わせてAIの指示を変える
const tagInstruction = productType === '次来る' ? '「次来る」' :
productType === '抱き合わせ' ? '「抱合せ」' : '「鉄板」';

const prompt = `あなたは「鷹眼」エージェント。${persona}が欲しがる商品を見抜くプロです。

ジャンル：${genre}
ペルソナ：${persona}
商品タイプ：${productType}

以下は今人気の商品リストです：
${list}

この中から、${persona}向けに今すぐ投稿する価値のある商品を最大5つ選び、洞察を加えてください。
商品タイプ「${productType}」の観点で選んでください。

必ず商品番号を正確に指定してください。

JSONのみ出力（説明・マークダウン不要）：
{
"picks": [
{"index": 商品番号（0始まりの整数）, "reason": "なぜ${persona}におすすめか40文字", "xHook": "Xでバズりそうな一言フック30文字", "tag": "${tagInstruction}"}
],
"nextTrend": "次に流行りそうな商品ジャンルの予想と理由80文字",
"bundle": "一緒に買われそうな抱き合わせ提案80文字"
}`;

const c = await fetch('https://api.anthropic.com/v1/messages', {
method: 'POST',
headers: {
'Content-Type': 'application/json',
'x-api-key': process.env.ANTHROPIC_API_KEY,
'anthropic-version': '2023-06-01',
},
body: JSON.stringify({
model: 'claude-haiku-4-5-20251001',
max_tokens: 1500,
messages: [{ role: 'user', content: prompt }],
}),
});

if (!c.ok) {
const t = await c.text();
return res.status(500).json({ error: 'AI分析失敗', detail: t.substring(0, 300) });
}

const cd = await c.json();
const text = cd.content?.[0]?.text || '';
let analysis;
try {
analysis = JSON.parse(text.match(/\{[\s\S]*\}/)[0]);
} catch (e) {
return res.status(500).json({ error: 'AI結果の解析に失敗', raw: text.substring(0, 300) });
}

const recommendations = (analysis.picks || [])
.filter(p => {
const idx = parseInt(p.index);
return !isNaN(idx) && products[idx];
})
.map((p, i) => {
const idx = parseInt(p.index);
return {
rank: i + 1,
...products[idx],
reason: p.reason,
xHook: p.xHook,
tag: p.tag || '鉄板',
};
});

return res.status(200).json({
success: true,
genre,
persona,
productType,
keywords: selectedKeywords,
recommendations,
nextTrend: analysis.nextTrend || '',
bundle: analysis.bundle || '',
generatedAt: new Date().toISOString(),
});

} catch (error) {
return res.status(500).json({ error: 'サーバーエラー', message: error.message });
}
}
