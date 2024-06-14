import type React from "react";
import { useEffect, useState } from "react";
import HiTableLogo from "@/assets/svg/HiTableLogo.svg";
import welcome from "@/assets/svg/welcomeLogo.svg";
import { useLogin } from "@/components/store/useLogin";
import { PAGE_TYPES, singleRoute } from "@/components/utils/routes";
import { toast } from "react-toastify";
import { useBusinessStore } from "@/components/store/useBusinessData";
import { useLoyaltyStore } from "@/components/store/useLoyaltyData";
import { useNavigate, useParams } from "react-router-dom";
import axios from "@/components/utils/axios";
import { useUserToken } from "@/components/store/useUserToken";

function HiTable() {
	const { password, setPassword, setIsLogin, userDetails } = useLogin();
	const [phoneNumber, setPhoneNumber] = useState<string>(
		userDetails.phone || "",
	);
	const setBusinessData = useBusinessStore((s) => s.setBusinessData);
	const setLoyaltyData = useLoyaltyStore((s) => s.setLoyaltyData);
	const {setAccessToken,setRefreshToken} = useUserToken();
	const navigate = useNavigate();
	const params = useParams();
	const businessId = params.businessId as string;

	const handlePhoneNumberChange = (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		setPhoneNumber(event.target.value);
	};

	const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setPassword(event.target.value);
	};

	const setUserDetails = useLogin((s) => s.setUserDetails);

	const result = async () => {
		try {
			const config = {
				method: "POST",
				url: "/v1/users/waiterLogin",
				data: {
					phone: phoneNumber,
					password: password,
				},
			};

			const response = await axios(config);
			console.log(response);
			if (response.status === 201) {
				setUserDetails(response.data.existingUser);
				setAccessToken(response.data.accessToken);
				setRefreshToken(response.data.refreshToken);
				setIsLogin(true);
				navigate(`${singleRoute[PAGE_TYPES.ZONE](businessId)}`);
			}
		} catch (err) {
			return toast.error("Phone or Password invalid...!");
		}
	};

	const fetchBusinessData = async () => {
		try {
			const response = await axios.get(
				`/v1/businesses/get/Single/${businessId}`,
			);
			setBusinessData(response.data);
		} catch (error) {
			console.error("Error fetching business data:", error);
		}
	};
	const getLoyaltySetting = async (businessId: string) => {
		try {
			const response = await axios.get(`/v1/businesses/${businessId}/loyalty`);
			const data = response.data;
			setLoyaltyData(data);
		} catch (error) {
			console.error("Error fetching loyalty data:", error);
		}
	};

	useEffect(() => {
		if (businessId) {
			fetchBusinessData();
			getLoyaltySetting(businessId);
		}
	}, [businessId]);

	const goToMainLogin = () => {
		navigate("/");
	};

	return (
		<div>
			<div onClick={goToMainLogin} className="flex justify-center mt-[2rem]">
				<img width={104} height={31} src={HiTableLogo} alt="Hi Table Logo" />
			</div>
			<div className="flex justify-center mt-[1rem] mx-[3.375rem]">
				<img width={283} height={223} src={welcome} alt="Hi Table Logo" />
			</div>
			<div className="text-center mt-[2.5rem]">
				<span className="font-[400] text-base-content text-[1rem] leading-[1.125rem]">
					Let’s get started
				</span>
			</div>

			<div className="relative w-full px-[3.125rem] mt-[2.5rem] mb-[5.89rem] ml-0 mr-0 space-y-4">
				<div className="relative">
					<input
						onChange={handlePhoneNumberChange}
						type="tel"
						value={phoneNumber}
						id="floating_outlined3"
						className="block w-full pt-2 pb-3 pl-4 pr-4 mb-0 ml-0 mr-0 text-base text-gray-900 bg-transparent border border-gray-800 rounded-lg dark:text-base-100 focus:outline-none focus:border-primary dark:border-gray-600 peer"
						placeholder=" "
						maxLength={10}
						minLength={10}
						required
					/>
					<label
						htmlFor="floating_outlined3"
						className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-base-100 dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-primary peer-focus:dark:text-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
					>
						Phone number
					</label>
				</div>
				<div className="relative">
					<input
						onChange={handlePasswordChange}
						type="password"
						id="floating_outlined4"
						className="block w-full pt-2 pb-3 pl-4 pr-4 mb-0 ml-0 mr-0 text-base text-gray-900 bg-transparent border border-gray-800 rounded-lg dark:text-base-100 focus:outline-none focus:border-primary dark:border-gray-600 peer"
						placeholder=" "
						maxLength={4}
						minLength={4}
						required
					/>
					<label
						htmlFor="floating_outlined4"
						className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-base-100 dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-primary peer-focus:dark:text-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
					>
						Password
					</label>
				</div>
			</div>

			<div className="flex justify-center mb-5">
				<button
					onClick={result}
					type="button"
					className="on_active_bounce fixed bottom-6 z-50 bg-primary rounded-full w-[20.5rem] font-[600] py-[0.75rem] text-base-100 text-[18px] leading-[1.15rem]"
				>
					Login
				</button>
			</div>
		</div>
	);
}

export default HiTable;
