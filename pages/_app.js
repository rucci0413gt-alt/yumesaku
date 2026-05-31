// pages/_app.js
import Head from 'next/head';
import Script from 'next/script';

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        {/* OGP（XやLINEでリンクを貼ると画像付きカードが出る） */}
        <meta property="og:site_name" content="yumesaku" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="yumesaku｜夢がカタチに。" />
        <meta property="og:description" content="日本語で話すだけで、あなただけのアプリが作れる。AIで仕事を加速する人のためのガジェット＆ツール。" />
        <meta property="og:url" content="https://yumesaku-qxed.vercel.app" />
        <meta property="og:image" content="https://yumesaku-qxed.vercel.app/ogp.png" />

        {/* X（Twitter）用の大きいカード */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="yumesaku｜夢がカタチに。" />
        <meta name="twitter:description" content="日本語で話すだけで、あなただけのアプリが作れる。AIで仕事を加速する人のためのガジェット＆ツール。" />
        <meta name="twitter:image" content="https://yumesaku-qxed.vercel.app/ogp.png" />
      </Head>

      <Script id="vc-linkswitch" strategy="afterInteractive">
        {`var vc_pid = "892616493";`}
      </Script>
      <Script
        src="//aml.valuecommerce.com/vcdal.js"
        strategy="afterInteractive"
      />

      <Component {...pageProps} />
    </>
  );
}
