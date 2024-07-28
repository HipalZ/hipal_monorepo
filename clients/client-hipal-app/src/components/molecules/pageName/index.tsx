"use client"
import Image from "next/image"
import { memo } from "react"
import Footer from "@/assets/footer.png"


type Props = {
	endBannerUrl: string | undefined;
}

function PageComponent(props:Props) {
	const { endBannerUrl } = props;
	const onBoardBusiness = () => {
		window.open("https://wa.me/9177914130", "_blank");
	}
	return (
		<div className="pt-6 bg-base-100">
			<Image
				onClick={onBoardBusiness}
				src={Footer}
				quality={95}
				width={480}
				height={480}
				alt="background"
				objectFit="cover"
			/>
			{/* <section>
				<ol className="pt-8 pb-16 mx-4 space-y-2 text-sm custom-list">
					<li>Menu items, nutritional information and prices are set by the businesses. </li>
					<li>Refunds and application of rewards are managed by the businesses directly</li>
					<li>An average active adult requires 2,000 Kcal energy per day, however calorie needs may vary. </li>
				</ol>
			</section> */}
		</div>
	)
}

const PageName = memo(PageComponent)
export default PageName
