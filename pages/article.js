// pages/article.js
// AI記事自動生成 - X投稿コピー機能追加版

import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Article() {
const [category, setCategory] = useState('PC周辺');
const [loading, setLoading] = useState(false);
const [data, setData] = useState(null);
const [error, setError] = useState('');
const [mounted, setMounted] = useState(false);
const [copiedIndex, setCopiedIndex] = useState(null);
const [copiedAll, setCopiedAll] = useState(false);

useEffect(() => {
setMounted(true);
}, []);

const categories = ['ガジェット', 'PC周辺', 'オーディオ', 'スマホ', 'カメラ'];

const generateArticle = async () => {
setLoading(true);
setError('');
setData(null);

try {
const res = await fetch('/api/article', {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ category }),
});
const result = await res.json();

if (result.success) {
setData(result);
} else {
setError(result.error || '生成に失敗しました');
}
} catch (e) {
setError('通信エラーが発生しました');
} finally {
setLoading(false);
}
};

const generateXText = (review, item) => {
const headline = review.headline || '';
const price = item?.price ? `¥${item.price.toLocaleString()}` : '';
const recommend = review.recommendFor || '';
const desc = review.description ? review.description.slice(0, 40) : '';

const text = `【${category}】\n${headline}\n\n${desc}…\n\n👤 ${recommend}\n💰 ${price}\n\n詳しくはコメント欄👇`;
return text;
};

const generateFullText = () => {
if (!data) return '';
let text = `【${data.category}】${data.article.title}\n\n${data.article.intro}\n\n`;
data.article.reviews?.forEach((review, i) => {
const item = data.items[i];
if (!item) return;
text += `▼${i + 1}位：${review.headline}\n`;
text += `${review.description}\n`;
text += `👤 ${review.recommendFor}\n`;
text += `💰 ¥${item.price.toLocaleString()}\n\n`;
});
text += `【まとめ】\n${data.article.conclusion}`;
return text;
};

const copyToClipboard = async (text, index) => {
try {
await navigator.clipboard.writeText(text);
if (index === 'all') {
setCopiedAll(true);
setTimeout(() => setCopiedAll(false), 2000);
} else {
setCopiedIndex(index);
setTimeout(() => setCopiedIndex(null), 2000);
}
} catch (e) {
alert('コピーできませんでした。手動でコピーしてください。');
}
};

return (
<>
<Head>
<title>記事作成 - yumesaku</title>
<meta name="description" content="AIが厳選する、在宅ワーカー・クリエイター向けガジェット最新レビュー" />
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
<a href="/article" className="nav-link active">Article</a>
</nav>
</div>
</header>

<section className="hero">
<div className="hero-inner">
<h1 className={`hero-title fade-in-up ${mounted ? 'visible' : ''}`} style={{animationDelay: '0s'}}>
今、読んでおきたいレビュー。
</h1>
<p className={`hero-subtitle fade-in-up ${mounted ? 'visible' : ''}`} style={{animationDelay: '0.1s'}}>
Yahoo!ショッピングの売れ筋を<br />
AIが瞬時に編集記事化
</p>

<div className={`controls fade-in-up ${mounted ? 'visible' : ''}`} style={{animationDelay: '0.2s'}}>
<div className="tabs">
{categories.map(cat => (
<button
key={cat}
onClick={() => setCategory(cat)}
className={`tab ${category === cat ? 'active' : ''}`}
disabled={loading}
>
{cat}
</button>
))}
</div>

<button
onClick={generateArticle}
disabled={loading}
className="generate-btn"
>
{loading ? '生成中...' : '記事作成'}
</button>
</div>

{error && <p className="error">{error}</p>}
</div>
</section>

{loading && (
<div className="loading">
<div className="spinner-wrap">
<div className="spinner-ring"></div>
<div className="spinner-dot"></div>
</div>
<p className="loading-text">AIが記事を執筆中...</p>
<p className="loading-sub">30秒～1分ほどかかります</p>
</div>
)}

{data && (
<article className="article">
<div className="article-header fade-in-up visible">
<p className="article-category">{data.category}</p>
<h2 className="article-title">{data.article.title}</h2>
<p className="article-intro">{data.article.intro}</p>
</div>

<div className="review-list">
{data.article.reviews?.map((review, i) => {
const item = data.items[i];
if (!item) return null;
const xText = generateXText(review, item);
return (
<div key={i} className="review-wrapper">
<a
href={item.url}
target="_blank"
rel="noopener noreferrer"
className="review-card fade-in-up visible"
style={{ animationDelay: `${i * 0.1}s` }}
>
<div className={`rank-badge ${i < 3 ? `rank-${i + 1}` : ''}`}>
{review.rank || i + 1}位
</div>

{item.image && (
<div className="review-image-wrap">
<img src={item.image} alt={item.name} className="review-image" />
</div>
)}

<div className="review-content">
<h3 className="review-headline">{review.headline}</h3>
<p className="review-product">{item.name}</p>
<p className="review-desc">{review.description}</p>
<div className="review-meta">
<span className="recommend-for">👤 {review.recommendFor}</span>
</div>
<div className="review-footer">
<p className="review-price">¥{item.price.toLocaleString()}</p>
<span className="check-btn">商品を見る →</span>
</div>
</div>
</a>

<div className="x-copy-box">
<div className="x-copy-header">
<span className="x-copy-label">𝕏 投稿用テキスト</span>
<button
className={`copy-btn ${copiedIndex === i ? 'copied' : ''}`}
onClick={() => copyToClipboard(xText, i)}
>
{copiedIndex === i ? '✓ コピーしました' : 'コピー'}
</button>
</div>
<pre className="x-copy-text">{xText}</pre>
</div>
</div>
);
})}
</div>

<div className="conclusion fade-in-up visible" style={{ animationDelay: '0.6s' }}>
<h3 className="conclusion-title">まとめ</h3>
<p className="conclusion-text">{data.article.conclusion}</p>
</div>

<div className="full-copy-wrap">
<button
className={`full-copy-btn ${copiedAll ? 'copied' : ''}`}
onClick={() => copyToClipboard(generateFullText(), 'all')}
>
{copiedAll ? '✓ コピーしました！' : '📋 記事をまるごとコピー'}
</button>
</div>

<p className="disclaimer">
※本記事はAIにより自動生成されました｜価格・在庫は変動する場合があります
</p>
</article>
)}

<footer className="footer">
<p className="footer-text">© 2026 yumesaku. AIで仕事を加速する人のために.</p>
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

h1, h2, h3, h4, .hero-title, .article-title, .review-headline, .conclusion-title {
word-break: keep-all;
overflow-wrap: break-word;
line-break: strict;
}

.container { min-height: 100vh; background: #FAFAFA; }

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
padding: clamp(14px, 2.5vw, 20px) clamp(20px, 4vw, 32px);
display: flex;
justify-content: space-between;
align-items: center;
}
.logo {
font-family: 'Inter', sans-serif;
font-size: clamp(18px, 3vw, 22px);
font-weight: 700;
color: #1A1A1A;
text-decoration: none;
letter-spacing: -0.02em;
transition: opacity 0.3s;
}
.logo:hover { opacity: 0.7; }
.nav { display: flex; gap: clamp(16px, 3vw, 32px); }
.nav-link {
font-size: clamp(13px, 1.5vw, 14px);
color: #1A1A1A;
text-decoration: none;
font-weight: 500;
position: relative;
transition: color 0.3s;
}
.nav-link.active { font-weight: 700; }
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
.nav-link:hover::after,
.nav-link.active::after { width: 100%; }

.hero {
padding: clamp(48px, 10vw, 96px) clamp(20px, 4vw, 32px) clamp(32px, 6vw, 48px);
text-align: center;
}
.hero-inner { max-width: 760px; margin: 0 auto; }
.hero-title {
font-size: clamp(26px, 6vw, 52px);
font-weight: 700;
color: #1A1A1A;
line-height: 1.3;
letter-spacing: -0.03em;
margin: 0 0 clamp(16px, 3vw, 24px) 0;
}
.hero-subtitle {
font-size: clamp(14px, 2vw, 17px);
color: #666;
line-height: 1.75;
margin: 0 0 clamp(28px, 5vw, 44px) 0;
}

.controls {
display: flex;
flex-direction: column;
gap: clamp(16px, 3vw, 24px);
align-items: center;
}
.tabs {
display: flex;
flex-wrap: wrap;
gap: 8px;
justify-content: center;
}
.tab {
padding: clamp(8px, 1.5vw, 10px) clamp(16px, 3vw, 22px);
font-size: clamp(12px, 1.5vw, 14px);
font-weight: 500;
color: #1A1A1A;
background: #FFFFFF;
border: 1px solid #E8E8E8;
border-radius: 100px;
cursor: pointer;
font-family: inherit;
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.tab:hover:not(:disabled) {
background: #F5F5F5;
transform: translateY(-1px);
}
.tab.active {
background: #1A1A1A;
color: #FFFFFF;
border-color: #1A1A1A;
}
.tab:disabled { opacity: 0.5; cursor: not-allowed; }

.generate-btn {
padding: clamp(14px, 2.5vw, 18px) clamp(32px, 6vw, 56px);
font-size: clamp(14px, 1.8vw, 16px);
font-weight: 600;
color: #FFFFFF;
background: #1A1A1A;
border: none;
border-radius: 12px;
cursor: pointer;
font-family: inherit;
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.generate-btn:hover:not(:disabled) {
transform: translateY(-2px);
box-shadow: 0 12px 28px rgba(26,26,26,0.25);
}
.generate-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.loading {
text-align: center;
padding: clamp(60px, 10vw, 120px) 20px;
}
.spinner-wrap {
position: relative;
width: 56px;
height: 56px;
margin: 0 auto;
}
.spinner-ring {
position: absolute;
width: 100%;
height: 100%;
border: 2px solid #E8E8E8;
border-top-color: #1A1A1A;
border-radius: 50%;
animation: spin 0.8s linear infinite;
}
.spinner-dot {
position: absolute;
top: 50%;
left: 50%;
width: 10px;
height: 10px;
margin-top: -5px;
margin-left: -5px;
background: #1A1A1A;
border-radius: 50%;
animation: pulse 1.2s ease-in-out infinite;
}
.loading-text {
margin-top: 24px;
color: #1A1A1A;
font-size: 16px;
font-weight: 500;
}
.loading-sub {
margin-top: 4px;
color: #999;
font-size: 13px;
}

.article {
max-width: 760px;
margin: clamp(20px, 4vw, 40px) auto;
padding: 0 clamp(20px, 4vw, 32px) clamp(60px, 10vw, 96px);
}
.article-header {
text-align: center;
margin-bottom: clamp(40px, 8vw, 72px);
}
.article-category {
font-family: 'Inter', sans-serif;
font-size: clamp(11px, 1.4vw, 12px);
color: #0066FF;
font-weight: 600;
letter-spacing: 0.12em;
text-transform: uppercase;
margin: 0 0 clamp(12px, 2vw, 16px) 0;
}
.article-title {
font-size: clamp(24px, 4.5vw, 38px);
font-weight: 700;
color: #1A1A1A;
line-height: 1.35;
letter-spacing: -0.02em;
margin: 0 0 clamp(16px, 3vw, 24px) 0;
}
.article-intro {
font-size: clamp(15px, 2vw, 17px);
color: #444;
line-height: 1.85;
margin: 0;
}

.review-list {
display: flex;
flex-direction: column;
gap: clamp(16px, 3vw, 28px);
}

.review-wrapper {
display: flex;
flex-direction: column;
gap: 0;
}

.review-card {
background: #FFFFFF;
border-radius: 16px 16px 0 0;
box-shadow: 0 2px 8px rgba(0,0,0,0.04);
text-decoration: none;
color: inherit;
overflow: hidden;
position: relative;
border: 1px solid #F0F0F0;
border-bottom: none;
transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
display: block;
}
.review-card:hover {
transform: translateY(-4px);
box-shadow: 0 16px 40px rgba(0,0,0,0.1);
border-color: #1A1A1A;
}
.review-card:hover .review-image { transform: scale(1.04); }
.review-card:hover .check-btn { transform: translateX(4px); }

.rank-badge {
position: absolute;
top: 16px;
left: 16px;
background: #1A1A1A;
color: #FFFFFF;
font-family: 'Inter', sans-serif;
font-size: clamp(11px, 1.4vw, 13px);
font-weight: 700;
padding: 6px 14px;
border-radius: 100px;
z-index: 2;
letter-spacing: 0.02em;
}
.rank-badge.rank-1 {
background: linear-gradient(135deg, #FFD700, #FFA500);
box-shadow: 0 4px 16px rgba(255,165,0,0.4);
}
.rank-badge.rank-2 {
background: linear-gradient(135deg, #C0C0C0, #909090);
box-shadow: 0 4px 16px rgba(192,192,192,0.4);
}
.rank-badge.rank-3 {
background: linear-gradient(135deg, #CD7F32, #8B4513);
color: #FFFFFF;
box-shadow: 0 4px 16px rgba(205,127,50,0.4);
}

.review-image-wrap {
width: 100%;
aspect-ratio: 16/9;
background: #F5F5F5;
overflow: hidden;
}
.review-image {
width: 100%;
height: 100%;
object-fit: contain;
padding: clamp(16px, 3vw, 32px);
transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.review-content { padding: clamp(20px, 4vw, 32px); }
.review-headline {
font-size: clamp(18px, 2.5vw, 22px);
font-weight: 700;
color: #1A1A1A;
margin: 0 0 8px 0;
letter-spacing: -0.01em;
line-height: 1.4;
}
.review-product {
font-size: clamp(12px, 1.5vw, 13px);
color: #999;
margin: 0 0 clamp(12px, 2vw, 16px) 0;
line-height: 1.5;
display: -webkit-box;
-webkit-line-clamp: 2;
-webkit-box-orient: vertical;
overflow: hidden;
}
.review-desc {
font-size: clamp(14px, 1.8vw, 15px);
color: #444;
line-height: 1.85;
margin: 0 0 clamp(14px, 2.5vw, 20px) 0;
}
.review-meta { margin-bottom: clamp(16px, 3vw, 24px); }
.recommend-for {
display: inline-block;
font-size: clamp(12px, 1.5vw, 13px);
color: #666;
background: #F5F5F5;
padding: 6px 12px;
border-radius: 8px;
}
.review-footer {
display: flex;
justify-content: space-between;
align-items: center;
padding-top: clamp(14px, 2.5vw, 20px);
border-top: 1px solid #F0F0F0;
gap: 12px;
flex-wrap: wrap;
}
.review-price {
font-size: clamp(18px, 2.5vw, 22px);
font-weight: 700;
color: #1A1A1A;
margin: 0;
letter-spacing: -0.01em;
}
.check-btn {
font-size: clamp(13px, 1.6vw, 14px);
color: #0066FF;
font-weight: 600;
transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.x-copy-box {
background: #F8F9FF;
border: 1px solid #E0E7FF;
border-top: none;
border-radius: 0 0 16px 16px;
padding: clamp(14px, 3vw, 20px);
}
.x-copy-header {
display: flex;
justify-content: space-between;
align-items: center;
margin-bottom: 10px;
}
.x-copy-label {
font-size: 12px;
font-weight: 700;
color: #5B6AD0;
letter-spacing: 0.05em;
}
.copy-btn {
padding: 6px 16px;
font-size: 12px;
font-weight: 600;
color: #FFFFFF;
background: #1A1A1A;
border: none;
border-radius: 100px;
cursor: pointer;
font-family: inherit;
transition: all 0.3s;
white-space: nowrap;
}
.copy-btn.copied { background: #22C55E; }
.copy-btn:hover { opacity: 0.8; }
.x-copy-text {
font-family: 'Noto Sans JP', sans-serif;
font-size: clamp(12px, 1.5vw, 13px);
color: #333;
line-height: 1.8;
margin: 0;
white-space: pre-wrap;
word-break: break-all;
background: #FFFFFF;
border: 1px solid #E8E8E8;
border-radius: 8px;
padding: 12px;
}

.full-copy-wrap {
text-align: center;
margin-top: clamp(24px, 5vw, 40px);
}
.full-copy-btn {
padding: clamp(14px, 2.5vw, 18px) clamp(28px, 5vw, 48px);
font-size: clamp(14px, 1.8vw, 16px);
font-weight: 600;
color: #1A1A1A;
background: #FFFFFF;
border: 2px solid #1A1A1A;
border-radius: 12px;
cursor: pointer;
font-family: inherit;
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.full-copy-btn:hover {
background: #1A1A1A;
color: #FFFFFF;
transform: translateY(-2px);
box-shadow: 0 12px 28px rgba(26,26,26,0.2);
}
.full-copy-btn.copied {
background: #22C55E;
border-color: #22C55E;
color: #FFFFFF;
}

.conclusion {
margin-top: clamp(40px, 7vw, 64px);
padding: clamp(24px, 5vw, 40px);
background: #FFFFFF;
border-radius: 16px;
border: 1px solid #F0F0F0;
}
.conclusion-title {
font-size: clamp(16px, 2.5vw, 20px);
font-weight: 700;
margin: 0 0 clamp(12px, 2vw, 16px) 0;
color: #1A1A1A;
}
.conclusion-text {
font-size: clamp(14px, 1.8vw, 15px);
color: #444;
line-height: 1.85;
margin: 0;
}
.disclaimer {
font-size: 12px;
color: #999;
text-align: center;
margin-top: clamp(24px, 5vw, 40px);
line-height: 1.6;
}

.error {
color: #E53935;
margin-top: 16px;
font-size: 14px;
}

.footer {
border-top: 1px solid #E8E8E8;
padding: clamp(24px, 5vw, 40px) clamp(20px, 4vw, 32px);
text-align: center;
background: #FFFFFF;
}
.footer-text {
font-size: 12px;
color: #999;
margin: 0;
}

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
@keyframes spin {
from { transform: rotate(0deg); }
to { transform: rotate(360deg); }
}
@keyframes pulse {
0%, 100% { transform: scale(1); opacity: 1; }
50% { transform: scale(1.2); opacity: 0.6; }
}

@media (max-width: 640px) {
.hero-subtitle br { display: none; }
.nav { gap: 16px; }
.review-footer { flex-direction: row; align-items: center; }
}
@media (max-width: 480px) {
.hero-title { font-size: 24px; line-height: 1.4; }
}
@media (max-width: 380px) {
.hero-title { font-size: 22px; }
.generate-btn { padding: 14px 24px; font-size: 14px; }
}
`}</style>
</>
);
}
