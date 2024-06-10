import React, { memo } from "react";
import { HiArrowLeft } from "react-icons/hi";

interface HeaderProps {
	children: React.ReactNode;
  goBack: () => void;
}

function Header({ children,goBack  }: HeaderProps) {

	return (
		<div className="flex justify-between ml-[1.5rem] pt-[1.5rem]">
			<HiArrowLeft
				onClick={goBack}
				className="mr-[1rem] text-2xl"
			/>
			{children}
      <div />
		</div>
	);
}

export default memo(Header);
