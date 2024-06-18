"use client"
import { PAGE_TYPES, routePaths } from "@/components/utils/routes"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { FormEvent, memo, useState } from "react"
import { toast } from "react-toastify"
import Welcome from "@/assets/login-background.png"
import { BiArrowBack } from "react-icons/bi"
import HipalLogo from "@/assets/hipalNewLogo.svg"
import { useLogin } from "@/components/store/useLogin"
import { useParams } from "next/navigation"
import useBusinessDetails from "@/components/store/useBusinessDetails"
import axios from "@/utils/axios"

function SignUp() {
	const [logo, setLogo] = useState<string>('')
	const [phone, setPhone] = useState("")
	const { setUserDetails } = useLogin()
    const businessData = useBusinessDetails((s) => s.businessDetails)
	const router = useRouter()
	const params = useParams<{ businessId: string }>();
	const businessId = params ? params.businessId : undefined;

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault()

		if (phone.length !== 10) {
			toast.error("Please enter a valid phone number")
			return
		}

		const userData = {
			phone: phone,
			role: "HIPAL_CUSTOMER",
		}

		const config = {
			method: "POST",
			url: "/v1/users/:id/signUp",
			data: userData,
		}
		try {
			const res = await axios(config)
			if (res.status === 201) {
				setUserDetails(res.data.data)
				router.push(`${routePaths[PAGE_TYPES.OTP](`${businessId}`)}`)
			}
		} catch (error) {
			if ((error as any).response?.status === 409) {
				setUserDetails((error as any).response.data.data)
				//TODO: already existing status code
				router.push(`${routePaths[PAGE_TYPES.OTP](`${businessId}`)}`)
			} else {
				toast.error("An error occurred. Please try again later")
			}
		}
	}

	const goBack = () => {
		router.back()
	}

	return (
		<section className="relative bg-black">
			<section className="flex items-center justify-between">
				<article
					onClick={goBack}
					className="sticky z-20 px-4 py-2 mt-4 ml-4 bg-gray-100/50 w-[3.25rem] top-4 left-4 rounded-3xl"
				>
					<BiArrowBack size={20} />
				</article>
			</section>
			<section
				className="fixed inset-0 z-0 bg-black bg-center bg-no-repeat bg-contain"
				style={{ backgroundImage: `url(${Welcome.src})` }}
			></section>
			<form
				onSubmit={handleSubmit}
				className="fixed bottom-0 w-full p-4 bg-white max-w-[30rem] z-10 rounded-t-2xl"
			>
				{businessData?.logo && (
					<section className="bg-inherit float-right w-[5rem] h-[5rem] rounded-lg flex items-center justify-center -mt-[4rem] p-1 shadow-xl overflow-hidden">
						<Image
							className="aspect-square w-[4.75rem] h-[4.75rem]"
							width={84}
							height={84}
							src={logo}
							alt="business logo"
							onError={() => setLogo(HipalLogo.src)}
						/>
					</section>
				)}
				<section className="my-4 space-y-2">
					<b>Hurry up for a rewarding journey✨</b>
					<input
						onChange={(e) => setPhone(e.target.value)}
						value={phone}
						type="tel"
						id="floating_outlined2"
						className="w-full px-4 py-3 border border-black rounded-2xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
						placeholder="Enter phone number"
						maxLength={10}
						minLength={10}
						required
					/>
				</section>
				<button type="submit" className="w-full mt-4 bg-black rounded-full on_active_bounce btn">
					get started
				</button>
				<center className="mx-12 mt-4 text-xs">
					By continuing you are agreeing to the{" "}
					<small className="text-[#2364E6]">Terms of Service and Privacy Policy.</small>
				</center>
			</form>
		</section>
	)
}

export default memo(SignUp)
