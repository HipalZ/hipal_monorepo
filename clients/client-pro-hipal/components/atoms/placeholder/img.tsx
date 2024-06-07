import { BiDish } from 'react-icons/bi'

function PlaceholderImg({ className }: { className?: string }) {
	return (
		<div className={(className || '') + ' flex bg-base-300 rounded-lg mb-2'}>
			<BiDish className='m-auto text-2xl fill-current text-base-content' />
		</div>
	)
}

export default PlaceholderImg
