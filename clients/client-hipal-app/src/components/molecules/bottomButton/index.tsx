"use client"
import { IThemes } from "@/components/types/businessData"
import React, { memo } from "react"
import { MdOutlineMenuBook } from "react-icons/md"
import { AiFillHome } from "react-icons/ai";

function BottomButton({
	children,
	themes,
	onClick,
	appendClassNames = "",
	placingOrder = false,
	...props
}: {
	appendClassNames?: string
	themes: IThemes,
	onClick?: () => void
	children: React.ReactNode
	placingOrder?: boolean
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {

	return (
		<>
			<center className="fixed bottom-0 z-20 flex items-center justify-between p-4 bg-base-100 w-full max-w-[30rem]">
				<center role="button" className="text-sm">
					<AiFillHome size={22} />	Home
				</center>
				<center role="button" className="text-sm">
					<MdOutlineMenuBook size={22} />	Pay Bill
				</center>
				<button type="button" className="flex items-center justify-center w-[40%] py-4 rounded-full text-base-100 bg-primary text-sm">
					<MdOutlineMenuBook size={22} /> &nbsp;	Menu
				</button>
			</center>
		</>
	)
}

export default memo(BottomButton)
