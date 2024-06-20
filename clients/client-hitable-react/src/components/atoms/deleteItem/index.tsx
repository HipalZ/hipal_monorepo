import { useState, memo } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { useQuery } from "@tanstack/react-query";
import { DeleteData } from "../deleteMultipleDishes";
import { useParams } from "react-router-dom";
import axios from "@/components/utils/axios";

interface DeleteItemComponentProps {
	deleteData: DeleteData;
	incorrectPassword: boolean;
	handleUpdateDeleteData: (newValues: Partial<DeleteData>) => void;
}
interface User {
	_id: string;
	name: string;
}

const DeleteItemComponent = ({
	deleteData,
	handleUpdateDeleteData,
	incorrectPassword,
}: DeleteItemComponentProps): JSX.Element => {
	const [showPassword, setShowPassword] = useState<boolean>(false);
	const { businessId } = useParams<{
		businessId: string;
	}>();

	const updateReason = (e: React.ChangeEvent<HTMLInputElement>) => {
		handleUpdateDeleteData({ reasonForDelete: e.target.value });
	};

	const updateStaffResponsible = (e: React.ChangeEvent<HTMLSelectElement>) => {
		handleUpdateDeleteData({ staffName: e.target.value });
		handleUpdateDeleteData({ staffResponsible: e.target.value });
	};

	const updateInventory = (e: React.ChangeEvent<HTMLSelectElement>) => {
		handleUpdateDeleteData({ inventory: e.target.value });
	};

	const updatePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
		handleUpdateDeleteData({ password: e.target.value });
	};

	const fetchUsers = async () => {
		try {
			const response = await axios(`/v1/users/${businessId}`);
			const data = await response.data.data;
			if (deleteData.staffResponsible === "") {
				handleUpdateDeleteData({ staffResponsible: data[0].name });
				handleUpdateDeleteData({ staffName: data[0].name });
			}
			return data;
		} catch (error) {
			console.error("Failed to fetch users", error);
		}
	};

	const { data, isLoading } = useQuery({
		queryKey: ["users", businessId],
		queryFn: fetchUsers,
		enabled: !!businessId,
	});

	if (isLoading) return <div>Loading...</div>;

	return (
		<form className="pb-[5rem] bg-base-100 shadow-lg rounded-t-3xl">
			<div className="mx-6 mt-4">
				<h1 className="mb-2 font-semibold">
					Are you sure, you want to delete item?
				</h1>
				<p className="mb-4 text-xs opacity-60">
					Deleting an item will result in removing it from running order and
					from kitchen.
				</p>
			</div>

			<div className="mx-6 mb-4">
				<input
					type="text"
					value={deleteData.reasonForDelete}
					onChange={updateReason}
					className="w-full py-2 pl-4 pr-10 mb-0 ml-0 mr-0 bg-base-100 text-base text-gray-900 bg-transparent border-gray-800 rounded-2xl border dark:text-base-100 focus:outline-none focus:border-[#4071F1] dark:border-gray-600"
					placeholder="Reason for deletion"
				/>
			</div>
			<div className="relative pb-4 mx-6">
				<label className="block mb-2 text-sm font-semibold">
					Password for deleting
				</label>
				<input
					type={showPassword ? "text" : "password"}
					value={deleteData.password}
					onChange={updatePassword}
					className={`w-full py-2 pl-4 pr-10 mb-0 ml-0 mr-0 bg-base-100 bg-transparent rounded-2xl border focus:outline-none dark:border-gray-600 ${
						!incorrectPassword
							? "border-red-500"
							: "border-gray-800 focus:border-[#4071F1]"
					}`}
					placeholder="Enter Password"
					required
				/>

				<button
					type="button"
					onClick={() => setShowPassword((prev) => !prev)}
					className="absolute flex items-center justify-center w-6 h-6 text-[#2C2C2C] rounded-full bottom-6 right-2 focus:outline-none"
				>
					{showPassword ? (
						<AiOutlineEyeInvisible className="text-base" />
					) : (
						<AiOutlineEye className="text-base" />
					)}
				</button>
			</div>
			{!incorrectPassword && (
				<small
					id="invalid-password"
					className="block mx-6 mb-2 -mt-4 text-red-500"
				>
					Wrong password
				</small>
			)}

			<div className="mb-4 text-[#2C2C2C] mx-6">
				<label className="block mb-2 text-sm font-semibold">
					Staff Responsible
				</label>
				<select
					value={deleteData.staffResponsible || data?.[0]?.name}
					onChange={updateStaffResponsible}
					className="w-full py-2 pl-4 pr-10 mb-0 ml-0 mr-0 bg-base-100 text-base text-gray-900 bg-transparent border-gray-800 rounded-2xl border dark:text-base-100 focus:outline-none focus:border-[#4071F1] dark:border-gray-600"
				>
					{data &&
						data.map((user: User) => (
							<option value={user.name} key={user._id}>
								{user.name}
							</option>
						))}
				</select>
			</div>

			<div className="mx-6 mb-4">
				<label className="block mb-2 text-sm font-semibold">Inventory</label>
				<select
					value={deleteData.inventory}
					onChange={updateInventory}
					className="w-full py-2 pl-4 pr-10 mb-0 ml-0 mr-0 bg-base-100 text-base text-gray-900 bg-transparent border-gray-800 rounded-2xl border dark:text-base-100 focus:outline-none focus:border-[#4071F1] dark:border-gray-600"
				>
					<option value="used">Used</option>
					<option value="not used">Not used</option>
				</select>
			</div>
		</form>
	);
};

export default memo(DeleteItemComponent);
