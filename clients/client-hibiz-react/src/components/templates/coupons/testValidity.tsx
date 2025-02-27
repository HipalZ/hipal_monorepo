import { memo, useCallback } from "react";
import toast from "react-hot-toast";
import DatePicker from "react-datepicker";
import useCouponsStore from "@/components/store/useCouponsStore";
import { formatDate } from "@/components/utils/helper";
import { cn } from "@hi/common";

const MemoTestValidity = () => {
    const {
        couponStartDate,
        setCouponStartDate,
        couponEndDate,
        setCouponEndDate,
        isNoValidity,
        setIsNoValidity,
        couponType,
    } = useCouponsStore((s) => ({
        couponStartDate: s.couponStartDate,
        setCouponStartDate: s.setCouponStartDate,
        couponEndDate: s.couponEndDate,
        setCouponEndDate: s.setCouponEndDate,
        isNoValidity: s.isNoValidity,
        setIsNoValidity: s.setIsNoValidity,
        couponType: s.couponType,
    }));

    const handleNoValidity = useCallback(() => {
        setIsNoValidity(true);
        setCouponStartDate(null);
        setCouponEndDate(null);
    }, [setCouponStartDate, setCouponEndDate, setIsNoValidity]);

    const handleFixedDate = useCallback(() => {
        setIsNoValidity(false);
    }, [setIsNoValidity]);

    const handleStartDateChange = useCallback(
        (date: Date | null) => {
            if (date && couponEndDate && date.getTime() > couponEndDate) {
                toast.error("Start date cannot be after end date");
                return;
            }
            console.log(date);
            setCouponStartDate(date ? date.getTime() : null);
        },
        [couponEndDate, setCouponStartDate],
    );

    const handleEndDateChange = useCallback(
        (date: Date | null) => {
            if (couponStartDate && date && date.getTime() < couponStartDate) {
                toast.error("End date cannot be before start date");
                return;
            }
            setCouponEndDate(date ? date.getTime() : null);
        },
        [couponStartDate, setCouponEndDate],
    );

    const getExpiryMessage = useCallback(() => {
        const now = Date.now();

        if (couponStartDate === null && couponEndDate === null) {
            return "No Validity";
        }

        if (couponStartDate === null && couponEndDate !== null) {
            const daysLeft = Math.ceil((couponEndDate - now) / (1000 * 60 * 60 * 24));
            return `Expires in ${daysLeft} days`;
        }
        if (couponStartDate !== null && couponEndDate !== null) {
            const daysLeft = Math.ceil(
                (couponEndDate - couponStartDate) / (1000 * 60 * 60 * 24),
            );
            return `Expires ${daysLeft > 0 ? `in ${daysLeft} days` : "today"}`;
        }
        return "Expires: None";
    }, [couponEndDate, couponStartDate]);

    return (
        <section>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Validity
                </label>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={handleNoValidity}
                        className={`flex-1 py-2 px-4 rounded-md border ${isNoValidity
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                            : 'border-gray-300 text-gray-700'
                            }`}
                    >
                        No Expiry
                    </button>
                    <button
                        type="button"
                        onClick={handleFixedDate}
                        className={`flex-1 py-2 px-4 rounded-md border ${!isNoValidity ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                            : 'border-gray-300 text-gray-700'
                            }`}
                    >
                        Fixed Date
                    </button>
                </div>
            </div>
            {!isNoValidity && (
                <div className="flex gap-4 mt-4">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                        <DatePicker
                            selected={couponStartDate ? new Date(couponStartDate) : null}
                            onChange={handleStartDateChange}
                            selectsStart
                            startDate={couponStartDate ? new Date(couponStartDate) : null}
                            endDate={couponEndDate ? new Date(couponEndDate) : null}
                            dateFormat="dd/MM/yyyy"
                            minDate={new Date()}
                            placeholderText="Select start date"
                            className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                        <DatePicker
                            selected={couponEndDate ? new Date(couponEndDate) : null}
                            onChange={handleEndDateChange}
                            selectsEnd
                            dateFormat="dd/MM/yyyy"
                            startDate={couponStartDate ? new Date(couponStartDate) : null}
                            endDate={couponEndDate ? new Date(couponEndDate) : null}
                            minDate={
                                couponStartDate ? new Date(couponStartDate) : new Date()
                            }
                            placeholderText="Select end date"
                            className="w-full rounded-lg border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                </div>
            )}
            <center className="mt-2 w-full font-bold rounded-md truncate text-sm text-indigo-700 border border-indigo-500 bg-indigo-50 py-1">
                <h3>{getExpiryMessage() || "No expiration details available"}</h3>
                {couponEndDate && couponStartDate && (
                    <h3>
                        {" "}
                        Validity: {formatDate(new Date(couponStartDate))} -{" "}
                        {formatDate(new Date(couponEndDate))}
                    </h3>
                )}
            </center>
        </section>
    );
};

const TestValidity = memo(MemoTestValidity);
export default TestValidity;
