// pages/xstrategy.js
import { useState } from 'react';
import Head from 'next/head';

export default function XStrategy() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const [form, setForm] = useState({
    followers: '',
    postFreq: '毎日',
    genre: 'ガジェット・リモートワーク',
    troubles: [],
    recentPost: '',
    goal: '',
  });

  const troubleOptions = [
    'フォロワーが増えない',
    '投稿しても反応がない',
    '何を投稿すればいいかわからない',
    '商品記事しか投稿できていない',
    'ハッシュタグが合ってるか不安',
    '投稿時間がわからない',
  ];

  const toggleTrouble = (t) => {
    setForm(f => ({
      ...f,
      troubles: f.troubles.includes(t)
        ? f.troubles.filter(x => x !== t)
        : [...f.troubles, t],
    }));
  };

  const analyze = async () => {
    setLoading(true);
    setResult(null);
    try {
      const prompt = `あなたはXのプロフェッショナルなSNS戦略コンサルタントです。
以下のユーザー情報をもとに、具体的で実行可能なX運用戦略と今週の投稿カレンダーを作成してください。

【ユーザー情報】
フォロワー数：${form.followers}人
投稿頻度：${form.postFreq}
ジャンル：${form.genre}
悩み：${form.troubles.join('、')}
最近の投稿内容：${form.recentPost || '商品紹介がメイン'}
目標：${form.goal || 'フォロワーを増やしてアフィリエイト収益を得たい'}

【重要なルール】
・フォロワー0〜100人の初期段階に最適な戦略を提案
・商品紹介だけでなく、有益情報・共感・人となりを混ぜる
・すぐ実行できる具体的な投稿文を作る
・日本語で、友達に話すような自然な口調
・JSONのみ出力・前後に余分な文字不要

出力フォーマット：
{
  "diagnosis": "現状診断（100文字）",
  "strategy": "今週の戦略方針（150文字）",
  "bestTime": "最適投稿時間と理由（80文字）",
  "hashtagTips": "ハッシュタグ戦略（100文字）",
  "calendar": [
    {"day": "月曜日", "type": "有益Tips", "theme": "テーマ", "post": "実際の投稿文（140文字以内・ハッシュタグ含む）"},
    {"day": "火曜日", "type": "商品紹介", "theme": "テーマ", "post": "実際の投稿文（140文字以内・ハッシュタグ含む）"},
    {"day": "水曜日", "type": "共感・あるある", "theme": "テーマ", "post": "実際の投稿文（140文字以内・ハッシュタグ含む）"},
    {"day": "木曜日", "type": "有益Tips", "theme": "テーマ", "post": "実際の投稿文（140文字以内・ハッシュタグ含む）"},
    {"day": "金曜日", "type": "商品紹介", "theme": "テーマ", "post": "実際の投稿文（140文字以内・ハッシュタグ含む）"},
    {"day": "土曜日", "type": "週まとめ・雑談", "theme": "テーマ", "post": "実際の投稿文（140文字以内・ハッシュタグ含む）"},
    {"day": "日曜日", "type": "軽い投稿・休息", "theme": "テーマ", "post": "実際の投稿文（140文字以内・ハッシュタグ含む）"}
  ],
  "nextAction": "今すぐやること3つ（各50文字）",
  "encouragement": "一言エール（50文字）"
}`;

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'anthropic-beta': 'web-search-2025-03-05',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 3000,
          tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 2 }],
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      const data = await res.json();
      const rawText = (data.content || [])
        .filter(b => b.type === 'text')
        .map(b => b.text)
        .join('');
      const clean = rawText.replace(/```json|```/g, '').trim();
      const startIdx = clean.indexOf('{');
      const endIdx = clean.lastIndexOf('}');
      const parsed = JSON.parse(clean.substring(startIdx, endIdx + 1));
      setResult(parsed);
      setStep(3);
    } catch (e) {
      alert('分析に失敗しました。もう一度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  const copy = async (text, i) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(i);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const typeColors = {
    '有益Tips': { bg: '#EFF6FF', border: '#BFDBFE', label: '#1D4ED8' },
    '商品紹介': { bg: '#F0FFF4', border: '#BBF7D0', label: '#15803D' },
    '共感・あるある': { bg: '#FFF7ED', border: '#FED7AA', label: '#C2410C' },
    '週まとめ・雑談': { bg: '#FAF5FF', border: '#E9D5FF', label: '#7C3AED' },
    '軽い投稿・休息': { bg: '#F8FAFC', border: '#E2E8F0', label: '#64748B' },
  };

  return (
    <>
      <Head>
        <title>X戦略室 - yumesaku</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+JP:wght@400;500;700&display=swap" rel="stylesheet" />
      </Head>

      <div className="container">
        <header className="header">
          <div className="header-inner">
            <a href="/" className="logo">yumesaku</a>
            <nav className="nav">
              <a href="/shop" className="nav-link">Shop</a>
              <a href="/ranking" className="nav-link">Ranking</a>
              <a href="/article" className="nav-link">Article</a>
              <a href="/xstrategy" className="nav-link active">X戦略室</a>
            </nav>
          </div>
        </header>

        <section className="hero">
          <h1 className="hero-title">X戦略室</h1>
          <p className="hero-sub">あなたの状況をAIが分析して<br />今週やることを全部決めます</p>
        </section>

        {step === 1 && (
          <div className="card">
            <p className="section-label">📊 現状を教えてください</p>

            <div className="field">
              <label className="field-label">フォロワー数</label>
              <input
                type="number"
                value={form.followers}
                onChange={e => setForm(f => ({ ...f, followers: e.target.value }))}
                placeholder="例：3"
                className="input"
              />
            </div>

            <div className="field">
              <label className="field-label">投稿頻度</label>
              <div className="chip-group">
                {['毎日', '週3〜4回', '週1〜2回', 'ほぼ投稿できていない'].map(opt => (
                  <button
                    key={opt}
                    className={`chip ${form.postFreq === opt ? 'active' : ''}`}
                    onClick={() => setForm(f => ({ ...f, postFreq: opt }))}
                  >{opt}</button>
                ))}
              </div>
            </div>

            <div className="field">
              <label className="field-label">悩み（複数選択OK）</label>
              <div className="chip-group">
                {troubleOptions.map(t => (
                  <button
                    key={t}
                    className={`chip ${form.troubles.includes(t) ? 'active' : ''}`}
                    onClick={() => toggleTrouble(t)}
                  >{t}</button>
                ))}
              </div>
            </div>

            <div className="field">
              <label className="field-label">最近どんな投稿をしてる？（任意）</label>
              <textarea
                value={form.recentPost}
                onChange={e => setForm(f => ({ ...f, recentPost: e.target.value }))}
                placeholder="例：ガジェットの商品紹介ばかりしている"
                className="textarea"
                rows={3}
              />
            </div>

            <div className="field">
              <label className="field-label">目標（任意）</label>
              <textarea
                value={form.goal}
                onChange={e => setForm(f => ({ ...f, goal: e.target.value }))}
                placeholder="例：3ヶ月でフォロワー100人、アフィリ収益を得たい"
                className="textarea"
                rows={2}
              />
            </div>

            <button
              className="primary-btn"
              onClick={analyze}
              disabled={!form.followers || form.troubles.length === 0 || loading}
            >
              {loading ? 'AIが分析中...' : '🔍 AIに分析してもらう'}
            </button>
          </div>
        )}

        {loading && (
          <div className="loading">
            <div className="spinner"></div>
            <p className="loading-text">AIがあなたのX戦略を考えています...</p>
            <p className="loading-sub">最新のXトレンドも調査中🔍</p>
          </div>
        )}

        {result && (
          <div className="result">
            <div className="diagnosis-card">
              <p className="diag-label">🩺 現状診断</p>
              <p className="diag-text">{result.diagnosis}</p>
            </div>

            <div className="strategy-card">
              <p className="strat-label">🎯 今週の戦略</p>
              <p className="strat-text">{result.strategy}</p>
              <div className="strat-meta">
                <div className="meta-item">
                  <span className="meta-icon">🕐</span>
                  <span className="meta-text">{result.bestTime}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-icon">#️⃣</span>
                  <span className="meta-text">{result.hashtagTips}</span>
                </div>
              </div>
            </div>

            <p className="calendar-title">📅 今週の投稿カレンダー</p>
            {result.calendar?.map((item, i) => {
              const color = typeColors[item.type] || typeColors['軽い投稿・休息'];
              return (
                <div key={i} className="calendar-item" style={{ background: color.bg, border: `1px solid ${color.border}` }}>
                  <div className="cal-header">
                    <div>
                      <span className="cal-day">{item.day}</span>
                      <span className="cal-type" style={{ color: color.label }}>#{item.type}</span>
                    </div>
                    <button
                      className={`copy-btn ${copiedIndex === i ? 'copied' : ''}`}
                      onClick={() => copy(item.post, i)}
                    >
                      {copiedIndex === i ? '✓ コピー済み' : 'コピー'}
                    </button>
                  </div>
                  <p className="cal-theme">テーマ：{item.theme}</p>
                  <pre className="cal-post">{item.post}</pre>
                </div>
              );
            })}

            <div className="action-card">
              <p className="action-label">⚡ 今すぐやること</p>
              <p className="action-text" style={{whiteSpace:'pre-wrap'}}>{result.nextAction}</p>
            </div>

            <div className="encourage-card">
              <p className="encourage-text">💬 {result.encouragement}</p>
            </div>

            <button className="secondary-btn" onClick={() => { setStep(1); setResult(null); }}>
              🔄 もう一度分析する
            </button>
          </div>
        )}
      </div>

      <style jsx global>{`
        body { margin:0; padding:0; font-family:'Noto Sans JP','Inter',-apple-system,sans-serif; background:#FAFAFA; color:#1A1A1A; -webkit-font-smoothing:antialiased; }
        * { box-sizing:border-box; }
        .container { min-height:100vh; }
        .header { border-bottom:1px solid #E8E8E8; background:rgba(250,250,250,0.9); backdrop-filter:blur(20px); position:sticky; top:0; z-index:100; }
        .header-inner { max-width:800px; margin:0 auto; padding:16px 20px; display:flex; justify-content:space-between; align-items:center; }
        .logo { font-family:'Inter',sans-serif; font-size:20px; font-weight:700; color:#1A1A1A; text-decoration:none; }
        .nav { display:flex; gap:16px; }
        .nav-link { font-size:13px; color:#1A1A1A; text-decoration:none; font-weight:500; opacity:0.6; }
        .nav-link.active { opacity:1; font-weight:700; }
        .hero { text-align:center; padding:48px 20px 32px; }
        .hero-title { font-size:clamp(26px,6vw,40px); font-weight:700; margin:0 0 12px; letter-spacing:-0.03em; }
        .hero-sub { font-size:15px; color:#666; line-height:1.8; margin:0; }
        .card { max-width:640px; margin:0 auto 40px; padding:0 20px; }
        .section-label { font-size:15px; font-weight:700; margin:0 0 24px; }
        .field { margin-bottom:24px; }
        .field-label { display:block; font-size:13px; font-weight:600; color:#666; margin-bottom:10px; }
        .input { width:100%; padding:14px 16px; font-size:15px; border:1px solid #E8E8E8; border-radius:10px; outline:none; font-family:inherit; background:#FFF; transition:all 0.3s; }
        .input:focus { border-color:#1A1A1A; box-shadow:0 0 0 4px rgba(26,26,26,0.05); }
        .textarea { width:100%; padding:12px 16px; font-size:14px; border:1px solid #E8E8E8; border-radius:10px; outline:none; font-family:inherit; background:#FFF; resize:vertical; transition:all 0.3s; line-height:1.7; }
        .textarea:focus { border-color:#1A1A1A; box-shadow:0 0 0 4px rgba(26,26,26,0.05); }
        .chip-group { display:flex; flex-wrap:wrap; gap:8px; }
        .chip { padding:8px 16px; font-size:13px; font-weight:500; border:1px solid #E8E8E8; border-radius:100px; background:#FFF; cursor:pointer; font-family:inherit; transition:all 0.3s; color:#1A1A1A; }
        .chip.active { background:#1A1A1A; color:#FFF; border-color:#1A1A1A; }
        .chip:hover:not(.active) { background:#F5F5F5; }
        .primary-btn { width:100%; padding:16px; font-size:16px; font-weight:700; color:#FFF; background:#1A1A1A; border:none; border-radius:12px; cursor:pointer; font-family:inherit; transition:all 0.3s; margin-top:8px; }
        .primary-btn:disabled { opacity:0.4; cursor:not-allowed; }
        .primary-btn:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 12px 28px rgba(26,26,26,0.2); }
        .secondary-btn { width:100%; padding:14px; font-size:14px; font-weight:600; color:#1A1A1A; background:#FFF; border:2px solid #1A1A1A; border-radius:12px; cursor:pointer; font-family:inherit; transition:all 0.3s; margin-top:16px; }
        .secondary-btn:hover { background:#1A1A1A; color:#FFF; }
        .loading { text-align:center; padding:80px 20px; }
        .spinner { width:48px; height:48px; border:3px solid #E8E8E8; border-top-color:#1A1A1A; border-radius:50%; animation:spin 0.8s linear infinite; margin:0 auto; }
        .loading-text { margin-top:20px; font-size:16px; font-weight:500; }
        .loading-sub { color:#999; font-size:13px; margin-top:6px; }
        .result { max-width:640px; margin:0 auto; padding:0 20px 60px; }
        .diagnosis-card { background:#FFF; border:1px solid #E8E8E8; border-radius:16px; padding:24px; margin-bottom:16px; }
        .diag-label { font-size:13px; font-weight:700; color:#666; margin:0 0 10px; }
        .diag-text { font-size:15px; line-height:1.8; margin:0; color:#1A1A1A; }
        .strategy-card { background:#1A1A1A; border-radius:16px; padding:24px; margin-bottom:24px; color:#FFF; }
        .strat-label { font-size:13px; font-weight:700; color:#999; margin:0 0 10px; }
        .strat-text { font-size:15px; line-height:1.8; margin:0 0 20px; }
        .strat-meta { display:flex; flex-direction:column; gap:12px; }
        .meta-item { display:flex; gap:10px; align-items:flex-start; }
        .meta-icon { font-size:16px; flex-shrink:0; }
        .meta-text { font-size:13px; color:#CCC; line-height:1.7; }
        .calendar-title { font-size:16px; font-weight:700; margin:0 0 16px; }
        .calendar-item { border-radius:12px; padding:16px; margin-bottom:12px; }
        .cal-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; }
        .cal-day { font-size:14px; font-weight:700; margin-right:8px; }
        .cal-type { font-size:12px; font-weight:600; }
        .cal-theme { font-size:12px; color:#666; margin:0 0 10px; }
        .cal-post { font-family:'Noto Sans JP',sans-serif; font-size:13px; line-height:1.8; white-space:pre-wrap; word-break:break-all; background:#FFF; border-radius:8px; padding:12px; margin:0; }
        .copy-btn { padding:6px 14px; font-size:12px; font-weight:600; color:#FFF; background:#1A1A1A; border:none; border-radius:100px; cursor:pointer; font-family:inherit; transition:all 0.3s; white-space:nowrap; }
        .copy-btn.copied { background:#22C55E; }
        .action-card { background:#FFFBEB; border:1px solid #FDE68A; border-radius:16px; padding:24px; margin:16px 0; }
        .action-label { font-size:13px; font-weight:700; color:#92400E; margin:0 0 10px; }
        .action-text { font-size:14px; line-height:1.9; margin:0; color:#1A1A1A; }
        .encourage-card { background:#F0FFF4; border:1px solid #BBF7D0; border-radius:16px; padding:20px; text-align:center; margin-bottom:8px; }
        .encourage-text { font-size:16px; font-weight:700; color:#15803D; margin:0; }
        @keyframes spin { to { transform:rotate(360deg); } }
        @media(max-width:480px) { .hero-title { font-size:26px; } .nav { gap:12px; } .nav-link { font-size:12px; } }
      `}</style>
    </>
  );
}
