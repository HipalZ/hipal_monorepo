import useCouponsStore from "@/components/store/useCouponsStore";
import { ImageIcon } from "lucide-react"
import { memo } from "react";

const MemoTestPreview = () => {
    const {
        couponName,
        couponType,
        couponDiscount,
        couponPrice,
        couponUserClaim,
        bgColor,
        isNoValidity,
    } = useCouponsStore((s) => ({
        couponName: s.couponName,
        couponType: s.couponType,
        couponDiscount: s.couponDiscount,
        couponPrice: s.couponPrice,
        couponUserClaim: s.couponUserClaim,
        bgColor: s.bgColor,
        isNoValidity: s.isNoValidity,
    }));
    return (
        <section className="z-50 w-[50dvw] h-64 mx-auto md:w-1/4 sticky top-6 rounded-lg shadow-lg overflow-hidden">
            <article className="p-4" style={{ backgroundColor: bgColor }}>
                <div className="aspect-video bg-white/20 rounded-lg flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-white/50" />
                </div>
            </article>
            <section className="p-4">
                <h3 className="text-lg font-semibold">{couponName || 'Your Coupon Name'}</h3>
                <h3 className="mt-2 text-2xl font-bold text-indigo-600">
                    {couponDiscount && `${couponDiscount}${couponType === 'PERCENTAGE' ? '%' : '₹'} OFF`}
                </h3>
                <h3 className="mt-2 text-sm text-gray-500">
                    {couponPrice && `Min. spend: ₹${couponPrice}`}
                    {couponUserClaim && ` • Max uses: ${couponUserClaim}`}
                </h3>
                <h3 className="mt-2 text-sm text-gray-500">
                    {isNoValidity ? 'No expiry' : 'Valid till specific date'}
                </h3>
            </section>
        </section>
    )
}


const TestPreview = memo(MemoTestPreview)
export default TestPreview