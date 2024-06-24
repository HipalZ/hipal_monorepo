import axios from '@utils/axios'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

export default function Slug() {
	const [isError, setIsError] = useState(false)
	const router = useRouter()
	const { customLink } = router.query

	useEffect(() => {
		if (!customLink) return

		const fetchData = async () => {
			try {
				const res = await axios.get(`/v1/businesses/n/${customLink}`)
				const businessId = res.data.data.businessId

				if (businessId) {
					router.push(`/r/${businessId}/explore`)
				} else {
					setIsError(true)
				}
			} catch (e) {
				console.log(e)
				setIsError(true)
			}
		}

		fetchData()
	}, [customLink, router])

	useEffect(() => {
		if (isError) {
			router.push('/')
		}
	}, [isError, router])

	return <div>Wait</div>
}
