import Image from "next/image"
import { memo, useEffect, useState } from "react"
import Mixed from "@/assets/svg/Mixed.svg"

export type FOOD_TYPES = "veg" | "nonveg" | "vegan" | "egg" | "other"

function FoodType({ type }: { type: FOOD_TYPES }) {
	const [_type, setType] = useState("other")

	const classes = {
		veg: {
			border: "border-green-500",
			circle: "bg-green-500",
			text: "text-green-500",
		},

		egg: {
			border: "border-[#D2C903]",
			circle: "bg-[#D2C903]",
			text: "text-[#D2C903]",
		},
		nonveg: {
			border: "border-red-500",
			circle: "bg-red-500",
			text: "text-red-500",
		},
		vegan: {
			border: "border-[#02614b]",
			circle: "bg-[#02614b]",
			text: "text-[#02614b]",
		},
		other: {
			border: "border-gray-500",
			circle: "bg-gray-500",
			text: "text-gray-500",
		},
	}

	useEffect(() => {
		type &&
			Object.keys(classes)?.includes(type?.replace(/[^a-zA-Z ]/, "").toLowerCase()) &&
			setType(type?.replace(/[^a-zA-Z ]/, "").toLowerCase())
	}, [type])

	if (type?.toLowerCase() === "mixed") {
		return (
			<div className="flex flex-row -mt-2 -mb-8">
				<Image src={Mixed} width={20} height={4} alt="mixed" />
			</div>
		)
	}

	return (
		<div className="flex flex-row my-auto space-x-2 shrink-0">
			<div className={"flex flex-row w-5 h-5 border-2 " + classes[`${_type}`].border}>
				<div
					className={
						"p-1 m-auto rounded-full  w-[0.676rem] h-[0.676rem] " + classes[`${_type}`].circle
					}
				></div>
			</div>
		</div>
	)
}

export default memo(FoodType)
