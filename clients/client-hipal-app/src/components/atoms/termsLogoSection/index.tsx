"use client"
import { isEmpty } from 'lodash-es'
import Logo from "@/assets/hipalNewLogo.svg";
import ShimmerImage from '../imageshimmer'
import { memo } from 'react';
import { HiChevronLeft } from 'react-icons/hi';
import { useRouter } from 'next/navigation';

const MemoTermsLogoSection = ({ logoUrl }: { logoUrl: string }) => {
    const router = useRouter()
    const handleBack = () => {
        router.back()
    }
    return (
        <>
            <button type="button" onClick={handleBack} className="relative">
                <HiChevronLeft className="mt-6 ml-2 text-3xl" />
            </button>
            <div className="flex items-center justify-center mx-6 mt-6 mb-3">
                {!isEmpty(logoUrl) && (
                    <ShimmerImage
                        src={logoUrl ? logoUrl : Logo}
                        height={100}
                        width={100}
                        quality={95}
                        alt="logo-business"
                        className="rounded-full"
                    />
                )}
            </div>
        </>
    )
}

const TermsLogoSection = memo(MemoTermsLogoSection)
export default TermsLogoSection