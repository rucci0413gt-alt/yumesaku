// pages/ranking.js
// 今、売れてる - ランキングページ（Apple級デザイン統一版）

import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Ranking() {
  const [category, setCategory] = useState('PC周辺');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  const categories = ['ガジェット', 'PC周辺', 'オーディオ', 'スマホ', 'カメラ'];

  useEffect(() => {
    setMounted(true);
    fetchRanking(category);
  }, []);

  const fetchRanking = async (cat) => {
    setLoading(true);
    setError('');
    setCategory(cat);

    try {
      const res = await fetch(`/api/ranking?category=${encodeURIComponent(cat)}`);
      const data = await res.json();

      if (data.success) {
        setItems(data.items);
      } else if (data.items) {
        setItems(data.items);
      } else {
        setError(data.error || '取得に失敗しました');
        setItems([]);
      }
    } catch (e) {
      setError('通信エラーが発生しました');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>今、売れてる - yumesaku Ranking</title>
        <meta name="description" content="在宅ワーカー・クリエイターが選ぶ、リアルタイム人気ランキング。" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+JP:wght@400;500;700&display=swap" rel="stylesheet" />
      </Head>

      <div className="container">
        <header className="header">
          <div className="header-inner">
            <a href="/" className="logo">yumesaku</a>
            <nav className="nav">
              <a href="/shop" className="nav-link">Shop</a>
              <a href="/ranking" className="nav-link active">Ranking</a>
              <a href="/article" className="nav-link">Article</a>
            </nav>
          </div>
        </header>

        <section className="hero">
          <div className="hero-inner">
            <p className={`eyebrow fade-in-up ${mounted ? 'visible' : ''}`} style={{animationDelay: '0s'}}>
              Real-Time Best Sellers
            </p>
            <h1 className={`hero-title fade-in-up ${mounted ? 'visible' : ''}`} style={{animationDelay: '0.1s'}}>
              今、売れてる。
            </h1>
            <p className={`hero-subtitle fade-in-up ${mounted ? 'visible' : ''}`} style={{animationDelay: '0.2s'}}>
              在宅ワーカー・クリエイターが選ぶ<br />
              リアルタイム人気ランキング
            </p>

            <div className={`tabs fade-in-up ${mounted ? 'visible' : ''}`} style={{animationDelay: '0.3s'}}>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => fetchRanking(cat)}
                  className={`tab ${category === cat ? 'active' : ''}`}
                  disabled={loading}
                >
                  {cat}
                </button>
              ))}
            </div>

            {error && <p className="error">{error}</p>}
          </div>
        </section>

        <section className="ranking-section">
          {loading && (
            <div className="loading">
              <div className="spinner-wrap">
                <div className="spinner-ring"></div>
                <div className="spinner-dot"></div>
              </div>
              <p className="loading-text">集計中...</p>
            </div>
          )}

          {!loading && items.length === 0 && !error && (
            <div className="empty">
              <p className="empty-text">商品が見つかりませんでした</p>
            </div>
          )}

          {!loading && items.length > 0 && (
            <div className="ranking-list">
              {items.map((item, index) => (
                <a
                  key={`${category}-${index}`}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ranking-card fade-in-up visible"
                  style={{ animationDelay: `${index * 0.06}s` }}
                >
                  <div className={`rank-badge ${index < 3 ? `rank-${index + 1}` : ''}`}>
                    <span className="rank-number">{index + 1}</span>
                  </div>

                  {item.image && (
                    <div className="image-wrap">
                      <img src={item.image} alt={item.name} className="product-image" />
                    </div>
                  )}

                  <div className="card-content">
                    <p className="shop-name">{item.shop}</p>
                    <h3 className="product-name">{item.name}</h3>
                    <div className="meta-row">
                      <p className="price">¥{item.price.toLocaleString()}</p>
                      {item.review > 0 && (
                        <p className="review">★ {item.review.toFixed(1)} <span className="review-count">({item.reviewCount})</span></p>
                      )}
                    </div>
                  </div>

                  <div className="arrow">→</div>
                </a>
              ))}
            </div>
          )}
        </section>

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

        .container { min-height: 100vh; background: #FAFAFA; }

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

        /* === Hero === */
        .hero {
          padding: clamp(48px, 10vw, 96px) clamp(20px, 4vw, 32px) clamp(32px, 6vw, 48px);
          text-align: center;
        }
        .hero-inner { max-width: 760px; margin: 0 auto; }
        .eyebrow {
          font-family: 'Inter', sans-serif;
          font-size: clamp(11px, 1.5vw, 13px);
          color: #0066FF;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin: 0 0 clamp(12px, 2vw, 20px) 0;
        }
        .hero-title {
          font-size: clamp(36px, 8vw, 64px);
          font-weight: 700;
          color: #1A1A1A;
          line-height: 1.2;
          letter-spacing: -0.03em;
          margin: 0 0 clamp(16px, 3vw, 24px) 0;
        }
        .hero-subtitle {
          font-size: clamp(14px, 2vw, 17px);
          color: #666;
          line-height: 1.75;
          margin: 0 0 clamp(28px, 5vw, 44px) 0;
        }

        /* === Tabs === */
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

        /* === Ranking Section === */
        .ranking-section {
          max-width: 920px;
          margin: 0 auto;
          padding: clamp(24px, 5vw, 40px) clamp(16px, 4vw, 32px) clamp(60px, 10vw, 96px);
        }
        .loading { text-align: center; padding: 80px 0; }
        .spinner-wrap {
          position: relative;
          width: 48px;
          height: 48px;
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
          width: 8px;
          height: 8px;
          margin-top: -4px;
          margin-left: -4px;
          background: #1A1A1A;
          border-radius: 50%;
          animation: pulse 1.2s ease-in-out infinite;
        }
        .loading-text { margin-top: 20px; color: #999; font-size: 14px; }
        .empty { text-align: center; padding: 60px 0; }
        .empty-text { color: #999; font-size: 15px; }

        /* === Ranking List === */
        .ranking-list {
          display: flex;
          flex-direction: column;
          gap: clamp(8px, 1.5vw, 12px);
        }
        .ranking-card {
          background: #FFFFFF;
          border-radius: 16px;
          padding: clamp(16px, 3vw, 24px);
          display: flex;
          align-items: center;
          gap: clamp(12px, 3vw, 24px);
          text-decoration: none;
          color: inherit;
          border: 1px solid #F0F0F0;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
        }
        .ranking-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 32px rgba(0,0,0,0.08);
          border-color: #1A1A1A;
        }
        .ranking-card:hover .product-image {
          transform: scale(1.08);
        }
        .ranking-card:hover .arrow {
          transform: translateX(4px);
          opacity: 1;
        }

        /* === Rank Badge === */
        .rank-badge {
          flex-shrink: 0;
          width: clamp(40px, 8vw, 56px);
          height: clamp(40px, 8vw, 56px);
          border-radius: 50%;
          background: #1A1A1A;
          color: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Inter', sans-serif;
          font-weight: 700;
          font-size: clamp(16px, 3vw, 22px);
        }
        .rank-badge.rank-1 {
          background: linear-gradient(135deg, #FFD700, #FFA500);
          box-shadow: 0 4px 16px rgba(255, 165, 0, 0.3);
        }
        .rank-badge.rank-2 {
          background: linear-gradient(135deg, #C0C0C0, #909090);
          box-shadow: 0 4px 16px rgba(192, 192, 192, 0.3);
        }
        .rank-badge.rank-3 {
          background: linear-gradient(135deg, #CD7F32, #8B4513);
          box-shadow: 0 4px 16px rgba(205, 127, 50, 0.3);
        }

        /* === Product Image === */
        .image-wrap {
          flex-shrink: 0;
          width: clamp(72px, 15vw, 110px);
          height: clamp(72px, 15vw, 110px);
          background: #F5F5F5;
          border-radius: 12px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .product-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 8px;
          transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* === Card Content === */
        .card-content {
          flex: 1;
          min-width: 0;
        }
        .shop-name {
          font-family: 'Inter', sans-serif;
          font-size: clamp(10px, 1.3vw, 11px);
          color: #999;
          margin: 0 0 6px 0;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .product-name {
          font-size: clamp(13px, 1.8vw, 15px);
          color: #1A1A1A;
          line-height: 1.5;
          margin: 0 0 clamp(8px, 1.5vw, 12px) 0;
          font-weight: 500;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .meta-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }
        .price {
          font-size: clamp(15px, 2vw, 18px);
          font-weight: 700;
          color: #1A1A1A;
          margin: 0;
          letter-spacing: -0.01em;
        }
        .review {
          font-size: clamp(11px, 1.4vw, 13px);
          color: #999;
          margin: 0;
        }
        .review-count {
          color: #CCC;
          font-size: 0.9em;
        }

        /* === Arrow === */
        .arrow {
          flex-shrink: 0;
          font-size: 20px;
          color: #999;
          opacity: 0.5;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .error {
          color: #E53935;
          margin-top: 16px;
          font-size: 14px;
        }

        /* === Footer === */
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

        /* === Animations === */
        .fade-in-up {
          opacity: 0;
          transform: translateY(20px);
        }
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

        /* === Mobile Specific === */
        @media (max-width: 640px) {
          .hero-subtitle br { display: none; }
          .nav { gap: 16px; }
          .arrow { display: none; }
          .ranking-card { 
            padding: 12px;
            gap: 10px;
            border-radius: 12px;
          }
        }
      `}</style>
    </>
  );
}
