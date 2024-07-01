import { memo } from "react";
import type { IFinalBill, SettlePageTypes } from "../settle/type";

const TotalBill = ({
	billData,
	openModal,
}: { billData: IFinalBill; openModal: (str: SettlePageTypes) => void }) => {
	return (
		<div>
			{billData && (
				<div className="relative">
					{billData.serviceChargeRemovedBy &&
						billData.serviceChargeRemovedBy !== "" && (
							<div className="flex justify-between pb-4 mx-4 text-sm capitalize text-primary">
								<h6>S.C Removed By {billData.serviceChargeRemovedBy}</h6>
								<button
									onClick={() => openModal("REMOVE_SERVICE_TAX")}
									type="button"
								>
									Add
								</button>
							</div>
						)}
					{billData.serviceChargeAddedBy &&
						billData.serviceChargeAddedBy !== "" && (
							<div className="flex justify-between pb-4 mx-4 text-sm capitalize text-primary">
								<h6>S.C Added By {billData.serviceChargeAddedBy}</h6>
							</div>
						)}
					<div className="flex justify-between mx-4 capitalize font-[600] text-base-content">
						<div>Sub Total</div>
						<div>₹ {billData?.subTotal}</div>
					</div>
					{billData?.discount > 0 && (
						<div className="flex justify-between mx-4 mt-1 text-sm capitalize text-base-content">
							<div className="w-[80%]">
								Discount <span>({billData.discountGivenBy})</span>{" "}
							</div>
							<div>₹ {billData?.discount}</div>
						</div>
					)}
					{billData?.claimedAmount > 0 && (
						<div className="flex justify-between mx-4 mt-1 text-sm capitalize text-base-content">
							<div>Claimed amount</div>
							<div>₹ {billData?.claimedAmount}</div>
						</div>
					)}
					{Number(billData?.serviceCharge) > 0 && (
						<div className="flex justify-between mx-4 mt-1 text-sm capitalize text-base-content">
							<div>Service Charge</div>
							<div>₹ {billData?.serviceCharge}</div>
						</div>
					)}
					<div className="flex justify-between mx-4 mt-1 text-sm capitalize text-base-content">
						<div>cgst</div>
						<div>₹ {billData?.SGST?.toFixed(2)}</div>
					</div>
					<div className="flex justify-between mx-4 mt-1 text-sm capitalize text-base-content">
						<div>sgst</div>
						<div>₹ {billData?.CGST?.toFixed(2)}</div>
					</div>
					{Number(billData?.tips) > 0 && (
						<div className="flex justify-between mx-4 mt-1 text-sm capitalize text-base-content">
							<div className="w-[80%]">
								Tips <span>({billData.tipsGivenBy})</span>{" "}
							</div>
							<div>₹ {billData?.tips}</div>
						</div>
					)}
					<div className="flex justify-between pt-2 pb-4 mx-4 text-xl font-bold capitalize text-base-content">
						<div>Total</div>
						<div>₹ {billData?.Total}</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default memo(TotalBill);
