import "../styles/globals.css";
import type { AppProps } from "next/app";
import Nav from '../components/nav';
import { MyVariableProvider } from '../context/MyVariableContext';  

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <MyVariableProvider> 
      <div>
          <div>
              <Nav />
          </div>
          <div>
              <Component {...pageProps} />
          </div>
      </div>
    </MyVariableProvider> 
  );
}

export default MyApp;