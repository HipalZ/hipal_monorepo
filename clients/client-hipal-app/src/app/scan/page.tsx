"use client";
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Html5Qrcode } from 'html5-qrcode';
import { useEffect, useRef, useState } from 'react';
import HipalLogo from '@/assets/HIPAL_LOGO.svg';

export default function Scan() {
    const router = useRouter();
    const readerRef = useRef<HTMLDivElement | null>(null);
    const [decodedText, setDecodedText] = useState<string>('');
    const [html5Qrcode, setHtml5Qrcode] = useState<Html5Qrcode | null>(null);
    const [scannerStarted, setScannerStarted] = useState<boolean>(false);

    const gotoExplore = () => {
        router.back();
    };

    useEffect(() => {
        if (decodedText && html5Qrcode) {
            try {
                console.log('Stopping scanner and redirecting to:', decodedText);
                html5Qrcode.stop().then(() => {
                    router.push(decodedText);
                }).catch((error) => console.error('Error stopping scanner:', error));
            } catch (error) {
                console.error('Redirection error:', error);
            }
        }
    }, [decodedText, router, html5Qrcode]);

    useEffect(() => {
        const readerElement = readerRef.current;
        if (readerElement) {
            const qrScanner = new Html5Qrcode(readerElement.id);
            setHtml5Qrcode(qrScanner);

            const qrCodeSuccessCallback = (decodedText: string, decodedResult: any) => {
                if (decodedText) {
                    setDecodedText(decodedText);
                }
            };

            const qrCodeErrorCallback = (error: any) => {
                console.error('QR Code Error:', error);
            };

            const config = { fps: 10, qrbox: { width: 250, height: 250 } }; // Reduced fps to avoid overload

            qrScanner
                .start({ facingMode: 'environment' }, config, qrCodeSuccessCallback, qrCodeErrorCallback)
                .then(() => {
                    const videoElem = document.querySelector('#reader video');
                    if (videoElem) {
                        (videoElem as HTMLVideoElement).style.borderRadius = '15px';
                    }
                    setScannerStarted(true);
                })
                .catch((err) => {
                    console.error('Scanner start error:', err);
                });

            return () => {
                if (scannerStarted && qrScanner) {
                    qrScanner.stop().catch((err) => {
                        console.error('Error stopping scanner on cleanup:', err);
                    });
                }
                if (readerElement) {
                    readerElement.innerHTML = '';
                }
            };
        }
    }, [scannerStarted]);

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
                <div className='w-full mt-20' id='reader' ref={readerRef} />
                <p className='mt-6 text-sm font-normal opacity-90'>Scan the QR to book the table</p>
            </div>
        </div>
    );
}
