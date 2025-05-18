import type { AppProps } from "next/app";
import "../styles/global.css"; // Ensure your global CSS is imported

interface LayoutProps extends AppProps {
  Component: any;
  pageProps: any;
}

const Layout = ({ Component, pageProps }: LayoutProps) => {
  return (
    <div className="app-layout">
      <Component {...pageProps} />
    </div>
  );
};

export default Layout;
