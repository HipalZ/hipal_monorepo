import React, { memo } from "react";
import { MdMenuOpen } from "react-icons/md";
import { HiArrowLeft } from "react-icons/hi";
import { PAGE_TYPES, routePaths } from "@/components/utils/routes";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
	children: React.ReactNode;
	businessId: string;
	zoneId: string;
	setCurrentView: (str: string) => void;
}

function TableHeader({
	children,
	businessId,
	zoneId,
	setCurrentView,
}: HeaderProps) {
	const navigate = useNavigate();
	const handleRoute = () =>{
		navigate(routePaths[PAGE_TYPES.TABLES](businessId, zoneId))
	}
	return (
		<div className="flex justify-between pt-[2rem] w-full">
			<div onClick={handleRoute}>
				<HiArrowLeft className="text-2xl" />
			</div>
			{children}{" "}
			<MdMenuOpen onClick={() => setCurrentView("kick")} className="text-2xl" />
		</div>
	);
}

export default memo(TableHeader);
