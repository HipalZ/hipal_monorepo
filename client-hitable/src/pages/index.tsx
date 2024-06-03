import type React from "react";
import { useEffect } from "react";
import HiTableLogo from "../assets/svg/HiTableLogo.svg";
import welcome from "../assets/svg/welcomeLogo.svg";
import { isEmpty } from "lodash-es";
import Image from "next/image";
import { useLogin } from "@/components/store/useLogin";
import axios from "@/axios";
import { useRouter } from "next/router";
import { PAGE_TYPES, singleRoute } from "@/components/utils/routes";
import { toast } from "react-toastify";

function HiTable() {
	const { phoneNumber, setPhoneNumber } = useLogin();

	const userDetail = useLogin((s) => s.userDetails);
	const router = useRouter();
	const businessId = userDetail.customRole?.[0]?.businessId;
	
	const handlePhoneNumberChange = (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		setPhoneNumber(event.target.value);
	};

	useEffect(() => {
		if (businessId === undefined) {
			router.push("/");
		}
		if (businessId !== undefined && businessId !== "64b630b09f464445c1fbd169") {
			router.push(`/r/${businessId}/zone`);
		}
	}, []);

	const setUserDetails = useLogin((s) => s.setUserDetails);

	const result = async () => {
		try {
			const config = {
				method: "POST",
				url: "/v1/users/chef/Login?withBusinessId=false",
				data: {
					phone: phoneNumber,
				},
			};

			const user = await axios(config);
			const res = user.data;
			console.log(res);
			if (!isEmpty(res)) {
				setUserDetails(res);
			}
			if (user.status === 200) {
				router.push(
					`${singleRoute[PAGE_TYPES.LOGIN](
						`${user?.data?.customRole?.[0].businessId}`,
					)}`,
				);
				if (user?.data?.customRole?.[0].businessId) {
					toast.success(`Hi ${user?.data?.name}`);
				}
			}
		} catch (err) {
			console.log(err);
			toast.error("User not registered as staff!");
		}
	};
	return (
		<div>
			<div className="flex justify-center mt-[2rem]">
				<Image width={104} height={31} src={HiTableLogo} alt="Hi Table Logo" />
			</div>
			<div className="flex justify-center mt-[1rem] mx-[3.375rem]">
				<Image width={283} height={223} src={welcome} alt="Hi Table Logo" />
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
						type="text"
						id="floating_outlined"
						className="block w-full pt-2 pb-4 pl-4 pr-4 mb-0 ml-0 mr-0 text-base border border-gray-800 rounded-lg text-base-content bg-base-100 dark:text-base-100 focus:outline-none focus:border-primary dark:border-gray-600 peer"
						placeholder=" "
						maxLength={10}
						minLength={10}
						required
					/>
					<label
						htmlFor="floating_outlined"
						className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-base-100 dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-primary peer-focus:dark:text-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
					>
						Phone number
					</label>
				</div>
			</div>

			<div className="absolute flex items-center justify-center w-full px-6 bottom-4">
				<button
					onClick={result}
					type="button"
					className="w-full py-3 text-xl rounded-full text-base-100 md:w-1/2 lg:w-1/4 on_active_bounce bg-primary"
				>
					Login
				</button>
			</div>
		</div>
	);
}

export default HiTable;
