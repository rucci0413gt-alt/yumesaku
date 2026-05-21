// pages/shop.js
// ユメサクショッピング - Apple系ミニマルデザイン

import { useState } from 'react';
import Head from 'next/head';

export default function Shop() {
  const [keyword, setKeyword] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  // おすすめキーワード（ガジェット×クリエイター特化）
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
        {/* ヘッダー */}
        <header style={styles.header}>
          <div style={styles.headerInner}>
            <a href="/" style={styles.logo}>
              ユメサク
            </a>
            <nav style={styles.nav}>
              <a href="/shop" style={styles.navLink}>Shop</a>
              <a href="/" style={styles.navLink}>About</a>
            </nav>
          </div>
        </header>

        {/* ヒーローセクション */}
        <section style={styles.hero}>
          <div style={styles.heroInner}>
            <p style={styles.eyebrow}>For Creators & Remote Workers</p>
            <h1 style={styles.heroTitle}>
              仕事を、もっと速く。<br />
              暮らしを、もっと自由に。
            </h1>
            <p style={styles.heroSubtitle}>
              AIで仕事を加速する人のための<br />
              ガジェット＆ツール厳選セレクション
            </p>

            {/* 検索ボックス */}
            <div style={styles.searchWrap}>
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="探したいアイテムを入力"
                style={styles.searchInput}
              />
              <button
                onClick={() => handleSearch()}
                disabled={loading}
                style={{
                  ...styles.searchButton,
                  opacity: loading ? 0.5 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? '検索中' : '検索'}
              </button>
            </div>

            {/* おすすめタグ */}
            {!searched && (
              <div style={styles.suggestions}>
                <span style={styles.suggestLabel}>人気の検索：</span>
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handleSearch(s)}
                    style={styles.suggestTag}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {error && <p style={styles.error}>{error}</p>}
          </div>
        </section>

        {/* 商品グリッド */}
        <section style={styles.productSection}>
          {loading && (
            <div style={styles.loading}>
              <div style={styles.spinner}></div>
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
              <div style={styles.resultHeader}>
                <h2 style={styles.resultTitle}>
                  「{keyword}」の検索結果
                </h2>
                <p style={styles.resultCount}>{items.length}件</p>
              </div>

              <div style={styles.grid}>
                {items.map((item, index) => (
                  <a
                    key={index}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.card}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.08)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
                    }}
                  >
                    {item.image && (
                      <div style={styles.imageWrap}>
                        <img
                          src={item.image}
                          alt={item.name}
                          style={styles.image}
                        />
                      </div>
                    )}
                    <div style={styles.cardContent}>
                      <p style={styles.shopName}>{item.shop}</p>
                      <h3 style={styles.productName}>{item.name}</h3>
                      <div style={styles.priceRow}>
                        <p style={styles.price}>¥{item.price.toLocaleString()}</p>
                        {item.review > 0 && (
                          <p style={styles.review}>
                            ★ {item.review.toFixed(1)}
                          </p>
                        )}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </>
          )}
        </section>

        {/* フッター */}
        <footer style={styles.footer}>
          <p style={styles.footerText}>
            © 2026 ユメサク. AIで仕事を加速する人のために.
          </p>
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
        * {
          box-sizing: border-box;
        }
      `}</style>
    </>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#FAFAFA',
  },
  header: {
    borderBottom: '1px solid #E8E8E8',
    background: 'rgba(250,250,250,0.8)',
    backdropFilter: 'blur(20px)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  headerInner: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px 32px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1A1A1A',
    textDecoration: 'none',
    letterSpacing: '-0.02em',
  },
  nav: {
    display: 'flex',
    gap: '32px',
  },
  navLink: {
    fontSize: '14px',
    color: '#1A1A1A',
    textDecoration: 'none',
    fontWeight: '500',
    transition: 'opacity 0.3s',
  },
  hero: {
    padding: '80px 32px 60px',
    textAlign: 'center',
  },
  heroInner: {
    maxWidth: '720px',
    margin: '0 auto',
  },
  eyebrow: {
    fontSize: '13px',
    color: '#0066FF',
    fontWeight: '600',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    margin: '0 0 16px 0',
  },
  heroTitle: {
    fontSize: '48px',
    fontWeight: '700',
    color: '#1A1A1A',
    lineHeight: '1.2',
    letterSpacing: '-0.03em',
    margin: '0 0 20px 0',
  },
  heroSubtitle: {
    fontSize: '17px',
    color: '#666',
    lineHeight: '1.7',
    margin: '0 0 40px 0',
  },
  searchWrap: {
    display: 'flex',
    gap: '8px',
    maxWidth: '600px',
    margin: '0 auto',
  },
  searchInput: {
    flex: 1,
    padding: '16px 20px',
    fontSize: '16px',
    border: '1px solid #E8E8E8',
    borderRadius: '12px',
    outline: 'none',
    background: '#FFFFFF',
    color: '#1A1A1A',
    fontFamily: 'inherit',
    transition: 'border-color 0.3s, box-shadow 0.3s',
  },
  searchButton: {
    padding: '16px 32px',
    fontSize: '15px',
    fontWeight: '600',
    color: '#FFFFFF',
    background: '#1A1A1A',
    border: 'none',
    borderRadius: '12px',
    transition: 'all 0.3s',
    fontFamily: 'inherit',
  },
  suggestions: {
    marginTop: '24px',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestLabel: {
    fontSize: '13px',
    color: '#999',
    marginRight: '4px',
  },
  suggestTag: {
    padding: '6px 14px',
    fontSize: '13px',
    color: '#1A1A1A',
    background: '#FFFFFF',
    border: '1px solid #E8E8E8',
    borderRadius: '20px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'all 0.3s',
  },
  error: {
    color: '#E53935',
    marginTop: '16px',
    fontSize: '14px',
  },
  productSection: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '40px 32px 80px',
  },
  loading: {
    textAlign: 'center',
    padding: '60px 0',
  },
  spinner: {
    width: '32px',
    height: '32px',
    border: '2px solid #E8E8E8',
    borderTopColor: '#1A1A1A',
    borderRadius: '50%',
    margin: '0 auto',
    animation: 'spin 0.8s linear infinite',
  },
  loadingText: {
    marginTop: '16px',
    color: '#999',
    fontSize: '14px',
  },
  empty: {
    textAlign: 'center',
    padding: '60px 0',
  },
  emptyText: {
    color: '#999',
    fontSize: '15px',
  },
  resultHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: '32px',
  },
  resultTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1A1A1A',
    margin: 0,
  },
  resultCount: {
    fontSize: '13px',
    color: '#999',
    margin: 0,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '24px',
  },
  card: {
    background: '#FFFFFF',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    textDecoration: 'none',
    color: 'inherit',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
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
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    padding: '16px',
  },
  cardContent: {
    padding: '20px',
  },
  shopName: {
    fontSize: '11px',
    color: '#999',
    margin: '0 0 8px 0',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  productName: {
    fontSize: '14px',
    color: '#1A1A1A',
    lineHeight: '1.5',
    margin: '0 0 16px 0',
    fontWeight: '500',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  priceRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1A1A1A',
    margin: 0,
    letterSpacing: '-0.01em',
  },
  review: {
    fontSize: '12px',
    color: '#999',
    margin: 0,
  },
  footer: {
    borderTop: '1px solid #E8E8E8',
    padding: '40px 32px',
    textAlign: 'center',
    background: '#FFFFFF',
  },
  footerText: {
    fontSize: '12px',
    color: '#999',
    margin: 0,
  },
};
