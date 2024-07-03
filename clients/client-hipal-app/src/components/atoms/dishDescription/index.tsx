import React, { Fragment, memo } from "react"
import { Dialog, DialogPanel, Transition, TransitionChild } from "@headlessui/react"
import { HiX } from "react-icons/hi"

function DishData({
	children,
	show,
	onClose,
}: {
	children: React.ReactNode
	show: boolean
	onClose: () => void
}) {
	const closeModalNothing = (e: any) => {
		// e.preventDefault()
	}
	return (
		<Transition show={show} as={Fragment}>
			<Dialog
				static
				as="div"
				className="fixed inset-0 z-50 overflow-y-auto"
				onClose={(e) => closeModalNothing(e)}
			>
				<div className="fixed inset-0 flex items-end justify-center bg-black backdrop-blur-sm bg-opacity-70">
					<TransitionChild
						as={Fragment}
						enter="transition ease-out duration-500 transform"
						enterFrom="opacity-0 translate-y-full"
						enterTo="opacity-100 translate-y-0"
						leave="transition ease-in duration-150 transform"
						leaveFrom="opacity-100 -translate-y-0"
						leaveTo="opacity-0 -translate-y-full"
					>
						<DialogPanel className="relative w-full max-w-md shadow-md bg-base-100 rounded-t-2xl">
							<div
								onClick={() => onClose()}
								className="absolute z-50 flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 on_active_bounce -top-10 left-1/2"
							>
								<HiX className="p-2 text-4xl text-black bg-white rounded-full cursor-pointer " />
							</div>
							{children}
						</DialogPanel>
					</TransitionChild>
				</div>
			</Dialog>
		</Transition>
	)
}

const MemoDishData = memo(DishData)
export default MemoDishData
