import { lazy, memo, useCallback, useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { BiRupee } from 'react-icons/bi';
import useCouponsStore from '@/components/store/useCouponsStore';
const TestValidity = lazy(() => import('./testValidity'));
const TestCouponName = lazy(() => import('./testCouponName'));
const TestDiscountType = lazy(() => import('./testDiscountType'));
const TestAvailableDays = lazy(() => import('./testAvailableDays'));

const MemoTestCoupon = () => {
    const [maxUses, setMaxUses] = useState('');
    const [bgColor, setBgColor] = useState('#6366f1');

    const colors = ['#6366f1', '#3b82f6', '#ec4899', '#10b981', '#f59e0b'];
    const {
        couponName,
        couponType,
        couponDiscount,
        couponPrice,
        setCouponPrice,
        isNoValidity,
    } = useCouponsStore((s) => ({
        couponName: s.couponName,
        couponType: s.couponType,
        couponDiscount: s.couponDiscount,
        couponPrice: s.couponPrice,
        setCouponPrice: s.setCouponPrice,
        isNoValidity: s.isNoValidity,
    }));

    const handleCouponPrice = useCallback((e) => {
        const value = e.target.value;
        if (value === '' || /^[0-9]*$/.test(value)) {
            setCouponPrice(value);
        }
    }, [setCouponPrice]);

    return (
        <div className="min-h-screen bg-gray-50 p-6 max-w-4xl mx-auto md:flex gap-8">
            {/* Coupon Preview */}
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
                        {maxUses && ` • Max uses: ${maxUses}`}
                    </h3>
                    <h3 className="mt-2 text-sm text-gray-500">
                        {isNoValidity ? 'No expiry' : 'Valid till specific date'}
                    </h3>
                </section>
            </section>

            {/* Form */}
            <div className="flex-1 bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-6">Create Your Coupon</h2>
                {/* Basic Details */}
                <div className="space-y-4 mb-1">
                    <TestCouponName />
                    <TestDiscountType />
                </div>

                {/* Validity & Conditions */}
                <div className="space-y-4 mt-4">
                    <TestValidity />
                    <TestAvailableDays />

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Minimum Amount
                            </label>
                            <div className="relative">
                                <BiRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="tel"
                                    maxLength={6}
                                    value={couponPrice}
                                    onChange={handleCouponPrice}
                                    className="pl-8 w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Min. amount"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Maximum Uses
                            </label>
                            <input
                                type="number"
                                value={maxUses}
                                onChange={(e) => setMaxUses(e.target.value)}
                                className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Max uses per user"
                            />
                        </div>
                    </div>
                </div>
                {/* Styling */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Coupon Style
                    </label>
                    <div className="flex gap-2">
                        {colors.map((color) => (
                            <button
                                key={color}
                                type="button"
                                onClick={() => setBgColor(color)}
                                className={`w-8 h-8 rounded-full ${bgColor === color ? 'ring-2 ring-offset-2 ring-gray-500' : ''
                                    }`}
                                style={{ backgroundColor: color }}
                            />
                        ))}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 flex justify-end gap-3">
                    <button type="button" className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                        Cancel
                    </button>
                    <button type="button" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                        Create Coupon
                    </button>
                </div>
            </div>
        </div>
    );
}

const TestCoupon = memo(MemoTestCoupon);
export default TestCoupon;