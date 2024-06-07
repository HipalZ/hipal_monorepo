import HipalLogo from '@assets/svg/HiPal.svg'
import useIdDetails from '@components/store/useIdDetails'
import { PAGE_TYPES, routePaths } from '@components/utils/routes'
import { Dialog, Transition } from '@headlessui/react'
import { on } from 'events'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { Fragment } from 'react'

interface ModalProps {
	id: string
	heading: React.ReactNode
	subheading: React.ReactNode
	children: React.ReactNode
	reduceMarginTop?: boolean

	isOpen: boolean
	onClose: () => void
}
function Prompt({
	id,
	heading,
	subheading,
	children,
	reduceMarginTop = false,
	isOpen,
	onClose,

	...props
}: ModalProps) {
	const router = useRouter()
	const { businessId } = router.query as { businessId: string }
	const { tableId, tableName, zoneId } = useIdDetails()

	return (
		<Transition show={isOpen} as={Fragment}>
			<Dialog as='div' className='relative !z-[99999999]' onClose={onClose}>
				<div className='fixed bottom-0 mx-auto mt-10 overflow-y-auto backdrop-blur-sm'>
					<div className='fixed inset-0 opacity-50 bg-black/80'></div>
					<div className='w-screen h-[35rem]'></div>
					<div className='flex min-h-full text-center'>
						<Transition.Child
							as={Fragment}
							enter='transition ease-out duration-200'
							enterFrom='opacity-0 translate-y-8'
							enterTo='opacity-100 translate-y-0'
							leave='transition ease-in duration-150'
							leaveFrom='opacity-100 translate-y-0'
							leaveTo='opacity-0 translate-y-8'
						>
							<Dialog.Panel className='rounded-t-2xl relative top-0 w-full max-w-md overflow-auto text-left transition-all transform bg-base-100 shadow-xl shadow-base-100 min-h-[50vh] mx-auto'>
								<div {...props}>
									<div className='relative w-full bg-base-100'>
										<div className='flex justify-between mx-4 mt-4'>
											<div className='text-xl font-bold left-6 top-4'>{tableName}</div>
											<label
												onClick={onClose}
												htmlFor={id}
												className='text-xl border-none text-primary bg-base-200 btn btn-circle right-4'
											>
												✕
											</label>
										</div>
										<div
											className={`text-base-content font-[700] ${
												reduceMarginTop ? 'mt-0' : 'mt-[4.5rem]'
											} text-[1.9rem] leading-7 text-center mb-[1.7rem] mx-4`}
										>
											{heading}
										</div>
										<div className='text-center font-[550] mx-6 text-base-content text-[1.125rem] leading-[1.125rem]'>
											<div>{subheading}</div>
										</div>
										<div>{children}</div>
									</div>
								</div>
							</Dialog.Panel>
						</Transition.Child>
					</div>
				</div>
			</Dialog>
		</Transition>
	)
}

export default Prompt
