
import { memo, useCallback } from "react"
import CommonBottomButton from "../bottomButton";
import { useOrderStore } from "@/components/store/useOrderData";
import { useCartStore } from "@/components/store/useCartStore";

const MemoLiveCart = () => {
    const { setOpenOrderModal, setModalType } = useOrderStore()
    const { cart } = useCartStore()

    const showCart = useCallback(() => {
        setModalType('liveCart')
    }, [])

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)

    return (
        <CommonBottomButton
            maxWidth="48rem"
            position="mid"
            fixed
            buttons={[
                {
                    text: '',
                    isBackButton: true,
                    onClick: () => setOpenOrderModal(false),
                    className: 'rounded-md pl-3',
                },
                {
                    text: cart.length > 0
                        ? `${totalItems} items added`
                        : 'View Cart',
                    onClick: showCart,
                    className: 'rounded-md shadow-md',
                    highlight: cart.length > 0,
                    disable: cart.length === 0,
                },
            ]}
        />

    )
}

const LiveCart = memo(MemoLiveCart)
export default LiveCart
