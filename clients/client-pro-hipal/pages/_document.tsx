import { Head, Html, Main, NextScript } from 'next/document'

// export const config = { amp: true }

export default function Document() {
	return (
		<Html lang='en' className='!scroll-smooth ease-in-out' data-theme='light'>
			<Head>
				<link
					href='https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@300;400;700&display=swap'
					rel='stylesheet'
				/>
				<link rel='preconnect' href='https://fonts.googleapis.com' />
				<link rel='preconnect' href='https://fonts.gstatic.com' />
				<link
					href='https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;800&display=swap'
					rel='stylesheet'
				/>
			</Head>
			<body>
				{/* <!-- Google Tag Manager (noscript) --> */}
				<noscript>
					<iframe
						src='https://www.googletagmanager.com/ns.html?id=GTM-57HCB68'
						height='0'
						width='0'
						className='hidden'
					></iframe>
				</noscript>
				<Main />
				<NextScript />
			</body>
		</Html>
	)
}
