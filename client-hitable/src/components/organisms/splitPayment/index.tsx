import React, { memo } from "react";
import { toast } from "react-toastify";

function SplitPaymentSelector({
	billData,
	paymentMethods,
	multiplePaymentMethods,
	handleMultiplePaymentMethodSelection,
	setIsSplitModalOpen,
	loading,
}) {
	return (
		<div className="relative min-h-[80vh]">
			<div className="flex justify-between mt-4">
				<div className="capitalize font-[500] ml-6 text-base-content">
					select payment methods
				</div>
				<div className="capitalize font-[500] mr-[1.5rem] text-base-content">
					₹ {billData[billData.length - 1]?.Total}
				</div>
			</div>
			<div className="mx-6 mt-4 space-y-4 overflow-y-auto max-h-[70vh] pb-[7rem]">
				{paymentMethods
					.filter(
						(method) =>
							method?.mode !== "dues" &&
							method?.mode !== "split payment" &&
							method?.mode !== "complimentary",
					)
					.map((method) => (
						<div
							key={method.id}
							className={`flex items-center px-4 py-2 border rounded-xl ${
								multiplePaymentMethods.includes(method?.mode)
									? "border-primary"
									: ""
							}`}
							onClick={() => handleMultiplePaymentMethodSelection(method?.mode)}
							onKeyDown={() =>
								handleMultiplePaymentMethodSelection(method?.mode)
							}
						>
							<input
								id={`method-${method.id}`}
								type="checkbox"
								checked={multiplePaymentMethods.includes(method?.mode)}
							/>
							<label
								htmlFor={`method-${method.id}`}
								className="ml-4 font-medium capitalize line-clamp-1"
							>
								{method?.mode}
							</label>
						</div>
					))}
			</div>

			<div className="w-full h-[4rem] bg-primary fixed bottom-0 z-20 py-2 shadow-lg shadow-base-100">
				<button
					type="button"
					onClick={() => {
						if (multiplePaymentMethods.length > 1) {
							setIsSplitModalOpen(true);
						} else {
							toast.error("Select at least 2 payment methods");
						}
					}}
					className={`absolute z-50 text-sm font-[500] px-4 py-2 mr-2 border-base-100 border text-primary bg-base-100 rounded-full right-6 bottom-3 ${
						loading ? "opacity-50 cursor-not-allowed" : ""
					}`}
					disabled={loading}
				>
					{loading ? "Loading..." : "Continue"}
				</button>
			</div>
		</div>
	);
}

export default memo(SplitPaymentSelector);
