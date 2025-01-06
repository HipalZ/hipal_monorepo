import { _useAllBusiness } from '@/components/store/useAllBusiness';
import useBusinessDetails from '@/components/store/useBusinessDetails';
import { usePaymentStore } from '@/components/store/usePaymentStore';
import type { IBusinessData } from '@/components/types/businessData';
import { cn } from '@/components/utils/helpers';
import { PAGE_TYPES, routePaths } from '@/components/utils/routes';
import { useParams, useRouter } from 'next/navigation';
import React, { memo, useCallback, useEffect } from 'react'
import { BiArrowBack } from 'react-icons/bi'

const MemoPaymentHeader = ({ data }: { data: IBusinessData }) => {
    const setBusinessData = _useAllBusiness((s) => s.setData);
    const { setBusinessDetails } = useBusinessDetails();
    const router = useRouter();
    const customLink = useParams()?.businessId as string;

    useEffect(() => {
        setBusinessData(data);
        if (data?.business) {
            setBusinessDetails(data?.business);
        }
    }, [data, setBusinessData, setBusinessDetails]);

    const {
        selectedMode,
        setSelectedMode
    } = usePaymentStore((s) => ({
        selectedMode: s.selectedMode,
        setSelectedMode: s.setSelectedMode
    }))

    const handleBack = useCallback(() => {
        switch (selectedMode) {
            case "MODE":
            case "ONLINE":
            case "OFFLINE":
                return setSelectedMode("INVOICE");
            case "INVOICE":
                router.push(`${routePaths[PAGE_TYPES.CATEGORY](customLink || "")}`);
                break;
            default:
                break;
        }
    }, [selectedMode, customLink, router, setSelectedMode]);

    return (
        <article onClick={handleBack} onKeyDown={handleBack}>
            <button
                type="button"
                className={cn(
                    selectedMode === "INVOICE"
                        ? "bg-[#ffffff70]"
                        : "border border-black mt-4",
                    "absolute top-2 left-4 py-2 rounded-full z-[60] px-4 text-black",
                )}
            >
                <BiArrowBack />
            </button>
        </article>
    )
}

const PaymentHeader = memo(MemoPaymentHeader)
export default PaymentHeader