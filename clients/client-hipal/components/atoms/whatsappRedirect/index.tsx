import React from 'react'
import { BsWhatsapp } from 'react-icons/bs'

const WhatsappRedirect = () => {
	return (
		<a
			href='//api.whatsapp.com/send?phone=919177914130&text=Hi, i would like to know more about Hipal'
			target='_blank'
			rel='noreferrer noopener'
		>
			<div className='shadow-lg fixed flex p-2 px-4 items-center bottom-5 right-10 lg:right-[7rem] bg-green-500 rounded-lg'>
				<BsWhatsapp color='#fff' />
				<button className='mx-2 text-white font-semibold'>Say Hi!</button>
			</div>
		</a>
	)
}

export default WhatsappRedirect
