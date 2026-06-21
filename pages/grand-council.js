// pages/grand-council.js
// 🏛️ ユメサク株式会社 統合会議 - 4部署→経営層の自動フロー + 実行プラン変換

import { useState } from 'react';
import Head from 'next/head';

export default function GrandCouncil() {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState(0);

  const [marketResult, setMarketResult] = useState('');
  const [techResult, setTechResult] = useState('');
  const [adResult, setAdResult] = useState('');
  const [finalResult, setFinalResult] = useState('');

  const [planLoading, setPlanLoading] = useState(false);
  const [actionPlan, setActionPlan] = useState('');

  const callClaude = async (systemPrompt, userPrompt) => {
    const res = await fetch('/api/council', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ systemPrompt, userPrompt }),
    });
    const data = await res.json();
    return data.text || 'エラーが発生しました';
  };

  const runDepartment = async (deptName, members) => {
    let context = `議題：${question}\n\n`;
    let lastText = '';
    for (const m of members) {
      const text = await callClaude(m.systemPrompt, context + m.userPromptSuffix);
      context += `${m.label}の意見：${text}\n\n`;
      lastText = text;
    }
    return lastText;
  };

  const startGrandCouncil = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setMarketResult(''); setTechResult(''); setAdResult(''); setFinalResult(''); setActionPlan('');

    setPhase(1);
    const marketConclusion = await runDepartment('マーケ部門', [
      { label: 'マーケU39', systemPrompt: `あなたは「マーケU39」。市場分析・戦略立案の専門家。簡潔に3〜5点で。日本語で。`, userPromptSuffix: `マーケU39として、市場・戦略視点の意見を述べてください。` },
      { label: 'マネーU39', systemPrompt: `あなたは「マネーU39」。コスト・収益性の専門家。簡潔に3〜5点で。日本語で。`, userPromptSuffix: `マネーU39として、コスト・収益性視点の意見を述べてください。` },
      { label: 'トレンドU39', systemPrompt: `あなたは「トレンドU39」。流行・需要予測の専門家。簡潔に3〜5点で。日本語で。`, userPromptSuffix: `トレンドU39として、流行・需要視点の意見を述べてください。` },
      { label: 'マーケ部長U39', systemPrompt: `あなたは「マーケ部長U39」。3人の意見をまとめ、マーケ部門としての結論を1つ出す。中立・現実的・具体的に。日本語で。`, userPromptSuffix: `マーケ部長U39として、3人の意見をまとめた部門としての結論を出してください。` },
    ]);
    setMarketResult(marketConclusion);

    setPhase(2);
    const techConclusion = await runDepartment('技術部門', [
      { label: 'クリエイティブU39', systemPrompt: `あなたは「クリエイティブU39」。アイデア・デザインの専門家。簡潔に3〜5点で。日本語で。`, userPromptSuffix: `クリエイティブU39として、アイデア・デザイン視点の意見を述べてください。` },
      { label: '技術U39', systemPrompt: `あなたは「技術U39」。開発・実装の専門家。簡潔に3〜5点で。日本語で。`, userPromptSuffix: `技術U39として、開発・実装視点の意見を述べてください。` },
      { label: 'データU39', systemPrompt: `あなたは「データU39」。数字・分析の専門家。簡潔に3〜5点で。日本語で。`, userPromptSuffix: `データU39として、数字・分析視点の意見を述べてください。` },
      { label: '技術部長U39', systemPrompt: `あなたは「技術部長U39」。3人の意見をまとめ、技術部門としての結論を1つ出す。中立・現実的・具体的に。日本語で。`, userPromptSuffix: `技術部長U39として、3人の意見をまとめた部門としての結論を出してください。` },
    ]);
    setTechResult(techConclusion);

    setPhase(3);
    const adConclusion = await runDepartment('広告部門', [
      { label: '広告U39', systemPrompt: `あなたは「広告U39」。SNS戦略の専門家。簡潔に3〜5点で。日本語で。`, userPromptSuffix: `広告U39として、SNS戦略視点の意見を述べてください。` },
      { label: 'SEOU39', systemPrompt: `あなたは「SEOU39」。検索・流入最適化の専門家。簡潔に3〜5点で。日本語で。`, userPromptSuffix: `SEOU39として、検索・流入視点の意見を述べてください。` },
      { label: 'コピーU39', systemPrompt: `あなたは「コピーU39」。投稿文・リード作成の専門家。簡潔に3〜5点で。日本語で。`, userPromptSuffix: `コピーU39として、投稿文・言葉選び視点の意見を述べてください。` },
      { label: '広告部長U39', systemPrompt: `あなたは「広告部長U39」。3人の意見をまとめ、広告部門としての結論を1つ出す。中立・現実的・具体的に。日本語で。`, userPromptSuffix: `広告部長U39として、3人の意見をまとめた部門としての結論を出してください。` },
    ]);
    setAdResult(adConclusion);

    setPhase(4);
    const execContext = `議題：${question}\n\nマーケ部門の結論：${marketConclusion}\n\n技術部門の結論：${techConclusion}\n\n広告部門の結論：${adConclusion}\n\n`;

    const ceoText = await callClaude(
      `あなたは「U39（社長）」。3部署の結論を踏まえ、経営推進の視点で意見を述べる。簡潔に3〜5点で。日本語で。`,
      execContext + `U39（社長）として、3部署の結論を踏まえた意見を述べてください。`
    );

    const auditText = await callClaude(
      `あなたは「アンチU39（監査役）」。3部署の結論とU39社長の意見を踏まえ、リスク・問題点を指摘する。簡潔に3〜5点で。日本語で。`,
      execContext + `U39（社長）の意見：${ceoText}\n\nアンチU39（監査役）として、リスク・問題点を指摘してください。`
    );

    const chairText = await callClaude(
      `あなたは「長老U39（会長）」。3部署の結論・社長の意見・監査役のリスク指摘を全て踏まえ、会社としての最終決定を1つ出す。中立・現実的・具体的に。最後に「ユメサク株式会社としての最終決定」を明示する。日本語で。`,
      execContext + `U39（社長）の意見：${ceoText}\n\nアンチU39（監査役）の意見：${auditText}\n\n長老U39（会長）として、最終決定を出してください。`
    );

    setFinalResult(chairText);
    setPhase(5);
    setLoading(false);
  };

  const convertToActionPlan = async () => {
    setPlanLoading(true);
    setActionPlan('');
    const plan = await callClaude(
      `あなたは「実行プランナーU39」。会社の最終決定を読み、るっちさん（非エンジニアの個人開発者）が
すぐ動ける「具体的な実行タスク」に変換する。
タスクは以下のような既存ツールに対応させる形で、3〜5個に分解する：
- 記事生成（/article）→ 記事タイトル案・内容の方向性
- X投稿文（コピー機能）→ 投稿文の例
- 鷹の目リサーチ（/hawkeye）→ 調べるべきキーワード・ジャンル
それぞれのタスクに「① タスク名 → 具体的な内容例」の形で出す。
最後に「るっちさんが今すぐコピペで使える」レベルの具体例を1つ含める。日本語で。`,
      `会社の最終決定：${finalResult}\n\nこの決定を、るっちさんが今すぐ実行できる具体的なタスクに変換してください。`
    );
    setActionPlan(plan);
    setPlanLoading(false);
  };

  const phaseLabel = {
    0: '', 1: '📈 マーケ部門が議論中...', 2: '🎨 技術部門が議論中...',
    3: '📣 広告部門が議論中...', 4: '🏮 経営層が最終決定中...', 5: '✅ 完了',
  };

  return (
    <>
      <Head>
        <title>統合会議 - yumesaku</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+JP:wght@400;500;700&display=swap" rel="stylesheet" />
      </Head>

      <div className="container">
        <header className="header">
          <div className="header-inner">
            <a href="/" className="logo">yumesaku</a>
            <nav className="nav">
              <a href="/council" className="nav-link">三者会議</a>
              <a href="/executive-council" className="nav-link">経営層</a>
            </nav>
          </div>
        </header>

        <section className="hero">
          <div className="hero-inner">
            <p className="eyebrow">🏛️ ユメサク株式会社 統合会議</p>
            <h1 className="hero-title">相談するだけで、会社が動く。</h1>
            <p className="hero-subtitle">マーケ・技術・広告の3部署が議論し<br />経営層が最終決定を下します</p>
          </div>
        </section>

        <main className="main">
          <div className="input-card">
            <label className="input-label">💬 議題・相談を入力</label>
            <textarea
              value={question}
              onChange={e => setQuestion(e.target.value)}
              placeholder={`例：ユメサク無双を今すぐ作り始めるべきか？\n例：毎日投稿は続けるべきか？`}
              className="input-textarea"
              disabled={loading}
            />
            <button onClick={startGrandCouncil} disabled={loading || !question.trim()} className="start-btn">
              {loading ? `⏳ ${phaseLabel[phase]}` : '🏛️ 統合会議を開始（3〜6分）'}
            </button>
          </div>

          {phase > 0 && (
            <div className="progress-bar">
              <div className={`progress-step ${phase >= 1 ? 'active' : ''} ${phase > 1 ? 'done' : ''}`}>📈 マーケ</div>
              <div className={`progress-step ${phase >= 2 ? 'active' : ''} ${phase > 2 ? 'done' : ''}`}>🎨 技術</div>
              <div className={`progress-step ${phase >= 3 ? 'active' : ''} ${phase > 3 ? 'done' : ''}`}>📣 広告</div>
              <div className={`progress-step ${phase >= 4 ? 'active' : ''} ${phase > 4 ? 'done' : ''}`}>🏮 経営層</div>
            </div>
          )}

          <div className="results">
            {marketResult && (<div className="result-card market"><div className="result-label">📈 マーケ部門の結論</div><div className="result-text">{marketResult}</div></div>)}
            {techResult && (<div className="result-card tech"><div className="result-label">🎨 技術部門の結論</div><div className="result-text">{techResult}</div></div>)}
            {adResult && (<div className="result-card ad"><div className="result-label">📣 広告部門の結論</div><div className="result-text">{adResult}</div></div>)}
            {finalResult && (
              <div className="result-card final">
                <div className="result-label">🏮 ユメサク株式会社 最終決定</div>
                <div className="result-text">{finalResult}</div>

                {!actionPlan && (
                  <button onClick={convertToActionPlan} disabled={planLoading} className="plan-btn">
                    {planLoading ? '⏳ 実行プランを作成中...' : '📋 この決定を実行プランに変換する'}
                  </button>
                )}
              </div>
            )}

            {actionPlan && (
              <div className="result-card plan">
                <div className="result-label">📋 今すぐできる実行プラン</div>
                <div className="result-text">{actionPlan}</div>
                <p className="plan-note">※ このプランを参考に、記事生成・鷹の目・X投稿の各ページで実際の作業を行ってください。</p>
              </div>
            )}
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
        .start-btn:disabled { opacity:.7; cursor:not-allowed; }
        .progress-bar { display:flex; gap:8px; margin-bottom:24px; }
        .progress-step { flex:1; text-align:center; padding:10px 6px; border-radius:8px; background:#E8E8E8; color:#999; font-size:12px; font-weight:600; transition:all .4s; }
        .progress-step.active { background:#FEF3C7; color:#B45309; animation:pulse 1s infinite; }
        .progress-step.done { background:#DCFCE7; color:#15803D; animation:none; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
        .results { display:flex; flex-direction:column; gap:16px; }
        .result-card { background:#fff; border-radius:16px; padding:clamp(18px,3vw,24px); border-left:4px solid #E8E8E8; box-shadow:0 2px 8px rgba(0,0,0,0.04); }
        .result-card.market { border-left-color:#0EA5E9; }
        .result-card.tech { border-left-color:#7C3AED; }
        .result-card.ad { border-left-color:#DB2777; }
        .result-card.final { border-left-color:#B45309; border:2px solid #B45309; background:#FFFBEB; }
        .result-card.plan { border-left-color:#15803D; border:2px solid #15803D; background:#F0FDF4; }
        .result-label { font-size:13px; font-weight:700; margin-bottom:10px; color:#444; }
        .result-card.final .result-label { color:#B45309; font-size:15px; }
        .result-card.plan .result-label { color:#15803D; font-size:15px; }
        .result-text { font-size:14px; line-height:1.85; color:#333; white-space:pre-wrap; }
        .plan-btn { margin-top:16px; width:100%; padding:14px; background:#15803D; color:#fff; border:none; border-radius:10px; font-size:14px; font-weight:600; cursor:pointer; font-family:inherit; transition:all .3s; }
        .plan-btn:hover:not(:disabled) { opacity:.9; }
        .plan-btn:disabled { opacity:.6; cursor:not-allowed; }
        .plan-note { font-size:12px; color:#999; margin-top:12px; margin-bottom:0; }
        .footer { border-top:1px solid #E8E8E8; padding:clamp(24px,5vw,40px); text-align:center; background:#fff; }
        .footer-text { font-size:12px; color:#999; margin:0; }
        @media(max-width:640px){ .hero-subtitle br { display:none; } .nav { gap:12px; } }
      `}</style>
    </>
  );
}
