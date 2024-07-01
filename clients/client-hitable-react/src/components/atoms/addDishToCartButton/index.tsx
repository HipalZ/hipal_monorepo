import { useBottomPanel } from "@/components/store/useBottomPanel";
import React from "react";
import { AlertVariant } from "../alertVariant";

const AddDishToCartButton = ({
	children,
	onClick,
	appendClassNames = "",
	...props
}: {
	appendClassNames?: string;
	onClick?: () => void;
	children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) => {
	const validationRef = useBottomPanel((state) => state.validationRef);
	const variantType = useBottomPanel((state) => state.variantType);
	const displayAlert = useBottomPanel((state) => state.displayAlert);

	return (
		<div className="fixed bottom-0 z-20 w-full py-2 rotate-180 shadow-lg bg-base-100 shadow-base-100">
			<div className="flex flex-col mx-auto rotate-180 justify-items-center">
				{displayAlert && <AlertVariant />}
				<button
					type="button"
					className={
						`${
							validationRef || variantType === "portion"
								? "bg-primary"
								: "bg-primary opacity-50"
						} min-h-[3rem] btn btn-md mx-auto font-semibold text-[1rem] rounded-full shadow-lg min-w-389 min-w-[95%] my-auto !py-2 ` +
						appendClassNames
					}
					onClick={onClick}
					onTouchStart={onClick}
					{...props}
					contentEditable={undefined}
				>
					{children}
				</button>
			</div>
		</div>
	);
};

export default AddDishToCartButton
