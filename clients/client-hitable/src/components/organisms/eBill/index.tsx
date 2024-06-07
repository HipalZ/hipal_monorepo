import React, { memo } from "react";

function EBillComponent({
	billData,
	newPhoneNumber,
	setNewPhoneNumber,
	handleAddPhoneNumber,
	grouped_customers,
	handleCheckboxChange,
	selectedPhoneNumbers,
	formatPhoneNumber,
	sendBill,
	loading,
}) {
	return (
		<div className="relative min-h-[70vh] max-h-[70vh] overflow-auto">
			<div className="flex justify-between">
				<div className="capitalize font-[500] ml-6 mt-4 text-base-content">
					E-Bill
				</div>
				<div className="capitalize font-[500] mr-6 mt-3 text-base-content">
					₹ {billData.Total}
				</div>
			</div>
			<div className="mt-4 ml-6">
				<div className="flex mr-6">
					<div className="px-3 border rounded-l-full bg-primary border-primary text-base-100">
						+91
					</div>
					<input
						type="number"
						value={newPhoneNumber}
						onChange={(e) => setNewPhoneNumber(e.target.value)}
						maxLength={10}
						minLength={10}
						placeholder="Enter Phone Number"
						className="w-full pl-2 border-b border-b-primary focus:outline-none"
					/>
					<button
						type="button"
						onClick={handleAddPhoneNumber}
						className="px-2 border rounded-lg text-primary border-primary"
					>
						Add
					</button>
				</div>
				<div className="my-2 text-primary text-medium">Sent to</div>
				{grouped_customers &&
					Object.values(grouped_customers)
						.filter((ele: any) => ele?.customerPhone?.toString().length >= 11)
						.map((customer: any) => (
							<div
								onKeyUp={() => handleCheckboxChange(customer?.customerPhone)}
								onClick={() => handleCheckboxChange(customer?.customerPhone)}
								key={customer?.customerPhone}
								className="border border-[#cacaca] mt-2 py-2 px-4 rounded-xl mr-6 flex justify-between items-center"
							>
								<div>{customer?.customerNames}</div>
								<input
									type="checkbox"
									checked={selectedPhoneNumbers.includes(
										`91${customer?.customerPhone}`,
									)}
								/>
							</div>
						))}

				<div className="pb-[5rem] overflow-auto">
					<div className="mt-4 text-primary text-medium">Selected Numbers</div>
					{selectedPhoneNumbers.map((phone, i) => formatPhoneNumber(phone))}
				</div>
			</div>

			<div className="w-full h-[4rem] bg-primary fixed bottom-0 z-20 py-2 shadow-lg shadow-base-100">
				<button
					type="button"
					className="absolute px-4 text-base py-2 mr-2 font-[500]  text-base-100 bg-primary rounded-full bottom-3 left-6"
				>
					₹ Bill
				</button>
				<button
					type="button"
					onClick={sendBill}
					disabled={loading}
					className="absolute z-50 text-sm font-[500] px-4 py-2 mr-2 border-base-100 border text-primary bg-base-100 rounded-full right-6 bottom-3"
				>
					send
				</button>
			</div>
		</div>
	);
}

export default memo(EBillComponent);
