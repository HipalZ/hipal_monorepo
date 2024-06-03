import React, { memo, useState } from "react";
import { BsChevronLeft } from "react-icons/bs";
import Hi from "@/assets/svg/hi.svg";
import Header from "@/components/molecules/header";
import { MdPerson } from "react-icons/md";
import { useRouter } from "next/router";
import axios from "@/axios";
import type { UserProfile } from "@/components/types/businessData";
import { paths } from "@/components/utils/paths";
import PopUp from "@/components/atom/popUp";
import AddStaffPopup from "@/components/molecules/addStaffpopup";
import { useOwnerLogin } from "@/components/store/useOwnerLogin";
import { useSelectedIcon } from "@/components/store/useSelectedIcon";
import LoadingSpinner from "@/components/atom/loadingSpinner";
import { useQuery } from "@tanstack/react-query";
import ErrorComponent from "@/components/errorComponent";

function Staff() {
	const router = useRouter();
	const user = useOwnerLogin((s) => s.user);
	const { businessId } = router.query as { businessId: string };
	const [staffDetails, setStaffDetails] = useState<UserProfile[]>([]);
	const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
	const handleStaffDetails = (staffId: string) => {
		router.push(`/business/${businessId}/staff/${staffId}`);
	};
	const addStaff = () => {
		setIsAddStaffOpen(true);
	};

	const getStaff = async () => {
		const url = paths.getAllStaff(businessId);

		try {
			const response = await axios.get(url);
			const filteredStaff = response.data.filter(
				(staff: UserProfile) => staff.id !== user.id,
			);
			setStaffDetails(filteredStaff);
			return response.data;
		} catch (error) {
			console.error("Error fetching staff details:", error);
		}
	};

	const {isLoading, error, data, refetch} =  useQuery({
		queryKey: ['staff', businessId],
		queryFn: getStaff,
		enabled: !!businessId,
	})

	if(error) return <ErrorComponent refetch={refetch}/>

	const StaffDashboard = memo(() => {
		const { setSelectedIcon } = useSelectedIcon();
		return (
			<>
				<div className="bg-white md:px-[10vw] lg:px-[10vw]">
					<div className="bg-[#f5f5f5] sticky top-0 z-50 w-full border-b border-[#CACACA]">
						<Header
							title="Staff"
							onBack={() => {
								setSelectedIcon("");
							}}
							leftIcon={<BsChevronLeft />}
							centerImage={Hi}
							rightImage={Hi}
							isIconBusinessShow={user.role !== "RESTAURANT_MANAGER"}
						/>
						<div className="mx-6 mt-6 text-2xl font-normal text-[#2B354D] pb-4 rounded-lg">
							Dashboard
						</div>
					</div>

					{staffDetails && staffDetails.length > 0 ? (
						<div className="grid grid-cols-1 pb-[5rem] md:gap-4 lg:gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
							{staffDetails.map((staff: UserProfile) => (
								<div
									onKeyDown={()=>handleStaffDetails(staff?.id)}
									key={staff.id}
									onClick={() => handleStaffDetails(staff?.id)}
									className="mx-6 mt-6 on_active_bounce bg-white text-[#2B354D] rounded-lg border border-[#cacaca] font-medium capitalize"
								>
									<div className="flex items-center px-4 py-2">
										<MdPerson className="mr-2" />
										<span>{staff?.name}</span>
									</div>
									<div className="flex items-center justify-between px-4 py-2">
										<span className="ml-1 text-sm opacity-60">
											{staff?.customRole?.[0]?.roleName}
										</span>
										<span>Manage</span>
									</div>
								</div>
							))}
						</div>
					) : (
						<div>
							{!isLoading && !staffDetails.length && (
								<div className="fixed transform -translate-x-1/2 top-1/2 left-1/2 text-center flex flex-col">
									No User Found
								</div>
							)}
						</div>
					)}
				</div>
				<div
					onClick={addStaff}
					onKeyDown={addStaff}
					className="fixed flex items-center justify-between w-full outline-none bottom-4 px-6 md:px-[20vw] lg:px-[40vw]"
				>
					<button
						type="button"
						className="bg-[#2B354D] w-full on_active_bounce capitalize py-2 rounded-md text-white"
					>
						Add Staff
					</button>
				</div>
				{isAddStaffOpen && (
					<PopUp show={isAddStaffOpen} onClose={() => setIsAddStaffOpen(false)}>
						<AddStaffPopup
							businessId={businessId}
							onClose={() => setIsAddStaffOpen(false)}
							staffDetails={staffDetails}
							getStaff={getStaff}
						/>
					</PopUp>
				)}
				{isLoading && <LoadingSpinner />}
			</>
		);
	});
	StaffDashboard.displayName = "StaffDashboard"
	return (
		<>
			<StaffDashboard />
		</>
	);
}

export default memo(Staff);
