// pages/ranking.js
// 売れ筋ランキングページ - Apple系ミニマル

import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Ranking() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState('gadget');

  const categories = [
    { id: 'gadget', label: 'ガジェット' },
    { id: 'pc', label: 'PC周辺' },
    { id: 'audio', label: 'オーディオ' },
    { id: 'mobile', label: 'スマホ' },
    { id: 'camera', label: 'カメラ' },
  ];

  const fetchRanking = async (cat) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/ranking?category=${cat}`);
      const data = await res.json();
      if (data.success) {
        setItems(data.items);
      } else {
        setError(data.error || 'ランキングの取得に失敗しました');
      }
    } catch (e) {
      setError('通信エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRanking(activeCategory);
  }, [activeCategory]);

  return (
    <>
      <Head>
        <title>今売れてるガジェット | ユメサクランキング</title>
        <meta name="description" content="リアルタイム更新。在宅ワーカー・クリエイターに今売れてるガジェット＆ツールランキング。" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+JP:wght@400;500;700&display=swap" rel="stylesheet" />
      </Head>

      <div style={styles.container}>
        <header style={styles.header}>
          <div style={styles.headerInner}>
            <a href="/" style={styles.logo}>ユメサク</a>
            <nav style={styles.nav}>
              <a href="/shop" style={styles.navLink}>Shop</a>
              <a href="/ranking" style={{...styles.navLink, fontWeight: '600'}}>Ranking</a>
              <a href="/" style={styles.navLink}>About</a>
            </nav>
          </div>
        </header>

        <section style={styles.hero}>
          <div style={styles.heroInner}>
            <p style={styles.eyebrow}>Real-time Best Sellers</p>
            <h1 style={styles.heroTitle}>今、売れてる。</h1>
            <p style={styles.heroSubtitle}>
              在宅ワーカー・クリエイターが選ぶ<br />
              リアルタイム人気ランキング
            </p>
          </div>
        </section>

        <section style={styles.tabSection}>
          <div style={styles.tabWrap}>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                style={{
                  ...styles.tab,
                  ...(activeCategory === cat.id ? styles.tabActive : {})
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </section>

        <section style={styles.rankingSection}>
          {loading && (
            <div style={styles.loading}>
              <div style={styles.spinner}></div>
              <p style={styles.loadingText}>集計中...</p>
            </div>
          )}

          {error && (
            <div style={styles.empty}>
              <p style={styles.emptyText}>{error}</p>
            </div>
          )}

          {!loading && items.length > 0 && (
            <div style={styles.rankingList}>
              {items.map((item, index) => (
                <a
                  key={index}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.rankCard}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
                  }}
                >
                  <div style={{
                    ...styles.rankBadge,
                    ...(item.rank <= 3 ? styles.rankBadgeTop : {})
                  }}>
                    {item.rank}
                  </div>
                  {item.image && (
                    <div style={styles.imageWrap}>
                      <img src={item.image} alt={item.name} style={styles.image} />
                    </div>
                  )}
                  <div style={styles.cardContent}>
                    <p style={styles.shopName}>{item.shop}</p>
                    <h3 style={styles.productName}>{item.name}</h3>
                    <div style={styles.priceRow}>
                      <p style={styles.price}>¥{item.price.toLocaleString()}</p>
                      {item.review > 0 && (
                        <p style={styles.review}>★ {item.review.toFixed(1)} ({item.reviewCount})</p>
                      )}
                    </div>
                  </div>
                </a>
              ))}
            </div>
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
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}

const styles = {
  container: { minHeight: '100vh', background: '#FAFAFA' },
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
  logo: { fontSize: '20px', fontWeight: '700', color: '#1A1A1A', textDecoration: 'none', letterSpacing: '-0.02em' },
  nav: { display: 'flex', gap: '32px' },
  navLink: { fontSize: '14px', color: '#1A1A1A', textDecoration: 'none', fontWeight: '500' },
  hero: { padding: '80px 32px 40px', textAlign: 'center' },
  heroInner: { maxWidth: '720px', margin: '0 auto' },
  eyebrow: { fontSize: '13px', color: '#0066FF', fontWeight: '600', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 16px 0' },
  heroTitle: { fontSize: '48px', fontWeight: '700', color: '#1A1A1A', lineHeight: '1.2', letterSpacing: '-0.03em', margin: '0 0 20px 0' },
  heroSubtitle: { fontSize: '17px', color: '#666', lineHeight: '1.7', margin: '0' },
  tabSection: { maxWidth: '1200px', margin: '0 auto', padding: '0 32px 40px' },
  tabWrap: { display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' },
  tab: {
    padding: '10px 20px',
    fontSize: '14px',
    color: '#666',
    background: '#FFFFFF',
    border: '1px solid #E8E8E8',
    borderRadius: '24px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontWeight: '500',
    transition: 'all 0.3s',
  },
  tabActive: {
    color: '#FFFFFF',
    background: '#1A1A1A',
    borderColor: '#1A1A1A',
  },
  rankingSection: { maxWidth: '1200px', margin: '0 auto', padding: '0 32px 80px' },
  loading: { textAlign: 'center', padding: '60px 0' },
  spinner: {
    width: '32px',
    height: '32px',
    border: '2px solid #E8E8E8',
    borderTopColor: '#1A1A1A',
    borderRadius: '50%',
    margin: '0 auto',
    animation: 'spin 0.8s linear infinite',
  },
  loadingText: { marginTop: '16px', color: '#999', fontSize: '14px' },
  empty: { textAlign: 'center', padding: '60px 0' },
  emptyText: { color: '#999', fontSize: '15px' },
  rankingList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  rankCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    background: '#FFFFFF',
    borderRadius: '12px',
    padding: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    textDecoration: 'none',
    color: 'inherit',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    border: '1px solid #F0F0F0',
  },
  rankBadge: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: '#F5F5F5',
    color: '#999',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    fontWeight: '700',
    flexShrink: 0,
  },
  rankBadgeTop: {
    background: '#1A1A1A',
    color: '#FFFFFF',
  },
  imageWrap: {
    width: '80px',
    height: '80px',
    background: '#F5F5F5',
    borderRadius: '8px',
    overflow: 'hidden',
    flexShrink: 0,
  },
  image: { width: '100%', height: '100%', objectFit: 'contain', padding: '8px' },
  cardContent: { flex: 1, minWidth: 0 },
  shopName: { fontSize: '11px', color: '#999', margin: '0 0 6px 0', textTransform: 'uppercase', letterSpacing: '0.05em' },
  productName: {
    fontSize: '14px',
    color: '#1A1A1A',
    lineHeight: '1.5',
    margin: '0 0 10px 0',
    fontWeight: '500',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  priceRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' },
  price: { fontSize: '16px', fontWeight: '700', color: '#1A1A1A', margin: 0, letterSpacing: '-0.01em' },
  review: { fontSize: '12px', color: '#999', margin: 0 },
  footer: { borderTop: '1px solid #E8E8E8', padding: '40px 32px', textAlign: 'center', background: '#FFFFFF' },
  footerText: { fontSize: '12px', color: '#999', margin: 0 },
};
