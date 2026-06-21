// pages/index.js
// ユメサク本体 - Apple級ハイブリッド（スマホ完全対応版）

import { useState, useRef, useEffect } from "react";
import Head from "next/head";

export default function Home() {
  // ===== アクセスコード認証 =====
  const [authenticated, setAuthenticated] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [codeInput, setCodeInput] = useState("");
  const [codeError, setCodeError] = useState("");
  const [codeLoading, setCodeLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const correctCode = process.env.NEXT_PUBLIC_ACCESS_CODE;
      if (!correctCode || correctCode === '') {
        setAuthenticated(true);
        setAuthChecking(false);
        return;
      }
      const saved = localStorage.getItem("yumesaku_access");
      if (saved && saved === correctCode) {
        setAuthenticated(true);
      }
      setAuthChecking(false);
    }
  }, []);

  const handleCodeSubmit = (e) => {
    if (e) e.preventDefault();
    setCodeLoading(true);
    setCodeError("");
    const correctCode = process.env.NEXT_PUBLIC_ACCESS_CODE;
    setTimeout(() => {
      if (codeInput.trim() === correctCode) {
        localStorage.setItem("yumesaku_access", codeInput.trim());
        setAuthenticated(true);
      } else {
        setCodeError("アクセスコードが正しくありません");
      }
      setCodeLoading(false);
    }, 400);
  };

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "こんにちは。ユメサクです。\n\nどんなアプリが欲しいですか？\n例えば「友達の誕生日を管理したい」「家計簿をつけたい」など、お気軽にどうぞ。",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedApp, setGeneratedApp] = useState(null);
  const [appTitle, setAppTitle] = useState("");
  const [tab, setTab] = useState("chat");
  const [downloaded, setDownloaded] = useState(false);
  const [mounted, setMounted] = useState(false);
  const bottomRef = useRef(null);
  const iframeRef = useRef(null);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  useEffect(() => { if (generatedApp) setTab("preview"); }, [generatedApp]);

  const hasUserInteraction = messages.length > 1;

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessages((prev) => [...prev, { role: "assistant", content: `エラーが発生しました: ${data.error}` }]);
      } else {
        if (data.message) {
          setMessages((prev) => [...prev, { role: "assistant", content: data.message }]);
        }
        if (data.appHtml) {
          setGeneratedApp(data.appHtml);
          const titleMatch = data.appHtml.match(/<title>(.*?)<\/title>/);
          setAppTitle(titleMatch ? titleMatch[1] : "作成したアプリ");
        }
      }
    } catch (e) {
      setMessages((prev) => [...prev, { role: "assistant", content: `エラー: ${e.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const handleDownload = () => {
    const blob = new Blob([generatedApp], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${appTitle || "yumesaku-app"}.html`;
    a.click();
    URL.revokeObjectURL(url);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  const handleReset = () => {
    if (!confirm("新しいアプリを作りますか？現在の内容はリセットされます。")) return;
    setMessages([{
      role: "assistant",
      content: "こんにちは。ユメサクです。\n\nどんなアプリが欲しいですか？\n例えば「友達の誕生日を管理したい」「家計簿をつけたい」など、お気軽にどうぞ。",
    }]);
    setGeneratedApp(null);
    setAppTitle("");
    setTab("chat");
  };

  const examples = ["家計簿", "ToDoリスト", "誕生日管理", "読書記録", "習慣トラッカー"];

  if (authChecking) {
    return (
      <div style={{ height: "100vh", background: "#FAFAFA", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#999", fontSize: 14 }}>Loading...</div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <>
        <Head>
          <title>yumesaku - アクセスコード</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+JP:wght@400;500;700&display=swap" rel="stylesheet" />
        </Head>
        <div className="auth-container">
          <div className="auth-inner">
            <h1 className="auth-logo">yumesaku</h1>
            <p className="auth-subtitle">モニター限定公開中</p>
            <div className="auth-card">
              <p className="auth-label">アクセスコードを入力</p>
              <input
                type="text"
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCodeSubmit()}
                placeholder="コード"
                autoFocus
                className={`auth-input ${codeError ? 'error' : ''}`}
              />
              {codeError && <p className="auth-error">{codeError}</p>}
              <button
                onClick={handleCodeSubmit}
                disabled={!codeInput.trim() || codeLoading}
                className="auth-button"
              >
                {codeLoading ? "確認中..." : "入る"}
              </button>
            </div>
            <p className="auth-help">
              コードをお持ちでない方は<br />
              X (@yumesakuapp) までDMください
            </p>
          </div>
        </div>
        <style jsx global>{`
          body { margin: 0; padding: 0; font-family: 'Noto Sans JP', 'Inter', -apple-system, sans-serif; background: #FAFAFA; }
          * { box-sizing: border-box; }
          .auth-container { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; background: #FAFAFA; }
          .auth-inner { max-width: 380px; width: 100%; text-align: center; }
          .auth-logo { font-family: 'Inter', sans-serif; font-size: 28px; font-weight: 700; color: #1A1A1A; margin: 0 0 8px; letter-spacing: -0.02em; }
          .auth-subtitle { color: #999; font-size: 13px; margin: 0 0 32px; }
          .auth-card { background: #FFFFFF; border: 1px solid #E8E8E8; border-radius: 16px; padding: 28px 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
          .auth-label { color: #666; font-size: 13px; margin: 0 0 16px; }
          .auth-input { width: 100%; background: #FAFAFA; border: 1px solid #E8E8E8; border-radius: 10px; padding: 14px 16px; color: #1A1A1A; font-size: 15px; outline: none; text-align: center; letter-spacing: 2px; margin-bottom: 12px; font-family: inherit; transition: all 0.3s; }
          .auth-input:focus { border-color: #1A1A1A; box-shadow: 0 0 0 4px rgba(26,26,26,0.05); }
          .auth-input.error { border-color: #E53935; }
          .auth-error { color: #E53935; font-size: 12px; margin: 0 0 12px; }
          .auth-button { width: 100%; padding: 14px; border-radius: 10px; border: none; background: #1A1A1A; color: #FFFFFF; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.3s; font-family: inherit; }
          .auth-button:disabled { background: #E8E8E8; color: #999; cursor: not-allowed; }
          .auth-button:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(26,26,26,0.15); }
          .auth-help { color: #999; font-size: 11px; margin: 24px 0 0; line-height: 1.6; }
        `}</style>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>yumesaku - 話すだけでアプリが作れる</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="description" content="日本語で話すだけで、あなただけのアプリが作れるAIサービス" />
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
              <a href="/grand-council" className="nav-link">🏛️ 会社</a>
            </nav>
          </div>
        </header>

        {!hasUserInteraction && !generatedApp && (
          <section className="hero">
            <div className="hero-inner">
              <h1 className={`hero-title fade-in-up ${mounted ? 'visible' : ''}`} style={{animationDelay: '0s'}}>
                夢がカタチに。
              </h1>
              <p className={`hero-subtitle fade-in-up ${mounted ? 'visible' : ''}`} style={{animationDelay: '0.1s'}}>
                日本語で話すだけで、<br />
                あなただけのアプリが作れます。
              </p>
            </div>
          </section>
        )}

        <main className={`main ${hasUserInteraction || generatedApp ? 'compact' : ''}`}>
          {generatedApp && (
            <div className="tabs-wrap">
              <div className="tabs-inner">
                {["chat", "preview"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`tab-btn ${tab === t ? 'active' : ''}`}
                  >
                    {t === "chat" ? "会話" : "プレビュー"}
                  </button>
                ))}
                <button onClick={handleReset} className="reset-btn">
                  ＋ 新しく作る
                </button>
              </div>
            </div>
          )}

          {tab === "chat" && (
            <div className="chat-area">
              {hasUserInteraction && (
                <div className="messages">
                  <div className="messages-inner">
                    {messages.map((msg, i) => {
                      const isUser = msg.role === "user";
                      return (
                        <div key={i} className={`msg-row ${isUser ? 'user' : 'assistant'}`}>
                          {!isUser && <div className="msg-name">yumesaku</div>}
                          <div className={`msg-bubble ${isUser ? 'user' : 'assistant'}`}>
                            {msg.content}
                          </div>
                        </div>
                      );
                    })}
                    {loading && (
                      <div className="msg-row assistant">
                        <div className="msg-name">yumesaku</div>
                        <div className="msg-bubble assistant">
                          <div className="typing">
                            <span></span><span></span><span></span>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={bottomRef} />
                  </div>
                </div>
              )}

              <div className={`input-area ${!hasUserInteraction ? 'hero-input' : ''}`}>
                <div className="input-inner">
                  <div className="input-box">
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="どんなアプリが欲しいですか？"
                      rows={1}
                      className="input"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!input.trim() || loading}
                      className="send-btn"
                    >
                      →
                    </button>
                  </div>
                  {!hasUserInteraction && (
                    <div className="examples">
                      <span className="examples-label">例えば</span>
                      <div className="example-tags">
                        {examples.map((ex, i) => (
                          <button
                            key={i}
                            onClick={() => setInput(ex)}
                            className="example-tag"
                          >
                            {ex}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="input-hint">
                    Enter で送信 · Shift+Enter で改行
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === "preview" && generatedApp && (
            <div className="preview-area">
              <div className="preview-header">
                <div className="preview-title">{appTitle}</div>
                <button
                  onClick={handleDownload}
                  className={`download-btn ${downloaded ? 'done' : ''}`}
                >
                  {downloaded ? "✓ 完了" : "↓ ダウンロード"}
                </button>
              </div>
              <iframe
                ref={iframeRef}
                srcDoc={generatedApp}
                className="preview-iframe"
                sandbox="allow-scripts allow-same-origin"
                title="Generated App Preview"
              />
            </div>
          )}
        </main>

        {!hasUserInteraction && !generatedApp && (
          <section className="features fade-in-up visible" style={{animationDelay: '0.4s'}}>
            <div className="features-inner">
              <h2 className="features-title">ユメサクを、もっと使い倒す。</h2>
              <div className="features-grid">
                <a href="/shop" className="feature-card">
                  <div className="feature-eyebrow">Shop</div>
                  <h3 className="feature-name">探す</h3>
                  <p className="feature-desc">AIで仕事を加速するガジェットを厳選</p>
                  <span className="feature-arrow">→</span>
                </a>
                <a href="/ranking" className="feature-card">
                  <div className="feature-eyebrow">Ranking</div>
                  <h3 className="feature-name">知る</h3>
                  <p className="feature-desc">今、売れている人気アイテムを一覧で</p>
                  <span className="feature-arrow">→</span>
                </a>
                <a href="/article" className="feature-card">
                  <div className="feature-eyebrow">Article</div>
                  <h3 className="feature-name">読む</h3>
                  <p className="feature-desc">AIが選ぶ、今読んでおきたいレビュー</p>
                  <span className="feature-arrow">→</span>
                </a>
                <a href="/grand-council" className="feature-card">
                  <div className="feature-eyebrow">Council</div>
                  <h3 className="feature-name">相談する</h3>
                  <p className="feature-desc">AI社員たちが議論し、会社としての結論を出す</p>
                  <span className="feature-arrow">→</span>
                </a>
              </div>
            </div>
          </section>
        )}

        <footer className="footer">
          <p className="footer-text">© 2026 yumesaku. 夢を、カタチに。</p>
        </footer>
      </div>

      <style jsx global>{`
        body {
          margin: 0;
          padding: 0;
          font-family: 'Noto Sans JP', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: #FAFAFA;
          color: #1A1A1A;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        * { box-sizing: border-box; }

        h1, h2, h3, h4, .hero-title, .feature-name, .features-title {
          word-break: keep-all;
          overflow-wrap: break-word;
          line-break: strict;
        }

        .container { min-height: 100vh; background: #FAFAFA; display: flex; flex-direction: column; }

        /* === Header === */
        .header {
          border-bottom: 1px solid #E8E8E8;
          background: rgba(250,250,250,0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .header-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: clamp(12px, 2.5vw, 20px) clamp(16px, 4vw, 32px);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .logo {
          font-family: 'Inter', sans-serif;
          font-size: clamp(17px, 3vw, 22px);
          font-weight: 700;
          color: #1A1A1A;
          text-decoration: none;
          letter-spacing: -0.02em;
          transition: opacity 0.3s;
        }
        .logo:hover { opacity: 0.7; }
        .nav { display: flex; gap: clamp(14px, 3vw, 32px); }
        .nav-link {
          font-size: clamp(12px, 1.5vw, 14px);
          color: #1A1A1A;
          text-decoration: none;
          font-weight: 500;
          position: relative;
          transition: color 0.3s;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          width: 0;
          height: 2px;
          background: #1A1A1A;
          transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .nav-link:hover::after { width: 100%; }

        /* === Hero === */
        .hero {
          padding: clamp(48px, 10vw, 120px) clamp(16px, 4vw, 32px) clamp(24px, 5vw, 48px);
          text-align: center;
        }
        .hero-inner { max-width: 760px; margin: 0 auto; }
        .hero-title {
          font-size: clamp(34px, 9vw, 72px);
          font-weight: 700;
          color: #1A1A1A;
          line-height: 1.15;
          letter-spacing: -0.03em;
          margin: 0 0 clamp(14px, 3vw, 24px) 0;
        }
        .hero-subtitle {
          font-size: clamp(14px, 2vw, 19px);
          color: #666;
          line-height: 1.75;
          margin: 0;
        }

        .main { flex: 1; }
        .main.compact { padding-top: 0; }

        /* === Tabs === */
        .tabs-wrap {
          border-bottom: 1px solid #E8E8E8;
          background: #FFFFFF;
          position: sticky;
          top: 57px;
          z-index: 50;
        }
        .tabs-inner {
          max-width: 760px;
          margin: 0 auto;
          padding: 0 clamp(12px, 4vw, 32px);
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .tab-btn {
          padding: 14px 18px;
          background: transparent;
          border: none;
          border-bottom: 2px solid transparent;
          color: #999;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.3s;
        }
        .tab-btn.active {
          color: #1A1A1A;
          font-weight: 700;
          border-bottom-color: #1A1A1A;
        }
        .reset-btn {
          margin-left: auto;
          padding: 7px 14px;
          background: transparent;
          border: 1px solid #E8E8E8;
          border-radius: 100px;
          color: #666;
          font-size: 11px;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.3s;
          white-space: nowrap;
        }
        .reset-btn:hover { background: #F5F5F5; border-color: #1A1A1A; color: #1A1A1A; }

        /* === Chat === */
        .chat-area { display: flex; flex-direction: column; }
        .messages {
          padding: clamp(16px, 4vw, 32px) clamp(12px, 4vw, 32px);
        }
        .messages-inner { max-width: 760px; margin: 0 auto; }
        .msg-row {
          display: flex;
          flex-direction: column;
          margin-bottom: clamp(14px, 2.5vw, 20px);
        }
        .msg-row.user { align-items: flex-end; }
        .msg-row.assistant { align-items: flex-start; }
        .msg-name {
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          color: #999;
          margin-bottom: 6px;
          letter-spacing: 0.02em;
        }
        .msg-bubble {
          max-width: 88%;
          padding: clamp(12px, 2vw, 14px) clamp(14px, 2.5vw, 18px);
          font-size: clamp(14px, 1.8vw, 15px);
          line-height: 1.7;
          white-space: pre-wrap;
          border-radius: 16px;
        }
        .msg-bubble.user {
          background: #1A1A1A;
          color: #FFFFFF;
          border-bottom-right-radius: 4px;
        }
        .msg-bubble.assistant {
          background: #FFFFFF;
          color: #1A1A1A;
          border: 1px solid #E8E8E8;
          border-bottom-left-radius: 4px;
        }
        .typing { display: flex; gap: 4px; padding: 4px 0; }
        .typing span {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #1A1A1A;
          animation: typing 1.2s ease-in-out infinite;
        }
        .typing span:nth-child(2) { animation-delay: 0.15s; }
        .typing span:nth-child(3) { animation-delay: 0.3s; }
        @keyframes typing {
          0%,100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }

        /* === Input === */
        .input-area {
          padding: clamp(14px, 3vw, 24px) clamp(12px, 4vw, 32px) clamp(20px, 5vw, 40px);
          background: #FAFAFA;
        }
        .input-area.hero-input {
          padding: 0 clamp(16px, 4vw, 32px) clamp(32px, 8vw, 64px);
        }
        .input-inner { max-width: 760px; margin: 0 auto; }
        .input-box {
          display: flex;
          align-items: flex-end;
          gap: 8px;
          background: #FFFFFF;
          border-radius: 16px;
          border: 1px solid #E8E8E8;
          padding: 6px 6px 6px clamp(14px, 3vw, 20px);
          transition: all 0.3s;
        }
        .input-box:focus-within {
          border-color: #1A1A1A;
          box-shadow: 0 0 0 4px rgba(26,26,26,0.05);
        }
        .input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          color: #1A1A1A;
          font-size: 16px;
          resize: none;
          font-family: inherit;
          line-height: 1.6;
          max-height: 120px;
          overflow-y: auto;
          padding: 10px 0;
          min-width: 0;
        }
        .input::placeholder { color: #999; }
        .send-btn {
          width: clamp(36px, 6vw, 42px);
          height: clamp(36px, 6vw, 42px);
          border-radius: 12px;
          background: #1A1A1A;
          border: none;
          color: #FFFFFF;
          font-size: 18px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.3s;
          font-family: inherit;
        }
        .send-btn:disabled {
          background: #E8E8E8;
          color: #CCC;
          cursor: not-allowed;
        }
        .send-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(26,26,26,0.2);
        }
        .examples {
          margin-top: clamp(14px, 2.5vw, 20px);
          text-align: center;
        }
        .examples-label {
          display: block;
          font-size: 11px;
          color: #999;
          margin-bottom: 8px;
          letter-spacing: 0.05em;
        }
        .example-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          justify-content: center;
        }
        .example-tag {
          padding: 6px 14px;
          font-size: 12px;
          color: #1A1A1A;
          background: #FFFFFF;
          border: 1px solid #E8E8E8;
          border-radius: 100px;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.3s;
        }
        .example-tag:hover {
          background: #1A1A1A;
          color: #FFFFFF;
          border-color: #1A1A1A;
          transform: translateY(-1px);
        }
        .input-hint {
          text-align: center;
          margin-top: clamp(10px, 2vw, 14px);
          font-size: 11px;
          color: #CCC;
        }

        /* === Preview === */
        .preview-area {
          max-width: 1200px;
          margin: 0 auto;
          padding: clamp(12px, 3vw, 24px) clamp(12px, 4vw, 32px) clamp(32px, 8vw, 64px);
        }
        .preview-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: clamp(12px, 2vw, 16px) clamp(14px, 3vw, 20px);
          background: #FFFFFF;
          border: 1px solid #E8E8E8;
          border-radius: 12px 12px 0 0;
          border-bottom: none;
          gap: 12px;
        }
        .preview-title {
          font-size: 13px;
          color: #666;
          font-family: 'Inter', monospace;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .download-btn {
          padding: 8px 16px;
          background: #1A1A1A;
          border: none;
          border-radius: 100px;
          color: #FFFFFF;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.3s;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .download-btn:hover { transform: translateY(-1px); }
        .download-btn.done { background: #10B981; }
        .preview-iframe {
          width: 100%;
          height: 70vh;
          min-height: 400px;
          border: 1px solid #E8E8E8;
          border-top: none;
          border-radius: 0 0 12px 12px;
          background: #FFFFFF;
        }

        /* === Features === */
        .features {
          padding: clamp(48px, 10vw, 120px) clamp(16px, 4vw, 32px);
        }
        .features-inner { max-width: 1100px; margin: 0 auto; }
        .features-title {
          font-size: clamp(22px, 5vw, 36px);
          font-weight: 700;
          text-align: center;
          color: #1A1A1A;
          margin: 0 0 clamp(28px, 6vw, 56px) 0;
          letter-spacing: -0.02em;
        }
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(280px, 100%), 1fr));
          gap: clamp(14px, 3vw, 24px);
        }
        .feature-card {
          background: #FFFFFF;
          border: 1px solid #F0F0F0;
          border-radius: 16px;
          padding: clamp(22px, 4vw, 36px);
          text-decoration: none;
          color: inherit;
          position: relative;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }
        .feature-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 40px rgba(0,0,0,0.08);
          border-color: #1A1A1A;
        }
        .feature-card:hover .feature-arrow {
          transform: translateX(4px);
          color: #1A1A1A;
        }
        .feature-eyebrow {
          font-family: 'Inter', sans-serif;
          font-size: clamp(11px, 1.4vw, 12px);
          color: #0066FF;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin-bottom: 10px;
        }
        .feature-name {
          font-size: clamp(20px, 3vw, 28px);
          font-weight: 700;
          color: #1A1A1A;
          margin: 0 0 12px 0;
          letter-spacing: -0.02em;
        }
        .feature-desc {
          font-size: clamp(13px, 1.6vw, 14px);
          color: #666;
          line-height: 1.7;
          margin: 0 0 18px 0;
        }
        .feature-arrow {
          font-size: 20px;
          color: #999;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: inline-block;
        }

        /* === Footer === */
        .footer {
          border-top: 1px solid #E8E8E8;
          padding: clamp(20px, 5vw, 40px) clamp(16px, 4vw, 32px);
          text-align: center;
          background: #FFFFFF;
        }
        .footer-text {
          font-size: 12px;
          color: #999;
          margin: 0;
        }

        /* === Animations === */
        .fade-in-up { opacity: 0; transform: translateY(20px); }
        .fade-in-up.visible {
          animation: fadeInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1) backwards;
          opacity: 1;
          transform: translateY(0);
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #E0E0E0; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #BDBDBD; }

        /* === Mobile === */
        @media (max-width: 768px) {
          .hero {
            padding: 56px 20px 32px;
          }
          .hero-title {
            font-size: clamp(32px, 9vw, 48px);
            line-height: 1.2;
          }
          .hero-subtitle {
            font-size: 15px;
            line-height: 1.7;
          }
          .hero-subtitle br { display: none; }
          .features {
            padding: 56px 20px;
          }
          .features-title {
            font-size: 24px;
            margin-bottom: 32px;
          }
          .features-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }
          .feature-card {
            padding: 24px;
          }
          .feature-name {
            font-size: 22px;
          }
        }
        @media (max-width: 640px) {
          .header-inner { padding: 12px 18px; }
          .logo { font-size: 18px; }
          .nav { gap: 16px; }
          .nav-link { font-size: 13px; }
          .hero {
            padding: 40px 18px 28px;
          }
          .hero-title { 
            font-size: 36px;
            line-height: 1.25;
          }
          .hero-subtitle {
            font-size: 14px;
          }
          .msg-bubble {
            max-width: 92%;
            font-size: 14px;
          }
          .input-hint {
            font-size: 10px;
          }
          .examples-label {
            font-size: 10px;
          }
          .example-tag {
            font-size: 11px;
            padding: 5px 12px;
          }
        }
        @media (max-width: 480px) {
          .header-inner { padding: 10px 16px; }
          .logo { font-size: 17px; }
          .nav { gap: 14px; }
          .nav-link { font-size: 12px; }
          .hero {
            padding: 32px 16px 24px;
          }
          .hero-title { 
            font-size: 30px;
            line-height: 1.25;
          }
          .hero-subtitle {
            font-size: 13px;
          }
          .input-area {
            padding: 12px 14px 24px;
          }
          .input-area.hero-input {
            padding: 0 14px 28px;
          }
          .messages {
            padding: 16px 14px;
          }
          .features {
            padding: 40px 16px;
          }
          .features-title {
            font-size: 22px;
          }
          .feature-card {
            padding: 20px;
          }
          .feature-name {
            font-size: 20px;
          }
          .feature-desc {
            font-size: 13px;
          }
        }
        @media (max-width: 380px) {
          .hero-title { font-size: 26px; }
          .hero-subtitle { font-size: 12px; }
          .nav { gap: 12px; }
          .nav-link { font-size: 11px; }
          .logo { font-size: 16px; }
          .features-title { font-size: 20px; }
        }
      `}</style>
    </>
  );
}
