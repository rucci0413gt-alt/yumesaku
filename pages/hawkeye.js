// pages/hawkeye.js
// 🦅 鷹の目エージェント - ハッシュタグ提案追加版
import { useState } from 'react';
import Head from 'next/head';

export default function HawkEye() {
const [loading, setLoading] = useState(false);
const [data, setData] = useState(null);
const [error, setError] = useState('');
const [copied, setCopied] = useState(null);
const [copiedTag, setCopiedTag] = useState(null);

const run = async () => {
setLoading(true); setError(''); setData(null);
try {
const res = await fetch('/api/hawkeye', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ genre: 'エンジニア向け' }),
});
const result = await res.json();
if (result.success) setData(result);
else setError(result.error || 'リサーチに失敗しました');
} catch (e) {
setError('通信エラーが発生しました');
} finally {
setLoading(false);
}
};

const copy = async (text, i) => {
try {
await navigator.clipboard.writeText(text);
setCopied(i);
setTimeout(() => setCopied(null), 2000);
} catch (e) { alert('コピーできませんでした'); }
};

const copyTag = async (tag, i) => {
try {
await navigator.clipboard.writeText(tag);
setCopiedTag(i);
setTimeout(() => setCopiedTag(null), 2000);
} catch (e) { alert('コピーできませんでした'); }
};

// ジャンルに合わせたハッシュタグセット
const hashtagSets = [
['#エンジニア', '#ガジェット', '#在宅ワーク', '#テレワーク', '#作業効率化'],
['#プログラマー', '#デスク環境', '#リモートワーク', '#ガジェット好き', '#仕事効率化'],
['#エンジニアライフ', '#在宅勤務', '#ガジェットオタク', '#デスクセットアップ', '#ITエンジニア'],
['#テック', '#ガジェット購入', '#在宅ワーカー', '#エンジニア転職', '#プログラミング'],
['#デスクツアー', '#作業環境', '#ガジェットレビュー', '#テレワーク生活', '#エンジニア必見'],
];

// 毎回ランダムに3セット提案
const getRandomTags = () => {
const shuffled = [...hashtagSets].sort(() => Math.random() - 0.5);
return shuffled.slice(0, 3);
};

const [tagSets] = useState(() => getRandomTags());

return (
<>
<Head>
<title>鷹の目 - yumesaku</title>
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
</nav>
</div>
</header>

<section className="hero">
<div className="hero-inner">
<p className="eyebrow">🦅 鷹の目エージェント</p>
<h1 className="hero-title">エンジニアが、欲しがる。</h1>
<p className="hero-subtitle">人気の鉄板商品・次に来る商品・抱き合わせを<br />AIが瞬時に見抜く。</p>
<button onClick={run} disabled={loading} className="run-btn">
{loading ? 'リサーチ中...' : '🦅 リサーチ開始'}
</button>
{error && <p className="error">{error}</p>}
</div>
</section>

{/* ハッシュタグ提案（常時表示） */}
<section className="hashtag-section">
<div className="hashtag-inner">
<p className="hashtag-title"># 今日のおすすめハッシュタグ</p>
<p className="hashtag-desc">毎回違う組み合わせを提案します。1セットをコピーして投稿に使ってください。</p>
<div className="hashtag-sets">
{tagSets.map((tags, i) => (
<div key={i} className="hashtag-set">
<div className="hashtag-tags">
{tags.map((tag, j) => (
<span key={j} className="hashtag-chip">{tag}</span>
))}
</div>
<button
className={`hashtag-copy-btn ${copiedTag === i ? 'copied' : ''}`}
onClick={() => copyTag(tags.join(' '), i)}
>
{copiedTag === i ? '✓ コピー！' : 'コピー'}
</button>
</div>
))}
</div>
</div>
</section>

{loading && (
<div className="loading">
<div className="spinner"></div>
<p className="loading-text">鷹の目が獲物を探しています...</p>
<p className="loading-sub">30秒〜1分ほどかかります</p>
</div>
)}

{data && (
<main className="results">
{(data.nextTrend || data.bundle) && (
<div className="insights">
{data.nextTrend && (
<div className="insight-card">
<p className="insight-label">📈 次に来そう</p>
<p className="insight-text">{data.nextTrend}</p>
</div>
)}
{data.bundle && (
<div className="insight-card">
<p className="insight-label">🎁 抱き合わせ提案</p>
<p className="insight-text">{data.bundle}</p>
</div>
)}
</div>
)}

<h2 className="section-title">今日の鉄板ピック</h2>
<div className="grid">
{data.recommendations.map((p, i) => (
<div key={i} className="card">
<span className="tag">{p.tag}</span>
{p.image && (
<div className="img-wrap"><img src={p.image} alt={p.name} className="img" /></div>
)}
<div className="card-body">
{p.xHook && <p className="hook">「{p.xHook}」</p>}
<p className="name">{p.name}</p>
<p className="reason">💡 {p.reason}</p>
<p className="price">¥{p.price?.toLocaleString?.() || p.price}</p>
<div className="card-actions">
<button className={`copy-btn ${copied === i ? 'copied' : ''}`} onClick={() => copy(p.url, i)}>
{copied === i ? '✓ コピーしました' : 'URLをコピー'}
</button>
<a href="/article" className="article-link">記事を作る →</a>
</div>
</div>
</div>
))}
</div>
<p className="hint">※ URLをコピー → Articleページの「商品URLから記事＋MyLink生成」に貼り付け</p>
</main>
)}

<footer className="footer">
<p className="footer-text">© 2026 yumesaku. AIで仕事を加速する人のために.</p>
</footer>
</div>

<style jsx global>{`
body { margin:0; font-family:'Noto Sans JP','Inter',sans-serif; background:#FAFAFA; color:#1A1A1A; -webkit-font-smoothing:antialiased; }
* { box-sizing:border-box; }
h1,h2,.hero-title { word-break:keep-all; overflow-wrap:break-word; }
.container { min-height:100vh; }
.header { border-bottom:1px solid #E8E8E8; background:rgba(250,250,250,0.85); backdrop-filter:blur(20px); position:sticky; top:0; z-index:100; }
.header-inner { max-width:1200px; margin:0 auto; padding:clamp(14px,2.5vw,20px) clamp(20px,4vw,32px); display:flex; justify-content:space-between; align-items:center; }
.logo { font-family:'Inter',sans-serif; font-size:clamp(18px,3vw,22px); font-weight:700; color:#1A1A1A; text-decoration:none; }
.nav { display:flex; gap:clamp(16px,3vw,32px); }
.nav-link { font-size:clamp(13px,1.5vw,14px); color:#1A1A1A; text-decoration:none; font-weight:500; }
.hero { padding:clamp(48px,10vw,96px) clamp(20px,4vw,32px) clamp(32px,6vw,48px); text-align:center; }
.hero-inner { max-width:760px; margin:0 auto; }
.eyebrow { font-size:clamp(12px,1.6vw,14px); color:#0066FF; font-weight:600; letter-spacing:0.08em; margin:0 0 12px; }
.hero-title { font-size:clamp(28px,6vw,52px); font-weight:700; line-height:1.3; letter-spacing:-0.03em; margin:0 0 clamp(16px,3vw,24px); }
.hero-subtitle { font-size:clamp(14px,2vw,17px); color:#666; line-height:1.75; margin:0 0 clamp(28px,5vw,44px); }
.run-btn { padding:clamp(14px,2.5vw,18px) clamp(32px,6vw,56px); font-size:clamp(15px,1.8vw,17px); font-weight:600; color:#fff; background:#1A1A1A; border:none; border-radius:12px; cursor:pointer; font-family:inherit; transition:all .3s; }
.run-btn:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 12px 28px rgba(26,26,26,0.25); }
.run-btn:disabled { opacity:.5; cursor:not-allowed; }
.error { color:#E53935; margin-top:16px; font-size:14px; }

/* === ハッシュタグセクション === */
.hashtag-section { max-width:760px; margin:0 auto; padding:0 clamp(20px,4vw,32px) clamp(32px,6vw,48px); }
.hashtag-inner { background:#FFFBEB; border:1px solid #FDE68A; border-radius:16px; padding:clamp(20px,4vw,28px); }
.hashtag-title { font-size:clamp(15px,2vw,17px); font-weight:700; color:#1A1A1A; margin:0 0 8px; }
.hashtag-desc { font-size:13px; color:#666; margin:0 0 20px; line-height:1.6; }
.hashtag-sets { display:flex; flex-direction:column; gap:12px; }
.hashtag-set { display:flex; align-items:center; justify-content:space-between; background:#FFFFFF; border:1px solid #FDE68A; border-radius:10px; padding:12px 14px; gap:12px; }
.hashtag-tags { display:flex; flex-wrap:wrap; gap:6px; flex:1; }
.hashtag-chip { font-size:12px; color:#B45309; background:#FEF3C7; padding:4px 10px; border-radius:100px; font-weight:500; }
.hashtag-copy-btn { padding:8px 16px; font-size:12px; font-weight:600; color:#FFFFFF; background:#1A1A1A; border:none; border-radius:8px; cursor:pointer; font-family:inherit; transition:all .3s; white-space:nowrap; flex-shrink:0; }
.hashtag-copy-btn.copied { background:#22C55E; }
.hashtag-copy-btn:hover { opacity:0.85; }

.loading { text-align:center; padding:clamp(60px,10vw,120px) 20px; }
.spinner { width:48px; height:48px; margin:0 auto; border:3px solid #E8E8E8; border-top-color:#1A1A1A; border-radius:50%; animation:spin .8s linear infinite; }
@keyframes spin { to { transform:rotate(360deg); } }
.loading-text { margin-top:24px; font-weight:500; }
.loading-sub { color:#999; font-size:13px; margin-top:4px; }
.results { max-width:1100px; margin:0 auto; padding:clamp(20px,4vw,40px) clamp(20px,4vw,32px) clamp(60px,10vw,96px); }
.insights { display:grid; grid-template-columns:1fr 1fr; gap:clamp(12px,2vw,20px); margin-bottom:clamp(32px,5vw,48px); }
.insight-card { background:#fff; border:1px solid #E0E7FF; border-radius:16px; padding:clamp(18px,3vw,24px); }
.insight-label { font-size:13px; font-weight:700; color:#5B6AD0; margin:0 0 8px; }
.insight-text { font-size:clamp(13px,1.6vw,15px); color:#333; line-height:1.7; margin:0; }
.section-title { font-size:clamp(20px,3vw,28px); font-weight:700; margin:0 0 clamp(20px,3vw,28px); }
.grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:clamp(16px,2.5vw,24px); }
.card { background:#fff; border:1px solid #F0F0F0; border-radius:16px; overflow:hidden; position:relative; transition:all .3s; }
.card:hover { transform:translateY(-4px); box-shadow:0 16px 40px rgba(0,0,0,0.1); }
.tag { position:absolute; top:12px; left:12px; z-index:2; background:#1A1A1A; color:#fff; font-size:12px; font-weight:700; padding:5px 12px; border-radius:100px; }
.img-wrap { aspect-ratio:1/1; background:#F5F5F5; }
.img { width:100%; height:100%; object-fit:contain; padding:20px; }
.card-body { padding:clamp(16px,2.5vw,20px); }
.hook { font-size:clamp(14px,1.8vw,16px); font-weight:700; color:#0066FF; margin:0 0 10px; line-height:1.4; }
.name { font-size:12px; color:#999; margin:0 0 10px; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
.reason { font-size:13px; color:#444; line-height:1.6; margin:0 0 12px; }
.price { font-size:clamp(17px,2.2vw,20px); font-weight:700; margin:0 0 14px; }
.card-actions { display:flex; flex-direction:column; gap:8px; }
.copy-btn { padding:10px; font-size:13px; font-weight:600; color:#fff; background:#1A1A1A; border:none; border-radius:8px; cursor:pointer; font-family:inherit; transition:all .3s; }
.copy-btn.copied { background:#22C55E; }
.copy-btn:hover { opacity:.85; }
.article-link { text-align:center; font-size:13px; color:#0066FF; font-weight:600; text-decoration:none; padding:6px; }
.hint { text-align:center; font-size:12px; color:#999; margin-top:clamp(24px,4vw,40px); }
.footer { border-top:1px solid #E8E8E8; padding:clamp(24px,5vw,40px); text-align:center; background:#fff; }
.footer-text { font-size:12px; color:#999; margin:0; }
@media (max-width:640px) { .insights { grid-template-columns:1fr; } .hero-subtitle br { display:none; } .hashtag-set { flex-direction:column; align-items:flex-start; } .hashtag-copy-btn { width:100%; } }
`}</style>
</>
);
}
