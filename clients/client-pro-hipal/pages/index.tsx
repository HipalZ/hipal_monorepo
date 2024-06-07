import WhatsappRedirect from '@components/atoms/whatsappRedirect'
import BusinessThrive from '@components/molecules/businessThrive'
import BusinessThriveMobile from '@components/molecules/businessThriveMobile'
import CardSection from '@components/molecules/cardSection'
import CeoContainer from '@components/molecules/ceoContainer'
import FooterSection from '@components/molecules/footerSection'
import LogoNavBar from '@components/molecules/logoNavBar'
import MiddleSection from '@components/molecules/middleSection'
import StartTrail from '@components/molecules/startTrail'
import TopSection from '@components/molecules/topSection'
import { useEffect, useState } from 'react'
import { useInView } from 'react-intersection-observer'

export default function App() {
	const [data, setData] = useState({
		roundedHeader: false,
	}) // roundedHeader is false when the header is scrolled to the top
	const {
		ref: headerRef,
		inView,
		entry,
	} = useInView({
		threshold: 0,
	})
	useEffect(() => {
		changeHeaderStyle()
	}, [entry])
	function changeHeaderStyle() {
		if (inView) {
			setData({ ...data, roundedHeader: false })
		} else {
			setData({ ...data, roundedHeader: true })
		}
	}
	return (
		<>
			<div className='bg-[#fef7f5] w-screen h-screen overflow-x-hidden relative'>
				<LogoNavBar data={data} />
				<div ref={headerRef} style={{ height: '1px' }} />
				<TopSection />
				<MiddleSection />
				<CardSection />
				<BusinessThrive />
				<StartTrail />
				<BusinessThriveMobile />
				<CeoContainer />
				<FooterSection />
				<WhatsappRedirect />
			</div>
		</>
	)
}
