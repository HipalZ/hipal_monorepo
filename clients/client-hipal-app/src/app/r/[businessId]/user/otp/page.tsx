"use client"
import { useLogin } from "@/components/store/useLogin"
import { PAGE_TYPES, routePaths } from "@/components/utils/routes"
import axios from "@/utils/axios";
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { memo, useEffect, useRef, useState } from "react"
import Welcome from "@/assets/otp_image.png"
import { BiArrowBack, BiEditAlt } from "react-icons/bi"
import Sunlight from "@/assets/Ellipse 1-min.png"
import Image from "next/image"
import confetti from "canvas-confetti"
import Hi_Coin from "@/assets/hi-coin.svg"
import CoinsAnimation from "@/components/atoms/coinAnimation"
import NumberAnimation from "@/components/atoms/coinsScroll"
import useLoyaltyData from "@/components/store/useLoyaltyData"
import useBusinessDetails from "@/components/store/useBusinessDetails"
import HipalLogo from "@/assets/hipalNewLogo.svg"
import HipalWhiteLogo from "@/assets/hipalLogoOtp.svg"
import { useUserToken } from "@/components/store/useUserToken";

function OtpPage() {
	const [otp, setOtp] = useState(["", "", "", ""])
	const [error, setError] = useState("")
	const { setIsLogin, setUserDetails, userDetails } = useLogin()
	const [coinZ, setCoinz] = useState(0)
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [customerName, setCustomerName] = useState(userDetails.name)
	const businessLogo = useBusinessDetails((s) => s.businessDetails.logo)
	const [logo, setLogo] = useState(businessLogo)
	const setAccessToken = useUserToken((s) => s.setAccessToken)
	const setRefreshToken = useUserToken((s) => s.setRefreshToken)
	const inputRefs = [
		useRef<HTMLInputElement>(null),
		useRef<HTMLInputElement>(null),
		useRef<HTMLInputElement>(null),
		useRef<HTMLInputElement>(null),
	]
	const router = useRouter()
	const params = useParams<{ businessId: string }>();
	const businessId = params ? params.businessId : undefined;
	const sendOtp = useLogin((s) => s.sendOtp)
	const {  loyaltyId, signUpBonus } = useLoyaltyData((s) => s.loyaltySetting)
	const direction = useLogin((s) => s.direction)

	const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
		if (e.target.value.length > 1 || isNaN(Number(e.target.value))) return

		const newOtp = [...otp]
		newOtp[index] = e.target.value

		if (index < inputRefs.length - 1 && e.target.value !== "") {
			inputRefs[index + 1]?.current?.focus()
		}

		setOtp(newOtp)
	}

	
	function randomInRange(min:number, max:number) {
		return Math.random() * (max - min) + min
	}

	// Function to trigger a single blast
	function triggerConfettiBlast() {
		confetti({
			angle: randomInRange(55, 125),
			spread: randomInRange(50, 70),
			particleCount: randomInRange(50, 100),
			origin: { y: 0.6 },
		})
	}

	const verifyOtp = async () => {
		const fullOtp = otp.join("")
		if (fullOtp.length !== 4) {
			setError("Please enter the complete OTP.")
			return
		}

		try {
			const config = {
				method: "POST",
				url: "/v1/users/:id/signIn",
				data: {
					phone: userDetails.phone,
					role: userDetails.role,
					userId: userDetails._id,
					otp: fullOtp,
					loyaltyId: loyaltyId,
					signUpBonus: signUpBonus,
					name: customerName || userDetails.name,
				},
			}

			const response = await axios(config)
			const data = response.data.data
			if (response.status === 200) {
				setAccessToken(data.accessToken)
				setRefreshToken(data.refreshToken)
				setUserDetails(data?.user)
				setIsLogin(true)
				if (data?.reward > 0 && data?.count === 1) {
					setCoinz(data.reward)
					setIsModalOpen(true)
					triggerConfettiBlast()
					setTimeout(triggerConfettiBlast, 1000)
					setTimeout(triggerConfettiBlast, 2000)
					return
				}
				goNext()
			}

			setOtp(["", "", "", ""])
			if (inputRefs[0].current) {
				inputRefs[0].current.focus()
			}
		} catch (error) {
			setError("Incorrect OTP. Please try again.")
			setOtp(["", "", "", ""])
			if (inputRefs[0].current) {
				inputRefs[0].current.focus()
			}
		}
	}
	const goNext = () => {
		if (direction === "loyalty") {
			router.push(routePaths[PAGE_TYPES.LOYALTY](`${businessId}`))
		} else {
			router.push(routePaths[PAGE_TYPES.CATEGORY](`${businessId}`))
		}
	}

	const goBack = () => {
		router.back()
	}

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		verifyOtp()
	}

	useEffect(() => {
		let audio:HTMLAudioElement
		if (isModalOpen) {
			audio = new Audio("/sounds/Money.mp3")
			audio.play()
		}
		return () => {
			if (audio) {
				audio.pause()
				audio.currentTime = 0
			}
		}
	}, [isModalOpen])

	return (
		<section className="relative bg-black">
			<section className="flex items-center justify-between">
				<article
					onClick={goBack}
					className="sticky z-20 px-4 py-2 mt-4 ml-4 bg-gray-100/50 w-[3.25rem] top-4 left-4 rounded-3xl"
				>
					<BiArrowBack size={20} />
				</article>
				<article className="sticky z-20 top-4 right-4">
					<Image src={HipalWhiteLogo} alt="logo" />
				</article>
			</section>
			<section
				className="fixed inset-0 z-0 w-full max-w-[30rem]
				 bg-black bg-center bg-no-repeat bg-contain  mx-auto"
				style={{ backgroundImage: `url(${Welcome.src})` }}
			></section>
			{userDetails.name === "" ? (
				<section className="absolute text-white top-[10vh] left-9">
					<b className="block text-2xl gradient-text">You look new !</b>
					<b className="text-3xl capitalize gradient-text">Welcome...</b>
					<b className="text-4xl wave-hand">👋</b>
				</section>
			) : (
				<section className="absolute text-white top-[10vh] left-9">
					<h4 className="text-2xl">Hello!</h4>
					<b className="text-3xl capitalize">{userDetails.name}</b>
					<b className="text-4xl wave-hand">👋</b>
				</section>
			)}
			<form
				className="fixed bottom-0 w-full p-4 bg-white max-w-[30rem] z-10 rounded-t-xl"
				onSubmit={handleSubmit}
			>
				{businessLogo && (
					<section className="bg-inherit w-[5rem] float-right h-[5rem] rounded-lg flex items-center justify-center -mt-[4rem] p-1 shadow-xl overflow-hidden">
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
				<section className="space-y-4">
					{userDetails.name === "" ? (
						<>
							{" "}
							<div className="!-mb-4 text-sm font-semibold">Whatz your name ?</div>
							<input
								onChange={(e) => setCustomerName(e.target.value)}
								value={customerName}
								type="text"
								id="floating_outlined"
								className="w-full px-4 py-3 border border-black rounded-2xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
								placeholder="Enter your name"
								maxLength={18}
								required
							/>
						</>
					) : null}
					<div className="!-mb-2 text-sm font-semibold">Check your phone for OTP</div>
					<section className="flex">
						{otp.map((_, index) => (
							<input
								type="tel"
								key={index.toString()}
								value={otp[index]}
								onChange={(e) => handleOtpChange(e, index)}
								max={1}
								min={0}
								ref={inputRefs[index]}
								className={`border border-black rounded-lg py-2 px-2 text-center text-base-content w-[3rem] h-12 mr-2 focus:outline-none ${error && "border-red-500"
									}`}
								required
							/>
						))}
					</section>
					{error && (
						<div className="mb-2 animate-pulse">
							<div className="tracking-wider text-red-500" role="alert">
								{error}
							</div>
						</div>
					)}
					<Link href={`${routePaths[PAGE_TYPES.SIGN_UP](`${businessId}`)}`}>
						<article className="flex items-center !mb-2 !mt-4">
							<small>
								Sent to <span className="text-[#3E3CFF] underline">{userDetails.phone}</span>{" "}
							</small>
							<span className="cursor-pointer text-[#3E3CFF]">
								<BiEditAlt />
							</span>
						</article>
					</Link>
					<button type="submit" className="w-full bg-black rounded-full btn">
						{userDetails.name !== "" ? "sign in" : "Sign up"}
					</button>
					<small className="flex justify-center mt-2">
						Didn’t receive the code? &nbsp;
						<button
							type="button"
							onClick={() => sendOtp()}
							role="button"
							className="cursor-pointer text-[#3E3CFF]"
						>
							Resend
						</button>
					</small>
				</section>
			</form>
			{isModalOpen && (
				<section
					id="my_modal_1"
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
				>
					<section className="absolute inset-0 flex items-center justify-center">
						<center className="absolute w-[900px] animate-glow">
							<Image
								className="animate-spin"
								width={1080}
								height={1080}
								src={Sunlight}
								alt="Sunlight"
							/>
						</center>
					</section>
					<section className="absolute inset-0 flex items-center justify-center">
						<section className="absolute rotate-[-30deg] left-6 top-[12vh]">
							<Image className="zoomIn" width={76} height={76} src={Hi_Coin} alt="Hi Coin" />
						</section>
						<section className="absolute rotate-45 right-6 top-[20vh] z-20">
							<Image className="zoomIn" width={76} height={76} src={Hi_Coin} alt="Hi Coin" />
						</section>
					</section>

					<section
						id="shine-card"
						className="relative mt-[5rem] p-6 bg-[#F8D76E] rounded-2xl shadow-lg mx-auto w-[80%] max-w-[26rem] z-10 zoomIn overflow-hidden"
					>
						<div className="shine-effect"></div>
						<center>
							<CoinsAnimation />
						</center>
						<center className="text-xl font-bold uppercase text-[#8D0F16] mt-6">
							Congratulations!!
						</center>
						<center className="text-lg font-medium uppercase text-[#8D0F16] mt-2">you got</center>
						<div className="loyalty_card_gradient" />
						<div className="loyalty_card_gradient2" />
						{coinZ > 0 && <NumberAnimation number={coinZ} />}
						<center className="text-xl font-medium uppercase text-[#8D0F16]">CoinZ</center>
						<button
							className="relative z-20 w-full px-4 py-2 mt-6 text-white bg-[#015845] transition-all duration-300 rounded-full shadow-lg"
							onClick={goNext}
						>
							Explore
						</button>
					</section>
				</section>
			)}
		</section>
	)
}

export default memo(OtpPage)
