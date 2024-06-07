// @ts-nocheck
import Image from 'next/image'
import { useRouter } from 'next/router'
import { Html5Qrcode } from 'html5-qrcode'
import { useEffect, useRef, useState } from 'react'
import HipalLogo from '@assets/svg/Hipal_logo.svg'

export default function Scan() { 
	const router = useRouter()
	const readerRef = useRef(null)
	const [decodedText, setDecodedText] = useState(null)
	const gotoExplore = () => {
		router.back()
	}
	useEffect(() => {
		if (decodedText) {
			router.push(decodedText)
		}
	}, [decodedText])
	useEffect(() => {
		let scannerStarted = false
		const readerElement = readerRef.current
		if (readerElement) {
			const html5Qrcode = new Html5Qrcode(readerElement.id)

			const qrCodeSuccessCallback = (decodedText, decodedResult) => {
				if (decodedText) {
					html5Qrcode.stop().catch((error) => console.error(error))
					setDecodedText(decodedText)
				}
			}

			const config = { fps: 60, qrbox: { width: 250, height: 250 } }

			html5Qrcode
				.start({ facingMode: 'environment' }, config, qrCodeSuccessCallback)
				.then(() => {
					const videoElem = document.querySelector('#reader video')
					if (videoElem) {
						videoElem.style.borderRadius = '15px'
					}
					scannerStarted = true
				})
				.catch((err) => {
					console.error(err)
				})

			return () => {
				if (scannerStarted) {
					html5Qrcode.stop().catch((err) => {
						console.error(err)
					})
				}
				if (readerElement) {
					readerElement.innerHTML = ''
				}
			}
		}
	}, [])
	return (
		<div className='bg-[#fbfbfb]'>
			<div className='pl-5 flex justify-between pt-2.5 pr-8'>
				<div>
					<Image src={HipalLogo} alt='HipalLogo' />
				</div>
				<div onKeyDown={gotoExplore} onClick={gotoExplore} className='text-[#393939] text-xl'>
					<p>Skip</p>
				</div>
			</div>
			<div className='px-8' style={{ textAlign: 'center' }}>
				<div className='w-full mt-20' id='reader' ref={readerRef}/>
				<p className='mt-6 text-sm font-normal opacity-90'>Scan the QR to book the table</p>
			</div>
		</div>
	)
}
