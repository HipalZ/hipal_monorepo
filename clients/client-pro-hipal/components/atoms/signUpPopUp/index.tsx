import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'

export default function SignUpPopUp({
	children,
	show,
	onClose,
}: {
	children: React.ReactNode
	show: boolean
	onClose: () => void
}) {
	return (
		<>
			<Transition appear show={show} as={Fragment}>
				<Dialog
					static
					as='div'
					className='fixed inset-0 overflow-y-auto z-50'
					onClose={() => onClose()}
				>
					<div className='fixed inset-0 flex items-end justify-end bg-black backdrop-blur-sm bg-opacity-70'>
						<Transition.Child
							as={Fragment}
							enter='transition ease-out duration-500 transform'
							enterFrom='opacity-0 translate-y-full'
							enterTo='opacity-100 translate-y-0'
							leave='transition ease-in duration-150 transform'
							leaveFrom='opacity-100 -translate-y-0'
							leaveTo='opacity-0 -translate-y-full'
						>
							<Dialog.Panel className='relative w-full max-w-md shadow-md bg-base-100 rounded-t-3xl '>
								{children}
							</Dialog.Panel>
						</Transition.Child>
					</div>
				</Dialog>
			</Transition>
		</>
	)
}
