// pages/app/[id].js
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Head from 'next/head';

export default function AppViewer() {
  const router = useRouter();
  const { id } = router.query;
  const [html, setHtml] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/get-app?id=${id}`)
      .then(res => {
        if (!res.ok) throw new Error();
        return res.text();
      })
      .then(setHtml)
      .catch(() => setError(true));
  }, [id]);

  if (error) {
    return (
      <div style={{ padding: 40, textAlign: 'center', fontFamily: 'sans-serif' }}>
        <p>アプリの読み込みに失敗しました。</p>
      </div>
    );
  }

  if (!html) {
    return (
      <div style={{ padding: 40, textAlign: 'center', fontFamily: 'sans-serif', color: '#999' }}>
        読み込み中...
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>アプリを開く</title>
      </Head>
      <iframe
        srcDoc={html}
        style={{ width: '100vw', height: '100vh', border: 'none' }}
        sandbox="allow-scripts allow-same-origin allow-forms"
        title="App"
      />
    </>
  );
}
