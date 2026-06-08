// pages/api/marketing.js
// 📊 マーケティング分析API

export const config = { maxDuration: 60 };

export default async function handler(req, res) {
if (req.method !== 'POST') {
return res.status(405).json({ error: 'Method not allowed' });
}

const { posts } = req.body;

if (!posts || posts.length === 0) {
return res.status(400).json({ error: 'データがありません' });
}

// データを整形
const postData = posts.map((p, i) => `
投稿${i + 1}:
・商品名：${p.product}
・カテゴリ：${p.category}
・投稿時間：${p.hour ? p.hour + '時' : '不明'}
・インプレッション：${p.impressions || 0}
・いいね：${p.likes || 0}
・クリック数：${p.clicks || 0}
・人物画像：${p.image}
`).join('\n');

const prompt = `あなたはSNSマーケティングの専門家です。
以下はXへのガジェット系アフィリエイト投稿のデータです。

${postData}

このデータを分析して、以下をJSONで返してください。
説明・マークダウン不要。JSONのみ出力。

{
"winPattern": "何が共通して反応が良いか・勝ちパターンを100文字で",
"bestTime": "最適な投稿時間帯とその理由を60文字で",
"improvement": "今すぐ改善できる点を100文字で",
"nextProducts": [
{
"product": "次に投稿すべき商品名",
"reason": "なぜこの商品が売れそうか60文字",
"hook": "X投稿の冒頭フック30文字"
},
{
"product": "次に投稿すべき商品名2",
"reason": "なぜこの商品が売れそうか60文字",
"hook": "X投稿の冒頭フック30文字"
},
{
"product": "次に投稿すべき商品名3",
"reason": "なぜこの商品が売れそうか60文字",
"hook": "X投稿の冒頭フック30文字"
}
]
}`;

try {
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

return res.status(200).json({
success: true,
winPattern: analysis.winPattern || '',
bestTime: analysis.bestTime || '',
improvement: analysis.improvement || '',
nextProducts: analysis.nextProducts || [],
});

} catch (error) {
return res.status(500).json({ error: 'サーバーエラー', message: error.message });
}
}
