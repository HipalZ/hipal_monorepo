import Image from "next/image"
import React from "react"
import hand from "@assets/svg/hand.svg"
import iphone from "@assets/svg/iphone.svg"
import tiltedHand from "@assets/img/tilted_hand_lg.png"
import iphoneLg from "@assets/svg/iphone_lg.svg"
const IphoneBackground = () => {
	return (
		<>
			<div
				className="flex justify-center lg:hidden"
				style={{
					backgroundImage: `url('${hand.src}')`,
					backgroundSize: "cover",
					width: "100%",
				}}
			>
				<Image
					src={iphone}
					alt="iphone"
					height={627}
					width={360}
					className="mt-[1.2rem]"
					style={{ width: "100%" }}
				/>
			</div>
			<div
				className="hidden lg:flex lg:justify-center lg:ml-[4rem]"
				style={{
					backgroundImage: `url(${tiltedHand.src})`,
					backgroundSize: "cover",
					backgroundPosition: "left",
					width: "100%",
				}}
			>
				<Image src={iphoneLg} alt="iphone" height={832} width={571} className="mt-[2rem]" />
			</div>
		</>
	)
}

export default IphoneBackground
