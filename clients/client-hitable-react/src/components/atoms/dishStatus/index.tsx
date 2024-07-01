import { IStatus } from "@/components/types/hiTableData";
import React from "react";
import { BiBowlRice } from "react-icons/bi";
import { MdDelete } from "react-icons/md";

type StatusKey = "delivered" | "cooked" | "deleted" | "default";
interface DishStatusProps {
	selectedDishStatus: IStatus | null;
}

const DishStatusComponent = ({
	selectedDishStatus,
}: DishStatusProps): JSX.Element => {
	if (!selectedDishStatus || !selectedDishStatus.dishStatus) {
		return <></>;
	}

	const statusConfig = {
		delivered: {
			bgColor: "#DBFFE2",
			iconColor: "#00BA34",
			textColor: "#00BA34",
			text: "delivered",
			icon: <BiBowlRice className="text-base-100" />,
		},
		cooked: {
			bgColor: "#E0EBFF",
			iconColor: "#5591FF",
			textColor: "#5591FF",
			text: "cooked",
			icon: <BiBowlRice className="text-base-100" />,
		},
		deleted: {
			bgColor: "#F5E5E5",
			iconColor: "#F04B4B",
			textColor: "#F04B4B",
			text: "deleted",
			icon: <MdDelete className="text-base-100" />,
		},
		default: {
			bgColor: "#FFF6DB",
			iconColor: "#FFC318",
			textColor: "#FFC318",
			text: "cooking",
			icon: <BiBowlRice className="text-base-100" />,
		},
	};

	const dishStatusKey = selectedDishStatus.dishStatus as StatusKey;

	let config = statusConfig[dishStatusKey] || statusConfig.default;

	if (selectedDishStatus?.isDeleted) {
		config = statusConfig.deleted;
	}

	return (
		<div className="mt-2">
			<button
				type="button"
				className="relative px-2 font-normal text-black rounded-full"
				style={{ backgroundColor: config.bgColor }}
			>
				<div className="inline-flex items-center justify-start">
					<div
						className="w-[1.5rem] flex justify-center items-center h-[1.5rem] rounded-full"
						style={{ backgroundColor: config.iconColor }}
					>
						{config.icon}
					</div>
					<div
						className="mb-[0.1rem] capitalize font-[500] text-lg pr-1 pl-1 ml-2 mr-4"
						style={{ color: config.textColor }}
					>
						{config.text}
					</div>
				</div>
			</button>
		</div>
	);
};

export default DishStatusComponent;
