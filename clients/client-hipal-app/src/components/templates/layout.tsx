import { useEffect } from "react";
import type { AppProps } from "next/app";
import { updateTheme } from "@/components/utils/themes";
import "../styles/global.css"; // Ensure your global CSS is imported

interface LayoutProps extends AppProps {
  Component: any;
  pageProps: any;
}

const Layout = ({ Component, pageProps }: LayoutProps) => {
  useEffect(() => {
    if (pageProps?.data?.settings) {
      updateTheme(pageProps.data.setting);
    }
  }, [pageProps]);

  return (
    <div className="app-layout">
      <Component {...pageProps} />
    </div>
  );
};

export default Layout;
