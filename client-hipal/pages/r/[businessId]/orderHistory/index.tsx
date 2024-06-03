import ProfileHeader from '@components/molecules/profileHeader'
import { useCart } from '@components/store/useCart'
import { useLogin } from '@components/store/useLogin'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import FoodType, { FOOD_TYPES } from '@components/atoms/foodType'
import moment from 'moment'
import { isEmpty } from 'lodash-es'
import { BsChevronDown, BsChevronUp } from 'react-icons/bs'
import axios from '@utils/axios'

function OrderHistory() {
	const [data, setData] = useState<any>([])
	const userDetails = useLogin((s) => s.userDetails)
	const [activeIndex, setActiveIndex] = useState<null | number>(null)
	const [filterData, setFilterData] = useState<null | any>()
	const [inputValue, setInputValue] = useState('')

	useEffect(() => {
		const result = async () => {
			const res = await axios.get(
				`/v1/payments/:id/byUsers?customerPhone=${userDetails?.phone}`,
			)
			setData(res.data.data)
			setFilterData(res.data.data)
		}
		result()
	}, [])

	function openAccordion(index: number) {
		setActiveIndex(index === activeIndex ? null : index)
	}
	function filterTheData(e) {
		setInputValue(e.target.value)

		const filteredData = data?.filter((each: any) => {
			return (
				each?.businessName?.toLowerCase().includes(e.target.value.toLowerCase()) ||
				each?.items?.some((item) =>
					item?.name?.toLowerCase().includes(e.target.value.toLowerCase()),
				)
			)
		})

		setFilterData(filteredData)
	}
	const [itemCount, setItemCount] = useState(5)

	const handleLoadMore = () => {
		setItemCount(itemCount + 5)
	}
	return (
		<div className='bg-[#fbfbfb] pb-[7rem]'>
			<div className='sticky top-0 z-10 bg-[#fbfbfb] pt-[1rem] pb-[1.5rem] border border-b-[#CACACA] mb-[1.5rem]'>
				<ProfileHeader />
				<div className='flex items-center px-[2rem] justify-center mt-2'>
					<label htmlFor='simple-search' className='sr-only'>
						Search
					</label>
					<div className='relative w-full'>
						<div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
							<svg
								aria-hidden='true'
								className='w-5 h-5 text-[#FF5019]/80 dark:text-[#FF5019]'
								fill='currentColor'
								viewBox='0 0 20 20'
								xmlns='http://www.w3.org/2000/svg'
							>
								<path
									fillRule='evenodd'
									d='M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z'
									clipRule='evenodd'
								></path>
							</svg>
						</div>
						<input
							type='text'
							id='simple-search'
							value={inputValue}
							onChange={(e) => filterTheData(e)}
							className='border border-gray-300 text-gray-900 text-sm rounded-xl focus:outline-none focus:border-[#E96108] block w-full pl-10 p-2.5'
							placeholder='Search by restaurant or dish'
							required
						/>
					</div>
				</div>
				<div className='mt-[1.5rem] mx-[2rem]'>
					<p className='text-xl font-medium text-base-content'>Orders</p>
					{/* <hr /> */}
				</div>
			</div>

			{filterData &&
				filterData.slice(0, itemCount).map((ele: any, index: number) => (
					<div key={index} className='bg-[#fbfbfb] h-full'>
						<div>
							<div
								key={index}
								onClick={() => openAccordion(index)}
								className='mx-[1.5rem] rounded-2xl mb-[1.5rem] transition-all pl-[1rem] h-auto border bg-white border-[#023047]/20'
							>
								<div className='flex items-center justify-between mt-4 mb-3'>
									<div className='flex items-center'>
										<div className='bg-white border border-[#023047]/10 mr-[1rem] rounded-[0.8rem]'>
											<Image
												quality={75}
												width={50}
												height={50}
												src={ele?.businessLogo}
												alt='logo'
											/>
										</div>
										<div className='w-auto md:text-[2.5rem] lg:text-[10rem] text-[#002D4B] text-[1.25rem] font-[550]'>
											{ele.businessName}
										</div>
									</div>
									<div className='mr-4'>
										{activeIndex === index ? (
											<BsChevronUp className='stroke-1' />
										) : (
											<BsChevronDown className='stroke-1' />
										)}
									</div>
								</div>
								<div className='flex justify-between pb-4 mr-4'>
									<div className='text-[0.75rem] font-[300] opacity-50'>
										{moment(ele?.date).format('D MMMM YYYY [at] h:mm A')}
									</div>
									<div className='opacity-50 flex justify-self-end font-[400] text-[0.75rem] text-base-content'>
										<span className='mr-0.5'>&#8377;</span>
										{/* {getGrandTotalPrice(ele.cart)} */}
										{ele?.total}
									</div>
								</div>
								<p className='opacity-50 flex justify-self-end font-[400] text-[0.75rem] text-base-content'>
									you rated: Good
								</p>
								{activeIndex === index && (
									<div className='my-4 mr-5'>
										<hr />
									</div>
								)}
								<div className='pb-3'>
									{activeIndex === index &&
										ele?.items.map((item, itemIndex) => {
											return (
												<div key={itemIndex} className='flex flex-col mt-2'>
													<div className='flex flex-row items-center justify-between my-1 mr-5'>
														<div className='flex items-center tracking-wider capitalize font-[400] text-[0.75rem] text-base-content'>
															<FoodType type={item?.dishType as FOOD_TYPES} />
															<span className='ml-2 mr-1 lowercase'>{item?.quantity}x</span>
															{item?.name}
														</div>
														<p className='text-xs'>
															<span className='mr-0.5'>&#8377;</span>
															{item?.amount}
														</p>
													</div>
													{(!isEmpty(item?.extras) || !isEmpty(item?.portions)) && (
														<>
															<div className='flex flex-row justify-between my-2 mr-5'>
																<div className='flex'>
																	<div className='ml-10 mr-5 py-5 w-0.5 bg-gray-500 self-stretch'></div>
																	<div className='flex flex-col'>
																		{item?.portions && (
																			<div className='capitalize flex font-[400] text-[0.625rem] text-base-content my-0.5'>
																				<p>{item?.portions?.name}</p>
																			</div>
																		)}
																		{item?.extras.map((extra: any, extraIndex: number) => {
																			return (
																				<>
																					<div
																						className='flex flex-row justify-between font-[400] text-[0.625rem] text-base-content my-0.5'
																						key={extraIndex}
																					>
																						<p className=''>
																							{extra?.quantity} x {extra?.name}
																						</p>
																					</div>
																				</>
																			)
																		})}
																	</div>
																</div>
																<div>
																	{item?.portions && (
																		<div className='flex font-[400] text-[0.625rem] text-base-content my-0.5'>
																			<span className='mr-0.5'>&#8377;</span>
																			<p>{item?.portions?.price}</p>
																		</div>
																	)}
																	{item?.extras.map((extra: any, extraIndex: number) => {
																		return (
																			<>
																				<div
																					className='flex flex-row justify-between font-[400] text-[0.625rem] text-base-content my-0.5'
																					key={extraIndex}
																				>
																					<span className='mr-0.5'>&#8377;</span>
																					<p>{extra?.price}</p>
																				</div>
																			</>
																		)
																	})}
																</div>
															</div>
														</>
													)}
												</div>
											)
										})}
									{activeIndex === index && (
										<>
											<div>
												<div className='flex justify-between my-2 mr-5'>
													<div className='text-sm font-semibold text-base-content'>Item Total</div>
													<div className='flex text-sm font-semibold justify-self-end text-base-content'>
														<span className='mr-0.5'>&#8377;</span>
														{ele?.subTotal}
													</div>
												</div>
												<div className='flex justify-between my-2 mr-5'>
													<div className='text-[0.75rem] font-[300]'>sgst</div>
													<div className='flex justify-self-end font-[300] text-[0.75rem] text-base-content'>
														<span className='mr-0.5 opacity-50'>&#8377;</span>
														{ele?.sgst.toFixed(2)}
													</div>
												</div>
												<div className='flex justify-between my-2 mr-5'>
													<div className='text-[0.75rem] font-[300]'>cgst</div>
													<div className='flex justify-self-end font-[300] text-[0.75rem] text-base-content'>
														<span className='mr-0.5 opacity-50'>&#8377;</span>
														{(ele?.cgst).toFixed(2)}
													</div>
												</div>
												<div className='my-2 mr-5'>
													<hr />
												</div>
												<div className='flex justify-between my-2 mr-5'>
													<div className='text-sm font-semibold'>Grand Total</div>
													<div className='flex text-sm font-semibold justify-self-end text-base-content'>
														<span className='mr-0.5'>&#8377;</span>
														{ele?.total}
													</div>
												</div>
											</div>
											<div className='my-2 mr-5'>
												<hr />
											</div>
										</>
									)}
								</div>
								{activeIndex === index && (
									<div className='mt-6 mb-4 text-[#002D4B]'>
										<h1 className='mb-1 text-sm font-semibold'>Order Details:</h1>
										<p className='mb-3 text-xs font-medium'>OrderId: {ele?.id}</p>
										<h1 className='mb-1 text-sm font-semibold'>Payment:</h1>
										<p className='mb-3 text-xs font-medium'>Paid: {ele?.paymentMode}</p>
										<h1 className='mb-1 text-sm font-semibold'>Date:</h1>
										<p className='text-xs font-medium '>
											{moment(ele?.date).format('D MMMM YYYY [at] h:mm A')}
										</p>
									</div>
								)}
							</div>
						</div>
					</div>
				))}
			{itemCount < filterData?.length && (
				<div className='flex justify-center mt-16'>
					<button
						className='text-xs font-semibold underline text-base-content'
						onClick={handleLoadMore}
					>
						Load More
					</button>
				</div>
			)}
		</div>
	)
}

export default OrderHistory
