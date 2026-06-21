// pages/ad-council.js
// 📣 広告・集客部門会議 - 広告・SEO・コピー + 広告部長

import { useState } from 'react';
import Head from 'next/head';

export default function AdCouncil() {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [adText, setAdText] = useState('');
  const [seoText, setSeoText] = useState('');
  const [copyText, setCopyText] = useState('');
  const [chiefText, setChiefText] = useState('');
  const [step, setStep] = useState(0); // 0:未開始 1:広告 2:SEO 3:コピー 4:部長 5:完了

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
    setAdText(''); setSeoText(''); setCopyText(''); setChiefText('');

    // Step1: 広告U39
    setStep(1);
    const ad = await callClaude(
      `あなたは「広告U39」。ユメサクのSNS・広告戦略担当AI。
X/Threads/SNS戦略・投稿タイミング・拡散の視点で、意見を述べる。
簡潔に3〜5点でまとめる。日本語で。`,
      `議題：${question}\n\n広告U39として、SNS戦略視点の意見を述べてください。`
    );
    setAdText(ad);

    // Step2: SEOU39
    setStep(2);
    const seo = await callClaude(
      `あなたは「SEOU39」。ユメサクの検索・流入最適化担当AI。
検索流入・キーワード・サイト構造の視点で、意見を述べる。
簡潔に3〜5点で。日本語で。`,
      `議題：${question}\n\n広告U39の意見：${ad}\n\nSEOU39として、検索・流入視点の意見を述べてください。`
    );
    setSeoText(seo);

    // Step3: コピーU39
    setStep(3);
    const copy = await callClaude(
      `あなたは「コピーU39」。ユメサクの投稿文・リード作成担当AI。
キャッチコピー・投稿文・読者の興味を引く言葉選びの視点で、意見を述べる。
簡潔に3〜5点で。日本語で。`,
      `議題：${question}\n\n広告U39の意見：${ad}\n\nSEOU39の意見：${seo}\n\nコピーU39として、投稿文・言葉選び視点の意見を述べてください。`
    );
    setCopyText(copy);

    // Step4: 広告部長U39
    setStep(4);
    const chief = await callClaude(
      `あなたは「広告部長U39」。広告・集客部門のまとめ役AI。
広告U39（SNS戦略）・SEOU39（検索流入）・コピーU39（投稿文）の3人の意見を聞いた上で、
広告・集客部門としての結論・行動指針を1つにまとめる。
中立・現実的・具体的に。最後に「広告部門としての結論」を明示する。日本語で。`,
      `議題：${question}\n\n広告U39の意見：${ad}\n\nSEOU39の意見：${seo}\n\nコピーU39の意見：${copy}\n\n広告部長U39として、3人の意見をまとめた部門としての結論を出してください。`
    );
    setChiefText(chief);

    setStep(5);
    setLoading(false);
  };

  return (
    <>
      <Head>
        <title>広告・集客部門会議 - yumesaku</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+JP:wght@400;500;700&display=swap" rel="stylesheet" />
      </Head>

      <div className="container">
        <header className="header">
          <div className="header-inner">
            <a href="/" className="logo">yumesaku</a>
            <nav className="nav">
              <a href="/council" className="nav-link">三者会議</a>
              <a href="/marketing-council" className="nav-link">マーケ会議</a>
              <a href="/tech-council" className="nav-link">技術会議</a>
            </nav>
          </div>
        </header>

        <section className="hero">
          <div className="hero-inner">
            <p className="eyebrow">📣 広告・集客部門会議</p>
            <h1 className="hero-title">3つの視点で、部門の結論を。</h1>
            <p className="hero-subtitle">広告・SEO・コピーが議論し<br />広告部長が結論をまとめます</p>
          </div>
        </section>

        <main className="main">
          <div className="input-card">
            <label className="input-label">💬 広告・集客部門への議題を入力</label>
            <textarea
              value={question}
              onChange={e => setQuestion(e.target.value)}
              placeholder={`例：巣レッズは毎日投稿すべきか\n例：投稿文に絵文字を増やすべきか`}
              className="input-textarea"
              disabled={loading}
            />
            <button
              onClick={startDiscussion}
              disabled={loading || !question.trim()}
              className="start-btn"
            >
              {loading ? '⏳ 会議中...' : '📣 広告部門会議を開始'}
            </button>
          </div>

          <div className="agents">
            <div className={`agent-card ad ${step >= 1 ? 'active' : ''}`}>
              <div className="agent-header">
                <div className="agent-icon">📣</div>
                <div>
                  <div className="agent-name ad-name">広告U39</div>
                  <div className="agent-role">X/Threads/SNS戦略</div>
                </div>
                {step === 1 && <div className="thinking-badge">考え中...</div>}
              </div>
              <div className="agent-text">
                {adText || (step >= 1 ? '考え中...' : '議題を入力して会議を始めてください。')}
              </div>
            </div>

            <div className={`agent-card seo ${step >= 2 ? 'active' : ''}`}>
              <div className="agent-header">
                <div className="agent-icon">🔍</div>
                <div>
                  <div className="agent-name seo-name">SEOU39</div>
                  <div className="agent-role">検索・流入最適化</div>
                </div>
                {step === 2 && <div className="thinking-badge seo-badge">考え中...</div>}
              </div>
              <div className="agent-text">
                {seoText || (step >= 2 ? '考え中...' : '広告U39の意見に検索視点で補足します。')}
              </div>
            </div>

            <div className={`agent-card copy ${step >= 3 ? 'active' : ''}`}>
              <div className="agent-header">
                <div className="agent-icon">✍️</div>
                <div>
                  <div className="agent-name copy-name">コピーU39</div>
                  <div className="agent-role">投稿文・リード作成</div>
                </div>
                {step === 3 && <div className="thinking-badge copy-badge">考え中...</div>}
              </div>
              <div className="agent-text">
                {copyText || (step >= 3 ? '考え中...' : '言葉選びの視点で意見を述べます。')}
              </div>
            </div>

            <div className={`agent-card chief ${step >= 4 ? 'active' : ''}`}>
              <div className="agent-header">
                <div className="agent-icon">👔</div>
                <div>
                  <div className="agent-name chief-name">広告部長U39</div>
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
        .eyebrow { font-size:13px; color:#DB2777; font-weight:600; letter-spacing:0.08em; margin:0 0 12px; }
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
        .agent-card.ad { border-left-color:#DB2777; }
        .agent-card.seo { border-left-color:#0284C7; }
        .agent-card.copy { border-left-color:#CA8A04; }
        .agent-card.chief { border-left-color:#1A1A1A; border:2px solid #1A1A1A; }

        .agent-header { display:flex; align-items:center; gap:12px; margin-bottom:14px; }
        .agent-icon { width:42px; height:42px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:20px; flex-shrink:0; background:#F5F5F5; }
        .agent-name { font-size:14px; font-weight:700; }
        .agent-role { font-size:11px; color:#999; margin-top:2px; }
        .ad-name { color:#DB2777; }
        .seo-name { color:#0284C7; }
        .copy-name { color:#CA8A04; }
        .chief-name { color:#1A1A1A; }

        .thinking-badge { margin-left:auto; font-size:11px; font-weight:600; color:#DB2777; background:#FCE7F3; padding:4px 10px; border-radius:100px; animation:pulse 1s infinite; }
        .seo-badge { color:#0284C7; background:#E0F2FE; }
        .copy-badge { color:#CA8A04; background:#FEF3C7; }
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
