// pages/shop.js
// ユメサクショッピング - 商品検索ページ

import { useState } from 'react';

export default function Shop() {
  const [keyword, setKeyword] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!keyword.trim()) {
      setError('キーワードを入力してください');
      return;
    }

    setLoading(true);
    setError('');
    setSearched(true);

    try {
      const res = await fetch(`/api/yahoo?keyword=${encodeURIComponent(keyword)}`);
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
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
      fontFamily: 'sans-serif'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{
          color: 'white',
          textAlign: 'center',
          fontSize: '2.5rem',
          marginBottom: '10px'
        }}>
          🛍️ ユメサクショッピング
        </h1>
        <p style={{
          color: 'white',
          textAlign: 'center',
          marginBottom: '30px',
          opacity: 0.9
        }}>
          話しかけるだけで、欲しいものが見つかる
        </p>

        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '15px',
          marginBottom: '20px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
        }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="例：iPhoneケース、ワイヤレスイヤホン、夏物Tシャツ..."
              style={{
                flex: 1,
                padding: '15px',
                fontSize: '16px',
                border: '2px solid #e0e0e0',
                borderRadius: '10px',
                outline: 'none'
              }}
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              style={{
                padding: '15px 30px',
                fontSize: '16px',
                fontWeight: 'bold',
                color: 'white',
                background: loading ? '#999' : 'linear-gradient(135deg, #667eea, #764ba2)',
                border: 'none',
                borderRadius: '10px',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? '検索中...' : '🔍 検索'}
            </button>
          </div>
          {error && (
            <p style={{ color: '#e74c3c', marginTop: '10px', textAlign: 'center' }}>
              ⚠️ {error}
            </p>
          )}
        </div>

        {loading && (
          <div style={{ textAlign: 'center', color: 'white', fontSize: '18px' }}>
            🔄 商品を探しています...
          </div>
        )}

        {!loading && searched && items.length === 0 && !error && (
          <div style={{ textAlign: 'center', color: 'white', fontSize: '18px' }}>
            😢 商品が見つかりませんでした
          </div>
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '20px'
        }}>
          {items.map((item, index) => (
            <a
              key={index}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: 'white',
                borderRadius: '15px',
                overflow: 'hidden',
                boxShadow: '0 5px 20px rgba(0,0,0,0.15)',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'transform 0.2s',
                display: 'block'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {item.image && (
                <img
                  src={item.image}
                  alt={item.name}
                  style={{
                    width: '100%',
                    height: '200px',
                    objectFit: 'contain',
                    background: '#f5f5f5'
                  }}
                />
              )}
              <div style={{ padding: '15px' }}>
                <p style={{
                  fontSize: '14px',
                  margin: '0 0 10px 0',
                  lineHeight: '1.4',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {item.name}
                </p>
                <p style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#e74c3c',
                  margin: '5px 0'
                }}>
                  ¥{item.price.toLocaleString()}
                </p>
                <p style={{ fontSize: '12px', color: '#666', margin: '5px 0' }}>
                  {item.shop}
                </p>
                {item.review > 0 && (
                  <p style={{ fontSize: '12px', color: '#f39c12', margin: '5px 0' }}>
                    ⭐ {item.review} ({item.reviewCount}件)
                  </p>
                )}
              </div>
            </a>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <a href="/" style={{
            color: 'white',
            textDecoration: 'none',
            fontSize: '14px',
            opacity: 0.8
          }}>
            ← ユメサクトップに戻る
          </a>
        </div>
      </div>
    </div>
  );
}
