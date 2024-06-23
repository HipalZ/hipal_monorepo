import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import ProgressProvider from '@/components/atoms/progressBar';
import './globals.css';

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
      <body className='w-full max-w-[30rem] mx-auto'>
        <ProgressProvider>
          <DynamicToast />
          <DynamicQueryComponent>
            <div id="root">
              {children}
            </div>
          </DynamicQueryComponent>
        </ProgressProvider>
      </body>
    </html>
  );
}
