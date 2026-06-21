// pages/tech-council.js
// 🎨 制作・技術部門会議 - クリエイティブ・技術・データ + 技術部長

import { useState } from 'react';
import Head from 'next/head';

export default function TechCouncil() {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [creativeText, setCreativeText] = useState('');
  const [techText, setTechText] = useState('');
  const [dataText, setDataText] = useState('');
  const [chiefText, setChiefText] = useState('');
  const [step, setStep] = useState(0); // 0:未開始 1:クリエイティブ 2:技術 3:データ 4:部長 5:完了

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
    setCreativeText(''); setTechText(''); setDataText(''); setChiefText('');

    // Step1: クリエイティブU39
    setStep(1);
    const creative = await callClaude(
      `あなたは「クリエイティブU39」。ユメサクのデザイン・アイデア担当AI。
アイデア・デザイン・ユーザー体験の視点で、創造的な意見を述べる。
簡潔に3〜5点でまとめる。日本語で。`,
      `議題：${question}\n\nクリエイティブU39として、アイデア・デザイン視点の意見を述べてください。`
    );
    setCreativeText(creative);

    // Step2: 技術U39
    setStep(2);
    const tech = await callClaude(
      `あなたは「技術U39」。ユメサクの開発・実装担当AI。
開発の実現可能性・技術的な難易度・実装方法の視点で、現実的な意見を述べる。
簡潔に3〜5点で。日本語で。`,
      `議題：${question}\n\nクリエイティブU39の意見：${creative}\n\n技術U39として、開発・実装視点の意見を述べてください。`
    );
    setTechText(tech);

    // Step3: データU39
    setStep(3);
    const data = await callClaude(
      `あなたは「データU39」。ユメサクの数字・分析担当AI。
データ・数字・効果測定の視点で、意見を述べる。
簡潔に3〜5点で。日本語で。`,
      `議題：${question}\n\nクリエイティブU39の意見：${creative}\n\n技術U39の意見：${tech}\n\nデータU39として、数字・分析視点の意見を述べてください。`
    );
    setDataText(data);

    // Step4: 技術部長U39
    setStep(4);
    const chief = await callClaude(
      `あなたは「技術部長U39」。制作・技術部門のまとめ役AI。
クリエイティブU39（アイデア）・技術U39（実装）・データU39（数字）の3人の意見を聞いた上で、
制作・技術部門としての結論・行動指針を1つにまとめる。
中立・現実的・具体的に。最後に「技術部門としての結論」を明示する。日本語で。`,
      `議題：${question}\n\nクリエイティブU39の意見：${creative}\n\n技術U39の意見：${tech}\n\nデータU39の意見：${data}\n\n技術部長U39として、3人の意見をまとめた部門としての結論を出してください。`
    );
    setChiefText(chief);

    setStep(5);
    setLoading(false);
  };

  return (
    <>
      <Head>
        <title>制作・技術部門会議 - yumesaku</title>
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
              <a href="/hawkeye" className="nav-link">鷹眼</a>
            </nav>
          </div>
        </header>

        <section className="hero">
          <div className="hero-inner">
            <p className="eyebrow">🎨 制作・技術部門会議</p>
            <h1 className="hero-title">3つの視点で、部門の結論を。</h1>
            <p className="hero-subtitle">クリエイティブ・技術・データが議論し<br />技術部長が結論をまとめます</p>
          </div>
        </section>

        <main className="main">
          <div className="input-card">
            <label className="input-label">💬 制作・技術部門への議題を入力</label>
            <textarea
              value={question}
              onChange={e => setQuestion(e.target.value)}
              placeholder={`例：鷹の目にAI画像生成を追加すべきか\n例：UIをもっとシンプルにすべきか`}
              className="input-textarea"
              disabled={loading}
            />
            <button
              onClick={startDiscussion}
              disabled={loading || !question.trim()}
              className="start-btn"
            >
              {loading ? '⏳ 会議中...' : '🎨 技術部門会議を開始'}
            </button>
          </div>

          <div className="agents">
            <div className={`agent-card creative ${step >= 1 ? 'active' : ''}`}>
              <div className="agent-header">
                <div className="agent-icon">🎨</div>
                <div>
                  <div className="agent-name creative-name">クリエイティブU39</div>
                  <div className="agent-role">アイデア・デザイン</div>
                </div>
                {step === 1 && <div className="thinking-badge">考え中...</div>}
              </div>
              <div className="agent-text">
                {creativeText || (step >= 1 ? '考え中...' : '議題を入力して会議を始めてください。')}
              </div>
            </div>

            <div className={`agent-card tech ${step >= 2 ? 'active' : ''}`}>
              <div className="agent-header">
                <div className="agent-icon">⚙️</div>
                <div>
                  <div className="agent-name tech-name">技術U39</div>
                  <div className="agent-role">開発・実装判断</div>
                </div>
                {step === 2 && <div className="thinking-badge tech-badge">考え中...</div>}
              </div>
              <div className="agent-text">
                {techText || (step >= 2 ? '考え中...' : 'クリエイティブU39の意見に実装視点で補足します。')}
              </div>
            </div>

            <div className={`agent-card data ${step >= 3 ? 'active' : ''}`}>
              <div className="agent-header">
                <div className="agent-icon">📊</div>
                <div>
                  <div className="agent-name data-name">データU39</div>
                  <div className="agent-role">数字・分析</div>
                </div>
                {step === 3 && <div className="thinking-badge data-badge">考え中...</div>}
              </div>
              <div className="agent-text">
                {dataText || (step >= 3 ? '考え中...' : '数字・分析の視点で意見を述べます。')}
              </div>
            </div>

            <div className={`agent-card chief ${step >= 4 ? 'active' : ''}`}>
              <div className="agent-header">
                <div className="agent-icon">👔</div>
                <div>
                  <div className="agent-name chief-name">技術部長U39</div>
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
        .eyebrow { font-size:13px; color:#7C3AED; font-weight:600; letter-spacing:0.08em; margin:0 0 12px; }
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
        .agent-card.creative { border-left-color:#7C3AED; }
        .agent-card.tech { border-left-color:#0891B2; }
        .agent-card.data { border-left-color:#EA580C; }
        .agent-card.chief { border-left-color:#1A1A1A; border:2px solid #1A1A1A; }

        .agent-header { display:flex; align-items:center; gap:12px; margin-bottom:14px; }
        .agent-icon { width:42px; height:42px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:20px; flex-shrink:0; background:#F5F5F5; }
        .agent-name { font-size:14px; font-weight:700; }
        .agent-role { font-size:11px; color:#999; margin-top:2px; }
        .creative-name { color:#7C3AED; }
        .tech-name { color:#0891B2; }
        .data-name { color:#EA580C; }
        .chief-name { color:#1A1A1A; }

        .thinking-badge { margin-left:auto; font-size:11px; font-weight:600; color:#7C3AED; background:#F3E8FF; padding:4px 10px; border-radius:100px; animation:pulse 1s infinite; }
        .tech-badge { color:#0891B2; background:#CFFAFE; }
        .data-badge { color:#EA580C; background:#FFEDD5; }
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
