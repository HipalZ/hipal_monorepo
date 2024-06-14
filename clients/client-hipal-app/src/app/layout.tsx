import type { Metadata } from 'next'
import './globals.css'
import dynamic from 'next/dynamic';

const DynamicProgressBar = dynamic(() => import('@/components/atoms/progressBar'), { ssr: false });
const DynamicToast = dynamic(() => import('@/components/atoms/toastContainer'), { ssr: false });

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
        <DynamicToast/>
        <DynamicProgressBar />
        <div id="root">{children}</div>
      </body>
    </html>
  )
}