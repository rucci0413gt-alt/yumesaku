// pages/api/xstrategy.js
export const config = { maxDuration: 60 };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const { followers, postFreq, genre, troubles, recentPost, goal } = req.body;

  const prompt = `あなたはXのプロフェッショナルなSNS戦略コンサルタントです。
以下のユーザー情報をもとに、具体的で実行可能なX運用戦略と今週の投稿カレンダーを作成してください。

【ユーザー情報】
フォロワー数：${followers}人
投稿頻度：${postFreq}
ジャンル：${genre || 'ガジェット・リモートワーク'}
悩み：${(troubles || []).join('、')}
最近の投稿内容：${recentPost || '商品紹介がメイン'}
目標：${goal || 'フォロワーを増やしてアフィリエイト収益を得たい'}

【重要なルール】
・フォロワー0〜100人の初期段階に最適な戦略を提案
・商品紹介だけでなく、有益情報・共感・人となりを混ぜる
・すぐ実行できる具体的な投稿文を作る
・日本語で、友達に話すような自然な口調
・JSONのみ出力・前後に余分な文字不要

出力フォーマット：
{"diagnosis":"現状診断100文字","strategy":"今週の戦略方針150文字","bestTime":"最適投稿時間と理由80文字","hashtagTips":"ハッシュタグ戦略100文字","calendar":[{"day":"月曜日","type":"有益Tips","theme":"テーマ","post":"投稿文140文字以内"},{"day":"火曜日","type":"商品紹介","theme":"テーマ","post":"投稿文140文字以内"},{"day":"水曜日","type":"共感・あるある","theme":"テーマ","post":"投稿文140文字以内"},{"day":"木曜日","type":"有益Tips","theme":"テーマ","post":"投稿文140文字以内"},{"day":"金曜日","type":"商品紹介","theme":"テーマ","post":"投稿文140文字以内"},{"day":"土曜日","type":"週まとめ・雑談","theme":"テーマ","post":"投稿文140文字以内"},{"day":"日曜日","type":"軽い投稿・休息","theme":"テーマ","post":"投稿文140文字以内"}],"nextAction":"今すぐやること3つ","encouragement":"一言エール50文字"}`;

  try {
    const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 3000,
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
    return res.status(200).json({ success: true, result: parsed });
  } catch (e) {
    return res.status(500).json({ error: '分析失敗', message: e.message });
  }
}
