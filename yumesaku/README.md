# ユメサク - デプロイ手順

## Vercelへのデプロイ（3ステップ）

### Step 1｜GitHubにアップロード
1. https://github.com でアカウント作成（無料）
2. 「New repository」→ 名前を「yumesaku」にする
3. このZIPを解凍してファイルを全部アップロード

### Step 2｜Vercelに接続
1. https://vercel.com でGitHubアカウントでログイン
2. 「Add New Project」→「yumesaku」リポジトリを選択
3. そのまま「Deploy」をクリック

### Step 3｜APIキーを設定
1. Vercelのプロジェクト画面 → 「Settings」→「Environment Variables」
2. 以下を追加：
   - Name: `ANTHROPIC_API_KEY`
   - Value: あなたのAPIキー（https://console.anthropic.com で取得）
3. 「Save」→「Redeploy」

### 完成！🎉
VercelのURLにアクセスするとユメサクが動きます。

---

## ローカルで試す場合

```bash
npm install
cp .env.local.example .env.local
# .env.localを開いてAPIキーを入力
npm run dev
```
→ http://localhost:3000 で確認

---

## 使い方
1. テキストボックスに作りたいものを日本語で入力
2. AIが質問しながら要件を整理
3. 自動でアプリが生成される
4. 「プレビュー」タブで確認
5. 「ダウンロード」でHTMLファイルを保存
