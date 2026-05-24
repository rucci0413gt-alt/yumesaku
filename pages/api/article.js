// pages/article.js
// AI記事自動生成ページ

import { useState } from 'react';
import Head from 'next/head';

export default function Article() {
  const [category, setCategory] = useState('PC周辺');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

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

  return (
    <>
      <Head>
        <title>AI厳選レビュー | ユメサク</title>
        <meta name="description" content="AIが厳選する、在宅ワーカー・クリエイター向けガジェット最新レビュー" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+JP:wght@400;500;700&display=swap" rel="stylesheet" />
      </Head>

      <div style={styles.container}>
        <header style={styles.header}>
          <div style={styles.headerInner}>
            <a href="/" style={styles.logo}>ユメサク</a>
            <nav style={styles.nav}>
              <a href="/shop" style={styles.navLink}>Shop</a>
              <a href="/ranking" style={styles.navLink}>Ranking</a>
              <a href="/article" style={{...styles.navLink, fontWeight: '700'}}>Article</a>
            </nav>
          </div>
        </header>

        <section style={styles.hero}>
          <p style={styles.eyebrow}>AI EDITORIAL</p>
          <h1 style={styles.heroTitle}>
            AIが選ぶ、<br />今読むべきレビュー。
          </h1>
          <p style={styles.heroSubtitle}>
            Yahoo!ショッピングの売れ筋を<br />
            AIが瞬時に編集記事化
          </p>

          <div style={styles.controls}>
            <div style={styles.tags}>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  style={{
                    ...styles.tag,
                    background: category === cat ? '#1A1A1A' : '#FFFFFF',
                    color: category === cat ? '#FFFFFF' : '#1A1A1A',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            <button
              onClick={generateArticle}
              disabled={loading}
              style={{
                ...styles.generateBtn,
                opacity: loading ? 0.5 : 1,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? '生成中...' : '✨ AIで記事を生成'}
            </button>
          </div>

          {error && <p style={styles.error}>{error}</p>}
        </section>

        {loading && (
          <div style={styles.loading}>
            <div style={styles.spinner}></div>
            <p style={styles.loadingText}>AIが記事を執筆中...（30秒ほど）</p>
          </div>
        )}

        {data && (
          <article style={styles.article}>
            <div style={styles.articleHeader}>
              <p style={styles.articleCategory}>{data.category}</p>
              <h2 style={styles.articleTitle}>{data.article.title}</h2>
              <p style={styles.articleIntro}>{data.article.intro}</p>
            </div>

            <div style={styles.reviewList}>
              {data.article.reviews?.map((review, i) => {
                const item = data.items[i];
                if (!item) return null;
                return (
                  <a
                    key={i}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.reviewCard}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.08)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
                    }}
                  >
                    <div style={styles.rankBadge}>{review.rank || i + 1}位</div>
                    {item.image && (
                      <div style={styles.reviewImageWrap}>
                        <img src={item.image} alt={item.name} style={styles.reviewImage} />
                      </div>
                    )}
                    <div style={styles.reviewContent}>
                      <h3 style={styles.reviewHeadline}>{review.headline}</h3>
                      <p style={styles.reviewProduct}>{item.name}</p>
                      <p style={styles.reviewDesc}>{review.description}</p>
                      <div style={styles.reviewMeta}>
                        <span style={styles.recommendFor}>👤 {review.recommendFor}</span>
                      </div>
                      <div style={styles.reviewFooter}>
                        <p style={styles.reviewPrice}>¥{item.price.toLocaleString()}</p>
                        <span style={styles.checkBtn}>商品を見る →</span>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>

            <div style={styles.conclusion}>
              <h3 style={styles.conclusionTitle}>まとめ</h3>
              <p style={styles.conclusionText}>{data.article.conclusion}</p>
            </div>

            <p style={styles.disclaimer}>
              ※本記事はAIにより自動生成されました｜価格・在庫は変動する場合があります
            </p>
          </article>
        )}

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
          from { transform: rotate(0deg); }
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
  navLink: { fontSize: '14px', color: '#1A1A1A', textDecoration: 'none', fontWeight: '500' },
  hero: { padding: '80px 32px 40px', textAlign: 'center', maxWidth: '720px', margin: '0 auto' },
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
  heroSubtitle: { fontSize: '17px', color: '#666', lineHeight: '1.7', margin: '0 0 40px 0' },
  controls: { display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' },
  tags: { display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' },
  tag: {
    padding: '8px 18px', fontSize: '13px',
    border: '1px solid #E8E8E8', borderRadius: '20px',
    cursor: 'pointer', fontFamily: 'inherit',
    transition: 'all 0.3s', fontWeight: '500',
  },
  generateBtn: {
    padding: '16px 40px', fontSize: '15px', fontWeight: '600',
    color: '#FFFFFF', background: '#1A1A1A',
    border: 'none', borderRadius: '12px',
    fontFamily: 'inherit', transition: 'all 0.3s',
  },
  error: { color: '#E53935', marginTop: '16px', fontSize: '14px' },
  loading: { textAlign: 'center', padding: '80px 0' },
  spinner: {
    width: '32px', height: '32px',
    border: '2px solid #E8E8E8', borderTopColor: '#1A1A1A',
    borderRadius: '50%', margin: '0 auto',
    animation: 'spin 0.8s linear infinite',
  },
  loadingText: { marginTop: '16px', color: '#999', fontSize: '14px' },
  article: { maxWidth: '760px', margin: '40px auto', padding: '0 32px 80px' },
  articleHeader: { textAlign: 'center', marginBottom: '60px' },
  articleCategory: {
    fontSize: '12px', color: '#0066FF',
    fontWeight: '600', letterSpacing: '0.1em',
    textTransform: 'uppercase', margin: '0 0 12px 0',
  },
  articleTitle: {
    fontSize: '36px', fontWeight: '700',
    color: '#1A1A1A', lineHeight: '1.3',
    letterSpacing: '-0.02em', margin: '0 0 24px 0',
  },
  articleIntro: { fontSize: '17px', color: '#444', lineHeight: '1.8', margin: 0 },
  reviewList: { display: 'flex', flexDirection: 'column', gap: '24px' },
  reviewCard: {
    background: '#FFFFFF', borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    textDecoration: 'none', color: 'inherit',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    overflow: 'hidden', position: 'relative',
    border: '1px solid #F0F0F0',
  },
  rankBadge: {
    position: 'absolute', top: '16px', left: '16px',
    background: '#1A1A1A', color: '#FFFFFF',
    fontSize: '12px', fontWeight: '700',
    padding: '4px 10px', borderRadius: '20px', zIndex: 1,
  },
  reviewImageWrap: { width: '100%', aspectRatio: '16/9', background: '#F5F5F5' },
  reviewImage: { width: '100%', height: '100%', objectFit: 'contain', padding: '24px' },
  reviewContent: { padding: '24px 28px' },
  reviewHeadline: {
    fontSize: '20px', fontWeight: '700',
    color: '#1A1A1A', margin: '0 0 8px 0',
    letterSpacing: '-0.01em',
  },
  reviewProduct: {
    fontSize: '13px', color: '#999',
    margin: '0 0 16px 0', lineHeight: '1.5',
    display: '-webkit-box', WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical', overflow: 'hidden',
  },
  reviewDesc: { fontSize: '14px', color: '#444', lineHeight: '1.7', margin: '0 0 16px 0' },
  reviewMeta: { marginBottom: '20px' },
  recommendFor: { fontSize: '13px', color: '#666', background: '#F5F5F5', padding: '4px 10px', borderRadius: '6px' },
  reviewFooter: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', paddingTop: '16px',
    borderTop: '1px solid #F0F0F0',
  },
  reviewPrice: { fontSize: '20px', fontWeight: '700', color: '#1A1A1A', margin: 0 },
  checkBtn: { fontSize: '14px', color: '#0066FF', fontWeight: '600' },
  conclusion: { marginTop: '60px', padding: '32px', background: '#FFFFFF', borderRadius: '12px', border: '1px solid #F0F0F0' },
  conclusionTitle: { fontSize: '18px', fontWeight: '700', margin: '0 0 16px 0' },
  conclusionText: { fontSize: '15px', color: '#444', lineHeight: '1.8', margin: 0 },
  disclaimer: { fontSize: '12px', color: '#999', textAlign: 'center', marginTop: '32px' },
  footer: { borderTop: '1px solid #E8E8E8', padding: '40px 32px', textAlign: 'center', background: '#FFFFFF' },
  footerText: { fontSize: '12px', color: '#999', margin: 0 },
};
