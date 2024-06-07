import React, { memo } from "react";

function AddTipComponent({ tip, handleTipChange, addingTip }) {
	return (
		<div className="relative p-4 space-y-4 overflow-auto">
			<div className="font-medium">Add Tip</div>
			<div>
				<input
					type="number"
					value={tip}
					className="border border-[#79747E] w-full px-4 py-1 rounded-2xl focus:outline-none focus:ring-0"
					onChange={handleTipChange}
					max="10000"
				/>
			</div>
			<div className="flex items-center justify-end">
				<button
					type="button"
					onClick={addingTip}
					className="on_active_bounce flex items-center justify-center text-base-100 px-4 w-[25%] py-1 rounded-full bg-primary"
				>
					Add
				</button>
			</div>
		</div>
	);
}

export default memo(AddTipComponent);
