import { useCart } from "@/components/store/useCart"
import { memo, useMemo } from "react"

function EmptyCartBtn() {
	const { cart, emptyCart } = useCart()

	const isCartEmpty = useMemo(() => Object.keys(cart).length === 0, [cart])

	if (isCartEmpty) {
		return null
	}

	return (
		<button
			className="btn btn-primary btn-outline btn-xs my-auto rounded-full"
			onClick={emptyCart}
			type="button"
		>
			Empty Cart
		</button>
	)
}

export default memo(EmptyCartBtn)
