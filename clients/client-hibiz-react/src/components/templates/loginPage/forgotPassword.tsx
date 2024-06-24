import Hand from "@/assets/login/hand.png";
import useLoginStore from "@/components/store/useLogin";
import { cn } from "@/components/utils/helper";
import { useRef, useState } from "react";
import { LuArrowLeft } from "react-icons/lu";
import { PiSealWarningBold } from "react-icons/pi";

const ForgotPassword = () => {
	const { setStep, phone, step, setPhone } = useLoginStore();
	const [validPhone, setValidPhone] = useState(true);
	const [showInputFeilds, setShowInputFeilds] = useState(false);
	const validPhoneNumber = () => {
		const phoneRegex = /^[6-9]\d{9}$/;
		return phoneRegex.test(phone);
	};
	console.log("hello world in forgot password");
	const [otp, setOtp] = useState("");
	const inputRefs = [
		useRef<HTMLInputElement>(null),
		useRef<HTMLInputElement>(null),
		useRef<HTMLInputElement>(null),
		useRef<HTMLInputElement>(null),
	];

	const handleSubmit = () => {
		const isPhoneValid = validPhoneNumber();

		setValidPhone(isPhoneValid);

		if (isPhoneValid) {
			showInputFeilds ? setStep(step + 1) : setShowInputFeilds(true);
		}
	};

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement>,
		index: number,
	) => {
		const newValue = e.target.value;
		if (/^[0-9]$/.test(newValue) || newValue === "") {
			const newOtp = otp.split("");
			newOtp[index] = newValue;
			setOtp(newOtp.join(""));
			if (newValue !== "" && index < 3) {
				inputRefs[index + 1].current?.focus();
			}
		}
	};

	const hideOtpInputes = () => {
		setShowInputFeilds(false);
	};

	const goBack = () => {
		setStep(step - 1);
	};

	return (
		<>
			{" "}
			<img
				className="absolute left-0 right-0 m-auto -top-[6.5rem]"
				width={63}
				height={73}
				src={Hand}
				alt="Hipal_hand"
			/>
			<h3
				onClick={goBack}
				className="flex items-center font-semibold leading-8 text-[#1C4EFF]"
			>
				<LuArrowLeft size={16} />
				&nbsp; Back
			</h3>
			<h3 className="mt-2 text-xl font-semibold leading-8">
				Forgot your Password
			</h3>
			<h3 className="flex leading-8">No worriez !</h3>
			{showInputFeilds ? (
				<section className="mt-4">
					<small>
						<span className="opacity-40">OTP send to +91</span>{" "}
						<span className="text-[#1C4EFF]">{phone}</span>
					</small>
					<div className="flex mt-4 space-x-2">
						{inputRefs.map((ref, index) => (
							<input
								key={index}
								ref={ref}
								type="text"
								value={otp[index] || ""}
								onChange={(e) => handleChange(e, index)}
								className="w-12 px-4 py-3 text-center border border-black rounded-2xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
								maxLength={1}
							/>
						))}
					</div>
				</section>
			) : (
				<section className="mt-6 space-y-6">
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
			)}
			<button className="action_btn" onClick={handleSubmit}>
				{showInputFeilds ? "Verify" : "Send Otp"}
			</button>
			<center className="mt-2">
				{showInputFeilds ? (
					<small onClick={hideOtpInputes} className="text-[#1C4EFF]">
						Resend OTP
					</small>
				) : (
					<>
						Forgot Password ? <span className="text-[#1C4EFF]">Set OTP</span>
					</>
				)}
			</center>
		</>
	);
};

export default ForgotPassword;
