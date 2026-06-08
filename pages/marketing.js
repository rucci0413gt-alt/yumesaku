// pages/marketing.js
// 📊 マーケティング分析エージェント

import { useState } from 'react';
import Head from 'next/head';

const emptyPost = () => ({
product: '',
category: 'ガジェット',
impressions: '',
likes: '',
clicks: '',
hour: '',
image: 'あり',
});

export default function Marketing() {
const [posts, setPosts] = useState([emptyPost()]);
const [loading, setLoading] = useState(false);
const [result, setResult] = useState(null);
const [error, setError] = useState('');

const categories = ['ガジェット', 'PC周辺', 'オーディオ', 'スマホ', 'カメラ'];

const addPost = () => setPosts([...posts, emptyPost()]);
const removePost = (i) => setPosts(posts.filter((_, idx) => idx !== i));
const updatePost = (i, field, value) => {
const updated = [...posts];
updated[i][field] = value;
setPosts(updated);
};

const analyze = async () => {
const valid = posts.filter(p => p.product && p.impressions);
if (valid.length === 0) {
setError('商品名とインプレッション数を入力してください');
return;
}
setLoading(true);
setError('');
setResult(null);

try {
const res = await fetch('/api/marketing', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ posts: valid }),
});
const data = await res.json();
if (data.success) setResult(data);
else setError(data.error || '分析に失敗しました');
} catch (e) {
setError('通信エラーが発生しました');
} finally {
setLoading(false);
}
};

return (
<>
<Head>
<title>マーケティング分析 - yumesaku</title>
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
<p className="eyebrow">📊 マーケティング分析</p>
<h1 className="hero-title">何が売れるか、見える化する。</h1>
<p className="hero-subtitle">投稿データを入力するだけで<br />AIが次に売れる商品を提案します</p>
</div>
</section>

<main className="main">
<div className="section-title-wrap">
<h2 className="section-title">投稿データを入力</h2>
<button onClick={addPost} className="add-btn">＋ 投稿を追加</button>
</div>

<div className="posts-list">
{posts.map((post, i) => (
<div key={i} className="post-card">
<div className="post-header">
<span className="post-num">投稿 {i + 1}</span>
{posts.length > 1 && (
<button onClick={() => removePost(i)} className="remove-btn">削除</button>
)}
</div>

<div className="form-grid">
<div className="form-group full">
<label className="label">商品名</label>
<input
type="text"
value={post.product}
onChange={e => updatePost(i, 'product', e.target.value)}
placeholder="例：SHOKZ OPENDOTS ONE"
className="input"
/>
</div>

<div className="form-group">
<label className="label">カテゴリ</label>
<select
value={post.category}
onChange={e => updatePost(i, 'category', e.target.value)}
className="input"
>
{categories.map(c => <option key={c}>{c}</option>)}
</select>
</div>

<div className="form-group">
<label className="label">投稿時間（時）</label>
<input
type="number"
value={post.hour}
onChange={e => updatePost(i, 'hour', e.target.value)}
placeholder="例：7"
min="0" max="23"
className="input"
/>
</div>

<div className="form-group">
<label className="label">インプレッション数 *</label>
<input
type="number"
value={post.impressions}
onChange={e => updatePost(i, 'impressions', e.target.value)}
placeholder="例：100"
className="input"
/>
</div>

<div className="form-group">
<label className="label">いいね数</label>
<input
type="number"
value={post.likes}
onChange={e => updatePost(i, 'likes', e.target.value)}
placeholder="例：3"
className="input"
/>
</div>

<div className="form-group">
<label className="label">クリック数</label>
<input
type="number"
value={post.clicks}
onChange={e => updatePost(i, 'clicks', e.target.value)}
placeholder="例：11"
className="input"
/>
</div>

<div className="form-group">
<label className="label">人物画像</label>
<select
value={post.image}
onChange={e => updatePost(i, 'image', e.target.value)}
className="input"
>
<option value="あり">あり</option>
<option value="なし">なし</option>
</select>
</div>
</div>
</div>
))}
</div>

{error && <p className="error">{error}</p>}

<button onClick={analyze} disabled={loading} className="analyze-btn">
{loading ? '分析中...' : '📊 AIに分析してもらう'}
</button>

{loading && (
<div className="loading">
<div className="spinner"></div>
<p className="loading-text">データを分析中...</p>
</div>
)}

{result && (
<div className="result">
<h2 className="result-title">📊 分析結果</h2>

{/* 勝ちパターン */}
<div className="result-card">
<p className="result-label">🏆 勝ちパターン</p>
<p className="result-text">{result.winPattern}</p>
</div>

{/* 最適投稿時間 */}
<div className="result-card">
<p className="result-label">🕐 最適な投稿時間帯</p>
<p className="result-text">{result.bestTime}</p>
</div>

{/* 改善ポイント */}
<div className="result-card">
<p className="result-label">💡 改善ポイント</p>
<p className="result-text">{result.improvement}</p>
</div>

{/* 次に投稿すべき商品TOP3 */}
<h3 className="next-title">🎯 次に投稿すべき商品TOP3</h3>
<div className="next-list">
{result.nextProducts?.map((p, i) => (
<div key={i} className="next-card">
<div className="next-rank">{i + 1}</div>
<div className="next-content">
<p className="next-product">{p.product}</p>
<p className="next-reason">{p.reason}</p>
<p className="next-hook">💬 フック：「{p.hook}」</p>
</div>
<a href="/hawkeye" className="next-link">鷹眼で探す →</a>
</div>
))}
</div>
</div>
)}
</main>

<footer className="footer">
<p className="footer-text">© 2026 yumesaku. AIで仕事を加速する人のために.</p>
</footer>
</div>

<style jsx global>{`
body { margin:0; font-family:'Noto Sans JP','Inter',sans-serif; background:#FAFAFA; color:#1A1A1A; -webkit-font-smoothing:antialiased; }
* { box-sizing:border-box; }
h1,h2,h3,.hero-title { word-break:keep-all; overflow-wrap:break-word; }
.container { min-height:100vh; }
.header { border-bottom:1px solid #E8E8E8; background:rgba(250,250,250,0.85); backdrop-filter:blur(20px); position:sticky; top:0; z-index:100; }
.header-inner { max-width:1200px; margin:0 auto; padding:clamp(14px,2.5vw,20px) clamp(20px,4vw,32px); display:flex; justify-content:space-between; align-items:center; }
.logo { font-family:'Inter',sans-serif; font-size:clamp(18px,3vw,22px); font-weight:700; color:#1A1A1A; text-decoration:none; }
.nav { display:flex; gap:clamp(16px,3vw,32px); }
.nav-link { font-size:clamp(13px,1.5vw,14px); color:#1A1A1A; text-decoration:none; font-weight:500; }
.hero { padding:clamp(48px,10vw,80px) clamp(20px,4vw,32px) clamp(24px,4vw,40px); text-align:center; }
.hero-inner { max-width:760px; margin:0 auto; }
.eyebrow { font-size:13px; color:#0066FF; font-weight:600; letter-spacing:0.08em; margin:0 0 12px; }
.hero-title { font-size:clamp(24px,5vw,44px); font-weight:700; line-height:1.3; letter-spacing:-0.03em; margin:0 0 16px; }
.hero-subtitle { font-size:clamp(14px,2vw,17px); color:#666; line-height:1.75; margin:0; }

.main { max-width:760px; margin:0 auto; padding:clamp(24px,5vw,40px) clamp(20px,4vw,32px) clamp(60px,10vw,96px); }

.section-title-wrap { display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; }
.section-title { font-size:clamp(18px,3vw,22px); font-weight:700; margin:0; }
.add-btn { padding:8px 18px; font-size:13px; font-weight:600; color:#1A1A1A; background:#FFFFFF; border:1px solid #E8E8E8; border-radius:100px; cursor:pointer; font-family:inherit; transition:all .3s; }
.add-btn:hover { background:#1A1A1A; color:#FFFFFF; border-color:#1A1A1A; }

.posts-list { display:flex; flex-direction:column; gap:16px; margin-bottom:24px; }
.post-card { background:#FFFFFF; border:1px solid #F0F0F0; border-radius:16px; padding:clamp(16px,3vw,24px); box-shadow:0 2px 8px rgba(0,0,0,0.04); }
.post-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; }
.post-num { font-size:13px; font-weight:700; color:#0066FF; }
.remove-btn { font-size:12px; color:#E53935; background:none; border:none; cursor:pointer; font-family:inherit; }

.form-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
.form-group { display:flex; flex-direction:column; gap:6px; }
.form-group.full { grid-column:1/-1; }
.label { font-size:12px; font-weight:600; color:#666; }
.input { padding:10px 12px; font-size:14px; border:1px solid #E8E8E8; border-radius:10px; outline:none; background:#FAFAFA; color:#1A1A1A; font-family:inherit; transition:all .3s; }
.input:focus { border-color:#1A1A1A; background:#FFFFFF; box-shadow:0 0 0 4px rgba(26,26,26,0.05); }

.error { color:#E53935; font-size:13px; margin-bottom:16px; }

.analyze-btn { width:100%; padding:clamp(14px,2.5vw,18px); font-size:clamp(15px,1.8vw,16px); font-weight:600; color:#FFFFFF; background:#1A1A1A; border:none; border-radius:12px; cursor:pointer; font-family:inherit; transition:all .3s; }
.analyze-btn:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 12px 28px rgba(26,26,26,0.25); }
.analyze-btn:disabled { opacity:.5; cursor:not-allowed; }

.loading { text-align:center; padding:40px 0; }
.spinner { width:40px; height:40px; margin:0 auto; border:3px solid #E8E8E8; border-top-color:#1A1A1A; border-radius:50%; animation:spin .8s linear infinite; }
@keyframes spin { to { transform:rotate(360deg); } }
.loading-text { margin-top:16px; color:#999; font-size:14px; }

.result { margin-top:40px; }
.result-title { font-size:clamp(20px,3vw,26px); font-weight:700; margin:0 0 20px; }
.result-card { background:#FFFFFF; border:1px solid #F0F0F0; border-radius:16px; padding:clamp(18px,3vw,24px); margin-bottom:12px; box-shadow:0 2px 8px rgba(0,0,0,0.04); }
.result-label { font-size:13px; font-weight:700; color:#5B6AD0; margin:0 0 8px; }
.result-text { font-size:clamp(14px,1.8vw,15px); color:#333; line-height:1.75; margin:0; }

.next-title { font-size:clamp(18px,2.5vw,22px); font-weight:700; margin:32px 0 16px; }
.next-list { display:flex; flex-direction:column; gap:12px; }
.next-card { background:#FFFFFF; border:1px solid #F0F0F0; border-radius:16px; padding:clamp(16px,3vw,20px); display:flex; align-items:flex-start; gap:16px; box-shadow:0 2px 8px rgba(0,0,0,0.04); }
.next-rank { flex-shrink:0; width:36px; height:36px; border-radius:50%; background:#1A1A1A; color:#FFFFFF; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:16px; }
.next-content { flex:1; min-width:0; }
.next-product { font-size:15px; font-weight:700; color:#1A1A1A; margin:0 0 6px; }
.next-reason { font-size:13px; color:#666; line-height:1.6; margin:0 0 6px; }
.next-hook { font-size:13px; color:#0066FF; font-weight:500; margin:0; }
.next-link { flex-shrink:0; font-size:12px; color:#0066FF; font-weight:600; text-decoration:none; white-space:nowrap; padding-top:4px; }

.footer { border-top:1px solid #E8E8E8; padding:clamp(24px,5vw,40px); text-align:center; background:#FFFFFF; }
.footer-text { font-size:12px; color:#999; margin:0; }

@media (max-width:480px) {
.form-grid { grid-template-columns:1fr; }
.form-group.full { grid-column:1; }
.hero-subtitle br { display:none; }
}
`}</style>
</>
);
}
