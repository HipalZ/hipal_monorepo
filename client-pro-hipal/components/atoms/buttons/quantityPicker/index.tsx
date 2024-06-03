import { memo } from 'react'
import { AiOutlineMinus, AiOutlinePlus } from 'react-icons/ai'
import { BiTrash } from 'react-icons/bi'

function QuantityPicker({
	quantity,
	setQuantity,
	minQuantity,
	isDeleteAble,
	onDeleteItem,
}: {
	quantity: number
	setQuantity: (arg1: number) => void
	minQuantity: number
	isDeleteAble?: boolean
	onDeleteItem?: () => void
}) {
	const onIncreaseQuantity = () => {
		setQuantity(quantity + 1)
	}

	const onDecreaseQuantity = () => {
		if (quantity > minQuantity) {
			setQuantity(quantity - 1)
		}
	}

	return (
		<div className='border-primary !bg-base-100  min-w-[6.044rem] min-h-[2.241rem] flex flex-row mx-1 my-auto border rounded-full !font-medium !text-[0.969rem] '>
			{isDeleteAble && quantity === 0 ? (
				<>
					{/* Delete Item */}
					<button
						className='btn btn-xs btn-outline btn-primary  focus:!bg-transparent active:!bg-transparent w-1/2 !py-0 my-auto flex flex-col border-0 rounded-none rounded-l-full'
						onClick={onDeleteItem}
					>
						<BiTrash className='font-bold' />
					</button>
				</>
			) : (
				<>
					{/* Decrease */}
					<button
						className=' className="w-1/3 px-2 py-1 my-auto text-xs bg-transparent rounded-none rounded-r-full text-primary focus:outline-none active:bg-transparent"'
						onClick={onDecreaseQuantity}
					>
						<AiOutlineMinus className='font-bold' />
					</button>

					{/* Quantity */}
					<span
						className={`${
							isDeleteAble && quantity === 0 ? ' w-1/2' : ' w-1/3'
						} !py-0 px-1 flex flex-col  my-auto mx-auto text-center text-primary`}
					>
						{quantity}
					</span>
				</>
			)}

			{/* Increase */}
			<button
				className=' className="w-1/3 px-2 py-1 my-auto text-xs bg-transparent rounded-none rounded-r-full text-primary focus:outline-none active:bg-transparent"'
				onClick={onIncreaseQuantity}
			>
				<AiOutlinePlus className='font-bold' />
			</button>
		</div>
	)
}

export default memo(QuantityPicker)
