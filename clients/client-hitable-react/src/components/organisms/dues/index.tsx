import { memo } from "react";
import { IFinalBill } from "../settle/type";

interface DuesUserSelectorProps {
	billData: IFinalBill;
	duesPersons: any[];
	handleUserSelection: (name: string, id: string) => void;
	selectedPerson: any;
	finalClick: () => void;
	loading: boolean;
}

function DuesUserSelector({
	billData,
	duesPersons,
	handleUserSelection,
	selectedPerson,
	finalClick,
	loading,
}:DuesUserSelectorProps) {
	return (
		<div className="relative min-h-[80vh]">
			<div className="flex justify-between mt-4">
				<div className="capitalize font-[500] ml-6 text-base-content">
					select user
				</div>
				<div className="capitalize font-[500] mr-[1.5rem] text-base-content">
					₹ {billData.Total}
				</div>
			</div>
			<div className="mx-6 mt-4 space-y-4 overflow-y-auto max-h-[70vh]">
				{duesPersons.map((person) => (
					<div
						key={person._id}
						onClick={() =>
							handleUserSelection(person.duesPersonNames, person._id)
						}
						className="flex items-center justify-between py-2 pr-4 border cursor-pointer rounded-xl"
					>
						<label className="ml-4 font-medium capitalize line-clamp-1">
							{person?.duesPersonNames}
						</label>
						<input
							type="checkbox"
							value="0"
							checked={selectedPerson?._id === person._id}
							onChange={() =>
								handleUserSelection(person.duesPersonNames, person._id)
							}
						/>
					</div>
				))}
			</div>

			<div className="w-full h-[4rem] bg-primary fixed bottom-0 z-20 py-2 shadow-lg shadow-base-100">
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
}

export default memo(DuesUserSelector);
