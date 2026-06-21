// pages/marketing-council.js
// 📈 マーケ部門会議 - マーケ・マネー・トレンド + マーケ部長

import { useState } from 'react';
import Head from 'next/head';

export default function MarketingCouncil() {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [marketText, setMarketText] = useState('');
  const [moneyText, setMoneyText] = useState('');
  const [trendText, setTrendText] = useState('');
  const [chiefText, setChiefText] = useState('');
  const [step, setStep] = useState(0); // 0:未開始 1:マーケ 2:マネー 3:トレンド 4:部長 5:完了

  const callClaude = async (systemPrompt, userPrompt) => {
    const res = await fetch('/api/council', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ systemPrompt, userPrompt }),
    });
    const data = await res.json();
    return data.text || 'エラーが発生しました';
  };

  const startDiscussion = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setMarketText(''); setMoneyText(''); setTrendText(''); setChiefText('');

    // Step1: マーケU39
    setStep(1);
    const market = await callClaude(
      `あなたは「マーケU39」。ユメサクのマーケティング担当AI。
市場分析・戦略立案の専門家として、市場や競合・ターゲット視点で意見を述べる。
簡潔に3〜5点でまとめる。日本語で。`,
      `議題：${question}\n\nマーケU39として、市場・戦略視点の意見を述べてください。`
    );
    setMarketText(market);

    // Step2: マネーU39
    setStep(2);
    const money = await callClaude(
      `あなたは「マネーU39」。ユメサクの収益・コスト担当AI。
コスト・収益性・投資対効果の視点で、現実的な意見を述べる。
簡潔に3〜5点で。日本語で。`,
      `議題：${question}\n\nマーケU39の意見：${market}\n\nマネーU39として、コスト・収益性視点の意見を述べてください。`
    );
    setMoneyText(money);

    // Step3: トレンドU39
    setStep(3);
    const trend = await callClaude(
      `あなたは「トレンドU39」。ユメサクの流行・需要予測担当AI。
流行・季節性・需要予測の視点で、意見を述べる。
簡潔に3〜5点で。日本語で。`,
      `議題：${question}\n\nマーケU39の意見：${market}\n\nマネーU39の意見：${money}\n\nトレンドU39として、流行・需要視点の意見を述べてください。`
    );
    setTrendText(trend);

    // Step4: マーケ部長U39
    setStep(4);
    const chief = await callClaude(
      `あなたは「マーケ部長U39」。マーケ部門のまとめ役AI。
マーケU39（戦略）・マネーU39（収益性）・トレンドU39（需要予測）の3人の意見を聞いた上で、
マーケ部門としての結論・行動指針を1つにまとめる。
中立・現実的・具体的に。最後に「マーケ部門としての結論」を明示する。日本語で。`,
      `議題：${question}\n\nマーケU39の意見：${market}\n\nマネーU39の意見：${money}\n\nトレンドU39の意見：${trend}\n\nマーケ部長U39として、3人の意見をまとめた部門としての結論を出してください。`
    );
    setChiefText(chief);

    setStep(5);
    setLoading(false);
  };

  return (
    <>
      <Head>
        <title>マーケ部門会議 - yumesaku</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+JP:wght@400;500;700&display=swap" rel="stylesheet" />
      </Head>

      <div className="container">
        <header className="header">
          <div className="header-inner">
            <a href="/" className="logo">yumesaku</a>
            <nav className="nav">
              <a href="/council" className="nav-link">三者会議</a>
              <a href="/hawkeye" className="nav-link">鷹眼</a>
              <a href="/marketing" className="nav-link">分析</a>
            </nav>
          </div>
        </header>

        <section className="hero">
          <div className="hero-inner">
            <p className="eyebrow">📈 マーケ部門会議</p>
            <h1 className="hero-title">3つの視点で、部門の結論を。</h1>
            <p className="hero-subtitle">マーケ・マネー・トレンドが議論し<br />マーケ部長が結論をまとめます</p>
          </div>
        </section>

        <main className="main">
          <div className="input-card">
            <label className="input-label">💬 マーケ部門への議題を入力</label>
            <textarea
              value={question}
              onChange={e => setQuestion(e.target.value)}
              placeholder={`例：巣レッズは毎日投稿すべきか\n例：新ジャンルの商品を扱うべきか`}
              className="input-textarea"
              disabled={loading}
            />
            <button
              onClick={startDiscussion}
              disabled={loading || !question.trim()}
              className="start-btn"
            >
              {loading ? '⏳ 会議中...' : '📈 マーケ部門会議を開始'}
            </button>
          </div>

          <div className="agents">
            <div className={`agent-card market ${step >= 1 ? 'active' : ''}`}>
              <div className="agent-header">
                <div className="agent-icon">🎯</div>
                <div>
                  <div className="agent-name market-name">マーケU39</div>
                  <div className="agent-role">市場分析・戦略立案</div>
                </div>
                {step === 1 && <div className="thinking-badge">考え中...</div>}
              </div>
              <div className="agent-text">
                {marketText || (step >= 1 ? '考え中...' : '議題を入力して会議を始めてください。')}
              </div>
            </div>

            <div className={`agent-card money ${step >= 2 ? 'active' : ''}`}>
              <div className="agent-header">
                <div className="agent-icon">💰</div>
                <div>
                  <div className="agent-name money-name">マネーU39</div>
                  <div className="agent-role">コスト・収益性判断</div>
                </div>
                {step === 2 && <div className="thinking-badge money-badge">考え中...</div>}
              </div>
              <div className="agent-text">
                {moneyText || (step >= 2 ? '考え中...' : 'マーケU39の意見にコスト視点で補足します。')}
              </div>
            </div>

            <div className={`agent-card trend ${step >= 3 ? 'active' : ''}`}>
              <div className="agent-header">
                <div className="agent-icon">🌍</div>
                <div>
                  <div className="agent-name trend-name">トレンドU39</div>
                  <div className="agent-role">流行・需要予測</div>
                </div>
                {step === 3 && <div className="thinking-badge trend-badge">考え中...</div>}
              </div>
              <div className="agent-text">
                {trendText || (step >= 3 ? '考え中...' : '流行・需要の視点で意見を述べます。')}
              </div>
            </div>

            <div className={`agent-card chief ${step >= 4 ? 'active' : ''}`}>
              <div className="agent-header">
                <div className="agent-icon">👔</div>
                <div>
                  <div className="agent-name chief-name">マーケ部長U39</div>
                  <div className="agent-role">部門としての最終結論</div>
                </div>
                {step === 4 && <div className="thinking-badge chief-badge">考え中...</div>}
              </div>
              <div className="agent-text">
                {chiefText || (step >= 4 ? '考え中...' : '3人の意見を聞いて部門の結論を出します。')}
              </div>
            </div>
          </div>
        </main>

        <footer className="footer">
          <p className="footer-text">© 2026 yumesaku. AIで仕事を加速する人のために.</p>
        </footer>
      </div>

      <style jsx global>{`
        body { margin:0; font-family:'Noto Sans JP','Inter',sans-serif; background:#F5F5F7; color:#1A1A1A; -webkit-font-smoothing:antialiased; }
        * { box-sizing:border-box; }
        h1,.hero-title { word-break:keep-all; overflow-wrap:break-word; }
        .container { min-height:100vh; }
        .header { border-bottom:1px solid #E8E8E8; background:rgba(250,250,250,0.85); backdrop-filter:blur(20px); position:sticky; top:0; z-index:100; }
        .header-inner { max-width:1200px; margin:0 auto; padding:clamp(14px,2.5vw,20px) clamp(20px,4vw,32px); display:flex; justify-content:space-between; align-items:center; }
        .logo { font-family:'Inter',sans-serif; font-size:clamp(18px,3vw,22px); font-weight:700; color:#1A1A1A; text-decoration:none; }
        .nav { display:flex; gap:clamp(12px,2vw,24px); }
        .nav-link { font-size:clamp(12px,1.5vw,14px); color:#1A1A1A; text-decoration:none; font-weight:500; }

        .hero { padding:clamp(40px,8vw,72px) clamp(20px,4vw,32px) clamp(24px,4vw,36px); text-align:center; }
        .hero-inner { max-width:760px; margin:0 auto; }
        .eyebrow { font-size:13px; color:#0EA5E9; font-weight:600; letter-spacing:0.08em; margin:0 0 12px; }
        .hero-title { font-size:clamp(26px,5vw,44px); font-weight:700; line-height:1.3; letter-spacing:-0.03em; margin:0 0 16px; }
        .hero-subtitle { font-size:clamp(14px,2vw,16px); color:#666; line-height:1.75; margin:0; }

        .main { max-width:760px; margin:0 auto; padding:clamp(20px,4vw,32px) clamp(20px,4vw,32px) clamp(60px,10vw,96px); }

        .input-card { background:#fff; border-radius:16px; padding:clamp(20px,4vw,28px); margin-bottom:24px; box-shadow:0 2px 8px rgba(0,0,0,0.06); }
        .input-label { font-size:13px; font-weight:600; color:#666; display:block; margin-bottom:10px; }
        .input-textarea { width:100%; border:1px solid #E8E8E8; border-radius:10px; padding:14px; font-size:14px; font-family:inherit; resize:none; outline:none; height:100px; line-height:1.7; transition:all .3s; }
        .input-textarea:focus { border-color:#1A1A1A; box-shadow:0 0 0 4px rgba(26,26,26,0.05); }
        .input-textarea:disabled { background:#F5F5F5; }
        .start-btn { width:100%; margin-top:12px; padding:clamp(14px,2.5vw,16px); background:#1A1A1A; color:#fff; border:none; border-radius:10px; font-size:15px; font-weight:600; cursor:pointer; font-family:inherit; transition:all .3s; }
        .start-btn:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 8px 20px rgba(26,26,26,0.2); }
        .start-btn:disabled { opacity:.4; cursor:not-allowed; }

        .agents { display:flex; flex-direction:column; gap:16px; }

        .agent-card { background:#fff; border-radius:16px; padding:clamp(18px,3vw,24px); border-left:4px solid #E8E8E8; opacity:.4; transition:all .5s; box-shadow:0 2px 8px rgba(0,0,0,0.04); }
        .agent-card.active { opacity:1; }
        .agent-card.market { border-left-color:#0EA5E9; }
        .agent-card.money { border-left-color:#22C55E; }
        .agent-card.trend { border-left-color:#A855F7; }
        .agent-card.chief { border-left-color:#1A1A1A; border:2px solid #1A1A1A; }

        .agent-header { display:flex; align-items:center; gap:12px; margin-bottom:14px; }
        .agent-icon { width:42px; height:42px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:20px; flex-shrink:0; background:#F5F5F5; }
        .agent-name { font-size:14px; font-weight:700; }
        .agent-role { font-size:11px; color:#999; margin-top:2px; }
        .market-name { color:#0EA5E9; }
        .money-name { color:#22C55E; }
        .trend-name { color:#A855F7; }
        .chief-name { color:#1A1A1A; }

        .thinking-badge { margin-left:auto; font-size:11px; font-weight:600; color:#0EA5E9; background:#E0F2FE; padding:4px 10px; border-radius:100px; animation:pulse 1s infinite; }
        .money-badge { color:#22C55E; background:#DCFCE7; }
        .trend-badge { color:#A855F7; background:#F3E8FF; }
        .chief-badge { color:#1A1A1A; background:#F0F0F0; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }

        .agent-text { font-size:14px; line-height:1.85; color:#333; white-space:pre-wrap; }

        .footer { border-top:1px solid #E8E8E8; padding:clamp(24px,5vw,40px); text-align:center; background:#fff; }
        .footer-text { font-size:12px; color:#999; margin:0; }
        @media(max-width:640px){ .hero-subtitle br { display:none; } .nav { gap:12px; } }
      `}</style>
    </>
  );
}
