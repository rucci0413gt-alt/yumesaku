// pages/shop.js
// ユメサクショッピング - Apple級アニメーション搭載

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
        <title>ユメサク | AIで仕事を加速する人のためのガジェット</title>
        <meta name="description" content="在宅ワーカー・クリエイター・副業中の人へ。AIで仕事を加速するためのガジェット＆ツールを厳選紹介。" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+JP:wght@400;500;700&display=swap" rel="stylesheet" />
      </Head>

      <div style={styles.container}>
        <header style={styles.header}>
          <div style={styles.headerInner}>
            <a href="/" style={styles.logo}>ユメサク</a>
            <nav style={styles.nav}>
              <a href="/shop" style={styles.navLink}>Shop</a>
              <a href="/ranking" style={styles.navLink}>Ranking</a>
              <a href="/article" style={styles.navLink}>Article</a>
            </nav>
          </div>
        </header>

        <section style={styles.hero}>
          <div style={styles.heroInner}>
            <p className={`fade-in-up ${mounted ? 'visible' : ''}`} style={{...styles.eyebrow, animationDelay: '0s'}}>
              For Creators & Remote Workers
            </p>
            <h1 className={`fade-in-up ${mounted ? 'visible' : ''}`} style={{...styles.heroTitle, animationDelay: '0.1s'}}>
              仕事を、もっと速く。<br />
              暮らしを、もっと自由に。
            </h1>
            <p className={`fade-in-up ${mounted ? 'visible' : ''}`} style={{...styles.heroSubtitle, animationDelay: '0.2s'}}>
              AIで仕事を加速する人のための<br />
              ガジェット＆ツール厳選セレクション
            </p>

            <div className={`fade-in-up ${mounted ? 'visible' : ''}`} style={{...styles.searchWrap, animationDelay: '0.3s'}}>
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="探したいアイテムを入力"
                style={styles.searchInput}
                className="search-input"
              />
              <button
                onClick={() => handleSearch()}
                disabled={loading}
                style={{
                  ...styles.searchButton,
                  opacity: loading ? 0.5 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
                className="search-button"
              >
                {loading ? '検索中' : '検索'}
              </button>
            </div>

            {!searched && (
              <div className={`fade-in-up ${mounted ? 'visible' : ''}`} style={{...styles.suggestions, animationDelay: '0.4s'}}>
                <span style={styles.suggestLabel}>人気の検索：</span>
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handleSearch(s)}
                    style={styles.suggestTag}
                    className="suggest-tag"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {error && <p style={styles.error}>{error}</p>}
          </div>
        </section>

        <section style={styles.productSection}>
          {loading && (
            <div style={styles.loading}>
              <div style={styles.spinnerWrap}>
                <div style={styles.spinnerRing}></div>
                <div style={styles.spinnerDot}></div>
              </div>
              <p style={styles.loadingText}>厳選中...</p>
            </div>
          )}

          {!loading && searched && items.length === 0 && !error && (
            <div style={styles.empty}>
              <p style={styles.emptyText}>該当する商品が見つかりませんでした</p>
            </div>
          )}

          {items.length > 0 && (
            <>
              <div style={styles.resultHeader} className="fade-in-up visible">
                <h2 style={styles.resultTitle}>「{keyword}」の検索結果</h2>
                <p style={styles.resultCount}>{items.length}件</p>
              </div>

              <div style={styles.grid}>
                {items.map((item, index) => (
                  <a
                    key={`${keyword}-${index}`}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      ...styles.card,
                      animationDelay: `${index * 0.08}s`,
                    }}
                    className="product-card fade-in-up visible"
                  >
                    {item.image && (
                      <div style={styles.imageWrap}>
                        <img
                          src={item.image}
                          alt={item.name}
                          style={styles.image}
                          className="product-image"
                        />
                      </div>
                    )}
                    <div style={styles.cardContent}>
                      <p style={styles.shopName}>{item.shop}</p>
                      <h3 style={styles.productName}>{item.name}</h3>
                      <div style={styles.priceRow}>
                        <p style={styles.price}>¥{item.price.toLocaleString()}</p>
                        {item.review > 0 && (
                          <p style={styles.review}>★ {item.review.toFixed(1)}</p>
                        )}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </>
          )}
        </section>

        <footer style={styles.footer}>
          <p style={styles.footerText}>© 2026 ユメサク. AIで仕事を加速する人のために.</p>
        </footer>
      </div>

      <style jsx global>{`
        body {
          margin: 0;
          padding: 0;
          font-family: 'Noto Sans JP', 'Inter', -apple-system, sans-serif;
          background: #FAFAFA;
          color: #1A1A1A;
          -webkit-font-smoothing: antialiased;
        }
        * { box-sizing: border-box; }

        /* === フェードインアップ アニメーション === */
        .fade-in-up {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1),
                      transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .fade-in-up.visible {
          opacity: 1;
          transform: translateY(0);
          animation: fadeInUp 0.8s cubic-bezier(0.4, 0, 0.2, 1) backwards;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* === 商品カード === */
        .product-card {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .product-card:hover {
          transform: translateY(-8px) !important;
          box-shadow: 0 16px 40px rgba(0,0,0,0.12) !important;
        }
        .product-card:hover .product-image {
          transform: scale(1.06);
        }
        .product-image {
          transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* === 検索ボタン === */
        .search-button {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .search-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(26,26,26,0.2);
        }
        .search-button:active {
          transform: translateY(0);
        }

        /* === 検索入力 === */
        .search-input {
          transition: all 0.3s ease;
        }
        .search-input:focus {
          border-color: #1A1A1A !important;
          box-shadow: 0 0 0 4px rgba(26,26,26,0.05);
        }

        /* === タグ === */
        .suggest-tag {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .suggest-tag:hover {
          background: #1A1A1A !important;
          color: #FFFFFF !important;
          border-color: #1A1A1A !important;
          transform: translateY(-2px);
        }

        /* === ナビリンク === */
        nav a {
          position: relative;
          transition: color 0.3s;
        }
        nav a::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          width: 0;
          height: 2px;
          background: #1A1A1A;
          transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        nav a:hover::after {
          width: 100%;
        }

        /* === ロゴ === */
        a[style*="font-weight: 700"] {
          transition: opacity 0.3s;
        }
        a[style*="font-weight: 700"]:hover {
          opacity: 0.7;
        }

        /* === ローディング === */
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.6; }
        }
      `}</style>
    </>
  );
}

const styles = {
  container: { minHeight: '100vh', background: '#FAFAFA' },
  header: {
    borderBottom: '1px solid #E8E8E8',
    background: 'rgba(250,250,250,0.85)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    position: 'sticky', top: 0, zIndex: 100,
  },
  headerInner: {
    maxWidth: '1200px', margin: '0 auto',
    padding: '20px 32px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  logo: {
    fontSize: '20px', fontWeight: '700',
    color: '#1A1A1A', textDecoration: 'none',
    letterSpacing: '-0.02em',
  },
  nav: { display: 'flex', gap: '32px' },
  navLink: {
    fontSize: '14px', color: '#1A1A1A',
    textDecoration: 'none', fontWeight: '500',
  },
  hero: { padding: '80px 32px 60px', textAlign: 'center' },
  heroInner: { maxWidth: '720px', margin: '0 auto' },
  eyebrow: {
    fontSize: '13px', color: '#0066FF',
    fontWeight: '600', letterSpacing: '0.1em',
    textTransform: 'uppercase', margin: '0 0 16px 0',
  },
  heroTitle: {
    fontSize: '48px', fontWeight: '700',
    color: '#1A1A1A', lineHeight: '1.2',
    letterSpacing: '-0.03em', margin: '0 0 20px 0',
  },
  heroSubtitle: {
    fontSize: '17px', color: '#666',
    lineHeight: '1.7', margin: '0 0 40px 0',
  },
  searchWrap: {
    display: 'flex', gap: '8px',
    maxWidth: '600px', margin: '0 auto',
  },
  searchInput: {
    flex: 1, padding: '16px 20px',
    fontSize: '16px', border: '1px solid #E8E8E8',
    borderRadius: '12px', outline: 'none',
    background: '#FFFFFF', color: '#1A1A1A',
    fontFamily: 'inherit',
  },
  searchButton: {
    padding: '16px 32px', fontSize: '15px', fontWeight: '600',
    color: '#FFFFFF', background: '#1A1A1A',
    border: 'none', borderRadius: '12px',
    fontFamily: 'inherit',
  },
  suggestions: {
    marginTop: '24px', display: 'flex',
    flexWrap: 'wrap', gap: '8px',
    justifyContent: 'center', alignItems: 'center',
  },
  suggestLabel: { fontSize: '13px', color: '#999', marginRight: '4px' },
  suggestTag: {
    padding: '6px 14px', fontSize: '13px',
    color: '#1A1A1A', background: '#FFFFFF',
    border: '1px solid #E8E8E8', borderRadius: '20px',
    cursor: 'pointer', fontFamily: 'inherit',
  },
  error: { color: '#E53935', marginTop: '16px', fontSize: '14px' },
  productSection: {
    maxWidth: '1200px', margin: '0 auto',
    padding: '40px 32px 80px',
  },
  loading: { textAlign: 'center', padding: '80px 0' },
  spinnerWrap: {
    position: 'relative',
    width: '48px',
    height: '48px',
    margin: '0 auto',
  },
  spinnerRing: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    border: '2px solid #E8E8E8',
    borderTopColor: '#1A1A1A',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  spinnerDot: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '8px',
    height: '8px',
    marginTop: '-4px',
    marginLeft: '-4px',
    background: '#1A1A1A',
    borderRadius: '50%',
    animation: 'pulse 1.2s ease-in-out infinite',
  },
  loadingText: { marginTop: '20px', color: '#999', fontSize: '14px' },
  empty: { textAlign: 'center', padding: '60px 0' },
  emptyText: { color: '#999', fontSize: '15px' },
  resultHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: '32px',
  },
  resultTitle: { fontSize: '20px', fontWeight: '700', color: '#1A1A1A', margin: 0 },
  resultCount: { fontSize: '13px', color: '#999', margin: 0 },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '24px',
  },
  card: {
    background: '#FFFFFF', borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    textDecoration: 'none', color: 'inherit',
    display: 'block',
    border: '1px solid #F0F0F0',
  },
  imageWrap: {
    width: '100%',
    aspectRatio: '1',
    background: '#F5F5F5',
    overflow: 'hidden',
  },
  image: {
    width: '100%', height: '100%',
    objectFit: 'contain', padding: '16px',
  },
  cardContent: { padding: '20px' },
  shopName: {
    fontSize: '11px', color: '#999',
    margin: '0 0 8px 0',
    textTransform: 'uppercase', letterSpacing: '0.05em',
  },
  productName: {
    fontSize: '14px', color: '#1A1A1A',
    lineHeight: '1.5', margin: '0 0 16px 0',
    fontWeight: '500',
    display: '-webkit-box', WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical', overflow: 'hidden',
  },
  priceRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  price: {
    fontSize: '18px', fontWeight: '700',
    color: '#1A1A1A', margin: 0, letterSpacing: '-0.01em',
  },
  review: { fontSize: '12px', color: '#999', margin: 0 },
  footer: {
    borderTop: '1px solid #E8E8E8',
    padding: '40px 32px', textAlign: 'center', background: '#FFFFFF',
  },
  footerText: { fontSize: '12px', color: '#999', margin: 0 },
};
