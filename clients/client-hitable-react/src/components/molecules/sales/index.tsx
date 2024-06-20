export interface ISalesResponse {
	grossSale: number;
	totalSale: ISaleMode[];
	charges: ICharge[];
	discounts: IDiscount[];
	tips: ITip[];
	dues: IDue[];
}

interface ISaleMode {
	mode: string;
	totalSale: number;
	commissionPercent: number;
	totalCommissionSale: number;
}

interface ICharge {
	mode: string;
	totalSale: number;
	commissionPercent: number;
	totalCommissionSale: number;
}

interface IDiscount {
	mode: string;
	totalSale: number;
	commissionPercent: number;
	totalCommissionSale: number;
}

interface ITip {
	waiterName: string;
	tips: number;
}

interface IDue {
	customerName: string;
	dues: number;
}

interface SalesComponentProps {
	salesData: ISalesResponse | null;
	runCost: number;
}

const SalesComponent = ({
	salesData,
	runCost,
}:SalesComponentProps):JSX.Element => {
	return (
		<div className="relative pb-[5rem]">
			{salesData?.grossSale !== 0 ? (
				<>
					<div className="p-4 mx-6 mt-2 rounded-lg bg-primary text-base-100">
						<div className="pb-2 text-xs">
							Gross Sales
						</div>
						<div className="text-3xl font-medium">₹ {salesData?.grossSale}</div>
					</div>
					<div className="mt-4 masonry-layout">
						<div className="masonry-item">
							<div className="ml-6">Total Sales</div>
							<div className="mx-6 border bg-base-100 border-[#cacaca] rounded-md mt-4">
								{salesData?.totalSale
									?.filter((ele) => ele?.totalSale > 0)
									?.map((ele, index, array) => (
										<div
											key={ele.totalSale}
											className={`${
												index < array.length - 1
													? "border-b bg-base-100 border-[#cacaca]"
													: ""
											} mx-4 flex justify-between text-sm items-center py-4`}
										>
											{ele.totalSale > 0 && (
												<>
													<span> {ele?.mode}</span>
													<span>₹ {ele?.totalSale}</span>
												</>
											)}
										</div>
									))}
							</div>
						</div>
						{runCost > 0 && (
							<div className="mx-6 masonry-item">
								<div>Running Table</div>
								<div className="border mt-4 bg-base-100 border-[#cacaca] p-4 flex justify-between items-center rounded-md">
									<div>Cost</div>
									<div>₹ {runCost}</div>
								</div>
							</div>
						)}
						<div className="masonry-item">
							<div className="ml-6">Charges</div>
							<div className="mx-6 border bg-base-100 border-[#cacaca] rounded-md mt-4">
								{salesData?.charges
									?.filter((ele) => ele?.totalSale > 0)
									?.map((ele, index, array) => (
										<div
											key={ele.totalSale}
											className={`${
												index < array.length - 1
													? "border-b bg-base-100 border-[#cacaca]"
													: ""
											} mx-4 flex justify-between text-sm items-center py-4`}
										>
											{ele?.totalSale > 0 && (
												<>
													<span>{ele?.mode}</span>
													<span>₹ {ele?.totalSale}</span>
												</>
											)}
										</div>
									))}
							</div>
						</div>
						<div className="masonry-item">
							<div className="ml-6">Discounts</div>
							<div className="mx-6 border bg-base-100 border-[#cacaca] rounded-md mt-4">
								{salesData?.discounts
									?.filter((ele) => ele?.totalSale > 0)
									?.map((ele, index, array) => (
										<div
											key={ele.totalSale}
											className={`${
												index < array.length - 1
													? "border-b bg-base-100 border-[#cacaca]"
													: ""
											} mx-4 flex justify-between text-sm items-center py-4`}
										>
											{ele?.totalSale > 0 && (
												<>
													<span>{ele?.mode}</span>
													<span>₹ {ele?.totalSale}</span>
												</>
											)}
										</div>
									))}
							</div>
						</div>
						<div className="masonry-item">
							<div className="ml-6">Dues</div>
							<div className="mx-6 border bg-base-100 border-[#cacaca] rounded-md mt-4">
								{salesData?.dues?.map((ele) => (
									<div
										key={ele.customerName}
										className="mx-4 flex justify-between text-sm items-center py-4 border-b bg-base-100 border-[#cacaca]"
									>
										<span>{ele?.customerName}</span>
										<span>₹ {ele?.dues}</span>
									</div>
								))}
							</div>
						</div>
						<div className="masonry-item">
							<div className="ml-6">Tips</div>
							<div className="mx-6 border bg-base-100 border-[#cacaca] rounded-md mt-4">
								{salesData?.tips
									?.filter((ele) => ele?.tips > 0)
									?.map((ele) => (
										<div
											key={ele.waiterName}
											className="mx-4 flex justify-between text-sm items-center py-4 border-b bg-base-100 border-[#cacaca]"
										>
											<span>{ele?.waiterName ? ele?.waiterName : 'waiter'}</span>
											<span>₹ {ele?.tips}</span>
										</div>
									))}
							</div>
						</div>
					</div>
				</>
			) : (
				<div className="mt-4 text-xl font-medium text-center text-primary opacity-60">
					No sales Found
				</div>
			)}
		</div>
	);
};

export default SalesComponent;
