import axios from "@/utils/axios"

export default function Slug({ context }) {
	return <div>Wait</div>
}

export async function getServerSideProps(context) {
	try {
		const res = await axios.get(`/v1/businesses/n/${context.query.customLink}`)
		const data = await res.data
		const businessId = await data.data.businessId
		console.log(businessId)

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
