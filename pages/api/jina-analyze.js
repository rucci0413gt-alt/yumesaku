// pages/api/jina-analyze.js
// Jina AI競合リサーチAPI

export const config = { maxDuration: 60 };

export default async function handler(req, res) {
if (req.method !== 'POST') {
return res.status(405).json({ error: 'Method not allowed' });
}

const { url } = req.body;
if (!url) return res.status(400).json({ error: 'URLが必要です' });

try {
// Jina AIでページ内容を取得
const jinaRes = await fetch(url, {
headers: { 'Accept': 'text/plain' }
});

if (!jinaRes.ok) {
return res.status(400).json({ error: '投稿の取得に失敗しました。URLを確認してください。' });
}

const content = await jinaRes.text();

if (!content || content.length < 50) {
return res.status(400).json({ error: '投稿内容を取得できませんでした。' });
}

// Claude AIで分析
const prompt = `以下はSNS投稿の内容です。ガジェット・在宅ワーク系アフィリエイト投稿の参考にするため分析してください。

${content.slice(0, 3000)}

JSONのみ出力（説明不要）：
{
"buzzPattern": "この投稿がバズっている理由・パターンを80文字で",
"products": "紹介されている商品・ジャンルを60文字で",
"application": "ガジェ速アカウントへの応用アイデアを80文字で",
"hookSample": "この投稿を参考にしたX投稿フック文章（40文字）"
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
max_tokens: 1000,
messages: [{ role: 'user', content: prompt }],
}),
});

const cd = await c.json();
const text = cd.content?.[0]?.text || '';

let analysis;
try {
analysis = JSON.parse(text.match(/\{[\s\S]*\}/)[0]);
} catch (e) {
return res.status(500).json({ error: 'AI分析に失敗しました' });
}

return res.status(200).json({
success: true,
buzzPattern: analysis.buzzPattern || '',
products: analysis.products || '',
application: analysis.application || '',
hookSample: analysis.hookSample || '',
});

} catch (error) {
return res.status(500).json({ error: 'サーバーエラー', message: error.message });
}
}
