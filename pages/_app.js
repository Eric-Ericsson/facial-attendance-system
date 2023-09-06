import { useEffect } from "react";
import { useRouter } from "next/router";
import { SessionProvider } from 'next-auth/react';
import { RecoilRoot } from "recoil";
import "tailwindcss/tailwind.css";
import "../styles/globals.scss";

const ScrollRestoration = ({ children }) => {
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = () => {
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'manual';
      }
    };

    router.events.on('routeChangeComplete', handleRouteChange);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  return children;
};

function App({ Component, pageProps: {session, ...pageProps} }) {
  return (
    <SessionProvider session={session}>
    <ScrollRestoration>
    <RecoilRoot>
      <Component {...pageProps} />
    </RecoilRoot>
    </ScrollRestoration>
    </SessionProvider>

  );
}

export default App;