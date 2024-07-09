import ExtraWithDishWithSelect from "@/components/organisms/dishDescription/extras"
import { useBottomPanel } from "@/components/store/useBottomPanel"
import { useCart } from "@/components/store/useCart"
import { memo } from "react"
import ChoosePortions from "../choosePortions"
import AddDishToCartButton from "../bottomButton/AddDishToCartButton"
import type { IDish } from "@/components/types/businessData"
import MemoBottomPopUp from "@/components/atoms/bottomPopUp"

function BottomPanel({ dishData }: { readonly dishData: IDish }) {
	const { closeBottomPanel, isBottomPanelOpened, openBottomPanel } = useBottomPanel()
	const validationExtras = useBottomPanel((s) => s.validationExtras)
	const setBounceButton = useBottomPanel((s) => s.setBounceButton)
	const variantType = useBottomPanel((s) => s.variantType)
	const cart = useCart((s) => s.cart)
	const setCart = useCart((s) => s.setCart)
	console.log(dishData);

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



	return (
		<MemoBottomPopUp show={openModal} onClose={closeModal}>
		<div className="flex flex-col mt-4 mb-12 ">
			<div className="flex flex-col space-y-4 divide-y-2 divide-base-200">
				<ChoosePortions dishData={dishData} />
				<div>
					<ExtraWithDishWithSelect dishData={dishData} />
				</div>
			</div>
		</div>
		<AddDishToCartButton onClick={closeModal}>
			<div className="flex flex-row space-x-2 capitalize">
				<span className="my-auto">Add Dish to the cart</span>
			</div>
		</AddDishToCartButton>
	</MemoBottomPopUp>
	)
}

const MemoBottomPanel = memo(BottomPanel)
export default MemoBottomPanel