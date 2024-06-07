import type React from "react";
import HiKitchenLogo from "@/assets/svg/hiBizlogo.svg";
import Sir from "@/assets/svg/sir2.svg";
import { useOwnerLogin } from "@/components/store/useOwnerLogin";
import { toast } from "react-toastify";
import { PAGE_TYPES, routePaths } from "@/components/utils/routes";
import axios from "@/axios";
import { useNavigate } from "react-router-dom";
import { startTransition } from "react";

function Login() {
	const {
		phoneNumber,
		password,
		setIsLogin,
		setPassword,
		setPhoneNumber,
		setUser,
	} = useOwnerLogin();
	const navigate = useNavigate();

	const handlePhoneNumberChange = (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		setPhoneNumber(event.target.value);
	};

	const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setPassword(event.target.value);
	};
	const result = async () => {
		try {
			const config = {
				method: "POST",
				url: "/v1/users/Owner/Login",
				data: {
					phone: phoneNumber,
					password: password,
				},
			};

			const user = await axios(config);
			if (user?.data) {
				setUser(user.data);
			}
			if (user?.status === 200) {
				toast.success("Login Succsessfully");
				setIsLogin(true);
				startTransition(()=>{
					navigate(routePaths[PAGE_TYPES.BUSINESS]());
				})
			} else {
				toast.error("Phone or Password invalid...!");
			}
		} catch (err: any) {
			toast.error("Phone or Password invalid...!");
		}
	};


	return (
		<div className="bg-[#f6e8dd] min-h-screen flex flex-col lg:items-center md:items-center justify-between px-0 md:px-[20vw] lg:px-[40vw]">
			<div className="flex flex-col items-center justify-center pt-4 ">
				<div className="mt-4">
					<img src={HiKitchenLogo} alt="Hi Table Logo" loading="lazy"/>
				</div>
				<div className="text-center bg-[#f6e8dd] rounded-t-[3rem] py-2 mt-6">
					<img className="w-[85vw] h-[40vh]" src={Sir} alt="Hi Logo" loading="lazy"/>
				</div>
			</div>

			<div className="mx-6 flex flex-col text-3xl font-medium text-start text-[#2B354D]">
				<span className="mt-6">Hey,</span>
				<span className="">Welcome Back!</span>
			</div>

			<div className="flex flex-col items-center justify-center px-6 pb-12">
				<div className="relative w-full px-0 mt-6 mb-[5.89rem] ml-0 mr-0 space-y-4">
					<div className="relative w-full">
						<input
							onChange={handlePhoneNumberChange}
							type="tel"
							value={phoneNumber}
							id="floating_outlined3"
							className="block w-full pt-2 pb-3 pl-4 pr-4 mb-0 ml-0 mr-0 text-base text-gray-900 bg-transparent border-gray-800 rounded-lg border dark:text-white focus:outline-none focus:ring-0 focus:border-[#EF522F] dark:border-gray-600 peer"
							placeholder=" "
							maxLength={10}
							minLength={10}
							required
						/>
						<label
							htmlFor="floating_outlined3"
							className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-[#f6e8dd] dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#EF522F] peer-focus:dark:text-[#EF522F] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
						>
							Phone number
						</label>
					</div>
					<div className="relative w-full">
						<input
							onChange={handlePasswordChange}
							type="tel"
							value={password}
							id="floating_outlined"
							className="block w-full pt-2 pb-3 pl-4 pr-[7rem] mb-0 ml-0 mr-0 text-base text-gray-900 bg-transparent border-gray-800 rounded-lg border dark:text-white focus:outline-none focus:ring-0 focus:border-[#EF522F] dark:border-gray-600 peer"
							placeholder=" "
							maxLength={4}
							minLength={4}
							required
						/>
						<label
							htmlFor="floating_outlined"
							className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-[#f6e8dd] dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-[#EF522F] peer-focus:dark:text-[#EF522F] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
						>
							Password
						</label>
					</div>
				</div>
			</div>
			<div
				onClick={result}
				className="fixed flex items-center justify-between w-full outline-none bottom-4 px-6 md:px-[20vw] lg:px-[40vw]"
			>
				<button className="bg-[#EF522F] w-full on_active_bounce capitalize py-2 rounded-full text-white">
					Login
				</button>
			</div>
		</div>
	);
}

export default Login;
