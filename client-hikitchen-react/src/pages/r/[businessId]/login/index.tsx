import React, { startTransition } from "react";
import welcome from "@/assets/png/hikitchen.png";
import HiKitchenLogo from "@/assets/svg/hikitchenlogo.svg";
import axios from "@/axios";
import { useUserLogin } from "@/components/store/useUserLogin";
import { toast } from "react-toastify";
import { PAGE_TYPES, singleRoute } from "@/components/utils/routes";
import { useBusinessData } from "@/components/store/useBusinessData";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";

function Login() {
	const {
		phoneNumber,
		password,
		setIsLogin,
		setPassword,
		setPhoneNumber,
		setUser,
	} = useUserLogin();
	const { businessData, setBusinessData } = useBusinessData();
	const navigate = useNavigate()

	const { businessId } = useParams<{ businessId: string }>();

	const handlePhoneNumberChange = (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		setPhoneNumber(event.target.value);
	};

	const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setPassword(event.target.value);
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		result();
	};

	const result = async () => {
		try {
			const config = {
				method: "POST",
				url: "/v1/users/chef/Login?withBusinessId=true",
				data: {
					phone: phoneNumber,
					password: password,
					businessId: businessId,
				},
			};

			const user = await axios(config);
			const isData = user?.data && Object.keys(user.data).length >0;
			if (isData) {
				setUser(user.data);
			}
			if (user.status === 200) {
				toast.success("Login Successfully");
				setIsLogin(true);
				startTransition(() => {
					navigate(`${singleRoute[PAGE_TYPES.KITCHENS](`${businessId}`)}`);
				})
			} else {
				toast.error("Phone or Password invalid...!");
			}
		} catch (err) {
			toast.error("Phone or Password invalid...!");
		}
	};

	async function getBusinessData() {
		try {
			const res = await axios(`/v1/businesses/get/Single/${businessId}`);
			const data = await res.data;
			setBusinessData(data);
			return data;
		} catch (error) {
			toast.error("Please Login Again...!");
		}
	}

	const { isLoading } = useQuery({
		queryKey: ["business", businessId],
		queryFn: getBusinessData,
		enabled: !!businessId,
	});

	if (isLoading) {
		return <div>Loading...</div>;
	}

	return (
		<div className="grid bg-[#f5f5f5] my-auto min-h-screen place-items-center">
			<div className="flex flex-col items-center mt-4">
				<div className="flex justify-center pt-0 lg:pt-[2rem] mx-[3.375rem]">
					<img
						className="lg:w-[15rem]"
						src={HiKitchenLogo}
						alt="Hi Table Logo"
						loading="lazy"
					/>
				</div>
				<div className="flex relative lg:w-full justify-center mx-[3.375rem]">
					<div>
						<img
							className="lg:w-[30rem] lg:h-[30rem]"
							src={welcome}
							alt="Hi Table Logo"
							loading="lazy"
						/>
					</div>
					<div className="absolute w-[6rem] h-[6rem] -bottom-[3.5rem] lg:-bottom-8 lg:w-[8rem] lg:h-[8rem] rounded-full">
						<img height={100}
							width={100}
							className="rounded-full w-20 h-20"
							src={businessData?.logo}
							alt="Business Logo"
						/>
					</div>
				</div>
			</div>
			<div className="flex flex-col lg:mb-[4rem] mb-[12rem] items-start">
				<form onSubmit={handleSubmit}>
					<div className="relative w-full px-[3.125rem] md:px-[15rem] lg:px-[25rem] mt-[2.5rem] mb-[5rem] ml-0 mr-0 space-y-4">
						<div className="relative w-full">
							<input
								onChange={handlePhoneNumberChange}
								type="tel"
								value={phoneNumber}
								id="floating_outlined3"
								className="block w-full pt-2 pb-3 pl-4 pr-[7rem] mb-0 ml-0 mr-0 text-base text-gray-900 bg-transparent border-gray-800 rounded-lg border dark:text-white focus:outline-none focus:border-[#50A466] dark:border-gray-600 peer"
								placeholder=" "
								maxLength={10}
								minLength={4}
								required
							/>
							<label
								htmlFor="floating_outlined3"
								className="absolute text-sm text-gray-500 dark:text-gray-400 bg-[#f5f5f5] duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] peer:bg-[#f5f5f5] peer-focus:bg-[#f5f5f5] dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#50A466] peer-focus:dark:text-[#50A466] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2  peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
							>
								Phone number
							</label>
						</div>
						<div className="relative">
							<input
								onChange={handlePasswordChange}
								type="password"
								id="floating_outlined4"
								className="block w-full pt-2 pb-3 pl-4 pr-[7rem] mb-0 ml-0 mr-0 text-base text-gray-900 bg-transparent border-gray-800 rounded-lg border dark:text-white focus:outline-none focus:border-[#50A466] dark:border-gray-600 peer"
								placeholder=" "
								maxLength={4}
								minLength={4}
								required
							/>
							<label
								htmlFor="floating_outlined4"
								className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 bg-[#f5f5f5] transform -translate-y-4 scale-75 top-2 z-10 origin-[0] peer-focus:bg-[#f5f5f5] dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#50A466] peer-focus:dark:text-[#50A466] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
							>
								Password
							</label>
						</div>
					</div>
					<div className="items-center flex justify-center mb-5">
						<button
							type="submit"
							className="on_active_bounce bg-[#50A466] border rounded-full w-[20.5rem] font-[600] py-[0.75rem] text-white text-[18px] leading-[1.15rem]"
						>
							Login
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}

export default Login;
