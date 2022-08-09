import "../styles/globals.css";
import Head from "next/head";

function MyApp({ Component, pageProps }) {
  return (
    <div className="bg-gray-900">
      {" "}
      <Head>
        <title>DF2Mapper</title>
        <meta name="title" content="DF2Mappwe" />
        <meta
          name="description"
          content="Auto mapper for dead frontier 2 daily missions!"
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

        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Component {...pageProps} />
    </div>
  );
}

export default MyApp;

