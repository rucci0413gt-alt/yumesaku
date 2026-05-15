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
      const saved = localStorage.getItem("yumesaku_access");
      const correctCode = process.env.NEXT_PUBLIC_ACCESS_CODE;
      if (saved && correctCode && saved === correctCode) {
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

  // ===== 既存のstate =====
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "こんにちは！ユメサクです✨\n\nどんなアプリやツールが欲しいですか？\n「友達の誕生日を管理したい」「家計簿をつけたい」など、なんでもOKです！",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedApp, setGeneratedApp] = useState(null);
  const [appTitle, setAppTitle] = useState("");
  const [tab, setTab] = useState("chat");
  const [downloaded, setDownloaded] = useState(false);
  const bottomRef = useRef(null);
  const iframeRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (generatedApp) setTab("preview");
  }, [generatedApp]);

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
      content: "こんにちは！ユメサクです✨\n\nどんなアプリやツールが欲しいですか？\n「友達の誕生日を管理したい」「家計簿をつけたい」など、なんでもOKです！",
    }]);
    setGeneratedApp(null);
    setAppTitle("");
    setTab("chat");
  };

  // ===== 認証チェック中 =====
  if (authChecking) {
    return (
      <div style={{ height: "100vh", background: "#0d0d0d", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#555", fontSize: 13 }}>読み込み中...</div>
      </div>
    );
  }

  // ===== アクセスコード入力画面 =====
  if (!authenticated) {
    return (
      <>
        <Head>
          <title>ユメサク - アクセスコード</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
        <div style={{ height: "100vh", background: "#0d0d0d", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", fontFamily: "-apple-system, BlinkMacSystemFont, 'Hiragino Sans', sans-serif" }}>
          <div style={{ maxWidth: 360, width: "100%", textAlign: "center" }}>
            <div style={{ width: 60, height: 60, borderRadius: 16, background: "linear-gradient(135deg, #7c3aed, #db2777)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, margin: "0 auto 20px" }}>✦</div>
            <h1 style={{ color: "#fff", fontSize: 22, fontWeight: "700", marginBottom: 8, letterSpacing: "-0.5px" }}>ユメサク</h1>
            <p style={{ color: "#666", fontSize: 12, marginBottom: 28 }}>モニター限定公開中</p>

            <div style={{ background: "#161616", border: "1px solid #2a2a2a", borderRadius: 16, padding: "24px 20px" }}>
              <div style={{ color: "#aaa", fontSize: 13, marginBottom: 14 }}>
                アクセスコードを入力してください
              </div>
              <input
                type="text"
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCodeSubmit()}
                placeholder="コード"
                autoFocus
                style={{
                  width: "100%",
                  background: "#0d0d0d",
                  border: `1px solid ${codeError ? "#dc2626" : "#2a2a2a"}`,
                  borderRadius: 10,
                  padding: "12px 14px",
                  color: "#fff",
                  fontSize: 15,
                  outline: "none",
                  fontFamily: "inherit",
                  textAlign: "center",
                  letterSpacing: "2px",
                  marginBottom: 12,
                }}
              />
              {codeError && (
                <div style={{ color: "#dc2626", fontSize: 11, marginBottom: 12 }}>{codeError}</div>
              )}
              <button
                onClick={handleCodeSubmit}
                disabled={!codeInput.trim() || codeLoading}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: 10,
                  border: "none",
                  background: codeInput.trim() && !codeLoading ? "linear-gradient(135deg, #7c3aed, #6d28d9)" : "#1e1e1e",
                  color: codeInput.trim() && !codeLoading ? "#fff" : "#444",
                  fontSize: 14,
                  fontWeight: "600",
                  cursor: codeInput.trim() && !codeLoading ? "pointer" : "not-allowed",
                  letterSpacing: "0.5px",
                }}
              >
                {codeLoading ? "確認中..." : "入る"}
              </button>
            </div>

            <p style={{ color: "#333", fontSize: 10, marginTop: 20, lineHeight: 1.6 }}>
              コードをお持ちでない方は<br />
              X (@yumesakuapp) までDMください
            </p>
          </div>
        </div>
        <style>{`* { box-sizing: border-box; margin: 0; padding: 0; } body { background: #0d0d0d; }`}</style>
      </>
    );
  }

  // ===== ユメサク本体（既存画面）=====
  return (
    <>
      <Head>
        <title>ユメサク - 話すだけでアプリが作れる</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="日本語で話すだけで、あなただけのアプリが作れるサービス" />
      </Head>

      <div style={{ height: "100vh", background: "#0d0d0d", display: "flex", flexDirection: "column", fontFamily: "-apple-system, BlinkMacSystemFont, 'Hiragino Sans', sans-serif" }}>

        <header style={{ padding: "12px 20px", borderBottom: "1px solid #1e1e1e", background: "#0d0d0d", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg, #7c3aed, #db2777)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>✦</div>
            <div>
              <div style={{ color: "#fff", fontSize: 17, fontWeight: "700", letterSpacing: "-0.3px" }}>ユメサク</div>
              <div style={{ color: "#555", fontSize: 10, letterSpacing: "0.5px" }}>話すだけでアプリが作れる</div>
            </div>
          </div>
          <button onClick={handleReset} style={{ background: "transparent", border: "1px solid #2a2a2a", color: "#666", fontSize: 12, padding: "6px 14px", borderRadius: 20, cursor: "pointer" }}>
            + 新しく作る
          </button>
        </header>

        {generatedApp && (
          <div style={{ display: "flex", borderBottom: "1px solid #1e1e1e", background: "#0d0d0d", flexShrink: 0 }}>
            {["chat", "preview"].map((t) => (
              <button key={t} onClick={() => setTab(t)}
                style={{ flex: 1, padding: "10px", background: "transparent", border: "none", borderBottom: `2px solid ${tab === t ? "#7c3aed" : "transparent"}`, color: tab === t ? "#a855f7" : "#555", fontSize: 13, cursor: "pointer", fontWeight: tab === t ? "600" : "400" }}>
                {t === "chat" ? "💬 会話" : "✨ プレビュー"}
              </button>
            ))}
          </div>
        )}

        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>

          <div style={{ display: tab === "chat" ? "flex" : "none", flex: 1, flexDirection: "column", overflow: "hidden" }}>
            <div style={{ flex: 1, overflowY: "auto", padding: "20px 16px" }}>
              <div style={{ maxWidth: 600, margin: "0 auto" }}>
                {messages.map((msg, i) => {
                  const isUser = msg.role === "user";
                  return (
                    <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: isUser ? "flex-end" : "flex-start", marginBottom: 16 }}>
                      {!isUser && (
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                          <div style={{ width: 22, height: 22, borderRadius: 6, background: "linear-gradient(135deg, #7c3aed, #db2777)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11 }}>✦</div>
                          <span style={{ color: "#666", fontSize: 11 }}>ユメサク</span>
                        </div>
                      )}
                      <div style={{
                        maxWidth: "82%", padding: "12px 16px",
                        borderRadius: isUser ? "18px 18px 4px 18px" : "4px 18px 18px 18px",
                        background: isUser ? "linear-gradient(135deg, #7c3aed, #6d28d9)" : "#1a1a1a",
                        color: "#f0f0f0", fontSize: 14, lineHeight: 1.7,
                        border: isUser ? "none" : "1px solid #2a2a2a",
                        whiteSpace: "pre-wrap",
                      }}>
                        {msg.content}
                      </div>
                    </div>
                  );
                })}
                {loading && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                    <div style={{ width: 22, height: 22, borderRadius: 6, background: "linear-gradient(135deg, #7c3aed, #db2777)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11 }}>✦</div>
                    <div style={{ display: "flex", gap: 4 }}>
                      {[0,1,2].map((j) => (
                        <div key={j} style={{ width: 7, height: 7, borderRadius: "50%", background: "#7c3aed", animation: "pulse 1.2s ease-in-out infinite", animationDelay: `${j*0.2}s` }} />
                      ))}
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>
            </div>

            <div style={{ padding: "12px 16px 24px", borderTop: "1px solid #1e1e1e", background: "#0d0d0d", flexShrink: 0 }}>
              <div style={{ maxWidth: 600, margin: "0 auto" }}>
                <div style={{ display: "flex", gap: 8, alignItems: "flex-end", background: "#161616", borderRadius: 18, border: "1px solid #2a2a2a", padding: "10px 10px 10px 16px" }}>
                  <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
                    placeholder="どんなアプリが欲しいですか？"
                    rows={1}
                    style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#e0e0e0", fontSize: 15, resize: "none", fontFamily: "inherit", lineHeight: 1.5, maxHeight: 120, overflowY: "auto" }}
                  />
                  <button onClick={sendMessage} disabled={!input.trim() || loading}
                    style={{ width: 38, height: 38, borderRadius: 12, background: input.trim() && !loading ? "linear-gradient(135deg, #7c3aed, #6d28d9)" : "#1e1e1e", border: "none", color: input.trim() && !loading ? "#fff" : "#333", fontSize: 18, cursor: input.trim() && !loading ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s" }}>
                    ↑
                  </button>
                </div>
                <div style={{ textAlign: "center", marginTop: 8, fontSize: 10, color: "#2a2a2a" }}>
                  Enter で送信 · Shift+Enter で改行
                </div>
              </div>
            </div>
          </div>

          {tab === "preview" && generatedApp && (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
              <div style={{ padding: "10px 16px", borderBottom: "1px solid #1e1e1e", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#0d0d0d", flexShrink: 0 }}>
                <div style={{ color: "#888", fontSize: 12, fontFamily: "monospace" }}>
                  ✦ {appTitle}
                </div>
                <button onClick={handleDownload}
                  style={{ background: downloaded ? "#16a34a" : "linear-gradient(135deg, #7c3aed, #6d28d9)", border: "none", color: "#fff", fontSize: 12, padding: "7px 16px", borderRadius: 20, cursor: "pointer", fontWeight: "600", transition: "all 0.2s" }}>
                  {downloaded ? "✓ ダウンロード完了" : "⬇ ダウンロード"}
                </button>
              </div>
              <iframe
                ref={iframeRef}
                srcDoc={generatedApp}
                style={{ flex: 1, border: "none", background: "#fff" }}
                sandbox="allow-scripts allow-same-origin"
                title="Generated App Preview"
              />
            </div>
          )}
        </div>
      </div>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0d0d0d; }
        @keyframes pulse { 0%,100%{opacity:0.3;transform:scale(0.8)} 50%{opacity:1;transform:scale(1.2)} }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 2px; }
      `}</style>
    </>
  );
}
