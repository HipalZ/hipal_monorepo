import { initializeAllBusiness } from '@components/store/useAllBusiness'
import { paths } from '@components/utils/paths'
import axios from '@utils/axios'
import Image from 'next/image'
import type { NextRequest, NextResponse } from 'next/server'
import { useEffect } from 'react'
import Gift from '@assets/gift.png'
import Hundred from '@assets/100.png'
import Cracker from '@assets/crack.png'
import BusinessLogo from '@components/atoms/brandLogo'
import LoyatyImg from '@assets/loyalty.png'

function LoyaltyCardPage({ data }) {
	useEffect(() => {
		initializeAllBusiness(data);
	}, [data]);

	return (
		<>
			<div className="relative w-full pt-4 pb-[5rem] bg-base-100 syne-font">
				<div className="mx-6">
					<div className="flex items-center justify-center ml-[5rem] text-center">
						<BusinessLogo />
					</div>
					<div className="pt-4 text-center syne-font-bold">
						<div className="flex items-center justify-center space-x-2">
							<Image height={25} width={25} src={Gift} alt="gift" />
							<div className="text-3xl syne-font-bold">Grab your 50 </div>
						</div>
						<div className="text-3xl syne-font-bold"> yummycoinz now!</div>
					</div>
				</div>
				<div className="flex items-center justify-center -mt-8">
					<Image width={400} height={50} src={LoyatyImg} alt="Loyalty" />
				</div>

				<div className="pb-4 text-xl text-center">It&#39;s Reward time</div>
				<div className="w-full mx-auto space-y-4 md:w-2/3 lg:w-1/2">
					<div className="flex flex-row items-center justify-center p-4 mx-6 space-x-4 bg-base-200/70 rounded-xl">
						{" "}
						{/* Changed justify-between to justify-center */}
						<div className="w-[30%]">
							<Image width={100} height={100} src={Cracker} alt="gift" />
						</div>
						<div className="w-[60%]">
							<div className="pb-2 text-xl font-semibold text-accent">
								<span className="text-2xl">50</span> coinz
							</div>
							<div className="text-xs text-base-content opacity-70">
								Sign in now to claim your 50 yummycoinz! and spend them in any
								coffee cup Outlet!
							</div>
						</div>
					</div>
					<div className="flex flex-row items-center justify-center p-4 mx-6 space-x-4 bg-base-200/70 rounded-xl">
						{" "}
						{/* Changed justify-between to justify-center */}
						<div className="w-[30%]">
							<Image width={100} height={100} src={Hundred} alt="gift" />
						</div>
						<div className="w-[60%]">
							<div className="pb-2 text-xl font-semibold text-accent syne-font-bold">
								<span className="text-3xl">100 %</span> Redemption
							</div>
							<div className="text-xs text-base-content opacity-70">
								Redeem 100 % of yummy coinz collected on every bill
							</div>
						</div>
					</div>
				</div>
				{/* <Footer /> */}
			</div>
			<div className='fixed bottom-0 z-20 flex items-center justify-between w-full px-6 py-4 space-x-4 shadow-2xl bg-base-100 shadow-base-100'>
				<button type='button' className='w-full px-4 py-3 bg-primary text-primary-content rounded-2xl'>
					Reedem
				</button>
			</div>
		</>
	);
}

export default LoyaltyCardPage;

async function fetchAllBusinessIds() {
	const response = await axios.get(paths.listAllBusiness());
	return response.data.map((business) => business._id);
}
// // Only grab the entry for this page
export async function getStaticPaths() {
	try {
		// Replace with a function that fetches all business IDs from your database or API
		const businessIds = await fetchAllBusinessIds();
		const paths = businessIds.map((businessId) => ({
			params: { businessId: businessId },
		}));

		return { paths, fallback: "blocking" };
	} catch (error) {
		// console.error('Error fetching business IDs:', error)
		return { paths: [], fallback: "blocking" };
	}
}

export async function getStaticProps(context: {
	req: NextRequest;
	res: NextResponse;
	params: { businessId: string };
}) {
	try {
		const businessId = context?.params?.businessId || "";
		const settings = (await axios(paths.settings(businessId))) || {};
		const businessesData = await axios(paths.businessData(businessId));
		const data = {};

		data["settings"] = JSON.parse(JSON.stringify(settings?.data?.[0])) || {};
		data["businessesData"] = businessesData?.data || {};

		initializeAllBusiness(data);
		return {
			props: {
				data,
			},
			revalidate: 1020,
		};
	} catch (err: any) {
		console.error(
			"Error fetching data for dish:",
			err.message,
			err.response?.data,
		);
		return {
			redirect: {
				destination: `/r/${context?.params?.businessId}/explore`,
			},
		};
	}
}
