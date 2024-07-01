import { Dialog, DialogPanel, Transition, TransitionChild } from "@headlessui/react"
import { Fragment } from "react"

export default function QuickFilterPopup({
	children,
	show,
	onClose,
}: {
	children: React.ReactNode
	show: boolean
	onClose: () => void
}) {
	return (
			<Transition appear show={show} as={Fragment}>
				<Dialog as="div" className="relative z-50" onClose={onClose}>
					<div className="fixed inset-0 bg-black bg-opacity-40">
						<div className="fixed inset-0 flex items-start justify-end overflow-y-auto">
							<div className="mt-[5vh] p-4">
								<TransitionChild
									as={Fragment}
									enter="ease-out duration-300"
									enterFrom="opacity-0 scale-95"
									enterTo="opacity-100 scale-100"
									leave="ease-in duration-200"
									leaveFrom="opacity-100 scale-100"
									leaveTo="opacity-0 scale-95"
								>
									<DialogPanel className="w-full max-w-md overflow-hidden text-left align-middle transition-all transform">
										{children}
									</DialogPanel>
								</TransitionChild>
							</div>
						</div>
					</div>
				</Dialog>
			</Transition>
	)
}
