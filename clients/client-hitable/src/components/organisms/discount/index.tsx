import React, { memo } from "react";

function DiscountComponent({
	billData,
	discountMode,
	handleDiscountModeChange,
	discountValue,
	handleDiscountChange,
	discountDescription,
	setDiscountDescription,
	setDiscount,
	removeDiscount,
	setIsModalOpen,
	applyDiscount,
}) {
	return (
		<div className="relative min-h-[40vh]">
			<div className="flex justify-between mx-6">
				<div className="capitalize font-[500] mt-4 text-base-content">
					Discount
				</div>
				<div className="capitalize font-[500] mt-3 text-base-content">
					₹ {billData.Total}
				</div>
			</div>
			<div className="flex items-center mt-4 ml-6">
				<select
					value={discountMode}
					onChange={handleDiscountModeChange}
					className="rounded-l-full custom-select focus:outline-none focus:ring-0"
				>
					<option value="rupees">₹</option>
					<option value="percent">%</option>
				</select>
				<input
					className="border max-w-full min-w-[75%] font-[500] focus:outline-none focus:ring-0 text-sm focus:border-primary pl-4 border-primary rounded-r-full h-[32px]"
					type="number"
					value={discountValue}
					onChange={handleDiscountChange}
				/>
			</div>
			<div className="mx-6 mt-4">
				<label
					htmlFor="discountDescription"
					className="block text-sm font-medium text-gray-700"
				>
					Enter comment for discount
				</label>
				<input
					id="discountDescription"
					type="text"
					value={discountDescription}
					onChange={(e) => setDiscountDescription(e.target.value)}
					className="block min-w-full mt-2 py-1 px-2 border border-[#79747E] rounded-lg focus:outline-none focus:ring-0"
					placeholder="Enter reason for discount"
					required
				/>
			</div>
			<div
				className={`${
					billData.subTotal > 0 ? "" : "hidden"
				} w-full h-[4rem] bg-primary flex justify-evenly items-center fixed bottom-0 z-20 py-2 shadow-lg shadow-base-100`}
			>
				<button
					type="button"
					className="px-4 text-base py-2 mr-2 font-[500] text-base-100 bg-primary rounded-full"
				>
					₹ Discount
				</button>
				<button
					type="button"
					onClick={removeDiscount}
					className="z-50 text-sm font-[500] px-4 py-2 mr-2 border-base-100 border text-primary bg-base-100 rounded-full"
				>
					Remove
				</button>
				<button
					type="button"
					onClick={applyDiscount}
					className="z-50 text-sm font-[500] px-4 py-2 mr-2 border-base-100 border text-primary bg-base-100 rounded-full"
				>
					Apply Discount
				</button>
			</div>
		</div>
	);
}

export default memo(DiscountComponent);
