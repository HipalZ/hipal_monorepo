import React from "react";
import { MdTableRestaurant } from "react-icons/md"; // Ensure you have installed react-icons
import { BiRupee } from "react-icons/bi";
import { IoReceiptOutline } from "react-icons/io5";
import { ICurrentView } from "@/pages/r/[businessId]/zone";

interface IFooterProps {
	setCurrentView: (view: ICurrentView) => void;
	currentView: string;
}

const Footer: React.FC<IFooterProps> = ({ setCurrentView, currentView }) => {
	return (
		<div className="fixed bottom-0 z-20 w-full bg-primary">
			<div className="flex items-center py-2 justify-evenly">
				<div className="flex flex-col items-center">
					<button
						type="button"
						onClick={() => setCurrentView("zone")}
						className={`px-6 py-2 rounded-full ${
							currentView === "zone"
								? "bg-base-100/50 text-primary"
								: "text-base-100"
						} `}
					>
						<MdTableRestaurant className="text-xl " />
					</button>
					<span className="text-base-100">Zones</span>
				</div>
				<div className="flex flex-col items-center text-base-100">
					<button
						type="button"
						onClick={() => setCurrentView("sale")}
						className={`px-6 py-2 rounded-full ${
							currentView === "sale"
								? "bg-base-100/50 text-primary"
								: "text-base-100"
						} `}
					>
						<BiRupee className="text-xl" />
					</button>
					<span className="text-base-100">Sales</span>
				</div>
				<div className="flex flex-col items-center text-base-100">
					<button
						type="button"
						onClick={() => setCurrentView("bills")}
						className={`px-6 py-2 rounded-full ${
							currentView === "bills"
								? "bg-base-100/50 text-primary"
								: "text-base-100"
						} `}
					>
						<IoReceiptOutline className="text-xl" />
					</button>
					<span className="text-base-100">Bills</span>
				</div>
			</div>
		</div>
	);
};

export default Footer;
