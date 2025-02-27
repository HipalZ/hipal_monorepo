import useCouponsStore from '@/components/store/useCouponsStore'
import { Tag } from 'lucide-react'
import { memo } from 'react'

const MemoTestCouponName = () => {
    const { couponName, setCouponName } = useCouponsStore((s) => ({ couponName: s.couponName, setCouponName: s.setCouponName }))
    return (
        <section>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                Coupon Name <span className='text-red-500'>*</span>
            </label>
            <article className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                    type="text"
                    required
                    value={couponName}
                    maxLength={21}
                    onChange={(e) => setCouponName(e.target.value)}
                    className="pl-10 w-full rounded-lg border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter coupon name"
                />
            </article>
        </section>
    )
}

const TestCouponName = memo(MemoTestCouponName)
export default TestCouponName