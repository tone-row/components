import Head from "next/head";
import type { AppProps } from "next/app";
import { css } from "../component/theme";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <style dangerouslySetInnerHTML={{ __html: css() }} />
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
