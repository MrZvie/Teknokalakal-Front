import Green from "@/components/Green";
import "@/styles/globals.css";

export default function App({ Component, pageProps }) {
  return (
    <>
      <Green />
      <Component {...pageProps} />
    </>
  );
}
