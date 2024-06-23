"use client"
import Footer from "@/assets/bonuscard/footer.png"
import Image from "next/image"
import { memo } from "react"


function PageComponent() {
	return (
		<div>
			<Image
				src={Footer}
				quality={95}
				width={480}
				height={480}
				alt="background"
				objectFit="cover"
			/>
			<section>
				<ol className="pt-8 pb-16 mx-4 space-y-2 text-sm custom-list">
					<li>Menu items, nutritional information and prices are set by the businesses. </li>
					<li>Refunds and application of rewards are managed by the businesses directly</li>
					<li>An average active adult requires 2,000 Kcal energy per day, however calorie needs may vary. </li>
				</ol>
			</section>
		</div>
	)
}

const PageName = memo(PageComponent)
export default PageName
