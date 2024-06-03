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
import { memo, startTransition, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Create a client
const queryClient = new QueryClient();

export default memo(function MyApp({ Component, pageProps }: AppProps) {
	const router = useRouter();
	let { isActiveDishType, setActiveDishType } = useActiveClass();

	useEffect(() => {
		if (!isActiveDishType) {
			setActiveDishType("ALL");
		}
	}, []);

	useEffect(() => {
		startTransition(() => {
			if (!window.location.href.includes("#")) {
				setTimeout(() => {
					if (typeof document === "undefined") return null;
					(document.querySelector("body") as HTMLBodyElement).scrollTo({
						top: 0,
						left: 0,
						behavior: "smooth" as any,
					});
				}, 0);
			}
		});
	}, [router.pathname]);

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

			<ToastContainer />
			<QueryClientProvider client={queryClient}>
				<NextNProgress color={"hsl(var(--p))"} />
				<ThemeProvider>
					<div
						
						
					>
						<Component {...pageProps} />
					</div>
				</ThemeProvider>
			</QueryClientProvider>
		</div>
	);
});
