// pages/api/feedback-analyze.js
import { list } from '@vercel/blob';

export const config = { maxDuration: 60 };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  try {
    const { blobs } = await list({ prefix: 'feedback/' });

    if (blobs.length === 0) {
      return res.status(200).json({
        success: true,
        result: {
          hasData: false,
          message: 'まだ振り返りデータがありません。投稿の反応を記録してみましょう。',
        },
      });
    }

    const items = await Promise.all(
      blobs.map(async (b) => {
        const r = await fetch(b.url);
        return r.json();
      })
    );

    const summary = items.map(d =>
      `${d.day}｜${d.type}｜${d.theme}｜いいね${d.likes}・インプレッション${d.impressions}・返信${d.replies}${d.memo ? `｜メモ:${d.memo}` : ''}`
    ).join('\n');

    const prompt = `以下はXアカウントの過去の投稿実績データです。傾向を分析して、次回の戦略に活かせる気づきを出してください。

【過去の投稿実績】
${summary}

【分析してほしいこと】
・どの投稿タイプ（有益Tips/商品紹介/共感など）が反応良いか
・どんなテーマが伸びているか
・改善すべき点

JSONのみ出力・前後に余分な文字不要：
{"bestType":"一番反応が良いタイプ","bestTypeReason":"理由100文字","worstType":"反応が薄いタイプ","improvement":"改善提案150文字","insight":"重要な気づき100文字"}`;

    const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
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

    const data = await claudeRes.json();
    const rawText = (data.content || [])
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('');
    const clean = rawText.replace(/```json|```/g, '').trim();
    const startIdx = clean.indexOf('{');
    const endIdx = clean.lastIndexOf('}');
    const parsed = JSON.parse(clean.substring(startIdx, endIdx + 1));

    return res.status(200).json({
      success: true,
      result: { hasData: true, ...parsed, dataCount: items.length },
    });
  } catch (e) {
    return res.status(500).json({ error: '分析失敗', message: e.message });
  }
}
