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

    const gotoExplore = () => {
        router.back();
    };

    useEffect(() => {
        if (decodedText) {
            try {
                console.log('Redirecting to:', decodedText);
                router.push(decodedText);
            } catch (error) {
                console.error('Redirection error:', error);
            }
        }
    }, [decodedText]);

    useEffect(() => {
        let scannerStarted = false;
        const readerElement = readerRef.current;
        if (readerElement) {
            const html5Qrcode = new Html5Qrcode(readerElement.id);

            const qrCodeSuccessCallback = (decodedText: string, decodedResult: any) => {
                if (decodedText) {
                    html5Qrcode.stop().catch((error) => console.error('Error stopping scanner:', error));
                    setDecodedText(decodedText);
                }
            };

            const qrCodeErrorCallback = (error: any) => {
                console.error('QR Code Error:', error);
            };

            const config = { fps: 10, qrbox: { width: 250, height: 250 } }; // Reduced fps to avoid overload

            html5Qrcode
                .start({ facingMode: 'environment' }, config, qrCodeSuccessCallback, qrCodeErrorCallback)
                .then(() => {
                    const videoElem = document.querySelector('#reader video');
                    if (videoElem) {
                        (videoElem as HTMLVideoElement).style.borderRadius = '15px';
                    }
                    scannerStarted = true;
                })
                .catch((err) => {
                    console.error('Scanner start error:', err);
                });

            return () => {
                if (scannerStarted) {
                    html5Qrcode.stop().catch((err) => {
                        console.error('Error stopping scanner on cleanup:', err);
                    });
                }
                if (readerElement) {
                    readerElement.innerHTML = '';
                }
            };
        }
    }, []);

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
