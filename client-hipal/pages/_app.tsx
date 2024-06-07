import { useActiveClass } from "@components/store/useActiveClass";
import { ThemeProvider } from "@material-tailwind/react";
import "@splidejs/react-splide/css";
import "@splidejs/react-splide/css/core";
import "@styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import { useRouter } from "next/router";
import Script from "next/script";
import NextNProgress from "nextjs-progressbar";
import { memo, useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Create a client
const queryClient = new QueryClient();

export default memo(function MyApp({ Component, pageProps }: AppProps) {
	const router = useRouter();
	const [applyCss, setApplyCss] = useState<boolean>(false)
	let { isActiveDishType, setActiveDishType } = useActiveClass();

	useEffect(() => {
		if (!isActiveDishType) {
			setActiveDishType("ALL");
		}
	}, []);

	useEffect(() => {
		if (router.asPath.includes('r')) {
			setApplyCss(true)
		}
	}, [router])

	return (
		<div >
			{/* <!-- End Google Tag Manager (noscript) --> */}
			<Script id="google-analytics" strategy="afterInteractive">{`(function (w, d, s, l, i) {
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
				<title>Hipal menu</title>
				{/* Disabling zoom on two finger zoom in or out */}
				<meta charSet="UTF-8" />
				<meta httpEquiv="X-UA-Compatible" content="IE=edge" />
				<meta
					name="viewport"
					content="width=device-width, initial-scale=1.0, maximum-scale=1.0"
				/>
				<meta
					name="description"
					content="This page is all about online menu."
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
	);
});
