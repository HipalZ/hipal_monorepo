import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import './globals.css';

const DynamicProgressBar = dynamic(() => import('@/components/atoms/progressBar'), { ssr: false });
const DynamicToast = dynamic(() => import('@/components/atoms/toastContainer'), { ssr: false });
const DynamicQueryComponent = dynamic(() => import('@/components/atoms/queryComponent'), { ssr: false });

export const metadata: Metadata = {
  title: 'Hipal App',
  description: 'Menu Application for Restaurants',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <DynamicToast />
        <DynamicProgressBar />
        <DynamicQueryComponent>
          <div id="root">
            {children}
          </div>
        </DynamicQueryComponent>
      </body>
    </html>
  );
}
