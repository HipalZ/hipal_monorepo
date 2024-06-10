import { IFinalBill } from "@/components/organisms/settle/type";
import React, { useState } from "react";

type RemoveServiceTaxProps = {
	removeServiceTax: (password: string, action: boolean) => void;
	updatedBillData: IFinalBill;
};

const RemoveServiceTax: React.FC<RemoveServiceTaxProps> = ({
	removeServiceTax,
	updatedBillData,
}) => {
	const [password, setPassword] = useState("");

	return (
		<div className="mx-6">
			<div className="mt-4 font-semibold">
				Please enter password for{" "}
				{updatedBillData && !updatedBillData.serviceCharge ? "Add" : "remove"}{" "}
				service charge
			</div>
			<input
				type="password"
				value={password}
				onChange={(e) => setPassword(e.target.value)}
				className="w-full p-2 mt-4 border rounded-md"
				placeholder="Enter Password"
			/>
			<div className="flex justify-between gap-4 pb-4 mt-6">
				{updatedBillData && !updatedBillData.serviceCharge ? (
					<button
						type="button"
						onClick={() => {
							removeServiceTax(password, false);
							setPassword("");
						}}
						className="w-full px-6 py-3 text-sm bg-primary text-base-100 rounded-3xl"
					>
						Add
					</button>
				) : (
					<button
						type="button"
						onClick={() => {
							removeServiceTax(password, true);
							setPassword("");
						}}
						className="w-full px-6 py-3 text-sm bg-primary text-base-100 rounded-3xl"
					>
						Remove
					</button>
				)}
			</div>
		</div>
	);
};

export default RemoveServiceTax;
