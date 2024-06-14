import Loader from "@/components/atoms/loader";
import { IFinalBill } from "../settle/type";
import { memo } from "react";

interface PaymentModeSelectorProps {
	billData: IFinalBill;
	loading: boolean;
	paymentMethods: any[];
	selectedPaymentMethod: string;
	handlePaymentMethodSelection: (mode: string) => void;
	handleAmountChange: (e: any) => void;
	changeToGiveBack: number;
	finalClick: () => void;
}


const PaymentModeSelector = ({
	billData,
	loading,
	paymentMethods,
	selectedPaymentMethod,
	handlePaymentMethodSelection,
	handleAmountChange,
	changeToGiveBack,
	finalClick,
}:PaymentModeSelectorProps) => {

	return (
		<div className="relative min-h-[70vh]">
			<div className="flex justify-between mt-4">
				<div className="capitalize font-[500] ml-6 text-base-content">
					Payment Mode
				</div>
				<div className="capitalize font-[500] mr-[1.5rem] text-base-content">
					₹ {billData.Total}
				</div>
			</div>
			{loading ? (
				<div className="flex justify-center items-center h-[70vh]">
					<Loader />
				</div>
			) : (
				<div className="mx-6 mt-4 space-y-4 overflow-y-auto max-h-[70vh] pb-[7rem]">
					{paymentMethods.map((method) => (
						<div key={method._id}>
							<div
								className="flex items-center px-4 py-2 border rounded-xl"
								onClick={() => handlePaymentMethodSelection(method?.mode)}
							>
								<input
									id={`method-${method._id}`}
									type="checkbox"
									value={selectedPaymentMethod}
									checked={selectedPaymentMethod.split("_").join(" ").toLowerCase() === method?.mode}
								/>
								<div className="ml-4 font-medium capitalize line-clamp-1">
									{method?.mode}
								</div>
							</div>

							{selectedPaymentMethod.split("_").join(" ").toLowerCase() === method?.mode &&
								method?.mode === "cash" && (
									<div className="flex flex-col mt-2 space-y-2">
										<div className="flex items-center justify-between space-x-4">
											<label className="flex flex-col">
												<span className="mt-2 mb-2 text-sm font-medium">
													Cash In
												</span>
												<input
													type="text"
													placeholder="Enter amount"
													className="px-3 py-2 border rounded-xl focus:outline-none"
													onChange={handleAmountChange}
												/>
											</label>
											<label className="flex flex-col w-full">
												<span className="mt-2 mb-2 text-sm font-medium">
													Cash Out
												</span>
												<div className="w-full px-4 py-2 border rounded-lg">
													₹ {changeToGiveBack > 0 ? changeToGiveBack : 0}
												</div>
											</label>
										</div>
									</div>
								)}
						</div>
					))}
				</div>
			)}

			<div className="w-full h-[4rem] bg-primary fixed bottom-0 z-20 py-2 shadow-lg shadow-base-100">
				<button
					type="button"
					className="absolute px-4 text-base py-2 font-[500] text-base-100 bg-primary rounded-full bottom-3 left-2"
				>
					₹ Payment Modes
				</button>
				<button
					type="button"
					onClick={finalClick}
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
};

export default memo(PaymentModeSelector);
