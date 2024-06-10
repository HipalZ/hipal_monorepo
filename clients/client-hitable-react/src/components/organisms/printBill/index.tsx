import { memo } from "react";
interface PrintBillComponentProps {
	sendPrintBill: () => void;
	closeModal: () => void;
}

const PrintBillComponent = ({ sendPrintBill, closeModal }:PrintBillComponentProps) => {
	return (
		<div className="relative pb-12 mx-6 mt-6">
			<div className="font-semibold">Print bill</div>
			<p className="text-sm opacity-70">Do you want print bill?</p>
			<button
				type="button"
				onClick={() => {
					sendPrintBill();
					closeModal();
				}}
				className="absolute z-50 text-sm font-[500] px-6 py-2 mr-2 border-base-100 border bg-primary text-base-100 rounded-full right-0 bottom-6"
			>
				Print
			</button>
		</div>
	);
};

export default memo(PrintBillComponent);
