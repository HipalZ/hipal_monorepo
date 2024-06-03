import React, { memo } from "react";
import { BiShoppingBag } from "react-icons/bi"; // Ensure you have 'react-icons' installed
import { MdAdd } from "react-icons/md";
import type { SettlePageTypes } from "../settle/type";

function ClaimCoinzSelector({
	billData,
	users,
	selectedUser,
	setSelectedUser,
	setIsUserModalOpen,
	setIsModalOpen,
	handlePhoneNumberChange2,
	setFootButton,
}) {
	const addNumberToClaimCoinz = () => {
		const btn: SettlePageTypes = "HI_COINS";
		setIsUserModalOpen(false);
		setIsModalOpen(true);
		setFootButton(btn);
		setSelectedUser(null);
	};

	return (
		<div className="relative pb-12">
			<div className="flex justify-between mx-6 mt-4 text-sm font-semibold">
				<div>Select the users to claim coinz</div>
				<div>₹ {billData.Total}</div>
			</div>
			<div className="pb-[7rem]">
				{users
					.map((user) => (
						<div
							key={user.customerPhone}
							className={`flex items-center mt-4 mb-3 mx-6 py-2 px-2 rounded-xl ${
								selectedUser === user.customerPhone
									? "border-primary border-2"
									: "border-[#cacaca] border"
							}`}
							onClick={() => setSelectedUser(user.customerPhone)}
						>
							<input
								type="radio"
								name="users"
								value={user.customerPhone}
								checked={selectedUser === user.customerPhone}
								onChange={(e) => setSelectedUser(e.target.value)}
								className="cursor-pointer"
							/>
							<label className="ml-3 text-sm font-medium cursor-pointer">
								{user.customerName}
							</label>
						</div>
					))}
				<div
					onClick={addNumberToClaimCoinz}
					className="flex items-center px-2 py-2 mx-6 mt-4 mb-3 text-sm border border-[#cacaca] rounded-xl cursor-pointer"
				>
					<MdAdd className="mr-2" />
					<span>Add new user</span>
				</div>
			</div>

			<div className="fixed bottom-0 flex items-center justify-between w-full h-16 px-5 bg-primary">
				<div className="flex items-center">
					<BiShoppingBag color="#fff" size={24} />
					<h1 className="mx-2 text-sm font-semibold text-base-100">
						Hi Coinz added
					</h1>
				</div>
				<button
					type="button"
					onClick={() => handlePhoneNumberChange2(selectedUser)}
					className="text-primary font-semibold leading-[1.15rem] px-9 py-3 rounded-full bg-base-100"
				>
					Confirm
				</button>
			</div>
		</div>
	);
}

export default memo(ClaimCoinzSelector);
