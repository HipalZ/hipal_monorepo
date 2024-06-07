import { useStory } from "@components/store/useStory";
import React, { memo } from "react";

function BottomButton({
	children,
	onClick,
	appendClassNames = "",
	placingOrder=false,
	...props
}: {
	appendClassNames?: string;
	onClick?: () => void;
	children: React.ReactNode;
	placingOrder?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
	const { isStoryOn } = useStory();
	if (isStoryOn) {
		return null;
	}
	return (
		<div className="fixed bottom-0 z-20 w-[100%] max-w-[30rem] py-2 rotate-180 shadow-lg bg-base-100 shadow-base-100">
			<div className="flex flex-col mx-auto rotate-180 justify-items-center">
				<button
					className={`min-h-[3rem] w-[90%] max-w-[28rem] btn btn-primary btn-md mx-auto font-semibold text-[1rem] rounded-full shadow-lg my-auto !py-2 ${appendClassNames}`}
					onClick={onClick}
					aria-busy={placingOrder}
					disabled={placingOrder}
					{...props}
				>
					{children}
				</button>
			</div>
		</div>
	);
}

export default memo(BottomButton);
