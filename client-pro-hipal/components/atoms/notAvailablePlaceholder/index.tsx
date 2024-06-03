import { BiDish } from 'react-icons/bi'
import { MdNoFood, MdOutlineNoFood } from 'react-icons/md'

function NotAvailable({ className }: { className?: string }) {
	return (
		<div className={`${className || ''} flex relative bg-gray-700 rounded-lg h-[8rem] bottom-0 `}>
			<MdOutlineNoFood className='p-1 m-auto text-4xl text-gray-400 bg-gray-700 fill-current' />
			<div className='absolute z-20 text-sm text-white bottom-2 left-2'>Not Available</div>
			<div className='absolute bottom-0 w-full bg-gradient-to-t from-black via-black/50 to-transparent h-1/2'></div>
		</div>
	)
}

export default NotAvailable
