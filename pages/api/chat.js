export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { messages } = req.body;

  const system = `あなたは「ユメサク」というサービスのAIエージェントです。
ユーザーが日本語で話しかけると、会話しながら要件を整理し、最終的にWebアプリを生成します。

【会話のルール】
- 親しみやすく、明るいトーンで話す
- 技術用語は一切使わない
- 質問は一度に1〜2個まで
- 3〜4回の会話で要件を把握する

【アプリ生成のタイミング】
十分にヒアリングできたら（3〜4往復後）、以下のタグでHTMLアプリを出力する：

<GENERATE_APP>
<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>アプリタイトル</title>
<style>
/* モバイルファーストのスタイル */
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Hiragino Sans', sans-serif; background: #f5f5f5; }
/* 以下スタイル */
</style>
</head>
<body>
<!-- アプリの中身 -->
<script>
// 必要なJavaScript
</script>
</body>
</html>
</GENERATE_APP>

【生成するアプリの要件】
- 完全に動作するシングルHTMLファイル
- スマホでも使いやすいデザイン
- LocalStorageでデータを保存
- 見た目は清潔感があり、使いやすいUI
- 日本語UI

生成後は「完成しました！下のプレビューで確認してください😊」と伝える。`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "anthropic-version": "2023-06-01",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 4000,
        system,
        messages,
      }),
    });

    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data?.error?.message });

    const reply = data.content?.map((c) => c.text || "").join("") || "";

    // HTMLアプリが含まれているか確認
    const appMatch = reply.match(/<GENERATE_APP>([\s\S]*?)<\/GENERATE_APP>/);
    const appHtml = appMatch ? appMatch[1].trim() : null;
    const message = reply.replace(/<GENERATE_APP>[\s\S]*?<\/GENERATE_APP>/, "").trim();

    return res.status(200).json({ message, appHtml });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
