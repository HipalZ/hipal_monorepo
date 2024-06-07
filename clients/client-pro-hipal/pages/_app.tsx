import { useActiveClass } from '@components/store/useActiveClass'
import { ThemeProvider } from '@material-tailwind/react'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Script from 'next/script'
import NextNProgress from 'nextjs-progressbar'
import React, { memo, useEffect, useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import '@styles/globals.css'
import '@splidejs/react-splide/css'
import '@splidejs/react-splide/css/core'
// Create a client
const queryClient = new QueryClient()

export default memo(function MyApp({ Component, pageProps }: AppProps) {
	const [applyCss, setApplyCss] = useState<boolean>(false)
	const router = useRouter()
	const { isActiveDishType, setActiveDishType } = useActiveClass()

	const businessId = router.query?.businessId || ('' as string)

	useEffect(() => {
		if (!isActiveDishType) {
			setActiveDishType('ALL')
		}
	}, [])

	useEffect(() => {
		if (router.asPath.includes('r')) {
			setApplyCss(true)
		}
	}, [router])

	return (
		<div>
			{/* FOR ATC business tracking */}
			{businessId !== '' && businessId === '63cfae39735508896fb3782e' && (
				<Script id='atc'>
					{`!function(f,b,e,v,n,t,s)
	{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
	n.callMethod.apply(n,arguments):n.queue.push(arguments)};
	if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
	n.queue=[];t=b.createElement(e);t.async=!0;
	t.src=v;s=b.getElementsByTagName(e)[0];
	s.parentNode.insertBefore(t,s)}(window, document,'script',
	'https://connect.facebook.net/en_US/fbevents.js');
	fbq('init', '2166966540121426');
	fbq('track', 'PageView');`}
				</Script>
			)}

			{/* <!-- End Google Tag Manager (noscript) --> */}
			<Script id='google-analytics' strategy='afterInteractive'>{`(function (w, d, s, l, i) {
				w[l] = w[l] || [];
				w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
				var f = d.getElementsByTagName(s)[0],
					j = d.createElement(s),
					dl = l != 'dataLayer' ? '&l=' + l : '';
				j.async = true;
				j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
				f.parentNode.insertBefore(j, f);
			})(window, document, 'script', 'dataLayer', 'GTM-57HCB68')`}</Script>
			<Head>
				{/* Disabling zoom on two finger zoom in or out */}
				<meta charSet='UTF-8' />
				<meta httpEquiv='X-UA-Compatible' content='IE=edge' />
				<meta
					name='viewport'
					content='width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
				/>
			</Head>

			<div
				style={{
					width: '100%',
					maxWidth: applyCss ? '30rem' : '100%',
					margin: applyCss ? '0 auto' : '0',
				}}
			>
				<ToastContainer className='z-[999999]' />
				<QueryClientProvider client={queryClient}>
					<NextNProgress color={'hsl(var(--p))'} />
					<ThemeProvider>
						<Component {...pageProps} />
					</ThemeProvider>
					<ReactQueryDevtools />
				</QueryClientProvider>
			</div>
		</div>
	)
})
