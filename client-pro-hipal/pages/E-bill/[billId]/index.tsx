import type { IEBill } from '@components/types/businessData'
import axios from '@utils/axios'
import Image from 'next/image'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import Hipal from '@assets/hipalNewLogo.svg'
import { useQuery } from '@tanstack/react-query'

const Bill = () => {
	const router = useRouter()
	const { billId } = router.query as { billId: string }
	const [eBill, setEbill] = useState<IEBill[]>([])

	async function result() {
		try {
			const res = await axios(`/v1/kitchens/Get/UserBill/${billId}`)
			setEbill(res.data.bill)
			return res.data.bill
		} catch (error) {
			console.log(error)
		}
	}

	const { isPending, error, data } = useQuery({
		queryKey: ['bill', billId],
		queryFn: result,
		enabled: !!billId,
	})

	const returnImage = () => {
		return eBill?.[eBill?.length - 2]?.logo
	}

	const returnBizName = () => {
		return eBill?.[eBill?.length - 2]?.businessName
	}

	if (isPending) {
		return <div>Loading...</div>
	}
	if (error) {
		return `An error has occurred: ${error.message}`
	}

	return (
		<div className='h-screen pt-6 bg-[#F5F5F5] backdrop-blur-sm'>
			<div className='flex flex-wrap mx-6 mb-6'>
				<div className=''>
					<Image src={returnImage()} alt='logo' width={50} height={50} />
				</div>
				<div className='mt-1 ml-4 text-lg'>{returnBizName()}</div>
			</div>
			<div className='mx-6 rounded-2xl bg-white shadow-xl relative mb-[1.5rem]'>
				{eBill[0] && (
					<div className='py-4 overflow-auto bg-[#072D4B] rounded-t-2xl'>
						<div className='flex justify-between mx-4'>
							<div className='flex flex-col'>
								<div className='font-[500] text-white capitalize'>{eBill[0]?.tableName}</div>
								<div className='capitalize font-normal text-white text-[0.875rem] mt-1 leading-[1rem]'>
									{eBill[0]?.customerName}
								</div>
							</div>
							<div className='flex flex-col'>
								<div className='text-right text-md font-[500] text-white'>{eBill[0]?.kotTime}</div>
								<div className='capitalize font-normal mt-1 text-white text-[0.875rem] leading-[1rem]'>
									{eBill[0]?.date}
								</div>
							</div>
						</div>
					</div>
				)}
				{eBill && eBill.length > 0 && (
					<div className='bg-white'>
						<div className='flex justify-between capitalize font-[500] mx-4 my-4 text-[#072D4B] text-[1rem] leading-[1.25rem]'>
							<div className='w-[50%]'>Items</div>
							<div>Quantity</div>
							<div>Cost</div>
						</div>
						<div className='overflow-auto max-h-[15rem] min-h-[15rem] pb-4'>
							{eBill.slice(0, eBill.length - 2).map((bill, index) => (
								<div
									key={bill?.id}
									className={`flex justify-between capitalize font-[500] mx-4 mt-4 text-[#072D4B] text-[1rem] leading-[1.25rem] ${
										index !== eBill.length - 3 ? 'pb-4 border-b-2 border-dashed' : ''
									}`}
								>
									<div className='w-[60%] font-[500]'>
										{bill?.dish?.name}
										<div className='capitalize font-normal text-[#072D4B]/40 text-[0.875rem] mt-1 leading-[1rem]'>
											{bill?.dish?.portions?.name}
										</div>
										<div className='capitalize font-normal text-[#072D4B]/40 text-[0.875rem] mt-1 leading-[1rem]'>
											{bill?.dish?.extras?.map((extra, index) => (
												<span key={index.toString()}>{extra?.name}, </span>
											))}
										</div>
									</div>
									<div className='flex justify-center'>{bill?.dish?.qty}</div>
									<div className=''>₹ {bill?.dish?.price}</div>
								</div>
							))}
						</div>
						<div className='pb-2 mx-4'>
							<hr className='border-[#072D4B]' />
						</div>
					</div>
				)}
				{eBill[eBill.length - 1] && (
					<div>
						<div className='flex justify-between mx-4 capitalize font-[500] text-[#072D4B] text-[1rem] leading-[1.25rem]'>
							<div>Sub-Total</div>
							<div>₹ {eBill[eBill.length - 1]?.subTotal}</div>
						</div>
						{eBill[eBill.length - 1]?.discount > 0 && (
							<div className='flex justify-between mx-4 mt-1 text-sm capitalize text-[#072D4B]'>
								<div>Discount</div>
								<div>₹ {eBill[eBill.length - 1]?.discount}</div>
							</div>
						)}
						{eBill[eBill.length - 1]?.claimedAmount > 0 && (
							<div className='flex justify-between mx-4 mt-1 text-sm capitalize text-[#072D4B]'>
								<div>Claim</div>
								<div>₹ {eBill[eBill.length - 1]?.claimedAmount}</div>
							</div>
						)}
						{eBill[eBill.length - 1]?.serviceCharge && (
							<div className='flex justify-between mx-4 mt-1 text-sm capitalize text-[#072D4B]'>
								<div>Service Charge</div>
								<div>₹ {eBill[eBill.length - 1]?.serviceCharge}</div>
							</div>
						)}
						<div className='flex justify-between mx-4 mt-1 text-sm capitalize text-[#072D4B]'>
							<div>CGST</div>
							<div>₹ {eBill[eBill.length - 1]?.SGST}</div>
						</div>
						<div className='flex justify-between mx-4 mt-1 text-sm capitalize text-[#072D4B]'>
							<div>SGST</div>
							<div>₹ {eBill[eBill.length - 1]?.CGST}</div>
						</div>
						<div className='flex justify-between pb-4 mx-4 capitalize font-[500] text-[#072D4B] text-[1rem] leading-[1.25rem]'>
							<div>Total</div>
							<div>₹ {eBill[eBill.length - 1]?.Total}</div>
						</div>
					</div>
				)}
			</div>
			<div className='flex items-center justify-center opacity-70'>
				<Image src={Hipal} alt='qr' width={75} height={75} />
			</div>
		</div>
	)
}

export default Bill
