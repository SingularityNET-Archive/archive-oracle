import "../styles/globals.css";
import type { AppProps } from "next/app";
import Nav from '../components/nav'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div>
        <div>
            <Nav />
        </div>
        <div>
            <Component {...pageProps} />
        </div>
    </div>
      
  );
}

export default MyApp;