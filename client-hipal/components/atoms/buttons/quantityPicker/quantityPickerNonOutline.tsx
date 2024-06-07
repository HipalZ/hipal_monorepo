import type {  IExtraItem, IExtras } from '@components/types/businessData'
import { memo, useState } from 'react'
import { HiMinusSm, HiPlusSm } from 'react-icons/hi'

function QuantityPickerNonOutline({
	quantity,
	setQuantity,
	minQuantity,
	extra,
	item,
	selectedItemsCount,
	isDisabled,
	displayAlertPopUp,
}: {
	quantity: number
	setQuantity: (arg1: number) => void
	minQuantity: number
	extra: IExtras
	item: IExtraItem
	selectedItemsCount: any
	isDisabled: any
	displayAlertPopUp: () => void
}) {

	const [isChecked, setIsChecked] = useState(false);
	const onDecreaseQuantity = () => {
		if (quantity > minQuantity) {
			setQuantity(quantity - 1)
		}
	}
	function onIncreaseQuantity() {
		setQuantity(quantity + 1)
	}
	const handleCheckboxChange = (isChecked) => {
		if (extra?.maxQuantity === 0) {
			return;
		}
		const currentSelectedCount = selectedItemsCount[extra?._id] || 0;
		const maxAllowed = extra?.maxQuantity || extra?.numSelections;

		setIsChecked(isChecked);
		if (isChecked) {
			if (currentSelectedCount >= maxAllowed) {
				displayAlertPopUp();
				return;
			}
		}
		console.log('isChecked', isChecked)
		setQuantity(isChecked ? 1 : 0);
	};
	return (
		<>
			{extra?.addOnType === 'multiple' ? <div className='flex flex-row mx-1 my-auto'>
				{/* Decrease */}
				<div className='flex flex-col w-1/3'>
					<button
						type="button"
						className='btn btn-xs btn-outline btn-primary aspect-square !px-0 !py-0 !min-h-4 !h-6 !w-6 flex flex-col border-0  rounded-full !my-auto '
						onClick={
							isDisabled && quantity === 0 && extra?.name ? displayAlertPopUp : onDecreaseQuantity
						}
					>
						<HiMinusSm size={24} className='p-0 m-auto' />
					</button>
				</div>

				{/* Quantity */}
				<span className=' w-1/3 !py-0 px-2 flex flex-col text-xs font-bold my-auto mx-auto text-center text-base-content'>
					{quantity}
				</span>

				{/* Increase */}
				<div className='flex flex-col w-1/3'>
					<button
						type="button"
						className='btn btn-xs btn-outline btn-primary aspect-square !px-0 !py-0 !min-h-4 !h-6 !w-6 flex flex-col border-0  rounded-full !my-auto'
						onClick={
							extra?._id
								? (quantity === item?.maxQuantity || selectedItemsCount[extra?._id] === extra?.maxQuantity
									? displayAlertPopUp
									: onIncreaseQuantity)
								: (isDisabled && quantity === 0 && extra?.name
									? displayAlertPopUp
									: onIncreaseQuantity)
						}
					>
						<HiPlusSm size={24} />
					</button>
				</div>
			</div> : <div
				className='flex flex-row mx-1 my-auto'>
				<input
					type="checkbox"
					checked={quantity > 0}
					className='scale-110'
					onTouchStart={(e) => handleCheckboxChange(!isChecked)}
				/>
			</div>}
		</>
	)
}

export default memo(QuantityPickerNonOutline)