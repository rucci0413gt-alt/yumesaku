// pages/council.js
// ⚖️ U39 三者会議 - 3エージェント議論システム

import { useState } from 'react';
import Head from 'next/head';

export default function Council() {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [u39Text, setU39Text] = useState('');
  const [antiText, setAntiText] = useState('');
  const [elderText, setElderText] = useState('');
  const [step, setStep] = useState(0); // 0:未開始 1:U39 2:アンチ 3:長老 4:完了

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
    setU39Text(''); setAntiText(''); setElderText('');

    // Step1: U39
    setStep(1);
    const u39 = await callClaude(
      `あなたは「U39」。ユメサク開発AI。非エンジニアのるっちさんの副業アフィリエイトを支援している。
推進派・楽観派として、前向きな意見・具体的な実行案を出す。
簡潔に3〜5点でまとめる。日本語で。`,
      `るっちさんの相談：${question}\n\nU39として前向きな意見を述べてください。`
    );
    setU39Text(u39);

    // Step2: アンチU39
    setStep(2);
    const anti = await callClaude(
      `あなたは「アンチU39」。U39の反対意見を言う役割。
リスク・問題点・見落とし・落とし穴を鋭く指摘する。
批判的・懐疑的な視点で。ただし建設的に。簡潔に3〜5点で。日本語で。`,
      `るっちさんの相談：${question}\n\nU39の意見：${u39}\n\nこれに反論・リスク指摘してください。`
    );
    setAntiText(anti);

    // Step3: 長老U39
    setStep(3);
    const elder = await callClaude(
      `あなたは「長老U39」。深い経験と知恵を持つ最終判断者。
U39（推進派）とアンチU39（反論派）の両方の意見を聞いた上で、
るっちさんにとって最も適切な判断・行動指針を出す。
中立・現実的・具体的に。最後に「今日やること」を1つ明示する。日本語で。`,
      `るっちさんの相談：${question}\n\nU39の意見：${u39}\n\nアンチU39の意見：${anti}\n\n長老として最終的な判断と行動指針を出してください。`
    );
    setElderText(elder);

    setStep(4);
    setLoading(false);
  };

  return (
    <>
      <Head>
        <title>三者会議 - yumesaku</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+JP:wght@400;500;700&display=swap" rel="stylesheet" />
      </Head>

      <div className="container">
        <header className="header">
          <div className="header-inner">
            <a href="/" className="logo">yumesaku</a>
            <nav className="nav">
              <a href="/ranking" className="nav-link">Ranking</a>
              <a href="/article" className="nav-link">Article</a>
              <a href="/hawkeye" className="nav-link">鷹眼</a>
              <a href="/marketing" className="nav-link">分析</a>
            </nav>
          </div>
        </header>

        <section className="hero">
          <div className="hero-inner">
            <p className="eyebrow">⚖️ U39 三者会議</p>
            <h1 className="hero-title">3つの視点で、最適解を。</h1>
            <p className="hero-subtitle">推進派・反論派・長老が議論して<br />るっちさんの意思決定をサポートします</p>
          </div>
        </section>

        <main className="main">
          <div className="input-card">
            <label className="input-label">💬 質問・提案・相談を入力</label>
            <textarea
              value={question}
              onChange={e => setQuestion(e.target.value)}
              placeholder={`例：ユメサク無双を今すぐ作り始めるべきか？\n例：Threadsへの毎日投稿は続けるべきか？\n例：Google Sheets連携は本当に必要か？`}
              className="input-textarea"
              disabled={loading}
            />
            <button
              onClick={startDiscussion}
              disabled={loading || !question.trim()}
              className="start-btn"
            >
              {loading ? '⏳ 会議中...' : '🔥 三者会議を開始'}
            </button>
          </div>

          <div className="agents">
            {/* U39 */}
            <div className={`agent-card u39 ${step >= 1 ? 'active' : ''}`}>
              <div className="agent-header">
                <div className="agent-icon">🦅</div>
                <div>
                  <div className="agent-name u39-name">U39（推進派）</div>
                  <div className="agent-role">前向きな提案・実行派</div>
                </div>
                {step === 1 && <div className="thinking-badge">考え中...</div>}
              </div>
              <div className="agent-text">
                {u39Text || (step >= 1 ? '考え中...' : '質問を入力して会議を始めてください。')}
              </div>
            </div>

            {/* アンチU39 */}
            <div className={`agent-card anti ${step >= 2 ? 'active' : ''}`}>
              <div className="agent-header">
                <div className="agent-icon">⚡</div>
                <div>
                  <div className="agent-name anti-name">アンチU39（反論派）</div>
                  <div className="agent-role">リスク・問題点の指摘</div>
                </div>
                {step === 2 && <div className="thinking-badge anti-badge">考え中...</div>}
              </div>
              <div className="agent-text">
                {antiText || (step >= 2 ? '考え中...' : 'U39の意見に反論します。')}
              </div>
            </div>

            {/* 長老U39 */}
            <div className={`agent-card elder ${step >= 3 ? 'active' : ''}`}>
              <div className="agent-header">
                <div className="agent-icon">🏮</div>
                <div>
                  <div className="agent-name elder-name">長老U39（最終判断）</div>
                  <div className="agent-role">両者を踏まえた最適解</div>
                </div>
                {step === 3 && <div className="thinking-badge elder-badge">考え中...</div>}
              </div>
              <div className="agent-text">
                {elderText || (step >= 3 ? '考え中...' : '両者の意見を聞いて最適解を出します。')}
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
        .eyebrow { font-size:13px; color:#D97706; font-weight:600; letter-spacing:0.08em; margin:0 0 12px; }
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
        .agent-card.u39 { border-left-color:#0066FF; }
        .agent-card.anti { border-left-color:#E53935; }
        .agent-card.elder { border-left-color:#F59E0B; border:2px solid #F59E0B; }

        .agent-header { display:flex; align-items:center; gap:12px; margin-bottom:14px; }
        .agent-icon { width:42px; height:42px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:20px; flex-shrink:0; background:#F5F5F5; }
        .agent-name { font-size:14px; font-weight:700; }
        .agent-role { font-size:11px; color:#999; margin-top:2px; }
        .u39-name { color:#0066FF; }
        .anti-name { color:#E53935; }
        .elder-name { color:#D97706; }

        .thinking-badge { margin-left:auto; font-size:11px; font-weight:600; color:#0066FF; background:#EEF2FF; padding:4px 10px; border-radius:100px; animation:pulse 1s infinite; }
        .anti-badge { color:#E53935; background:#FEE2E2; }
        .elder-badge { color:#D97706; background:#FEF3C7; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }

        .agent-text { font-size:14px; line-height:1.85; color:#333; white-space:pre-wrap; }

        .footer { border-top:1px solid #E8E8E8; padding:clamp(24px,5vw,40px); text-align:center; background:#fff; }
        .footer-text { font-size:12px; color:#999; margin:0; }
        @media(max-width:640px){ .hero-subtitle br { display:none; } .nav { gap:12px; } }
      `}</style>
    </>
  );
}
