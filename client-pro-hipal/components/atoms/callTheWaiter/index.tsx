import React, { useState } from 'react'
import { MdOutlineRingVolume } from 'react-icons/md'
import Popup from '../Popup'
import { useRouter } from 'next/router'
import axios from '@utils/axios'
import useIdDetails from '@components/store/useIdDetails'
import { useLogin } from '@components/store/useLogin'
import { BiErrorAlt } from 'react-icons/bi'
import { FaBell } from 'react-icons/fa'
import { toast } from 'react-toastify'
import Link from 'next/link'
import { PAGE_TYPES, routePaths } from '@components/utils/routes'

function CallWaiter() {
	const [isModalOpen, setIsModalOpen] = useState(false)
	let { isLogin } = useLogin()
	const { zoneId, tableId, tableName } = useIdDetails()
	const [isCalling, setIsCalling] = useState(false)

	const router = useRouter()
	const { businessId } = router.query as { businessId: string }

	const openModal = () => {
		setIsModalOpen(true)
	}

	const closeModal = () => {
		setIsModalOpen(false)
	}
	const handleWaiterCallClick = async () => {
		// where is try catch
		if (isLogin && businessId && zoneId && tableId && !isCalling) {
			const config = {
				method: 'POST',
				url: '/v1/kitchens/User/WaiterCalling',
				data: {
					businessId: businessId,
					tableName: tableName,
					zoneId: zoneId,
					tableId: tableId,
				},
			}
			const { data } = await axios(config)
			setIsModalOpen(false)
			setIsCalling(true)
		} else {
			toast.error('u can call the waiter again after 5 minutes')
		}
		setTimeout(() => {
			setIsCalling(false)
		}, 1 * 60 * 1000)
	}
	return (
		<>
			<button
				onClick={() => openModal()}
				className={`${
					isCalling ? 'bg-primary' : 'bg-base-100'
				} text-primary  text-xs font-semibold no-underline border border-primary px-4 pt-1 rounded-[15px]`}
			>
				<FaBell className={`${isCalling ? 'text-base-100' : 'text-primary'} text-base mb-1`} />
			</button>
			{isLogin ? (
				<Popup show={isModalOpen} onClose={closeModal}>
					<div className='pt-4 pb-8 mx-12 text-base-content bg-base-100 rounded-xl'>
						<div className='flex justify-center text-3xl text-primary'>
							<MdOutlineRingVolume />
						</div>
						<div className='flex justify-center mt-4 font-semibold'>
							Do you want to call waiter?
						</div>
						<div className='flex justify-center mt-4 text-[0.75rem] font-light'>
							Need any assiatance from us?
						</div>
						<div className='flex justify-between mx-[1rem] mt-4 font-medium'>
							<button
								onClick={closeModal}
								className='px-8 py-1 shadow-lg bg-base-100 shadow-base-100'
							>
								close
							</button>
							<button
								onClick={() => handleWaiterCallClick()}
								className='px-8 py-1 mr-6 text-white rounded-full shadow-lg bg-primary shadow-base-100'
							>
								Call
							</button>
						</div>
					</div>
				</Popup>
			) : (
				<Popup show={isModalOpen} onClose={closeModal}>
					<div className='pt-4 pb-8 mx-12 text-base-content bg-base-100 rounded-xl'>
						<div className='flex justify-center text-3xl text-primary'>
							<BiErrorAlt />
						</div>
						<div className='flex justify-center mt-4 font-semibold'>Login to call waiter?</div>
						<div className='flex justify-center mt-4 text-[0.75rem] font-light'>
							Need any assiatance from us?
						</div>
						<div className='flex justify-center mx-[1rem] mt-4 font-medium'>
							<Link href={routePaths[PAGE_TYPES.SIGN_IN](businessId)}>
								<button
									onClick={closeModal}
									className='px-8 py-1 rounded-full shadow-lg btn btn-primary shadow-base-200'
								>
									Login
								</button>
							</Link>
						</div>
					</div>
				</Popup>
			)}
		</>
	)
}

export default CallWaiter
