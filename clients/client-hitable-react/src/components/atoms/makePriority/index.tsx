import { IUserLogin, useLogin } from "@/components/store/useLogin";
import type { IStatus } from "@/components/types/hiTableData";
import axios from "@/components/utils/axios";
import React from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

interface DeleteConfirmationProps {
	closeModal: () => void;
	selectedDishStatus: IStatus | null;
	kotId: string | undefined;
	getAllStatusData: () => void;
	onConfirm: (str: string) => void;
}

const Priority = ({
	closeModal,
	selectedDishStatus,
	kotId,
	getAllStatusData,
	onConfirm,
}: DeleteConfirmationProps): JSX.Element => {
	const userDetails = useLogin((s) => s.userDetails) as IUserLogin;
	const { businessId } = useParams() as { businessId: string };
	const updatePriority = async (kotId: string, businessId: string) => {
		try {
			const response = await axios.put(
				`/v1/kitchens/${kotId}/updateSingleKot`,
				{
					businessId: businessId,
					priority: true,
				},
			);

			if (response.status === 200) {
				toast.success(`Making ${selectedDishStatus?.dish?.name} a priority`);
				onConfirm("Priority");
				return true;
			}
			toast.error("Failed to update priority");
			throw new Error("Failed to update priority");
		} catch (error: any) {
			const errorMessage = error.response?.data?.message || error.message;
			toast.error(errorMessage);
			return false;
		}
	};

	const handleCookFast = async () => {
		if (!kotId || !businessId || !userDetails.customRole[0].businessId) {
			toast.error("Missing kotId or businessId");
			return;
		}
		const success = await updatePriority(
			kotId,
			businessId || userDetails.customRole[0].businessId,
		);
		if (success) {
			closeModal();
			getAllStatusData();
		}
	};

	return (
		<div className="bg-secondary p-6 rounded-t-[1.5rem] ">
			<h3 className="text-xl mb-2 font-medium text-[#2B354D]">
				Sure you want to make this item first?
			</h3>
			<p className="text-sm mb-4 opacity-80 text-[#2B354D] pb-12">
				The selected item will be highlighted to Kitchen Display System to be
				cooked in priority
			</p>

			<div className="flex justify-between space-x-6">
				<button
					type="button"
					onClick={() => {
						console.log("Cancel button clicked");
						closeModal();
					}}
					className="font-medium text-[#2B354D] px-6 py-2 rounded-lg on_active_bounce"
				>
					Cancel
				</button>
				<button
					type="button"
					onClick={() => {
						handleCookFast();
					}}
					className="w-full px-4 py-2 bg-primary text-base-100 rounded-3xl on_active_bounce"
				>
					Cook Fast
				</button>
			</div>
		</div>
	);
};

export default Priority;
