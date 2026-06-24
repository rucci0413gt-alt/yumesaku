// pages/daily.js
import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Daily() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDaily = async () => {
      try {
        const today = new Date().toISOString().slice(0, 10);
        const blobBase = process.env.NEXT_PUBLIC_BLOB_BASE_URL;
        const res = await fetch(`${blobBase}/daily/${today}.json`);
        if (!res.ok) throw new Error('今日の記事はまだ生成されていません');
        const json = await res.json();
        setData(json);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDaily();
  }, []);

  const generateMyLink = (url) => {
    const encoded = encodeURIComponent(url);
    return `https://ck.jp.ap.valuecommerce.com/servlet/referral?sid=3771004&pid=892616093&vc_url=${encoded}`;
  };

  return (
    <>
      <Head>
        <title>今日のガジェット - yumesaku</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
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
              <a href="/daily" className="nav-link active">Today</a>
            </nav>
          </div>
        </header>

        <section className="hero">
          <h1 className="hero-title">今日のガジェット</h1>
          <p className="hero-sub">{new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })} 自動生成</p>
        </section>

        {loading && (
          <div className="loading">
            <div className="spinner"></div>
            <p>読み込み中...</p>
          </div>
        )}

        {error && (
          <div className="error-box">
            <p>📭 {error}</p>
            <p className="error-sub">毎朝6時に自動更新されます</p>
          </div>
        )}

        {data && (
          <article className="article">
            <div className="article-header">
              <p className="category">{data.category}</p>
              <h2 className="title">{data.article?.title}</h2>
              <p className="intro">{data.article?.intro}</p>
            </div>

            <div className="review-list">
              {data.article?.reviews?.map((review, i) => {
                const item = data.items?.[i];
                if (!item) return null;
                return (
                  <a key={i} href={generateMyLink(item.url)} target="_blank" rel="noopener noreferrer" className="review-card">
                    <div className={`rank ${i < 3 ? `rank-${i+1}` : ''}`}>{i+1}位</div>
                    {item.image && <img src={item.image} alt={item.name} className="review-img" />}
                    <div className="review-body">
                      <h3 className="headline">{review.headline}</h3>
                      <p className="product-name">{item.name}</p>
                      <p className="desc">{review.description}</p>
                      <div className="footer">
                        <span className="price">¥{item.price?.toLocaleString()}</span>
                        <span className="cta">商品を見る →</span>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>

            {data.article?.conclusion && (
              <div className="conclusion">
                <h3>まとめ</h3>
                <p>{data.article.conclusion}</p>
              </div>
            )}
          </article>
        )}

        <footer className="footer">
          <p>© 2026 yumesaku. AIで仕事を加速する人のために.</p>
        </footer>
      </div>

      <style jsx global>{`
        body { margin:0; padding:0; font-family:'Noto Sans JP','Inter',sans-serif; background:#FAFAFA; color:#1A1A1A; }
        * { box-sizing:border-box; }
        .container { min-height:100vh; }
        .header { border-bottom:1px solid #E8E8E8; background:rgba(250,250,250,0.9); backdrop-filter:blur(20px); position:sticky; top:0; z-index:100; }
        .header-inner { max-width:760px; margin:0 auto; padding:16px 20px; display:flex; justify-content:space-between; align-items:center; }
        .logo { font-family:'Inter',sans-serif; font-size:20px; font-weight:700; color:#1A1A1A; text-decoration:none; }
        .nav { display:flex; gap:20px; }
        .nav-link { font-size:13px; color:#1A1A1A; text-decoration:none; font-weight:500; }
        .nav-link.active { font-weight:700; }
        .hero { text-align:center; padding:48px 20px 24px; }
        .hero-title { font-size:32px; font-weight:700; margin:0 0 8px; }
        .hero-sub { color:#999; font-size:13px; margin:0; }
        .loading { text-align:center; padding:80px 20px; }
        .spinner { width:40px; height:40px; border:2px solid #E8E8E8; border-top-color:#1A1A1A; border-radius:50%; animation:spin 0.8s linear infinite; margin:0 auto 16px; }
        .error-box { text-align:center; padding:60px 20px; color:#999; }
        .error-sub { font-size:12px; margin-top:8px; }
        .article { max-width:760px; margin:0 auto; padding:0 20px 80px; }
        .article-header { text-align:center; margin-bottom:48px; }
        .category { color:#0066FF; font-size:12px; font-weight:600; letter-spacing:0.1em; margin:0 0 12px; }
        .title { font-size:28px; font-weight:700; margin:0 0 16px; line-height:1.4; }
        .intro { color:#444; font-size:15px; line-height:1.8; margin:0; }
        .review-list { display:flex; flex-direction:column; gap:20px; }
        .review-card { background:#FFF; border:1px solid #F0F0F0; border-radius:16px; overflow:hidden; text-decoration:none; color:inherit; display:block; transition:all 0.3s; }
        .review-card:hover { transform:translateY(-4px); box-shadow:0 12px 32px rgba(0,0,0,0.08); }
        .rank { display:inline-block; background:#1A1A1A; color:#FFF; font-size:12px; font-weight:700; padding:6px 14px; border-radius:100px; margin:16px 16px 0; }
        .rank.rank-1 { background:linear-gradient(135deg,#FFD700,#FFA500); }
        .rank.rank-2 { background:linear-gradient(135deg,#C0C0C0,#909090); }
        .rank.rank-3 { background:linear-gradient(135deg,#CD7F32,#8B4513); }
        .review-img { width:100%; aspect-ratio:16/9; object-fit:contain; background:#F5F5F5; padding:16px; }
        .review-body { padding:16px 20px 20px; }
        .headline { font-size:18px; font-weight:700; margin:0 0 6px; }
        .product-name { font-size:12px; color:#999; margin:0 0 12px; }
        .desc { font-size:14px; color:#444; line-height:1.8; margin:0 0 16px; }
        .footer { display:flex; justify-content:space-between; align-items:center; padding-top:16px; border-top:1px solid #F0F0F0; }
        .price { font-size:20px; font-weight:700; }
        .cta { font-size:13px; color:#0066FF; font-weight:600; }
        .conclusion { margin-top:40px; background:#FFF; border:1px solid #F0F0F0; border-radius:16px; padding:28px; }
        .conclusion h3 { font-size:16px; font-weight:700; margin:0 0 12px; }
        .conclusion p { font-size:14px; color:#444; line-height:1.8; margin:0; }
        footer.footer { border-top:1px solid #E8E8E8; padding:32px 20px; text-align:center; }
        footer.footer p { font-size:12px; color:#999; margin:0; }
        @keyframes spin { to { transform:rotate(360deg); } }
      `}</style>
    </>
  );
}
