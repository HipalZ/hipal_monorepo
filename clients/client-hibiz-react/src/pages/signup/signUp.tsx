import React, { startTransition, useState } from "react";
import Hand from "@/assets/login/hand.png";
import { PiSealWarningBold } from "react-icons/pi";
import useLoginStore from "@/components/store/useLogin";
import { useNavigate } from "react-router-dom";
import { cn } from "@/components/utils/helper";

const SignUpPage: React.FC = () => {
	const { step, setStep, phone, setPhone, name, setName } = useLoginStore();
	const [validPhone, setValidPhone] = useState(true);

	const navigate = useNavigate();

	const validPhoneNumber = () => {
		const phoneRegex = /^[6-9]\d{9}$/;
		return phoneRegex.test(phone);
	};

	const handleSubmit = () => {
		const isPhoneValid = validPhoneNumber();

		setValidPhone(isPhoneValid);

		if (isPhoneValid) {
			setStep(step + 1);
		}
	};

	const goToLoginScreens = () => {
		startTransition(() => {
			navigate("/login");
		});
	};

	return (
		<>
			<img
				className="absolute left-0 right-0 m-auto -top-[6.5rem]"
				width={63}
				height={73}
				src={Hand}
				alt="Hipal_hand"
			/>
			<h5>
				Already User?{" "}
				<span
					onClick={goToLoginScreens}
					className="text-[#1C4EFF] text-sm font-semibold cursor-pointer"
				>
					Login
				</span>
			</h5>
			<h3 className="mt-4 text-xl font-semibold leading-8">
				Hi Pal, Let’s get started
			</h3>
			<p>Grow your restaurant! 🍽️</p>
			<section className="mt-6 space-y-6">
				<div>
					<input
						type="text"
						value={name}
						onChange={(e) => setName(e.target.value)}
						className="w-full px-4 py-3 border border-black rounded-2xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
						placeholder="Enter your name"
						maxLength={20}
						required
					/>
				</div>
				<div>
					{!validPhone && (
						<small className="flex items-center text-[#F2634C]">
							<PiSealWarningBold />
							&nbsp; Enter a valid number
						</small>
					)}
					<input
						type="tel"
						value={phone}
						onChange={(e) => setPhone(e.target.value)}
						className={cn(
							"w-full px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:border-transparent",
							validPhone ? "border-black focus:ring-black" : "border-red-500 focus:ring-red-500"
						)}
						placeholder="Enter phone number"
						maxLength={10}
						required
					/>
				</div>
			</section>
			<button className="action_btn" onClick={handleSubmit}>
				Create my biz
			</button>
		</>
	);
};

export default SignUpPage;
