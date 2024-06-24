import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import './globals.css';

const DynamicProgress = dynamic(()=>import('@/components/atoms/progressBar'), {ssr: false});
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
        <DynamicProgress>
          <DynamicToast />
          <DynamicQueryComponent>
            <div id="root">
              {children}
            </div>
          </DynamicQueryComponent>
        </DynamicProgress>
      </body>
    </html>
  );
}
