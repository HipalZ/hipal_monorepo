import { useEffect } from 'react';
import { AppProps } from 'next/app';
import { updateTheme } from '@/components/utils/themes';
import '../styles/global.css'; // Ensure your global CSS is imported


interface LayoutProps extends AppProps {
  Component: any;
  pageProps: any;
}

const Layout = ({ Component, pageProps }: LayoutProps) => {
    console.log("hello world");

  useEffect(() => {
    if (pageProps?.data?.settings?.themes) {
      updateTheme(pageProps.data.settings.themes);
    }
  }, [pageProps]);

  return (
    <div className="app-layout">
      <Component {...pageProps} />
    </div>
  );
};

export default Layout;