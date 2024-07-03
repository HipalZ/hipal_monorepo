"use client";
import { memo, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation"; // Corrected from 'next/navigation' to 'next/router'
import { Html5Qrcode } from "html5-qrcode";
import Image from "next/image";
import HipalLogo from "@/assets/img/HipalZ_logo_title.png";
import poweredBy from '@/assets/img/powered_hipalz.png'

function Scan() {
	const router = useRouter();
	const readerRef = useRef<HTMLDivElement | null>(null);
	const [decodedText, setDecodedText] = useState<string>("");
	const [html5Qrcode, setHtml5Qrcode] = useState<Html5Qrcode | null>(null);
	const [scannerStarted, setScannerStarted] = useState<boolean>(false); // New state to track scanner status

	const gotoExplore = () => {
		router.back();
	};

	useEffect(() => {
		if (decodedText && html5Qrcode && scannerStarted) {
			// Check if scannerStarted is true before stopping
			console.log("Stopping scanner and redirecting to:", decodedText);
			html5Qrcode
				.stop()
				.then(() => {
					setScannerStarted(false); // Update scanner status
					router.push(decodedText);
				})
				.catch((error) => console.error("Error stopping scanner:", error));
		}
	}, [decodedText, router, html5Qrcode, scannerStarted]);

	useEffect(() => {
		const readerElement = readerRef.current;

		if (readerElement) {
			const qrScanner = new Html5Qrcode(readerElement.id);
			setHtml5Qrcode(qrScanner);

			const qrCodeSuccessCallback = (decodedText: string) => {
				setDecodedText(decodedText);
			};

			const qrCodeErrorCallback = (error: any) => {
				// console.error('QR Code Error:', error);
			};

			const config = { fps: 10, qrbox: { width: 250, height: 250 } };

			qrScanner
				.start(
					{ facingMode: "environment" },
					config,
					qrCodeSuccessCallback,
					qrCodeErrorCallback,
				)
				.then(() => {
					setScannerStarted(true); // Update scanner status when started
					const videoElem = document.querySelector("#reader video");
					if (videoElem) {
						(videoElem as HTMLVideoElement).style.borderRadius = "15px";
					}
				})
				.catch((err) => {
					console.error("Scanner start error:", err);
				});

			return () => {
				if (scannerStarted) {
					// Check if scannerStarted is true before stopping
					qrScanner
						.stop()
						.then(() => {
							setScannerStarted(false); // Update scanner status
						})
						.catch((err) => {
							console.error("Error stopping scanner on cleanup:", err);
						});
				}
				readerElement.innerHTML = "";
			};
		}
	}, []);

	return (
		<div className="bg-[#fbfbfb] h-screen">
			<div className="pl-5 flex justify-between pt-2.5 pr-8">
				<div>
					<Image src={HipalLogo} alt="HipalLogo" loading="lazy" />
				</div>
				<div
					onKeyDown={gotoExplore}
					onClick={gotoExplore}
					className="text-[#393939] text-xl"
				>
					<p>Skip</p>
				</div>
			</div>
			<div className="px-8" style={{ textAlign: "center" }}>
				<div className="w-full mt-20" id="reader" ref={readerRef} />
				<p className="mt-6 text-sm font-normal opacity-90">
					Scan the QR on the table & start ordering
				</p>
			</div>
			<center className="fixed bottom-0 flex justify-center bg-black w-full max-w-[30rem] py-3">
				<figure >
					<Image src={poweredBy} alt="HiLogo" loading="lazy" />
				</figure>
			</center>
		</div>
	);
}

const MemoScan = memo(Scan);
export default MemoScan;