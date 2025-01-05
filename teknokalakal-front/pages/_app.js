import Head from "next/head";
import "@/styles/globals.css";
import { SessionProvider } from "next-auth/react";
import { CartContextProvider } from "@/components/CartContext";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import LoadingIndicator from "@/components/LoadingIndicator";
import Layout from "@/components/Layout";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Handle loading state for route changes
  useEffect(() => {
    const handleStart = () => setLoading(true);
    const handleComplete = () => setLoading(false);

    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleComplete);
    router.events.on("routeChangeError", handleComplete);

    return () => {
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleComplete);
      router.events.off("routeChangeError", handleComplete);
    };
  }, [router]);

  return (
    <SessionProvider session={session}>
      <Head>
        <title>TeknoKalkal</title>
        <meta name="description" content="This is the TeknoKalkal website" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <CartContextProvider>
        {loading ? (
          <Layout>
            <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 bg-aqua-forest-300 z-50">
              <LoadingIndicator />
            </div>
          </Layout>
        ) : (
          <>
          <Component {...pageProps} />
          <ToastContainer />
        </>
        )}
      </CartContextProvider>
    </SessionProvider>
  );
}
