import axios from "@/utils/axios"
import { lazy } from "react"
import Image from 'next/image';

const hipalLogo = lazy(() => import("@/assets/HIPAL_LOGO.svg"))
export default function Slug() {
	return <center>
			<Image src={hipalLogo} alt="logo" width={50} height={50}/>
		</center>	
}

export async function getServerSideProps(context) {
	try {
		const res = await axios.get(`/v1/businesses/n/${context.query.customLink}`)
		const data = await res?.data?.data
		const businessId = await data.data.businessId

		return {
			redirect: {
				destination: `/r/${businessId || ""}/explore`,
				permanent: true,
			},
		}
	} catch (e) {
		console.log(e)
		return {
			redirect: {
				destination: "/",
				permanent: true,
			},
		}
	}
}
