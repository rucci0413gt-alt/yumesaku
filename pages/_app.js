// pages/_app.js
import { useEffect } from 'react';
import Script from 'next/script';

export default function MyApp({ Component, pageProps }) {
  return (
    <>
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
