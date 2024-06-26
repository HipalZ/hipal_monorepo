import { handleDishQuantity } from "@/components/organisms/dishDescription/dishQuantityButton"
import ExtraWithDishWithSelect from "@/components/organisms/dishDescription/extras"
import { useBottomPanel } from "@/components/store/useBottomPanel"
import { useCart } from "@/components/store/useCart"
import { Dialog, DialogPanel, Transition, TransitionChild } from "@headlessui/react"
import { Fragment, memo } from "react"
import { RxCross2 } from "react-icons/rx"
import ChoosePortions from "../choosePortions"
import AddDishToCartButton from "../bottomButton/AddDishToCartButton"
import { IDish } from "@/components/types/businessData"

function BottomPanel({ dishData }:{dishData: IDish}) {
	const { closeBottomPanel, isBottomPanelOpened, openBottomPanel } = useBottomPanel()
	const validationExtras = useBottomPanel((s) => s.validationExtras)
	const setBounceButton = useBottomPanel((s) => s.setBounceButton)
	const variantType = useBottomPanel((s) => s.variantType)
	const cart = useCart((s) => s.cart)
	const setCart = useCart((s) => s.setCart)

	const checkValidation = () => {
		return validationExtras.every((item) => item)
	}

	const closeModal = () => {
		if (variantType === "portion") {
			closeBottomPanel(dishData?._id)
		}
		const itemValidation = checkValidation()
		if (itemValidation) {
			closeBottomPanel(dishData?._id)
		} else {
			setBounceButton(true)
			setTimeout(() => setBounceButton(false), 1000)
		}
	}

	const closeNRemoveCartDish = () => {
		handleDishQuantity(
			cart,
			dishData,
			openBottomPanel,
			setCart,
			closeBottomPanel,
		)(cart?.[dishData?._id]?.variants?.length || 0 || 0)
	}
	const closeModalNothing = (e: any) => {
		// e.preventDefault()
	}

	return (
			<Transition show={isBottomPanelOpened(dishData?._id)} as={Fragment}>
				<Dialog as="div" className="relative !z-[99999999]" onClose={(e) => closeModalNothing(e)}>
					<TransitionChild
						as={Fragment}
						enter="ease-out duration-300"
						enterFrom="opacity-0"
						enterTo="opacity-100"
						leave="ease-in duration-200"
						leaveFrom="opacity-100"
						leaveTo="opacity-0"
					>
						<div className="fixed inset-0 backdrop-blur-sm bg-base-content bg-opacity-30" />
					</TransitionChild>
					<div className="fixed inset-x-0 bottom-0 h-screen mx-auto mt-10 overflow-y-auto ">
						<div className="w-screen h-56" onClick={closeNRemoveCartDish}></div>
						<div className="flex min-h-full text-center ">
							<TransitionChild
								as={Fragment}
								enter="transition ease-out duration-200"
								enterFrom="opacity-0 translate-y-8"
								enterTo="opacity-100 translate-y-0"
								leave="transition ease-in duration-150"
								leaveFrom="opacity-100 translate-y-0"
								leaveTo="opacity-0 translate-y-8"
							>
								<DialogPanel className="rounded-t-2xl relative top-0 w-full max-w-md py-3 overflow-auto text-left align-middle transition-all transform bg-base-100 shadow-xl shadow-base-100 min-h-[60vh] mx-auto">
									<div className="flex flex-col mt-4 mb-12 ">
										<div className="absolute top-6 right-4">
											<div
												className="flex flex-row w-10 h-10 mr-auto rounded-full bg-base-100 on_active_bounce"
												onClick={closeNRemoveCartDish}
											>
												<div className="flex flex-row m-auto">
													<RxCross2 size={24} className="text-3xl text-primary " />
												</div>
											</div>
										</div>

										<div className="flex flex-col space-y-4 divide-y-2 divide-base-200">
											<ChoosePortions dishData={dishData} />
											<div>
												<ExtraWithDishWithSelect dishData={dishData} />
											</div>
										</div>
									</div>
								</DialogPanel>
							</TransitionChild>
							<AddDishToCartButton onClick={closeModal}>
								<div className="flex flex-row space-x-2 capitalize">
									<span className="my-auto">Add Dish to the cart</span>
								</div>
							</AddDishToCartButton>
						</div>
					</div>
				</Dialog>
			</Transition>
	)
}
export default memo(BottomPanel)
