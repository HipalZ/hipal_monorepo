import Image from "next/image"
import React from "react"
import CustomizableDigitalMenu from "assets/allPng/Group 166.png"
import PosBillingSoftware from "assets/allPng/Pos billing Software.png"
import KitchenDisplay from "assets/allPng/kitchenDisplaySystem.png"
import CentralizedDashboard from "assets/allPng/centralizedDashBoardSystem.png"

function Services() {
	return (
		<div>
			<div className="flex flex-col lg:flex-row px-[1.5rem] lg:px-[5.25rem] lg:pt-[6rem]">
				<div
					style={{ fontFamily: "Josefin Sans" }}
					className="block lg:hidden font-[700] text-[1.9rem] mt-[3.13rem] leading-[1.7rem]"
				>
					Customizable Digital Menu
				</div>
				<div className="pt-[2rem] pl-0 lg:pl-[8rem] lg:pt-0">
					<Image
						className="w-[21.733rem] h-[19.79rem] lg:w-[28.74rem] lg:h-[26.176rem]"
						src={CustomizableDigitalMenu}
						alt="Customizable Digital Menu"
					/>
				</div>
				<div className="px-[1rem] lg:w-[35rem] lg:pl-[3.3rem] pt-[1rem] lg:pt-[5.2rem]">
					<div
						style={{ fontFamily: "Josefin Sans" }}
						className="hidden lg:block font-[700] pl-0 lg:pl-[2rem] text-[1.9rem] lg:text-[2.9rem] leading-[1.7rem] lg:leading-[3rem]"
					>
						Customizable Digital Menu
					</div>
					<div
						style={{ fontFamily: "Josefin Sans" }}
						className="pl-0 lg:pl-[3rem] font-[400] pt-1 text-[1.1rem] lg:text-[1.25rem] lg:pt-[1rem] leading-[1.8rem] lg:leading-[2.1rem]"
					>
						<ol className="list-disc">
							<li>Build your Well Crafted Menu.</li>
							<li>Customize Theme , colour, button etc.</li>
							<li>Dynamic Pricing.</li>
							<li>Add categories and sub categories to your menu.</li>
							<li>Upload new status to engage your customers.</li>
						</ol>
					</div>
				</div>
			</div>

			<div className="flex flex-col lg:flex-row-reverse px-[1.5rem] lg:px-[10.75rem] lg:pt-[6rem]">
				<div
					style={{ fontFamily: "Josefin Sans" }}
					className="block lg:hidden font-[700] text-[1.9rem] mt-[3.13rem] leading-[1.7rem]"
				>
					POS Billing Software
				</div>
				<div className="pt-[2rem] pr-0 lg:pt-0">
					<Image
						className="w-[21.733rem] h-[19.79rem] lg:w-[28.74rem] lg:h-[26.176rem]"
						src={PosBillingSoftware}
						alt="POS Billing Software Menu"
					/>
				</div>
				<div className="px-[1rem] lg:w-[35rem] pr-0 lg:pr-[3.3rem] pt-[1rem] lg:pt-[5.2rem]">
					<div
						style={{ fontFamily: "Josefin Sans" }}
						className="hidden lg:block font-[700] pr-0 lg:pr-[2rem] text-[1.9rem] lg:text-[2.9rem] leading-[1.7rem] lg:leading-[3rem]"
					>
						POS Billing Software
					</div>
					<div
						style={{ fontFamily: "Josefin Sans" }}
						className="pr-0 lg:pr-[3rem] font-[400] pt-1 text-[1.1rem] lg:text-[1.25rem] lg:pt-[1rem] leading-[1.8rem] lg:leading-[2.1rem]"
					>
						<ol className="list-disc">
							<li>Eliminate traffic jam at the countertop POS with table ordering and payments.</li>
							<li>Take orders and countless payments from anywhere.</li>
							<li>Simple and Easy to use.</li>
							<li>Bill customize order according to table and zones.</li>
							<li>View status of orders..</li>
						</ol>
					</div>
				</div>
			</div>

			<div className="flex flex-col lg:flex-row px-[1.5rem] lg:px-[5.25rem] lg:pt-[6rem]">
				<div
					style={{ fontFamily: "Josefin Sans" }}
					className="block lg:hidden font-[700] text-[1.9rem] mt-[3.13rem] leading-[1.7rem]"
				>
					Kitchen Display System
				</div>
				<div className="pt-[2rem] pl-0 lg:pl-[8rem] lg:pt-0">
					<Image
						className="w-[21.733rem] h-[19.79rem] lg:w-[28.74rem] lg:h-[26.176rem]"
						src={KitchenDisplay}
						alt="Customizable Digital Menu"
					/>
				</div>
				<div className="px-[1rem] lg:w-[35rem] lg:pl-[3.3rem] pt-[1rem] lg:pt-[5.2rem]">
					<div
						style={{ fontFamily: "Josefin Sans" }}
						className="hidden lg:block font-[700] pl-0 lg:pl-[2rem] text-[1.9rem] lg:text-[2.9rem] leading-[1.7rem] lg:leading-[3rem]"
					>
						Kitchen Display System
					</div>
					<div
						style={{ fontFamily: "Josefin Sans" }}
						className="pl-0 lg:pl-[3rem] font-[400] pt-1 text-[1.1rem] lg:text-[1.25rem] lg:pt-[1rem] leading-[1.8rem] lg:leading-[2.1rem]"
					>
						<ol className="list-disc">
							<li>Manage all your kitchen orders in one place , no matter how they’re placed.</li>
							<li>Reduce paper and printer costs.</li>
							<li>Share real time updates.</li>
							<li>Speed up table service.</li>
							<li>Update status at item level..</li>
						</ol>
					</div>
				</div>
			</div>

			<div className="flex flex-col lg:flex-row-reverse px-[1.5rem] lg:px-[10.75rem] lg:pt-[6rem] pb-[2rem] lg:pb-[5rem]">
				<div
					style={{ fontFamily: "Josefin Sans" }}
					className="block lg:hidden font-[700] text-[1.8rem] mt-[3.13rem] leading-[1.7rem]"
				>
					Centralised Restaurant Dashboard
				</div>
				<div className="pt-[2rem] pr-0 lg:pt-0 ">
					<Image
						className="w-[21.733rem] h-[19.79rem] lg:w-[28.74rem] lg:h-[26.176rem]"
						src={CentralizedDashboard}
						alt="Centralised Restaurant Dashboard"
					/>
				</div>
				<div className="px-[1rem] lg:w-[35rem] pr-0 lg:pr-[3.3rem] pt-[1rem] lg:pt-[5.2rem]">
					<div
						style={{ fontFamily: "Josefin Sans" }}
						className="hidden lg:block font-[700] pr-0 text-[1.9rem] lg:text-[2.9rem] leading-[1.7rem] lg:leading-[3rem]"
					>
						Centralised Restaurant Dashboard
					</div>
					<div
						style={{ fontFamily: "Josefin Sans" }}
						className="pr-0 lg:pr-[3rem] font-[400] pt-1 text-[1.1rem] lg:text-[1.25rem] lg:pt-[1rem] leading-[1.8rem] lg:leading-[2.1rem]"
					>
						<ol className="list-disc">
							<li>Web based dashboard.</li>
							<li>Easy food category management.</li>
							<li>Effortless management of zone, table and staffs.</li>
						</ol>
					</div>
				</div>
			</div>
		</div>
	)
}

export default Services
