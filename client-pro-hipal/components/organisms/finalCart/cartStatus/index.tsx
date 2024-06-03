import { useAllBusiness } from "@components/store/useAllBusiness";
import { useStatus } from "@components/store/useStatus";
import {
	Accordion,
	AccordionBody,
	AccordionHeader,
} from "@material-tailwind/react";
import { useState } from "react";
import { BsPerson } from "react-icons/bs";
import { MdArrowBackIos } from "react-icons/md";

export default function CartStatus({dishStatusData}) {
	const { data: _data } = useAllBusiness();
	const [isPortionOpen, setIsPortionOpen] = useState(true);

	return (
		<>
			<div className="z-10 flex flex-col px-6 shadow-xl bg-base-100">
				<Accordion
					open={isPortionOpen}
					icon={
						<MdArrowBackIos
							className={`-mt-2 transition-all ${
								isPortionOpen ? "rotate-90" : "-rotate-90"
							}`}
						/>
					}
				>
					<AccordionHeader
						onClick={() => setIsPortionOpen(!isPortionOpen)}
						className="border-b-0 "
					>
						<div className="-mt-4 prose capitalize text-base-content">
							<h4>your orders</h4>
						</div>
					</AccordionHeader>
					<AccordionBody>
						<div className="flex flex-col divide-base-100">
							{dishStatusData && dishStatusData.map((ele: any, i) => {
								const kot = ele[0];
								if (!kot) {
									return null;
								}
								return (
									<div key={`dishStatus${kot?.id}${i}`}>
										{ele.dishStatus !== "" && (
											<div className="">
												<div className="capitalize font-normal mb-2 text-primary text-[0.875rem] -mt-2 leading-[1rem]">
													<span className="inline-block">
														<BsPerson className="inline-block mb-1 mr-1 text-base" />
														{kot?.customerName} order
													</span>
												</div>
												<div className="px-4 mb-8 border border-base-200 bg-base-200/30 rounded-xl">
													{ele.map((kot: any, i: number) => (
														<div key={`kot${i}${kot?.id}`}>
															<div className="flex justify-between mx-4 mt-2">
																<div className="w-[60%] -ml-4 font-[500] text-base-content">
																	{kot?.dish?.name}
																	<div className="capitalize font-normal text-base-content/40 text-[0.875rem] my-1 leading-[1rem]">
																		{kot?.dish?.portions?.name}
																	</div>
																	<div className="capitalize font-normal text-base-content/40 text-[0.875rem] my-1 leading-[1rem]">
																		{kot?.dish?.extras?.map(
																			(extra: any) => extra?.name + ", ",
																		)}
																	</div>
																</div>
																<div className="w-[10%] font-[500] text-base-content">
																	{kot?.dish?.qty} x
																</div>
																{kot.isDeleted ? (
																	<div className="text-primary">Deleted</div>
																) : (
																	<div className="text-primary">
																		{kot?.dishStatus}
																	</div>
																)}
															</div>
														</div>
													))}
												</div>
											</div>
										)}
									</div>
								);
							})}
						</div>
					</AccordionBody>
				</Accordion>
			</div>
		</>
	);
}
