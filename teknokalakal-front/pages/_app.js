import Head from 'next/head';
import Green from "@/components/Green";
import "@/styles/globals.css";
import { CartContextProvider } from '@/components/CartContext';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>TeknoKalkal</title>
        <meta name="description" content="This is the teknokalakal website" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Green />
      <CartContextProvider>
        <Component {...pageProps} />
      </CartContextProvider>
    </>
  );
}
