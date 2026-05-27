// pages/shop.js
// ユメサクショッピング - Apple級アニメーション + 完全レスポンシブ

import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Shop() {
  const [keyword, setKeyword] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const suggestions = [
    'ワイヤレスイヤホン',
    'モバイルバッテリー',
    'メカニカルキーボード',
    'ウェブカメラ',
    'モニターアーム',
    'タブレット',
  ];

  const handleSearch = async (searchWord) => {
    const word = searchWord || keyword;
    if (!word.trim()) {
      setError('キーワードを入力してください');
      return;
    }

    setLoading(true);
    setError('');
    setSearched(true);
    if (searchWord) setKeyword(searchWord);

    try {
      const res = await fetch(`/api/yahoo?keyword=${encodeURIComponent(word)}`);
      const data = await res.json();

      if (data.success) {
        setItems(data.items);
      } else {
        setError(data.error || '検索に失敗しました');
        setItems([]);
      }
    } catch (e) {
      setError('通信エラーが発生しました');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <>
      <Head>
        <title>yumesaku | AIで仕事を加速する人のためのガジェット</title>
        <meta name="description" content="在宅ワーカー・クリエイター・副業中の人へ。AIで仕事を加速するためのガジェット＆ツールを厳選紹介。" />
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
            <p className={`eyebrow fade-in-up ${mounted ? 'visible' : ''}`} style={{animationDelay: '0s'}}>
              For Creators & Remote Workers
            </p>
            <h1 className={`hero-title fade-in-up ${mounted ? 'visible' : ''}`} style={{animationDelay: '0.1s'}}>
              仕事をもっと速く。<br />
              暮らしをもっと自由に。
            </h1>
            <p className={`hero-subtitle fade-in-up ${mounted ? 'visible' : ''}`} style={{animationDelay: '0.2s'}}>
              AIで仕事を加速する人のための<br />
              ガジェット＆ツール厳選セレクション
            </p>

            <div className={`search-wrap fade-in-up ${mounted ? 'visible' : ''}`} style={{animationDelay: '0.3s'}}>
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="探したいアイテムを入力"
                className="search-input"
              />
              <button
                onClick={() => handleSearch()}
                disabled={loading}
                className="search-button"
                style={{ opacity: loading ? 0.5 : 1 }}
              >
                {loading ? '検索中' : '検索'}
              </button>
            </div>

            {!searched && (
              <div className={`suggestions fade-in-up ${mounted ? 'visible' : ''}`} style={{animationDelay: '0.4s'}}>
                <span className="suggest-label">人気の検索</span>
                <div className="suggest-tags">
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => handleSearch(s)}
                      className="suggest-tag"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {error && <p className="error">{error}</p>}
          </div>
        </section>

        <section className="product-section">
          {loading && (
            <div className="loading">
              <div className="spinner-wrap">
                <div className="spinner-ring"></div>
                <div className="spinner-dot"></div>
              </div>
              <p className="loading-text">厳選中...</p>
            </div>
          )}

          {!loading && searched && items.length === 0 && !error && (
            <div className="empty">
              <p className="empty-text">該当する商品が見つかりませんでした</p>
            </div>
          )}

          {items.length > 0 && (
            <>
              <div className="result-header fade-in-up visible">
                <h2 className="result-title">「{keyword}」の検索結果</h2>
                <p className="result-count">{items.length}件</p>
              </div>

              <div className="grid">
                {items.map((item, index) => (
                  <a
                    key={`${keyword}-${index}`}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="product-card fade-in-up visible"
                    style={{ animationDelay: `${index * 0.08}s` }}
                  >
                    {item.image && (
                      <div className="image-wrap">
                        <img src={item.image} alt={item.name} className="product-image" />
                      </div>
                    )}
                    <div className="card-content">
                      <p className="shop-name">{item.shop}</p>
                      <h3 className="product-name">{item.name}</h3>
                      <div className="price-row">
                        <p className="price">¥{item.price.toLocaleString()}</p>
                        {item.review > 0 && (
                          <p className="review">★ {item.review.toFixed(1)}</p>
                        )}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </>
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

        .container {
          min-height: 100vh;
          background: #FAFAFA;
        }

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

        .nav {
          display: flex;
          gap: clamp(16px, 3vw, 32px);
        }
        .nav-link {
          font-size: clamp(13px, 1.5vw, 14px);
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
          padding: clamp(48px, 10vw, 96px) clamp(20px, 4vw, 32px) clamp(40px, 8vw, 64px);
          text-align: center;
        }
        .hero-inner {
          max-width: 760px;
          margin: 0 auto;
        }
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
          font-size: clamp(30px, 7vw, 56px);
          font-weight: 700;
          color: #1A1A1A;
          line-height: 1.25;
          letter-spacing: -0.03em;
          margin: 0 0 clamp(16px, 3vw, 24px) 0;
        }
        .hero-subtitle {
          font-size: clamp(14px, 2vw, 17px);
          color: #666;
          line-height: 1.75;
          margin: 0 0 clamp(28px, 5vw, 44px) 0;
        }

        /* === Search === */
        .search-wrap {
          display: flex;
          gap: 8px;
          max-width: 600px;
          margin: 0 auto;
        }
        .search-input {
          flex: 1;
          padding: clamp(13px, 2vw, 16px) clamp(16px, 2.5vw, 20px);
          font-size: 16px;
          border: 1px solid #E8E8E8;
          border-radius: 12px;
          outline: none;
          background: #FFFFFF;
          color: #1A1A1A;
          font-family: inherit;
          transition: all 0.3s ease;
          width: 100%;
          min-width: 0;
        }
        .search-input:focus {
          border-color: #1A1A1A;
          box-shadow: 0 0 0 4px rgba(26,26,26,0.05);
        }
        .search-button {
          padding: clamp(13px, 2vw, 16px) clamp(20px, 4vw, 32px);
          font-size: clamp(14px, 1.5vw, 15px);
          font-weight: 600;
          color: #FFFFFF;
          background: #1A1A1A;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          font-family: inherit;
          white-space: nowrap;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .search-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(26,26,26,0.2);
        }
        .search-button:active { transform: translateY(0); }

        /* === Suggestions === */
        .suggestions {
          margin-top: 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          align-items: center;
        }
        .suggest-label {
          font-size: clamp(11px, 1.3vw, 13px);
          color: #999;
        }
        .suggest-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          justify-content: center;
        }
        .suggest-tag {
          padding: 6px 14px;
          font-size: clamp(12px, 1.4vw, 13px);
          color: #1A1A1A;
          background: #FFFFFF;
          border: 1px solid #E8E8E8;
          border-radius: 20px;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .suggest-tag:hover {
          background: #1A1A1A;
          color: #FFFFFF;
          border-color: #1A1A1A;
          transform: translateY(-2px);
        }

        /* === Product Section === */
        .product-section {
          max-width: 1200px;
          margin: 0 auto;
          padding: clamp(24px, 5vw, 40px) clamp(20px, 4vw, 32px) clamp(60px, 10vw, 96px);
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
        .loading-text {
          margin-top: 20px;
          color: #999;
          font-size: 14px;
        }
        .empty { text-align: center; padding: 60px 0; }
        .empty-text { color: #999; font-size: 15px; }
        .result-header {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: clamp(20px, 4vw, 32px);
        }
        .result-title {
          font-size: clamp(16px, 2.5vw, 20px);
          font-weight: 700;
          color: #1A1A1A;
          margin: 0;
        }
        .result-count {
          font-size: 13px;
          color: #999;
          margin: 0;
        }

        /* === Grid === */
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(min(260px, 100%), 1fr));
          gap: clamp(12px, 2.5vw, 24px);
        }
        @media (max-width: 480px) {
          .grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }
        }

        /* === Product Card === */
        .product-card {
          background: #FFFFFF;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          text-decoration: none;
          color: inherit;
          display: block;
          border: 1px solid #F0F0F0;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .product-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 16px 40px rgba(0,0,0,0.12);
        }
        .product-card:hover .product-image {
          transform: scale(1.06);
        }
        .image-wrap {
          width: 100%;
          aspect-ratio: 1;
          background: #F5F5F5;
          overflow: hidden;
        }
        .product-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: clamp(8px, 2vw, 16px);
          transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .card-content {
          padding: clamp(12px, 2vw, 20px);
        }
        .shop-name {
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          color: #999;
          margin: 0 0 8px 0;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .product-name {
          font-size: clamp(13px, 1.5vw, 14px);
          color: #1A1A1A;
          line-height: 1.5;
          margin: 0 0 clamp(12px, 2vw, 16px) 0;
          font-weight: 500;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .price-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .price {
          font-size: clamp(16px, 2vw, 18px);
          font-weight: 700;
          color: #1A1A1A;
          margin: 0;
          letter-spacing: -0.01em;
        }
        .review {
          font-size: 12px;
          color: #999;
          margin: 0;
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
          .hero-title {
            line-height: 1.3;
            letter-spacing: -0.02em;
          }
          .hero-subtitle br {
            display: none;
          }
          .search-wrap {
            flex-direction: row;
          }
          .nav {
            gap: 16px;
          }
        }
        @media (max-width: 380px) {
          .hero-title {
            font-size: 28px;
          }
          .search-button {
            padding: 12px 16px;
            font-size: 13px;
          }
        }
      `}</style>
    </>
  );
}
