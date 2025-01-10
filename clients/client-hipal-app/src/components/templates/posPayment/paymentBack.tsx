import { useMerchantDetails } from '@/components/hooks/useMerchantSecret';
import { useUserCoinz } from '@/components/hooks/useUserCoinz';
import { _useAllBusiness } from '@/components/store/useAllBusiness';
import useBusinessDetails from '@/components/store/useBusinessDetails';
import { useCart } from '@/components/store/useCart';
import useLoyaltyData from '@/components/store/useLoyaltyData';
import { usePaymentStore } from '@/components/store/usePaymentStore';
import type { IBusinessData } from '@/components/types/businessData';
import { cn } from '@/components/utils/helpers';
import { PAGE_TYPES, routePaths } from '@/components/utils/routes';
import { useParams, useRouter } from 'next/navigation';
import React, { memo, useCallback, useEffect } from 'react'
import { BiArrowBack } from 'react-icons/bi'

const MemoPaymentBack = ({ data }: { data: IBusinessData }) => {
    useMerchantDetails();
    useUserCoinz(data?.loyalty?.loyaltyId || "");
    const { setShowCart } = useCart();
    const setBusinessData = _useAllBusiness((s) => s.setData);
    const { setBusinessDetails } = useBusinessDetails();
    const router = useRouter();
    const customLink = useParams()?.businessId as string;
    const { setLoyaltySetting } = useLoyaltyData();
    useEffect(() => {
        setBusinessData(data);
        if (data?.business) {
            setBusinessDetails(data?.business);
        }
        if (data?.loyalty) {
            setLoyaltySetting(data?.loyalty)
        };
        setShowCart(false);
    }, [data, setBusinessData, setShowCart, setBusinessDetails, setLoyaltySetting]);

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

const PaymentBack = memo(MemoPaymentBack)
export default PaymentBack