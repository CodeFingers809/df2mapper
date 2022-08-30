/* eslint-disable @next/next/inline-script-id */
import "../styles/globals.css";
import Head from "next/head";
import Script from "next/script";

function MyApp({ Component, pageProps }) {
  return (
    <div className="bg-zinc-900">
      <Script
        strategy="lazyOnload"
        src={`https://www.googletagmanager.com/gtag/js?id=${process.env.GOOGLE_ANALYTICS}`}
      />

      <Script strategy="lazyOnload">
        {`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${process.env.GOOGLE_ANALYTICS}', {
        page_path: window.location.pathname,
        });
    `}
      </Script>
      <Head>
        <title>DF2Mapper</title>
        <meta name="title" content="DF2Mapper" />
        <meta
          name="description"
          content="Mission maps for Dead Frontier II. Updates Daily!"
        />
        <meta
          name="keywords"
          content="map, mission map, dead frontier 2 missions, df2 missions, df2 mission map, dead frontier 2 mission map, df2 daily missions"
        />
        <meta name="robots" content="index, follow" />
        <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="language" content="English" />
        <meta name="revisit-after" content="1 days" />
        <meta name="author" content="Ayush Bohra" />
        <meta httpEquiv="cache-control" content="no-cache"/>

        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Component {...pageProps} />
    </div>
  );
}

export default MyApp;

