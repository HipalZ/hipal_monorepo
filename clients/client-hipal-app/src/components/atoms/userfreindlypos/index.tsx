import div1 from "@public/homePageImages/div-2.png"
import i10 from "@public/homePageImages/user.jpeg"
import React, { memo } from "react"
import Image from "next/image"
import { GoArrowRight } from "react-icons/go"

function UserFreindlyPOS() {
	return (
		<>
			<div className="grid md:grid-cols-2 text-left bg-amber-400 mx-5 rounded-[60px] gap-4 mt-10  justify-items-center sm:grid-cols-12">
				<div className="p-10 mt-12 ">
					{" "}
					<Image width={400} height={300} className="w-[400px]" src={i10} alt="" />
				</div>
				<div className="p-10 mt-12">
					{" "}
					<div className="flex">
						<div>
							<Image width={50} height={50} src={div1} alt="" />
						</div>
						<div>
							<h1 className="text-2xl font-medium mx-2 text-[25px] md:mt-1 md:text-[30px]">
								User friendly Point of Sale
							</h1>{" "}
						</div>
					</div>
					<p className="mt-1 text-justify">
						<GoArrowRight className="inline-flex t" /> A user-friendly point of sale (POS) system is
						designed to be intuitive and easy to navigate for both employees and customers. <br />
						<GoArrowRight className="inline-flex" /> It has a simple interface, which allows for
						fast and efficient processing of transactions. <br />
						<GoArrowRight className="inline-flex" /> The system is easy to use, with minimal
						training required.{" "}
					</p>
				</div>
			</div>
		</>
	)
}

const MemoUserFriendlyPOS = memo(UserFreindlyPOS)
export default MemoUserFriendlyPOS
